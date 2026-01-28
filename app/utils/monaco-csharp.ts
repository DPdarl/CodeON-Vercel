import { OnMount } from "@monaco-editor/react";

export const setupCSharp: OnMount = (editor, monacoInstance) => {
  // Register C# language (if not already done)
  const languages = monacoInstance.languages.getLanguages();
  if (!languages.some((lang) => lang.id === "csharp")) {
    monacoInstance.languages.register({ id: "csharp" });

    monacoInstance.languages.setMonarchTokensProvider("csharp", {
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
        "catch",
        "char",
        "checked",
        "class",
        "const",
        "continue",
        "decimal",
        "default",
        "delegate",
        "do",
        "double",
        "else",
        "enum",
        "event",
        "explicit",
        "extern",
        "false",
        "finally",
        "fixed",
        "float",
        "for",
        "foreach",
        "goto",
        "if",
        "implicit",
        "in",
        "int",
        "interface",
        "internal",
        "is",
        "lock",
        "long",
        "namespace",
        "new",
        "null",
        "object",
        "operator",
        "out",
        "override",
        "params",
        "private",
        "protected",
        "public",
        "readonly",
        "ref",
        "return",
        "sbyte",
        "sealed",
        "short",
        "sizeof",
        "stackalloc",
        "static",
        "string",
        "struct",
        "switch",
        "this",
        "throw",
        "true",
        "try",
        "typeof",
        "uint",
        "ulong",
        "unchecked",
        "unsafe",
        "ushort",
        "using",
        "virtual",
        "void",
        "volatile",
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
        "object",
        "string",
        "var",
        "dynamic",
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
        "&&",
        "||",
        "++",
        "--",
        "+",
        "-",
        "*",
        "/",
        "&",
        "|",
        "^",
        "%",
        "<<",
        ">>",
        "+=",
        "-=",
        "*=",
        "/=",
        "&=",
        "|=",
        "^=",
        "%=",
        "<<=",
        ">>=",
      ],
      symbols: /[=><!~?:&|+\-*\/\^%]+/,
      escapes:
        /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
      tokenizer: {
        root: [
          [
            /[a-zA-Z_]\w*/,
            {
              cases: {
                "@typeKeywords": "keyword.type",
                "@keywords": "keyword",
                "@default": "identifier",
              },
            },
          ],
          { include: "@whitespace" },
          [/[{}()\[\]]/, "@brackets"],
          [/[<>](?!@symbols)/, "@brackets"],
          [/@symbols/, "operator"],
          [/\d*\.\d+([eE][\-+]?\d+)?/, "number.float"],
          [/0[xX][0-9a-fA-F]+/, "number.hex"],
          [/\d+/, "number"],
          [/[;,.]/, "delimiter"],
          [/"([^"\\]|\\.)*$/, "string.invalid"],
          [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],
          [/'[^\\']'/, "string"],
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
      },
    });

    // Define C# snippets
    monacoInstance.languages.registerCompletionItemProvider("csharp", {
      provideCompletionItems: (model, position) => {
        const word = model.getWordAtPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          startColumn: word ? word.startColumn : position.column,
          endLineNumber: position.lineNumber,
          endColumn: word ? word.endColumn : position.column,
        };

        const snippetSuggestions = [
          {
            label: "class",
            kind: monacoInstance.languages.CompletionItemKind.Snippet,
            insertText: ["class ${1:MyClass}", "{", "\t${0}", "}"].join("\n"),
            documentation: "Create a new class",
            insertTextRules:
              monacoInstance.languages.CompletionItemInsertTextRule
                .InsertAsSnippet,
            range: range,
          },
          {
            label: "Console.WriteLine",
            kind: monacoInstance.languages.CompletionItemKind.Snippet,
            insertText: 'Console.WriteLine("${1:message}");',
            documentation: "Console.WriteLine",
            insertTextRules:
              monacoInstance.languages.CompletionItemInsertTextRule
                .InsertAsSnippet,
            range: range,
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
            range: range,
          },
          {
            label: "svm",
            kind: monacoInstance.languages.CompletionItemKind.Snippet,
            insertText: [
              "static void Main(string[] args)",
              "{",
              "\t${0}",
              "}",
            ].join("\n"),
            documentation: "static void Main",
            insertTextRules:
              monacoInstance.languages.CompletionItemInsertTextRule
                .InsertAsSnippet,
            range: range,
          },
          {
            label: "cw",
            kind: monacoInstance.languages.CompletionItemKind.Snippet,
            insertText: "Console.WriteLine(${0});",
            documentation: "Console.WriteLine",
            insertTextRules:
              monacoInstance.languages.CompletionItemInsertTextRule
                .InsertAsSnippet,
            range: range,
          },
          {
            label: "cr",
            kind: monacoInstance.languages.CompletionItemKind.Snippet,
            insertText: "Console.ReadLine()",
            documentation: "Console.ReadLine",
            insertTextRules:
              monacoInstance.languages.CompletionItemInsertTextRule
                .InsertAsSnippet,
            range: range,
          },
          {
            label: "if",
            kind: monacoInstance.languages.CompletionItemKind.Snippet,
            insertText: ["if (${1:true})", "{", "\t${0}", "}"].join("\n"),
            documentation: "if statement",
            insertTextRules:
              monacoInstance.languages.CompletionItemInsertTextRule
                .InsertAsSnippet,
            range: range,
          },
          {
            label: "else",
            kind: monacoInstance.languages.CompletionItemKind.Snippet,
            insertText: ["else", "{", "\t${0}", "}"].join("\n"),
            documentation: "else statement",
            insertTextRules:
              monacoInstance.languages.CompletionItemInsertTextRule
                .InsertAsSnippet,
            range: range,
          },
          {
            label: "while",
            kind: monacoInstance.languages.CompletionItemKind.Snippet,
            insertText: ["while (${1:true})", "{", "\t${0}", "}"].join("\n"),
            documentation: "while loop",
            insertTextRules:
              monacoInstance.languages.CompletionItemInsertTextRule
                .InsertAsSnippet,
            range: range,
          },
          {
            label: "prop",
            kind: monacoInstance.languages.CompletionItemKind.Snippet,
            insertText: "public ${1:int} ${2:MyProperty} { get; set; }",
            documentation: "Auto-implemented property",
            insertTextRules:
              monacoInstance.languages.CompletionItemInsertTextRule
                .InsertAsSnippet,
            range: range,
          },
        ];

        return {
          suggestions: snippetSuggestions,
        };
      },
    });
  }

  // Add custom command (Ctrl+Enter to run)
  editor.addCommand(
    monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter,
    () => {
      console.log("Execute code (Ctrl+Enter)");
    },
  );
};
