import { OnMount, BeforeMount } from "@monaco-editor/react";

// Flag to prevent double initialization
let isInitialized = false;

// --- 1. Define VS 2022 Dark Theme ---
export const defineTheme = (monacoInstance: any) => {
  monacoInstance.editor.defineTheme("vs-2022", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "569CD6" }, // Blue
      { token: "keyword.control", foreground: "C586C0" }, // Purple
      { token: "identifier", foreground: "9CDCFE" }, // Light Blue
      { token: "type", foreground: "4EC9B0" }, // Teal
      { token: "string", foreground: "D69D85" }, // Orange
      { token: "number", foreground: "B5CEA8" }, // Light Green
      { token: "comment", foreground: "57A64A" }, // Green
      { token: "operator", foreground: "D4D4D4" }, // Grey/White
      { token: "delimiter", foreground: "D4D4D4" },
    ],
    colors: {
      "editor.background": "#1E1E1E",
      "editor.foreground": "#D4D4D4",
      "editor.lineHighlightBackground": "#2F3136",
      "editorCursor.foreground": "#D4D4D4",
      "editorWhitespace.foreground": "#3B3A32",
    },
  });
};

export const defineLightTheme = (monacoInstance: any) => {
  monacoInstance.editor.defineTheme("vs-2022-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "0000FF" }, // Blue
      { token: "keyword.control", foreground: "AF00DB" }, // Purple
      { token: "identifier", foreground: "001080" }, // Dark Blue
      { token: "type", foreground: "2B91AF" }, // Teal
      { token: "string", foreground: "A31515" }, // Red
      { token: "number", foreground: "098658" }, // Green
      { token: "comment", foreground: "008000" }, // Green
      { token: "operator", foreground: "000000" }, // Black
      { token: "delimiter", foreground: "000000" },
    ],
    colors: {
      "editor.background": "#FFFFFF",
      "editor.foreground": "#000000",
      "editor.lineHighlightBackground": "#F0F0F0",
      "editorCursor.foreground": "#000000",
      "editorWhitespace.foreground": "#B3B3B3",
    },
  });
};

export const setupCSharp: OnMount = (editor, monacoInstance) => {
  if (isInitialized) return;
  isInitialized = true;

  // Theme is applied via prop in component now, after definition in beforeMount
  // monacoInstance.editor.setTheme("vs-2022"); // Removed to rely on prop

  // --- 2. Register C# Language ---
  const languages = monacoInstance.languages.getLanguages();
  if (!languages.some((lang) => lang.id === "csharp")) {
    monacoInstance.languages.register({ id: "csharp" });
  }

  // --- 3. Lists of Keywords & Types ---
  const keywords = [
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
    "var",
    "dynamic",
  ];

  const typeKeywords = [
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
  ];

  // --- 4. Monarch Tokens Provider (Syntax Highlighting) ---
  monacoInstance.languages.setMonarchTokensProvider("csharp", {
    defaultToken: "",
    tokenPostfix: ".cs",
    keywords,
    typeKeywords,
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
              "@typeKeywords": "type", // Use 'type' token for teal color
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

  // --- 5. Completion Item Provider (Intellisense) ---
  monacoInstance.languages.registerCompletionItemProvider("csharp", {
    provideCompletionItems: (model, position) => {
      // Remove manual range calculation to let Monaco handle it

      const suggestions: any[] = [];

      // A. Keywords
      keywords.forEach((kw) => {
        suggestions.push({
          label: kw,
          kind: monacoInstance.languages.CompletionItemKind.Keyword,
          insertText: kw,
        });
      });

      // B. Standard Library "Mock" Intellisense
      const stdLib = [
        // Console
        {
          label: "Console",
          kind: monacoInstance.languages.CompletionItemKind.Class,
          insertText: "Console",
        },
        {
          label: "Console.WriteLine",
          kind: monacoInstance.languages.CompletionItemKind.Method,
          insertText: "Console.WriteLine(${1});",
          insertTextRules:
            monacoInstance.languages.CompletionItemInsertTextRule
              .InsertAsSnippet,
        },
        {
          label: "Console.Write",
          kind: monacoInstance.languages.CompletionItemKind.Method,
          insertText: "Console.Write(${1});",
          insertTextRules:
            monacoInstance.languages.CompletionItemInsertTextRule
              .InsertAsSnippet,
        },
        {
          label: "Console.ReadLine",
          kind: monacoInstance.languages.CompletionItemKind.Method,
          insertText: "Console.ReadLine()",
          insertTextRules:
            monacoInstance.languages.CompletionItemInsertTextRule
              .InsertAsSnippet,
        },
        {
          label: "Console.Clear",
          kind: monacoInstance.languages.CompletionItemKind.Method,
          insertText: "Console.Clear();",
        },

        // Math
        {
          label: "Math",
          kind: monacoInstance.languages.CompletionItemKind.Class,
          insertText: "Math",
        },
        {
          label: "Math.Abs",
          kind: monacoInstance.languages.CompletionItemKind.Method,
          insertText: "Math.Abs(${1})",
        },
        {
          label: "Math.Min",
          kind: monacoInstance.languages.CompletionItemKind.Method,
          insertText: "Math.Min(${1}, ${2})",
        },
        {
          label: "Math.Max",
          kind: monacoInstance.languages.CompletionItemKind.Method,
          insertText: "Math.Max(${1}, ${2})",
        },
        {
          label: "Math.Pow",
          kind: monacoInstance.languages.CompletionItemKind.Method,
          insertText: "Math.Pow(${1:x}, ${2:y})",
          documentation:
            "Returns a specified number raised to the specified power.",
          insertTextRules:
            monacoInstance.languages.CompletionItemInsertTextRule
              .InsertAsSnippet,
        },
        {
          label: "Math.Sqrt",
          kind: monacoInstance.languages.CompletionItemKind.Method,
          insertText: "Math.Sqrt(${1})",
        },
        {
          label: "Math.Round",
          kind: monacoInstance.languages.CompletionItemKind.Method,
          insertText: "Math.Round(${1})",
        },
        {
          label: "Math.Floor",
          kind: monacoInstance.languages.CompletionItemKind.Method,
          insertText: "Math.Floor(${1})",
        },
        {
          label: "Math.Ceiling",
          kind: monacoInstance.languages.CompletionItemKind.Method,
          insertText: "Math.Ceiling(${1})",
        },
        {
          label: "Math.PI",
          kind: monacoInstance.languages.CompletionItemKind.Constant,
          insertText: "Math.PI",
          documentation:
            "Represents the ratio of the circumference of a circle to its diameter.",
        },

        // Convert
        {
          label: "Convert",
          kind: monacoInstance.languages.CompletionItemKind.Class,
          insertText: "Convert",
        },
        {
          label: "Convert.ToInt32",
          kind: monacoInstance.languages.CompletionItemKind.Method,
          insertText: "Convert.ToInt32()",
        },
        {
          label: "Convert.ToDouble",
          kind: monacoInstance.languages.CompletionItemKind.Method,
          insertText: "Convert.ToDouble()",
        },
        {
          label: "Convert.ToString",
          kind: monacoInstance.languages.CompletionItemKind.Method,
          insertText: "Convert.ToString()",
        },

        // String
        {
          label: "String",
          kind: monacoInstance.languages.CompletionItemKind.Class,
          insertText: "String",
        },
        // Strings are object instances mostly, but static methods exist
        {
          label: "string.Concat",
          kind: monacoInstance.languages.CompletionItemKind.Method,
          insertText: "string.Concat()",
        },
        {
          label: "string.Join",
          kind: monacoInstance.languages.CompletionItemKind.Method,
          insertText: 'string.Join("", )',
        },
        {
          label: "string.Format",
          kind: monacoInstance.languages.CompletionItemKind.Method,
          insertText: 'string.Format("${1:format}", ${2:args})',
        },
        {
          label: "string.IsNullOrEmpty",
          kind: monacoInstance.languages.CompletionItemKind.Method,
          insertText: "string.IsNullOrEmpty()",
        },

        // Common Types
        {
          label: "List",
          kind: monacoInstance.languages.CompletionItemKind.Class,
          insertText: "List<${1:T}>",
        },
        {
          label: "Dictionary",
          kind: monacoInstance.languages.CompletionItemKind.Class,
          insertText: "Dictionary<${1:TKey}, ${2:TValue}>",
        },
        {
          label: "Array",
          kind: monacoInstance.languages.CompletionItemKind.Class,
          insertText: "Array",
        },
      ];

      stdLib.forEach((item) => {
        suggestions.push(item);
      });

      // C. Snippets
      const snippets = [
        {
          label: "cw",
          kind: monacoInstance.languages.CompletionItemKind.Snippet,
          insertText: "Console.WriteLine();",
          documentation: "Console.WriteLine",
          insertTextRules:
            monacoInstance.languages.CompletionItemInsertTextRule
              .InsertAsSnippet,
        },
        {
          label: "cr",
          kind: monacoInstance.languages.CompletionItemKind.Snippet,
          insertText: "Console.ReadLine()",
          documentation: "Console.ReadLine",
          insertTextRules:
            monacoInstance.languages.CompletionItemInsertTextRule
              .InsertAsSnippet,
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
        },
        {
          label: "foreach",
          kind: monacoInstance.languages.CompletionItemKind.Snippet,
          insertText: [
            "foreach (var ${1:item} in ${2:collection})",
            "{",
            "\t${0}",
            "}",
          ].join("\n"),
          documentation: "Foreach loop",
          insertTextRules:
            monacoInstance.languages.CompletionItemInsertTextRule
              .InsertAsSnippet,
        },
        {
          label: "if",
          kind: monacoInstance.languages.CompletionItemKind.Snippet,
          insertText: ["if (${1:true})", "{", "\t${0}", "}"].join("\n"),
          documentation: "if statement",
          insertTextRules:
            monacoInstance.languages.CompletionItemInsertTextRule
              .InsertAsSnippet,
        },
        {
          label: "ife",
          kind: monacoInstance.languages.CompletionItemKind.Snippet,
          insertText: [
            "if (${1:true})",
            "{",
            "\t${2}",
            "}",
            "else",
            "{",
            "\t${0}",
            "}",
          ].join("\n"),
          documentation: "if-else statement",
          insertTextRules:
            monacoInstance.languages.CompletionItemInsertTextRule
              .InsertAsSnippet,
        },
        {
          label: "while",
          kind: monacoInstance.languages.CompletionItemKind.Snippet,
          insertText: ["while (${1:true})", "{", "\t${0}", "}"].join("\n"),
          documentation: "while loop",
          insertTextRules:
            monacoInstance.languages.CompletionItemInsertTextRule
              .InsertAsSnippet,
        },
        {
          label: "do",
          kind: monacoInstance.languages.CompletionItemKind.Snippet,
          insertText: ["do", "{", "\t${0}", "} while (${1:true});"].join("\n"),
          documentation: "do-while loop",
          insertTextRules:
            monacoInstance.languages.CompletionItemInsertTextRule
              .InsertAsSnippet,
        },
        {
          label: "try",
          kind: monacoInstance.languages.CompletionItemKind.Snippet,
          insertText: [
            "try",
            "{",
            "\t${1}",
            "}",
            "catch (${2:Exception e})",
            "{",
            "\t${0}",
            "}",
          ].join("\n"),
          documentation: "try-catch block",
          insertTextRules:
            monacoInstance.languages.CompletionItemInsertTextRule
              .InsertAsSnippet,
        },
        {
          label: "prop",
          kind: monacoInstance.languages.CompletionItemKind.Snippet,
          insertText: "public ${1:int} ${2:MyProperty} { get; set; }",
          documentation: "Auto-implemented property",
          insertTextRules:
            monacoInstance.languages.CompletionItemInsertTextRule
              .InsertAsSnippet,
        },
        {
          label: "class",
          kind: monacoInstance.languages.CompletionItemKind.Snippet,
          insertText: ["class ${1:MyClass}", "{", "\t${0}", "}"].join("\n"),
          documentation: "Class definition",
          insertTextRules:
            monacoInstance.languages.CompletionItemInsertTextRule
              .InsertAsSnippet,
        },
      ];

      snippets.forEach((s) => suggestions.push(s));

      return {
        suggestions: suggestions,
      };
    },
  });

  // Add custom command (Ctrl+Enter to run)
  editor.addCommand(
    monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter,
    () => {
      console.log("Execute code (Ctrl+Enter)");
    },
  );
};
