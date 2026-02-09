// app/components/challenge/CodeEditor.tsx
import React from "react";
import { Editor, OnMount, BeforeMount } from "@monaco-editor/react";
import { useChallengeContext } from "~/contexts/ChallengeContext";
import {
  setupCSharp,
  defineTheme,
  defineLightTheme,
} from "~/utils/monaco-csharp";
import { Play } from "lucide-react";
import { lintCode } from "~/utils/linter";
import { toast } from "sonner";
import { useThemeDetector } from "~/hooks/useThemeDetector";

interface CodeEditorProps {
  className?: string;
  disableCopyPaste?: boolean;
}

const CodeEditor = ({
  className,
  disableCopyPaste = false,
}: CodeEditorProps) => {
  const { code, setCode, currentChallenge, handleRun, diagnostics } =
    useChallengeContext();
  const isDark = useThemeDetector();

  // Use state instead of refs to trigger effects when editor is ready
  const [editorInstance, setEditorInstance] = React.useState<any>(null);
  const [monacoInstance, setMonacoInstance] = React.useState<any>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    setEditorInstance(editor);
    setMonacoInstance(monaco);
    setupCSharp(editor, monaco);

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRun();
    });
  };

  // Anti-Cheat: Disable Copy/Paste/Context Menu
  React.useEffect(() => {
    if (!disableCopyPaste || !editorInstance || !monacoInstance) return;

    const editor = editorInstance;
    const monaco = monacoInstance;

    // 1. Disable Context Menu - REMOVED to allow selection on mobile
    // editor.updateOptions({ contextmenu: false });

    // 2. Block Key Commands (Ctrl+C, Ctrl+V, Ctrl+X) inside Editor
    // Note: KeyCode.KeyC is correct for modern Monaco.
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC, () => {
      toast.warning("Copy is disabled to prevent cheating.");
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
      toast.warning("Paste is disabled to prevent cheating.");
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyX, () => {
      toast.warning("Cut is disabled to prevent cheating.");
    });

    // 3. Block DOM events
    const domNode = editor.getDomNode();
    if (domNode) {
      const preventer = (e: any) => {
        // Allow context menu to pass through so mobile users can select text
        if (e.type === "contextmenu") return;

        e.preventDefault();
        e.stopPropagation();
        toast.warning(
          `${
            e.type.charAt(0).toUpperCase() + e.type.slice(1)
          } is disabled to prevent cheating.`,
        );
      };

      domNode.addEventListener("paste", preventer, true);
      domNode.addEventListener("copy", preventer, true);
      domNode.addEventListener("cut", preventer, true);
      // domNode.addEventListener("contextmenu", preventer, true); // ALLOW context menu

      // Cleanup not strictly necessary for "always on" but good practice
      return () => {
        domNode.removeEventListener("paste", preventer, true);
        domNode.removeEventListener("copy", preventer, true);
        domNode.removeEventListener("cut", preventer, true);
        // domNode.removeEventListener("contextmenu", preventer, true);
      };
    }
  }, [disableCopyPaste, editorInstance, monacoInstance]);

  const handleBeforeMount: BeforeMount = (monaco) => {
    defineTheme(monaco);
    defineLightTheme(monaco);
  };

  // Sync Theme
  React.useEffect(() => {
    if (monacoInstance) {
      monacoInstance.editor.setTheme(isDark ? "vs-2022" : "vs-2022-light");
    }
  }, [isDark, monacoInstance]);

  // Sync compiler diagnostics AND local linting to editor markers
  React.useEffect(() => {
    if (!editorInstance || !monacoInstance) return;

    const model = editorInstance.getModel();

    // Server-side Diagnostics
    const serverMarkers = diagnostics.map((d) => ({
      startLineNumber: d.line,
      startColumn: d.column,
      endLineNumber: d.line,
      endColumn: d.column + 5,
      message: `[${d.source}] ${d.message}`,
      severity: monacoInstance.MarkerSeverity.Error,
    }));

    // Debounced Local Linting
    const timer = setTimeout(() => {
      const lintErrors = lintCode(code);
      const localMarkers = lintErrors.map((err) => ({
        startLineNumber: err.line,
        startColumn: err.col,
        endLineNumber: err.line,
        endColumn: err.col + (err.length || 1),
        message: err.message,
        severity:
          err.severity === "error"
            ? monacoInstance.MarkerSeverity.Error
            : monacoInstance.MarkerSeverity.Warning,
      }));

      monacoInstance.editor.setModelMarkers(model, "csharp", [
        ...serverMarkers,
        ...localMarkers,
      ]);
    }, 500);

    return () => clearTimeout(timer);
  }, [diagnostics, code, editorInstance, monacoInstance]);

  return (
    <div
      className={`flex flex-col h-full bg-white dark:bg-[#1E1E1E] rounded-none overflow-hidden border-b border-gray-200 dark:border-gray-800 ${className}`}
    >
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-[#252526] border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="ml-4 text-xs font-medium text-gray-400 font-mono">
            {currentChallenge?.title
              ? `${currentChallenge.title.replace(/\s+/g, "")}.cs`
              : "Solution.cs"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            C# {currentChallenge?.requiredVersion || "8.0"}
          </span>
          {/* Internal Run Button Moved to Footer */}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-grow relative">
        <Editor
          height="100%"
          language="csharp"
          theme={isDark ? "vs-2022" : "vs-2022-light"}
          value={code}
          onChange={(value) => setCode(value || "")}
          onMount={handleEditorDidMount}
          beforeMount={handleBeforeMount}
          options={{
            fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
            fontSize: 14,
            lineHeight: 24,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            roundedSelection: true,
            padding: { top: 16, bottom: 16 },
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            renderWhitespace: "selection",
            wordWrap: "on",
            // Crucial for "Tab" to accept suggestions instead of moving focus
            accessibilitySupport: "off",
            tabCompletion: "on",
            snippetSuggestions: "top",
            quickSuggestions: { other: true, comments: true, strings: true },
            suggest: {
              snippetsPreventQuickSuggestions: false,
            },
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
