// app/components/challenge/CodeEditor.tsx
import React from "react";
import { Editor, OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useChallengeContext } from "~/contexts/ChallengeContext";

// --- C# Language Setup ---
const setupCSharp: OnMount = (editor, monacoInstance) => {
  // Register C# language (if not already done)
  const languages = monacoInstance.languages.getLanguages();
  if (!languages.some((lang) => lang.id === "csharp")) {
    monacoInstance.languages.register({ id: "csharp" });

    // Paste your entire 'setMonarchTokensProvider' object here
    // from your original 'CodeEditor.jsx' file.
    monacoInstance.languages.setMonarchTokensProvider("csharp", {
      // ... (Your entire 'tokenizer', 'keywords', 'operators', etc.)
      // This object is very large, so I'm omitting it for brevity
      // Just paste your original Monarch tokens provider object here
      defaultToken: "",
      tokenPostfix: ".cs",
      keywords: [
        "abstract",
        "as",
        "base",
        "bool",
        "break",
        "byte",
        "case",
        // ... all your keywords
        "while",
      ],
      typeKeywords: [
        "bool",
        "byte",
        "char",
        "decimal",
        "double",
        "float",
        "int",
        "long",
        "sbyte",
        "short",
        "uint",
        "ulong",
        "ushort",
        "void",
      ],
      operators: [
        "=",
        ">",
        "<",
        "!",
        "~",
        "?",
        ":",
        "==",
        "<=",
        ">=",
        "!=",
        // ... all your operators
        ">>=",
        ">>>=",
      ],
      symbols: /[=><!~?:&|+\-*\/\^%]+/,
      escapes:
        /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
      tokenizer: {
        root: [
          // ... all your tokenizer rules
          [/'/, "string.invalid"],
        ],
        string: [
          [/[^\\"]+/, "string"],
          [/@escapes/, "string.escape"],
          [/\\./, "string.escape.invalid"],
          [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
        ],
        whitespace: [
          [/[ \t\r\n]+/, "white"],
          [/\/\*/, "comment", "@comment"],
          [/\/\/.*$/, "comment"],
        ],
        comment: [
          [/[^\/*]+/, "comment"],
          [/\/\*/, "comment.invalid"],
          [/\*\//, "comment", "@pop"],
          [/[\/*]/, "comment"],
        ],
      }, // end tokenizer
    });

    // ▼▼▼ START OF FIX ▼▼▼

    // Define C# snippets
    monacoInstance.languages.registerCompletionItemProvider("csharp", {
      provideCompletionItems: (model, position) => {
        // Get the "word" at the current position
        const word = model.getWordAtPosition(position);

        // Create a range for the suggestion
        // This will replace the current word or insert at the cursor
        const range = {
          startLineNumber: position.lineNumber,
          startColumn: word ? word.startColumn : position.column,
          endLineNumber: position.lineNumber,
          endColumn: word ? word.endColumn : position.column,
        };

        // Define the snippets
        const snippetSuggestions = [
          {
            label: "class",
            kind: monacoInstance.languages.CompletionItemKind.Snippet,
            insertText: ["class ${1:MyClass}", "{", "\t${0}", "}"].join("\n"),
            documentation: "Create a new class",
            insertTextRules:
              monacoInstance.languages.CompletionItemInsertTextRule
                .InsertAsSnippet,
            range: range, // Add the required range
          },
          {
            label: "Console",
            kind: monacoInstance.languages.CompletionItemKind.Snippet,
            insertText: 'Console.WriteLine("${1:message}");',
            documentation: "Console.WriteLine",
            insertTextRules:
              monacoInstance.languages.CompletionItemInsertTextRule
                .InsertAsSnippet,
            range: range, // Add the required range
          },
          {
            label: "for",
            kind: monacoInstance.languages.CompletionItemKind.Snippet,
            insertText: [
              "for (int ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++)",
              "{",
              "\t${0}",
              "}",
            ].join("\n"),
            documentation: "For loop",
            insertTextRules:
              monacoInstance.languages.CompletionItemInsertTextRule
                .InsertAsSnippet,
            range: range, // Add the required range
          },
        ];

        return {
          suggestions: snippetSuggestions,
        };
      },
    });

    // ▲▲▲ END OF FIX ▲▲▲
  }

  // Add custom command (Ctrl+Enter to run)
  editor.addCommand(
    monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter,
    () => {
      console.log("Execute code (Ctrl+Enter)");
    }
  );
};
// --- End C# Language Setup ---

const CodeEditor = () => {
  const { code, setCode, currentChallenge, handleRun } = useChallengeContext();

  const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
    // Run the C# language setup
    setupCSharp(editor, monacoInstance);

    // Re-add the command, this time with access to the `handleRun` function
    editor.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter,
      () => {
        handleRun();
      }
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg mt-4 flex flex-col h-[400px]">
      <div className="px-4 pt-4 pb-2 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-blue-400">
            {currentChallenge?.title || "C# Editor"}
          </h3>
          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
            C# {currentChallenge?.requiredVersion || "8.0"}
          </span>
        </div>
      </div>
      <div className="flex-grow">
        <Editor
          height="100%"
          language="csharp"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || "")}
          onMount={handleEditorDidMount}
          options={{
            automaticLayout: true,
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            roundedSelection: true,
            padding: { top: 10 },
            renderWhitespace: "selection",
            wordWrap: "on",
            suggest: {
              snippetsPreventQuickSuggestions: false,
            },
            snippetSuggestions: "top",
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
