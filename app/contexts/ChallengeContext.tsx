// app/contexts/ChallengeContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useMemo,
} from "react";
import { useNavigate } from "@remix-run/react";
import { challenges } from "~/data/challenges";
import { toast } from "sonner";
import type { Challenge } from "~/types/challenge.types";
import { executeCodeCode as executeCode } from "~/utils/judge0";
import { lintCode, type LintError } from "~/utils/linter";
import { useAuth } from "~/contexts/AuthContext";
import {
  saveChallengeProgress,
  fetchUserProgress,
} from "~/utils/challenge.client";
import { supabase } from "~/lib/supabase";
import { useGameSound } from "~/hooks/useGameSound";
import { calculateStreakUpdate } from "~/lib/streak-logic";

// 1. Define the shape of the state
interface ChallengeState {
  currentChallengeIndex: number;
  completed: string[]; // Array of challenge IDs
  stars: Record<string, number>; // Map of challengeId -> star rating (1-3)
  code: string;
  output: string;
  exp: number;
  level: number;
  coins: number;
  hints: number; // [NEW] Hint Powerups
  levelThreshold: number;
  showHint: boolean;
  showTerminal: boolean;
  isWaitingForInput: boolean; // New: Terminal waiting for user input
  userProgress: number;
  diagnostics: Array<{
    line: number;
    column: number;
    message: string;
    source: string;
  }>; // Compiler errors
  showSuccessModal: boolean; // [NEW] Control the success modal
  startTime: number; // [NEW] Track start time for grading
  lastEarnedStars: number; // [NEW] Stars earned in this specific run
  inputHistory: string[]; // [NEW] History of inputs for re-run strategy
  isLoading: boolean;
  isExecuting: boolean; // [NEW] Track code execution specifically
  isMobileEditMode: boolean; // [NEW] Mobile Read/Edit Mode
  isReviewMode: boolean; // [NEW] Read-only mode for completed challenges
  submittedCodes: Record<string, string>; // [NEW] Cache of submitted code
  executionTimes: Record<string, number>; // [NEW] Cache of execution times
}

// 2. Define the shape of the context value (state + functions)
interface ChallengeContextType extends ChallengeState {
  challenges: Challenge[];
  currentChallenge: Challenge;
  setCode: (code: string) => void;
  setOutput: (output: string) => void;
  handleRun: () => void;
  submitTerminalInput: (input: string) => void; // New: Submit input
  handleComplete: () => void;
  handlePrevious: () => void;
  handleNext: () => void;
  handleNextChallenge: () => void; // [NEW]
  handleCloseModal: () => void; // [NEW]
  toggleHint: () => void;
  useHint: () => boolean;
  buyHint: () => void; // [NEW]
  setCurrentChallengeIndex: (index: number) => void;
  setIsMobileEditMode: (enabled: boolean) => void; // [NEW]
  handleRetry: () => void; // [NEW]
  isReviewMode: boolean;
  reviewTime: number | null; // [NEW] Time to display in review mode
  isExiting: boolean; // [NEW] Flag to bypass blocker
}

// 3. Create the context with a default value (or null)
export const ChallengeContext = createContext<ChallengeContextType | undefined>(
  undefined,
);

// 4. Define props for the provider
interface ChallengeProviderProps {
  children: React.ReactNode;
  initialChallengeId?: string | null;
}

export const ChallengeProvider = ({
  children,
  initialChallengeId,
}: ChallengeProviderProps) => {
  const initialIndex = useMemo(() => {
    if (!initialChallengeId) return 0;
    const idx = challenges.findIndex((c) => c.id === initialChallengeId);
    return idx >= 0 ? idx : 0;
  }, [initialChallengeId]);

  const [state, setState] = useState<ChallengeState>({
    currentChallengeIndex: initialIndex,
    completed: [],
    stars: {},
    code: "",
    output: "",
    exp: 0,
    level: 1,
    coins: 10,
    hints: 0, // [NEW]
    levelThreshold: 20,
    showHint: false,
    showTerminal: false,
    isWaitingForInput: false,
    userProgress: 0,
    diagnostics: [],
    showSuccessModal: false,
    startTime: Date.now(),
    lastEarnedStars: 0, // [NEW]
    inputHistory: [], // [NEW]
    isLoading: true, // [NEW] Loading state
    isExecuting: false, // [NEW]
    isMobileEditMode: false, // [NEW] Default to Read Mode
    isReviewMode: false, // [NEW]
    submittedCodes: {}, // [NEW]
    executionTimes: {}, // [NEW]
  });

  const navigate = useNavigate(); // [NEW] Navigation hook
  const { user, refreshUser, updateProfile, syncUser } = useAuth(); // Added syncUser for streak updates
  const { playSound } = useGameSound();

  // Sync basic stats from User Profile on mount
  useEffect(() => {
    if (user) {
      setState((prev) => ({
        ...prev,
        coins: user.coins || 0,
        hints: user.hints || 0, // [NEW]
        exp: user.xp || 0,
        level: user.level || 1,
        // user.levelThreshold might not be in user object, keep default or calculate
      }));

      // Fetch specific challenge progress
      // Fetch specific challenge progress
      fetchUserProgress(user.uid).then((progressData) => {
        // progressData is now [{ challenge_id, stars, code_submitted, execution_time_ms }, ...]
        const completedIds = user.completedMachineProblems || [];

        const starsMap: Record<string, number> = {};
        const codesMap: Record<string, string> = {}; // [NEW]
        const timesMap: Record<string, number> = {}; // [NEW]

        if (progressData) {
          progressData.forEach((p: any) => {
            if (p.challenge_id) {
              starsMap[p.challenge_id] = p.stars || 0;
              if (p.code_submitted) {
                codesMap[p.challenge_id] = p.code_submitted;
              }
              if (p.execution_time_ms) {
                timesMap[p.challenge_id] = p.execution_time_ms;
              }
            }
          });
        }

        setState((prev) => ({
          ...prev,
          completed: completedIds,
          stars: starsMap,
          submittedCodes: codesMap,
          executionTimes: timesMap,
          isLoading: false,
        }));
      });
    } else {
      // If no user, technically we stop loading but it will be empty
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [user]);

  // [NEW] Navigation Flag
  const [isExiting, setIsExiting] = useState(false);

  const handleNextChallenge = () => {
    setIsExiting(true); // [NEW] Bypass blocker
    // Navigate back to the challenges menu to claim rewards
    navigate("/play/challenges");

    // Ensure modal closes
    setState((prev) => ({ ...prev, showSuccessModal: false }));
  };

  const handleCloseModal = () => {
    setState((prev) => ({ ...prev, showSuccessModal: false }));
  };

  const setIsMobileEditMode = (enabled: boolean) => {
    setState((prev) => ({ ...prev, isMobileEditMode: enabled }));
  };

  const handleRetry = () => {
    if (currentChallenge) {
      activeRetriesRef.current.add(currentChallenge.id); // [NEW] Mark as retrying
    }

    setState((prev) => ({
      ...prev,
      isReviewMode: false, // Unlock editor
      isMobileEditMode: true, // Auto-enable edit mode on mobile
      startTime: Date.now(), // Reset timer
      output: "", // Clear output
      diagnostics: [], // Clear diagnostics
      code: currentChallenge?.starterCode.replace(/\\r\\n/g, "\n") || "", // [NEW] Reset to starter code
    }));
    toast.info("Retry Mode: Timer restarted!");
  };

  const currentChallenge = useMemo(
    () => challenges[state.currentChallengeIndex],
    [state.currentChallengeIndex],
  );

  // Track last initialized challenge to prevent resets on re-renders
  const lastChallengeIdRef = React.useRef<string | null>(null);
  const activeRetriesRef = React.useRef<Set<string>>(new Set()); // [NEW] Track retries

  // Initialize code with starter code or submitted code if completed
  useEffect(() => {
    if (currentChallenge) {
      const isCompleted = state.completed.includes(currentChallenge.id);
      const isNewChallenge = lastChallengeIdRef.current !== currentChallenge.id;

      if (isNewChallenge) {
        lastChallengeIdRef.current = currentChallenge.id;
        // If it's a new challenge, we shouldn't assume it's being retried unless complex nav logic.
        // Usually safe to clear or ignore retry state for *other* challenges,
        // but for *this* challenge ID, if we just navigated to it, we probably aren't retrying it yet.
        // However, if we preserve retry state across navigation, we wouldn't delete.
        // For now, let's just use the set check.

        if (isCompleted) {
          const savedCode = state.submittedCodes[currentChallenge.id];
          const starter = currentChallenge.starterCode.replace(/\\r\\n/g, "\n");
          setState((prev) => ({
            ...prev,
            code: savedCode ? savedCode.replace(/\\r\\n/g, "\n") : starter,
            isReviewMode: true,
            diagnostics: [],
            // Don't necessarily reset start time here if we want to track review time?
            // actually review time is separate.
          }));
        } else {
          const cleanedCode = currentChallenge.starterCode.replace(
            /\\r\\n/g,
            "\n",
          );
          setState((prev) => ({
            ...prev,
            code: cleanedCode,
            isReviewMode: false,
            diagnostics: [],
            startTime: Date.now(),
          }));
        }
      } else {
        // Challenge ID is the same, but maybe completion status changed (e.g. data loaded)
        // Only update if we need to switch to review mode AND we are not currently retrying
        const isRetrying = activeRetriesRef.current.has(currentChallenge.id);

        if (isCompleted && !state.isReviewMode && !isRetrying) {
          const savedCode = state.submittedCodes[currentChallenge.id];
          const starter = currentChallenge.starterCode.replace(/\\r\\n/g, "\n");
          setState((prev) => ({
            ...prev,
            code: savedCode ? savedCode.replace(/\\r\\n/g, "\n") : starter,
            isReviewMode: true,
            diagnostics: [],
          }));
        }
        // If not completed and already in edit mode, DO NOT reset code or timer
      }
    }
  }, [currentChallenge, state.completed, state.submittedCodes]);

  // Derived Review Time
  const reviewTime = useMemo(() => {
    if (state.isReviewMode && currentChallenge) {
      return state.executionTimes[currentChallenge.id] || 0;
    }
    return null;
  }, [state.isReviewMode, currentChallenge, state.executionTimes]);

  // Calculate progress
  useEffect(() => {
    const progress = (state.completed.length / challenges.length) * 100;
    setState((prev) => ({ ...prev, userProgress: progress }));
  }, [state.completed]);

  // Ref to store expected prompt for de-duplication
  const expectedPromptRef = React.useRef<string | null>(null);

  const executeWithPiston = async (
    code: string,
    stdin: string,
    stripPrefix?: string,
  ) => {
    // Clear previous diagnostics
    setState((prev) => ({ ...prev, diagnostics: [] }));

    try {
      const result = await executeCode("csharp", code, stdin);

      let out = result.stdout || "";
      // Normalize newlines to prevent rendering issues with mixed \r\n
      out = out.replace(/\r\n/g, "\n");

      // Strip the duplicated prompt if it exists in the output
      if (stripPrefix) {
        const variants = [
          stripPrefix, // exact
          stripPrefix.replace(/\r\n/g, "\n"), // unix normalized
          stripPrefix.replace(/\n/g, "\r\n"), // windows normalized
          stripPrefix.trim(), // trimmed
        ];

        for (const variant of variants) {
          if (out.startsWith(variant)) {
            out = out.substring(variant.length);
            break;
          }
        }
      }

      const newDiagnostics: any[] = [];
      if (result.stderr) {
        // Parse C# compiler errors
        // Example: /run_dir/program.cs(10,25): error CS1002: ; expected
        const regex = /\((\d+),(\d+)\): error ([^:]+): (.*)/g;
        let match;
        while ((match = regex.exec(result.stderr)) !== null) {
          newDiagnostics.push({
            line: parseInt(match[1], 10),
            column: parseInt(match[2], 10),
            source: match[3], // e.g. CS1002
            message: match[4].trim(),
          });
        }
      }

      setState((prev) => ({
        ...prev,
        output:
          prev.output +
          out +
          (result.stderr ? `\nError:\n${result.stderr}` : ""),
        diagnostics: newDiagnostics,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        output: prev.output + `\n❌ System Error: ${error.message || error}`,
      }));
    }
  };

  // --- Interactive Execution Helper ---
  const runWithHistory = async (currentInputs: string[]) => {
    const rawCode = state.code;

    // 1. Inject Shim for ReadLine to detect missing input
    // We replace Console.ReadLine() with our custom wrapper that throws if null.
    const shim = `
      // --- INTERAL SHIM ---
      public static class _Internal {
          public static string ReadLine() {
              string s = System.Console.ReadLine();
              if (s == null) throw new System.Exception("_INPUT_REQUIRED_");
              // Echo input precisely: Write string, then NewLine
              // [Fix] We use a marker \u001D to detect the start of input echo.
              // This allows us to strip preceding newlines in the UI to ensure inline prompts.
              System.Console.Write("\u001D" + s);
              System.Console.WriteLine();
              return s;
          }
      }
      // --- END SHIM ---
    `;

    // Regex to replace Console.ReadLine()
    // Handles: Console.ReadLine(), System.Console.ReadLine()
    let shimmedCode = rawCode.replace(
      /System\.Console\.ReadLine\s*\(\)/g,
      "_Internal.ReadLine()",
    );
    shimmedCode = shimmedCode.replace(
      /Console\.ReadLine\s*\(\)/g,
      "_Internal.ReadLine()",
    );

    // Append the shim class at the end
    shimmedCode += shim + "\n";

    // 2. Prepare Stdin
    const fullStdin = currentInputs.join("\n");

    setState((prev) => ({
      ...prev,
      showTerminal: true,
      output: prev.output, // Keep previous output while thinking
      isWaitingForInput: false,
      isExecuting: true,
    }));

    try {
      const result = await executeCode("csharp", shimmedCode, fullStdin);
      let out = result.stdout || "";
      // console.log("DEBUG RAW OUTPUT:", JSON.stringify(out)); // [DEBUG REMOVED]
      let err = result.stderr || "";
      let neededInput = false;

      // 3. Check for Input Requirement
      if (err.includes("_INPUT_REQUIRED_")) {
        neededInput = true;
        err = "";
      } else if (err.includes("Input string was not in a correct format")) {
        neededInput = true;
        err = "";
      }

      // [New] Execution Status
      if (!neededInput && !err) {
        if (!out.trim()) {
          out =
            "⚠️ Code executed successfully but produced no output.\n" +
            "Hint: Use Console.WriteLine() to print to the console.";
        } else {
          out += "\n\nCode Execution Successful.";
        }
      }

      // [Fix] Post-process output to enforce inline prompts.
      // 1. If waiting for input, remove TRAILING newline to keep cursor on same line.
      if (neededInput && /[\r\n]+$/.test(out)) {
        out = out.replace(/[\r\n]+$/, "");
      }

      // 2. If we see \n<Marker> (from re-runs), remove the \n to merge lines.
      // Marker is \u001D
      out = out.replace(/\n\u001D/g, "");
      out = out.replace(/\r\n\u001D/g, "");
      // Remove any remaining markers
      out = out.replace(/\u001D/g, "");

      // 4. Update State
      setState((prev) => {
        return {
          ...prev,
          output: out + (err ? `\nError:\n${err}` : ""),
          isWaitingForInput: neededInput,
          isLoading: false,
          isExecuting: false,
        };
      });
    } catch (e: any) {
      setState((prev) => ({
        ...prev,
        output: `System Error: ${e.message}`,
        isWaitingForInput: false,
        isLoading: false,
        isExecuting: false,
      }));
    }
  };

  const handleRun = async () => {
    const codeToRun = state.code;

    // --- 0. Pre-Run Syntax Check (Immediate Feedback) ---
    const lintErrors = lintCode(codeToRun);
    const criticalErrors = lintErrors.filter((e) => e.severity === "error");

    if (criticalErrors.length > 0) {
      setState((prev) => ({
        ...prev,
        showTerminal: true,
        output:
          "❌ Syntax Error:\n" +
          criticalErrors.map((e) => `Line ${e.line}: ${e.message}`).join("\n") +
          "\n\nFix these errors before running.",
        isWaitingForInput: false,
        diagnostics: criticalErrors.map((e) => ({
          line: e.line,
          column: e.col,
          message: e.message,
          source: "Syntax",
        })),
      }));
      return;
    }

    // Reset Input History
    setState((prev) => ({ ...prev, inputHistory: [] }));

    // Start Execution with empty input
    await runWithHistory([]);
  };

  const submitTerminalInput = async (inputVal: string) => {
    if (state.isWaitingForInput) {
      const newHistory = [...state.inputHistory, inputVal];

      setState((prev) => ({
        ...prev,
        inputHistory: newHistory,
        // Show the user's input locally for immediate feedback?
        // Actually, re-running Piston will output the prompt again?
        // No, Piston does NOT echo stdin.
        // So we MUST echo it ourselves in the UI if we want it to look like a terminal.
        // But we are replacing the entire output on re-run.
        // So Piston output will be: "Prompt... (no echo) Prompt2..."
        // We need to manually stitch input into the output?
        // Or cleaner: Rely on the Fact that we replace the output.
        // Wait, if Piston doesn't echo, the user interaction looks weird.
        // "Enter choice: 1" -> "Enter choice: Enter temp: "
        // The "1" disappears?

        // To fix this, we might rely on the fact that standard terminals echo input.
        // But Piston is not a TTY.
        // We can assume Piston output is clean.
        // If we want to show history, we might need to interleave it?
        // For now, let's just run it. The user will see the *Next* prompt.
        // The previous prompts/values might "disappear" if we just show raw stdout,
        // unless the program prints them (it won't).

        // Actually, in a real terminal, the typed char is echoed.
        // Since we are rebuilding the session, we lose that echo.
        // Improvement: We can't easily interleave unless we parse.
        // But let's verify if this "Re-run" is better than broken code. Yes.
      }));

      await runWithHistory(newHistory);
    }
  };

  const verifySolution = async (): Promise<{
    correct: boolean;
    stars: number;
    feedback: string;
    executionTimeMs: number;
  }> => {
    // Basic heuristics if no test inputs (shouldn't happen with our update)
    const inputs = currentChallenge.testInputs || ["5"];
    const code = state.code;

    setState((prev) => ({
      ...prev,
      showTerminal: true,
      output: "Verifying solution...\n",
    }));

    // --- Structural Check (IPO) ---
    // 1. Input Check
    if (!code.includes("Console.ReadLine")) {
      const failResult = {
        correct: false,
        stars: 0,
        feedback: "Missing Input: You need to get data from the user.",
        executionTimeMs: 0,
      };
      setState((prev) => ({
        ...prev,
        output:
          prev.output +
          "\n❌ MISSING INPUT\n------------------\n" +
          "Your code needs to read input from the user.\n" +
          "💡 Tip: Use `Console.ReadLine()`.\n" +
          "Example: string data = Console.ReadLine();\n",
      }));
      return failResult;
    }

    // 2. Output Check
    if (
      !code.includes("Console.WriteLine") &&
      !code.includes("Console.Write")
    ) {
      const failResult = {
        correct: false,
        stars: 0,
        feedback: "Missing Output: You need to show the result.",
        executionTimeMs: 0,
      };
      setState((prev) => ({
        ...prev,
        output:
          prev.output +
          "\n❌ MISSING RESULT\n-------------------\n" +
          "Your program logic is good, but it doesn't show the answer.\n" +
          "💡 Tip: Use `Console.WriteLine()` to print the result.\n",
      }));
      return failResult;
    }

    // 3. Process Check (Heuristic towards Logic/Formula)
    const cleanCode = code
      .replace(/\/\/.*$/gm, "") // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, ""); // Remove multi-line comments

    // Look for: Operators, Math calls, Loops, or assignments that assume calculation
    // Fixed: Added word boundaries (\b) to avoid matching 'double' as 'do'.
    // Matches: +, -, *, /, %, Math., if, switch, for, foreach, while, do
    const processPattern =
      /[\+\-\*\/%]|Math\.|\bif\s*\(|\bswitch\b|\bfor\b|\bforeach\b|\bwhile\b|\bdo\b/;

    // Skip heuristic for MP 1.7 (Type Casting) as it uses Convert/Casting instead of operators
    if (currentChallenge.id !== "1.7" && !processPattern.test(cleanCode)) {
      const failResult = {
        correct: false,
        stars: 0,
        feedback: "Missing Formula: No calculations found.",
        executionTimeMs: 0,
      };
      setState((prev) => ({
        ...prev,
        output:
          prev.output +
          "\n❌ MISSING LOGIC OR FORMULA\n----------------------------\n" +
          "You have the Input and Output, but where is the formula?\n" +
          "Your code needs to calculate the answer.\n" +
          "💡 Tip: Look at the problem description for the formula (using +, -, *, /).\n",
      }));
      return failResult;
    }

    // --- Challenge 1.2 Specific Checks (Temp Conversion) ---
    if (currentChallenge.id === "1.2") {
      const clean = cleanCode; // Use the comment-stripped code

      // 1. Check for Invalid Input Handler (else / default)
      // We look for 'else' or 'default' keyword.
      // Note: 'else if' contains 'else', but we specifically want the fallback 'else'.
      // Regex: \belse\b(?!\s*if) finds 'else' not followed by 'if'.
      const hasElse = /\belse\b(?!\s*if)/.test(clean);
      const hasDefault = /\bdefault\b/.test(clean); // For switch cases

      if (!hasElse && !hasDefault) {
        return {
          correct: false,
          stars: 0,
          feedback:
            "Missing Invalid Input Handler: You need to handle invalid choices (like 3 or 4).",
          executionTimeMs: 0,
        };
      }

      // 2. Check for Option 1: C to F
      // Formula: * 9 / 5  OR  * 1.8
      // Updated: Allow 9.0 and 5.0
      const hasCtoF = /(\*\s*9(\.0)?\s*\/\s*5(\.0)?)|(\*\s*1\.8)/.test(clean);
      if (!hasCtoF) {
        return {
          correct: false,
          stars: 0,
          feedback:
            "Missing Logic (Option 1): I don't see the formula for Celsius to Fahrenheit.\nHint: (C * 9/5) + 32",
          executionTimeMs: 0,
        };
      }

      // 3. Check for Option 2: F to C
      // Formula: * 5 / 9  OR  / 1.8
      // Updated: Allow 5.0 and 9.0
      const hasFtoC = /(\*\s*5(\.0)?\s*\/\s*9(\.0)?)|(\/\s*1\.8)/.test(clean);
      if (!hasFtoC) {
        return {
          correct: false,
          stars: 0,
          feedback:
            "Missing Logic (Option 2): I don't see the formula for Fahrenheit to Celsius.\nHint: (F - 32) * 5/9",
          executionTimeMs: 0,
        };
      }
    }

    // --- Challenge 1.3 Specific Checks (Peso-Dollar Conversion) ---
    if (currentChallenge.id === "1.3") {
      const clean = cleanCode;

      // 1. Check for Constants (Always required)
      const hasRate1 = /0\.018/.test(clean);
      const hasRate2 = /56(\.0)?/.test(clean);

      if (!hasRate1 || !hasRate2) {
        return {
          correct: false,
          stars: 0,
          feedback:
            "Missing Exchange Rates: Make sure you defined the constants (0.018 and 56.0).",
          executionTimeMs: 0,
        };
      }

      // 2. Identify Approach
      const hasSwitch = /\bswitch\b/.test(clean);
      const hasIfElse = /\bif\b/.test(clean) && /\belse\b/.test(clean);

      if (!hasSwitch && !hasIfElse) {
        return {
          correct: false,
          stars: 0,
          feedback:
            "Missing Logic: You need to implement EITHER a 'switch' statement OR 'if/else' statements.",
          executionTimeMs: 0,
        };
      }

      // 3. Validation based on selection
      if (hasSwitch) {
        // Enforce Placeholders for Switch approach
        if (!/\{0\}/.test(code) || !/\{1(:F2)?\}/.test(code)) {
          return {
            correct: false,
            stars: 0,
            feedback:
              "Missing Placeholders: The Switch approach requires using placeholders like {0} and {1:F2}.",
            executionTimeMs: 0,
          };
        }
      }

      if (hasIfElse) {
        // Enforce Math.Round for If/Else approach
        if (!/Math\.Round/.test(clean)) {
          return {
            correct: false,
            stars: 0,
            feedback:
              "Missing Math.Round: The If/Else approach requires using Math.Round(value, 2).",
            executionTimeMs: 0,
          };
        }
      }

      // If both are present, that's fine too.
      // Dynamic Runtime Verification is handled below by injecting a custom runner if needed?
      // Actually, since we removed the runner from 1.3 in challenges.ts, verifySolution will skip strict comparison
      // UNLESS we implement it here.

      // We NEED to verify the output matches expected.
      // Let's generate EXPECTED output based on the input and the code's approach.
      // Since `verifySolution` iterates `inputs`, we can do it inside the loop below.
      // But `verifySolution` structure relies on `currentChallenge.runner`.
      // We can temporarily attach a runner? No.
      // We can replicate the runner logic here?
      // Or we can just let `currentChallenge.runner` remain NULL (as updated) and rely on manual check?
      // `verifySolution` logic:
      // if (currentChallenge.runner) { ... expectedOutput = ... }
      // ...
      // if (!normUser.includes(normExpected)) ...

      // If `expectedOutput` is empty (because no runner), `normExpected` is empty.
      // `if (!normExpected)` -> returns "Configuration Error".
      // So we MUST generate expected output.
    }

    // --- Challenge 1.7 Specific Checks (Type Casting) ---
    if (currentChallenge.id === "1.7") {
      const clean = cleanCode;
      // Check for Convert.ToInt32 OR (int) cast
      // We match: Convert.ToInt32, (int), (int )
      const hasConvert = /Convert\.ToInt32/.test(clean);
      const hasCast = /\(int\)/.test(clean);

      if (!hasConvert && !hasCast) {
        const feedbackMsg =
          "Missing Type Conversion: You need to use `Convert.ToInt32()` or `(int)` casting.";
        setState((prev) => ({
          ...prev,
          output:
            prev.output +
            "\n❌ MISSING TYPE CONVERSION\n----------------------------\n" +
            "You have the Input, but you didn't convert the type correctly.\n" +
            "Your code needs to explicitly convert the double to an int.\n" +
            "💡 Tip: Use `Convert.ToInt32(val)` or cast with `(int)val`.\n",
        }));
        return {
          correct: false,
          stars: 0,
          feedback: feedbackMsg,
          executionTimeMs: 0,
        };
      }
    }

    // --- Challenge 1.8 Specific Checks (Tax Calculator) ---
    if (currentChallenge.id === "1.8") {
      const clean = cleanCode;
      // Formula: Price * (Rate / 100)
      // We check for multiplication and either division by 100 OR multiplication by 0.xx
      // But the problem asks to input Tax Rate (e.g. 12), so division by 100 is most likely.
      const hasTaxCalc = /(\*.*\/.*100)|(\/.*100.*\*)/.test(clean);

      if (!hasTaxCalc) {
        const feedbackMsg =
          "Missing Tax Formula: Remember Tax Amount = Price * (Rate / 100).";
        setState((prev) => ({
          ...prev,
          output:
            prev.output +
            "\n❌ MISSING TAX FORMULA\n----------------------------\n" +
            "You have the inputs, but the tax calculation is missing.\n" +
            "You need to calculate how much tax to add.\n" +
            "💡 Tip: Tax = Price * (Rate / 100).\n",
        }));
        return {
          correct: false,
          stars: 0,
          feedback: feedbackMsg,
          executionTimeMs: 0,
        };
      }

      // Check for Total addition
      // Total = Price + Tax
      if (!/\+/.test(clean)) {
        const feedbackMsg =
          "Missing Total Formula: Remember Total = Price + Tax Amount.";
        setState((prev) => ({
          ...prev,
          output:
            prev.output +
            "\n❌ MISSING TOTAL FORMULA\n----------------------------\n" +
            "You calculated the tax, but didn't add it to the price.\n" +
            "The final price must include the tax.\n" +
            "💡 Tip: Total = Price + Tax.\n",
        }));
        return {
          correct: false,
          stars: 0,
          feedback: feedbackMsg,
          executionTimeMs: 0,
        };
      }
    }

    // --- Challenge 1.9 Specific Checks (EOQ) ---
    if (currentChallenge.id === "1.9") {
      const clean = cleanCode;
      // EOQ = sqrt((2 * D * S) / H)

      if (!/Math\.Sqrt/.test(clean)) {
        const feedbackMsg =
          "Missing Square Root: The formula requires `Math.Sqrt()`.";
        setState((prev) => ({
          ...prev,
          output:
            prev.output +
            "\n❌ MISSING SQUARE ROOT\n----------------------------\n" +
            "The EOQ formula involves a square root, but I don't see it.\n" +
            "You cannot solve this without square root.\n" +
            "💡 Tip: Use `Math.Sqrt(...)`.\n",
        }));
        return {
          correct: false,
          stars: 0,
          feedback: feedbackMsg,
          executionTimeMs: 0,
        };
      }

      // Check for the core structure: 2 * D * S
      if (!/2\s*\*/.test(clean)) {
        const feedbackMsg =
          "Missing Formula Structure: Numerator is (2 * Demand * OrderCost).";
        setState((prev) => ({
          ...prev,
          output:
            prev.output +
            "\n❌ MISSING FORMULA STRUCTURE\n----------------------------\n" +
            "The internal part of the EOQ formula seems incomplete.\n" +
            "Make sure you are following the standard formula.\n" +
            "💡 Tip: Start with constants: 2 * Demand * OrderCost.\n",
        }));
        return {
          correct: false,
          stars: 0,
          feedback: feedbackMsg,
          executionTimeMs: 0,
        };
      }
    }

    // --- Challenge 1.10 Specific Checks (Area to Radius) ---
    if (currentChallenge.id === "1.10") {
      const clean = cleanCode;
      // r = sqrt(Area / PI)

      if (!/Math\.Sqrt/.test(clean)) {
        const feedbackMsg =
          "Missing Square Root: To find the radius from area, you need `Math.Sqrt()`.";
        setState((prev) => ({
          ...prev,
          output:
            prev.output +
            "\n❌ MISSING SQUARE ROOT\n----------------------------\n" +
            "To go from Area back to Radius, you need to take the square root.\n" +
            "Your code is missing this step.\n" +
            "💡 Tip: Use `Math.Sqrt(...)`.\n",
        }));
        return {
          correct: false,
          stars: 0,
          feedback: feedbackMsg,
          executionTimeMs: 0,
        };
      }

      if (!/Math\.PI/.test(clean)) {
        const feedbackMsg =
          "Missing PI: Use `Math.PI` for the most accurate value of π.";
        setState((prev) => ({
          ...prev,
          output:
            prev.output +
            "\n❌ MISSING PI constant\n----------------------------\n" +
            "The area of a circle involves PI (3.14159...).\n" +
            "Please use the built-in Math constant.\n" +
            "💡 Tip: Use `Math.PI`.\n",
        }));
        return {
          correct: false,
          stars: 0,
          feedback: feedbackMsg,
          executionTimeMs: 0,
        };
      }
    }

    // [New] Clear terminal before verify to show fresh results?
    // Actually the "Verifying solution..." is already there. Let's keep it.

    // [New] Inject Shim for Verification consistency (Echoing inputs)
    const shim = `
      public static class _Internal {
          public static string ReadLine() {
              string s = System.Console.ReadLine();
              if (s == null) return null; // Piston EOF check
              System.Console.Write(s);
              System.Console.WriteLine();
              return s;
          }
      }
    `;

    // Regex to replace Console.ReadLine()
    let verifiedCode = code.replace(
      /System\.Console\.ReadLine\s*\(\)/g,
      "_Internal.ReadLine()",
    );
    verifiedCode = verifiedCode.replace(
      /Console\.ReadLine\s*\(\)/g,
      "_Internal.ReadLine()",
    );
    verifiedCode += "\n" + shim;

    for (const inputVal of inputs) {
      try {
        // 1. Get Expected Output
        let expectedOutput = "";

        // [NEW] Custom Generator for MP 1.3 (One approach sufficient)
        if (currentChallenge.id === "1.3") {
          const lines = inputVal.split("\n");
          // Standard inputs are "Choice\nAmount"
          const choice = lines[0]?.trim();
          const valStr = lines[1]?.trim();
          const val = parseFloat(valStr);

          const PhpToUsd = 0.018;
          const UsdToPhp = 56.0;

          // Re-detect approach to determine expected format
          // Switch -> {1:F2} -> 2 decimal places fixed (e.g. 1.80)
          // If -> Math.Round(d, 2) -> 2 decimal places max (e.g. 1.8)
          const usesSwitch = /\bswitch\b/.test(code);
          // Default to If-style if Switch is not present

          if (choice === "1") {
            const res = val * PhpToUsd;
            if (usesSwitch) {
              expectedOutput = `Result: ${val} PHP = ${res.toFixed(2)} USD`;
            } else {
              const r = Math.round(res * 100) / 100;
              expectedOutput = `Result: ${val} PHP = ${r} USD`;
            }
          } else if (choice === "2") {
            const res = val * UsdToPhp;
            if (usesSwitch) {
              expectedOutput = `Result: ${val} USD = ${res.toFixed(2)} PHP`;
            } else {
              const r = Math.round(res * 100) / 100;
              expectedOutput = `Result: ${val} USD = ${r} PHP`;
            }
          }
        }
        // [NEW] Custom Generator for MP 1.4 (Unit Converter)
        else if (currentChallenge.id === "1.4") {
          const lines = inputVal.split("\n");
          const choice = lines[0]?.trim();
          const val = parseFloat(lines[1] || "0");

          const usesSwitch = /\bswitch\b/.test(code);
          const r2 = (n: number) => Math.round(n * 100) / 100;

          // Factors
          // 1. m->ft: 3.28084
          // 2. kg->lbs: 2.20462
          // 3. l->gal: 0.264172

          if (choice === "1") {
            // m -> ft
            const res = val * 3.28084;
            if (usesSwitch) {
              expectedOutput = `Result: ${val} m = ${res.toFixed(2)} ft`;
            } else {
              expectedOutput = `Result: ${val} m = ${r2(res)} ft`;
            }
          } else if (choice === "2") {
            // kg -> lbs
            const res = val * 2.20462;
            if (usesSwitch) {
              expectedOutput = `Result: ${val} kg = ${res.toFixed(2)} lbs`;
            } else {
              expectedOutput = `Result: ${val} kg = ${r2(res)} lbs`;
            }
          } else if (choice === "3") {
            // L -> gal
            const res = val * 0.264172;
            if (usesSwitch) {
              expectedOutput = `Result: ${val} L = ${res.toFixed(2)} gal`;
            } else {
              expectedOutput = `Result: ${val} L = ${r2(res)} gal`;
            }
          }
        }
        // [NEW] Custom Generator for MP 1.7 (Type Casting)
        else if (currentChallenge.runner) {
          const inputLines = inputVal.split("\n");
          let inputIdx = 0;
          await currentChallenge.runner(
            async () => inputLines[inputIdx++] || "",
            (text) => {
              expectedOutput += text + " ";
            }, // Accumulate with spacing
          );
        }

        // 2. Run User Code via Piston
        // Use verifiedCode instead of code
        const result = await executeCode("csharp", verifiedCode, inputVal);
        if (result.stderr) {
          return {
            correct: false,
            stars: 0,
            feedback: `Compilation/Runtime Error:\n${result.stderr}`,
            executionTimeMs: 0,
          };
        }

        // 3. Compare
        // Normalize: remove extra whitespace, newlines, case-insensitiveish?
        const normUser = (result.stdout || "").replace(/\s+/g, " ").trim();

        // [NEW] Late-binding Expected Output for MP 1.7 (Multiple valid answers)
        if (currentChallenge.id === "1.7") {
          const val = parseFloat(inputVal.trim());
          const s1 = Math.round(val).toString();
          const s2 = Math.floor(val).toString();
          if (normUser.includes(s1)) expectedOutput = s1;
          else if (normUser.includes(s2)) expectedOutput = s2;
          else expectedOutput = `${s1} or ${s2}`; // Will fail comparison
        }

        // [NEW] Late-binding Expected Output for MP 1.10 (Negative Area Check)
        if (currentChallenge.id === "1.10") {
          const area = parseFloat(inputVal.trim());
          if (area < 0) {
            // Option 1: Error message
            const errorMsg = "Error: Negative Area";
            // Option 2: Radius using Abs
            const radius = Math.sqrt(Math.abs(area) / Math.PI);
            const radiusMsg = "Radius: " + radius.toFixed(2);
            const radiusMsg2 = "Radius: " + Math.round(radius * 100) / 100; // Handle simple math.round logic?

            // Check which one user output contains
            if (normUser.includes("Error") || normUser.includes("Negative")) {
              expectedOutput = errorMsg;
            } else if (
              normUser.includes(radius.toFixed(2)) ||
              normUser.includes(radiusMsg2.toString())
            ) {
              expectedOutput = radiusMsg; // or just the number? check includes above
            } else {
              expectedOutput = `${errorMsg} OR ${radiusMsg}`;
            }
          }
        }

        const normExpected = expectedOutput.replace(/\s+/g, " ").trim();

        // [New] Log the test execution to the terminal for visibility
        setState((prev) => ({
          ...prev,
          output:
            prev.output +
            `\nTest Input: ${inputVal.replace(/\n/g, " ")}\nOutput:\n${
              result.stdout || "(no output)"
            }\n`,
        }));

        // [New] Safety Check: If no expected output was generated (e.g. missing runner),
        // we cannot verify correctness. Fail safely to avoid false positives.
        if (!normExpected) {
          return {
            correct: false,
            stars: 0,
            feedback:
              "Configuration Error: This challenge is missing verification tests. Please report this to the developer.",
            executionTimeMs: 0,
          };
        }

        // Loose comparison: check if expected numbers/keywords appear in user output
        // Perfect matching is hard because of prompts ("Enter radius: ").
        // We check if normExpected is a substring of normUser,
        // OR if normUser ends with output.
        // Given that expectedOutput usually contains the *result sentence*,
        // e.g. "The volume ... is ...", checking includes is reasonable.

        if (!normUser.includes(normExpected)) {
          // Check for empty output
          if (!normUser) {
            const failResult = {
              correct: false,
              stars: 0,
              feedback: "Missing Output: Your code didn't print anything.",
              executionTimeMs: 0,
            };
            setState((prev) => ({
              ...prev,
              output:
                prev.output +
                "\n❌ MISSING OUTPUT\n------------------\n" +
                "Your code ran successfully, but it didn't show any results.\n" +
                "You need to print the answer to the screen.\n" +
                "💡 Tip: Use `Console.WriteLine()`.\n" +
                'Example: Console.WriteLine("The volume is: " + volume);\n',
            }));
            return failResult;
          }

          // Heuristic: If expected output has digits (like a result) but user output has none,
          // it likely means they printed the prompt but not the calculated answer.
          const expectedHasDigits = /\d/.test(normExpected);
          const userHasDigits = /\d/.test(normUser);

          if (expectedHasDigits && !userHasDigits) {
            return {
              correct: false,
              stars: 0,
              feedback:
                "Your code ran, but I don't see the answer in the output. Did you forget to print the result using `Console.WriteLine()`?",
              executionTimeMs: 0,
            };
          }

          // [New] Fuzzy Numeric Check
          // Pass if we find a number in user output that is reasonably close to a number in expected output.
          // This handles cases like 523.598... vs 523.60
          const extractNumbers = (txt: string) => {
            const matches = txt.match(/-?[\d,]*\.?\d+/g) || [];
            return matches
              .map((n) => parseFloat(n.replace(/,/g, "")))
              .filter((n) => !isNaN(n));
          };

          const inputNums = extractNumbers(inputVal);
          const expNums = extractNumbers(normExpected);
          const usrNums = extractNumbers(normUser);

          // If expected output contains numbers, assume one of them is the answer.
          // Check if user output contains a matching number (tolerance 0.1)
          // [Fix] Ensure the matched number is NOT just an echo of the input.
          const isNumericMatch =
            expNums.length > 0 &&
            expNums.some((e) =>
              usrNums.some((u) => {
                const isMatch = Math.abs(u - e) < 0.1;
                // If it matches, verify it's not a trivial input echo
                // If matched value 'u' is present in inputNums, we treat it as an echo and discard.
                const isInputEcho = inputNums.some(
                  (i) => Math.abs(u - i) < 0.001,
                );
                return isMatch && !isInputEcho;
              }),
            );

          if (isNumericMatch) {
            // It matches numerically!
            // [Refinement] But did they print the prompt/text?
            // If expected output has significant text (more than just numbers and whitespace),
            // and user output is *only* numbers, we should probably fail or warn.
            // Heuristic: Remove numbers and whitespace. If expected has text left, user should too.
            const expText = normExpected.replace(/-?[\d,]*\.?\d+/g, "").trim();
            const usrText = normUser.replace(/-?[\d,]*\.?\d+/g, "").trim();

            if (expText.length > 5 && usrText.length < 2) {
              // Expected "The volume of a sphere..." but User printed nothing (just numbers).
              const failResult = {
                correct: false,
                stars: 0,
                feedback:
                  "Missing Text: You printed the correct number, but missing the descriptive text or prompts.",
                executionTimeMs: 0,
              };
              setState((prev) => ({
                ...prev,
                output:
                  prev.output +
                  "\n❌ MISSING TEXT/PROMPTS\n-----------------------\n" +
                  "Your calculated answer is correct, but the output format is too simple.\n" +
                  "Expected something like: " +
                  normExpected.substring(0, 30) +
                  "...\n" +
                  "Actual: " +
                  normUser +
                  "\n" +
                  "💡 Tip: Include the text prompts as asked in the problem.\n",
              }));
              return failResult;
            }

            // Otherwise, treat as correct.
            // Continue loop (implicit success for this input)
          } else {
            // [New] Check for "Missing Result" scenario:
            // User printed *some* numbers, but they are all input echoes.
            // This means they likely printed prompts ("Enter Radius: 5") but not the volume.
            const nonEchoNumbers = usrNums.filter(
              (u) => !inputNums.some((i) => Math.abs(u - i) < 0.001),
            );

            if (
              usrNums.length > 0 &&
              nonEchoNumbers.length === 0 &&
              expNums.length > 0
            ) {
              const failResult = {
                correct: false,
                stars: 0,
                feedback: "Missing Output: You didn't print the answer.",
                executionTimeMs: 0,
              };
              setState((prev) => ({
                ...prev,
                output:
                  prev.output +
                  "\n❌ MISSING RESULT\n-------------------\n" +
                  "You printed the input (or prompt), but I don't see the calculated answer.\n" +
                  "You need to print the result using `Console.WriteLine()`.\n" +
                  "Example: Console.WriteLine(result);\n",
              }));
              return failResult;
            }

            const failResult = {
              correct: false,
              stars: 0,
              feedback: `Test Failed. Expected: "${normExpected}"`,
              executionTimeMs: 0,
            };

            setState((prev) => ({
              ...prev,
              output:
                prev.output +
                `\n❌ WRONG OUTPUT\n---------------------\nINPUT:    ${inputVal.replace(
                  /\n/g,
                  " ",
                )}\nEXPECTED: "${normExpected}"\nACTUAL:   "${normUser}"\n`,
            }));

            return failResult;
          }
        }
      } catch (err: any) {
        return {
          correct: false,
          stars: 0,
          feedback: `System Error during verification: ${err.message}`,
          executionTimeMs: 0,
        };
      }
    }

    // Grading Logic (Time-based)
    const endTime = Date.now();
    const executionTimeMs = endTime - state.startTime;
    const elapsedMinutes = executionTimeMs / 60000;

    let targetTime = currentChallenge.targetTimeMinutes || 5; // Default 5 mins
    if (
      !currentChallenge.targetTimeMinutes &&
      currentChallenge.difficulty === "Medium"
    )
      targetTime = 10;
    if (
      !currentChallenge.targetTimeMinutes &&
      currentChallenge.difficulty === "Hard"
    )
      targetTime = 20;

    let earnedStars = 1;
    if (elapsedMinutes <= targetTime) earnedStars = 3;
    else if (elapsedMinutes <= targetTime * 1.5) earnedStars = 2;

    const timeMsg = `Time: ${elapsedMinutes.toFixed(
      1,
    )}m / Target: ${targetTime}m`;

    setState((prev) => ({
      ...prev,
      output: prev.output + "\n✅ Validation Passed! All tests correct.\n",
    }));

    return {
      correct: true,
      stars: earnedStars,
      feedback: `All tests passed!\n${timeMsg}`,
      executionTimeMs,
    };
  };

  const handleComplete = async () => {
    // Run verification first
    const result = await verifySolution();

    if (!result.correct) {
      playSound("wrong"); // Play wrong sound
      setState((prev) => ({
        ...prev,
        showTerminal: true, // Ensure terminal is open
        output: prev.output + "\n\n❌ " + result.feedback,
      }));
      return;
    }

    // Success! output feedback
    playSound("correct"); // Play correct sound
    setState((prev) => ({
      ...prev,
      output:
        prev.output +
        "\n\n✅ " +
        result.feedback +
        `\nYou earned ${result.stars} Stars!`,
    }));

    const isFirstTime = !state.completed.includes(currentChallenge.id);
    if (isFirstTime) {
      playSound("claim"); // Play celebration sound on first completion
    }

    const previousStars = state.stars[currentChallenge.id] || 0;
    const starsDelta = Math.max(0, result.stars - previousStars);
    const improvedScore = result.stars > previousStars;

    // Rewards (only if first time)
    // Note: If you want to award difference in XP based on stars, logic would be complex.
    // For now, staying with "XP/Coins only on first completion" as implied by previous code.
    const xpEarned = isFirstTime ? currentChallenge.xpReward || 20 : 0;
    const coinsEarned = isFirstTime ? currentChallenge.coinsReward || 5 : 0;

    const newExp = state.exp + xpEarned;
    const levelUp = newExp >= state.levelThreshold;

    // 1. Optimistic Update
    setState((prev) => ({
      ...prev,
      // Add to completed if not already
      completed: isFirstTime
        ? [...prev.completed, currentChallenge.id]
        : prev.completed,
      // Update stars only if improved
      stars: {
        ...prev.stars,
        [currentChallenge.id]: Math.max(previousStars, result.stars),
      },
      // [NEW] Update execution time for this challenge
      executionTimes: {
        ...prev.executionTimes,
        [currentChallenge.id]: result.executionTimeMs,
      },
      exp: levelUp ? 0 : newExp,
      level: levelUp ? prev.level + 1 : prev.level,
      levelThreshold: levelUp ? prev.levelThreshold + 20 : prev.levelThreshold,
      coins: prev.coins + coinsEarned,
      showHint: false,
      showSuccessModal: true,
      lastEarnedStars: result.stars,
      isReviewMode: true, // [NEW] Stop timer by entering review mode (or just freezing it)
    }));

    // 2. Persist to DB
    if (user) {
      // --- Streak Logic for Machine Problems ---
      const streakResult = calculateStreakUpdate(user);
      if (streakResult.shouldUpdate) {
        console.log("[MachineProblem] Updating Streak:", streakResult);

        // Update Local User Context
        syncUser({
          ...user,
          streaks: streakResult.newStreak,
          activeDates: streakResult.newActiveDates,
          streakFreezes: streakResult.newFreezes,
          frozenDates: streakResult.newFrozenDates,
          coins: streakResult.newCoins, // In case streak reward gave coins
        });

        // Update DB (Parallel with challenge save)
        await supabase
          .from("users")
          .update({
            streaks: streakResult.newStreak,
            active_dates: streakResult.newActiveDates,
            streak_freezes: streakResult.newFreezes,
            frozen_dates: streakResult.newFrozenDates,
            coins: streakResult.newCoins,
          })
          .eq("id", user.uid);

        toast.success("🔥 Streak Updated!");
      }

      console.log(
        "[HandleComplete] Saving progress for user:",
        user.uid,
        "Challenge:",
        currentChallenge.id,
      );

      // Update User Stars if we earned more
      // Note: We now handle this inside saveChallengeProgress to ensure atomic updates with other stats.
      // The separate update logic has been removed here.

      // Save Challenge Progress (Always update on submit to capture latest code/runtime/score)
      // The user requested that retry overwrites the runtime and code.
      // We still rely on starsDelta to ensure we don't double-award global stars.
      const shouldUpdateProgress = true;

      saveChallengeProgress(
        user.uid,
        currentChallenge,
        {
          stars: result.stars,
          code: state.code,
          executionTime: result.executionTimeMs,
          xpEarned: xpEarned,
          coinsEarned: coinsEarned,
          starsToAdd: starsDelta,
        },
        { skipProgressUpdate: !shouldUpdateProgress },
      ).then((res: { success: boolean; error?: any }) => {
        if (res.success) {
          console.log("[HandleComplete] Save success!");
          toast.success("Progress saved!");
          // Force refresh of user data to update unlocks/rewards in UI
          refreshUser();
        } else {
          console.error("[HandleComplete] Save failed:", res.error);
          toast.error(
            `Save failed: ${(res.error as any)?.message || "Unknown error"}`,
          );
        }
      });
    } else {
      console.warn(
        "[HandleComplete] User not logged in, cannot save progress.",
      );
    }
  };

  const handlePrevious = () => {
    if (state.currentChallengeIndex > 0) {
      setState((prev) => ({
        ...prev,
        currentChallengeIndex: prev.currentChallengeIndex - 1,
        showTerminal: false,
        showHint: false,
      }));
    }
  };

  const handleNext = () => {
    if (
      state.currentChallengeIndex < challenges.length - 1 &&
      state.completed.includes(challenges[state.currentChallengeIndex].id)
    ) {
      setState((prev) => ({
        ...prev,
        currentChallengeIndex: prev.currentChallengeIndex + 1,
        showTerminal: false,
        showHint: false,
      }));
    }
  };

  const toggleHint = () => {
    setState((prev) => ({ ...prev, showHint: !prev.showHint }));
  };

  const useHint = () => {
    // 1. Check if user has hint powerups
    if (state.hints > 0) {
      // Deduct 1 hint
      const newHints = state.hints - 1;
      setState((prev) => ({ ...prev, hints: newHints }));

      // Update DB
      if (user) {
        updateProfile({ hints: newHints }).then(() => {
          toast.success("Hint Used!");
        });
      }
      return true;
    }
    return false;
  };

  const buyHint = () => {
    const HINT_COST = 50;
    if (state.coins >= HINT_COST) {
      const newCoins = state.coins - HINT_COST;
      const newHints = state.hints + 1;

      setState((prev) => ({
        ...prev,
        coins: newCoins,
        hints: newHints,
      }));

      // Update DB
      if (user) {
        updateProfile({ coins: newCoins, hints: newHints }).then(() => {
          toast.success("Hint Bought! (-50 Coins)");
        });
      }
    } else {
      toast.error("Not enough coins! Need 50 coins.");
    }
  };

  const setCode = (code: string) => {
    setState((prev) => ({ ...prev, code }));
  };

  const setOutput = (output: string) => {
    setState((prev) => ({ ...prev, output }));
  };

  const setCurrentChallengeIndex = (index: number) => {
    setState((prev) => ({ ...prev, currentChallengeIndex: index }));
  };

  return (
    <ChallengeContext.Provider
      value={{
        ...state,
        challenges,
        currentChallenge,
        setCode,
        setOutput,
        handleRun,
        submitTerminalInput, // Provide new function
        handleComplete,
        handlePrevious,
        handleNext,
        handleNextChallenge, // [NEW]
        handleCloseModal, // [NEW]
        toggleHint,
        useHint,
        buyHint, // [NEW]
        setCurrentChallengeIndex, // Provide this to the context
        setIsMobileEditMode: setIsMobileEditMode, // [FIX]
        handleRetry, // [NEW]
        reviewTime, // [NEW]
        isExiting, // [NEW] Flag to bypass blocker
      }}
    >
      {children}
    </ChallengeContext.Provider>
  );
};

// 5. Create a strongly-typed custom hook
export const useChallengeContext = () => {
  const context = useContext(ChallengeContext);
  if (context === undefined) {
    throw new Error(
      "useChallengeContext must be used within a ChallengeProvider",
    );
  }
  return context;
};
