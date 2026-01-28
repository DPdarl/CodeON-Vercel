// app/components/challenge/CodeEditor.tsx
import React from "react";
import { Editor, OnMount } from "@monaco-editor/react";
import { useChallengeContext } from "~/contexts/ChallengeContext";
import { setupCSharp } from "~/utils/monaco-csharp";
import { Play } from "lucide-react";
import { lintCode } from "~/utils/linter";

interface CodeEditorProps {
  className?: string;
}

const CodeEditor = ({ className }: CodeEditorProps) => {
  const { code, setCode, currentChallenge, handleRun, diagnostics } =
    useChallengeContext();
  const editorRef = React.useRef<any>(null);
  const monacoRef = React.useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;
    setupCSharp(editor, monacoInstance);

    editor.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter,
      () => {
        handleRun();
      },
    );
  };

  // Sync compiler diagnostics AND local linting to editor markers
  React.useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const model = editorRef.current.getModel();

    // Server-side Diagnostics
    const serverMarkers = diagnostics.map((d) => ({
      startLineNumber: d.line,
      startColumn: d.column,
      endLineNumber: d.line,
      endColumn: d.column + 5,
      message: `[${d.source}] ${d.message}`,
      severity: monacoRef.current.MarkerSeverity.Error,
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
            ? monacoRef.current.MarkerSeverity.Error
            : monacoRef.current.MarkerSeverity.Warning,
      }));

      monacoRef.current.editor.setModelMarkers(model, "csharp", [
        ...serverMarkers,
        ...localMarkers,
      ]);
    }, 500);

    return () => clearTimeout(timer);
  }, [diagnostics, code]);

  return (
    <div
      className={`flex flex-col h-full bg-[#1E1E1E] rounded-none overflow-hidden border-b border-gray-800 ${className}`}
    >
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-gray-800">
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
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || "")}
          onMount={handleEditorDidMount}
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
