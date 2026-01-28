export interface LintError {
  line: number;
  col: number;
  message: string;
  severity: "error" | "warning";
  length?: number;
}

export const lintCode = (code: string): LintError[] => {
  const errors: LintError[] = [];
  if (!code) return errors;

  const lines = code.split("\n");
  const stack: { char: string; line: number; col: number }[] = [];

  lines.forEach((line, lineIdx) => {
    const lineNum = lineIdx + 1;
    const trimmed = line.trim();

    // 1. Semicolon Check (Heuristic)
    if (
      trimmed.length > 0 &&
      !trimmed.startsWith("//") &&
      !trimmed.startsWith("using") &&
      !trimmed.endsWith(";") &&
      !trimmed.endsWith("{") &&
      !trimmed.endsWith("}") &&
      !trimmed.endsWith(":")
    ) {
      const isControlFlow =
        /^(if|else|for|foreach|while|switch|class|namespace|void|public|private|protected|static|try|catch|finally)\b/.test(
          trimmed,
        );
      if (!isControlFlow) {
        errors.push({
          line: lineNum,
          col: line.length + 1,
          message: "Syntax Hint: Missing semicolon?",
          severity: "warning",
          length: 1,
        });
      }
    }

    // 2. Brace Matching
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === "{" || char === "(") {
        stack.push({ char, line: lineNum, col: i + 1 });
      } else if (char === "}" || char === ")") {
        const last = stack.pop();
        if (
          !last ||
          (char === "}" && last.char !== "{") ||
          (char === ")" && last.char !== "(")
        ) {
          errors.push({
            line: lineNum,
            col: i + 1,
            message: `Unexpected closing bracket '${char}'`,
            severity: "error",
            length: 1,
          });
        }
      }
    }
  });

  // Check for unclosed braces
  if (stack.length > 0) {
    const last = stack[stack.length - 1];
    errors.push({
      line: last.line,
      col: last.col,
      message: `Unclosed bracket '${last.char}'`,
      severity: "error",
      length: 1,
    });
  }

  return errors;
};
