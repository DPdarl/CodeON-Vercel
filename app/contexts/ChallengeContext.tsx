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
import type { Challenge } from "~/types/challenge.types";
import { executeCode } from "~/utils/piston";
import { lintCode, type LintError } from "~/utils/linter";
import { useAuth } from "~/contexts/AuthContext";
import {
  saveChallengeProgress,
  fetchUserProgress,
} from "~/utils/challenge.client";

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
  setCurrentChallengeIndex: (index: number) => void;
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
    levelThreshold: 20,
    showHint: false,
    showTerminal: false,
    isWaitingForInput: false,
    userProgress: 0,
    diagnostics: [],
    showSuccessModal: false, // [NEW]
  });

  const navigate = useNavigate(); // [NEW] Navigation hook
  const { user } = useAuth();

  // Sync basic stats from User Profile on mount
  useEffect(() => {
    if (user) {
      setState((prev) => ({
        ...prev,
        coins: user.coins || 0,
        exp: user.xp || 0,
        level: user.level || 1,
        // user.levelThreshold might not be in user object, keep default or calculate
      }));

      // Fetch specific challenge progress
      fetchUserProgress(user.uid).then((completedIds) => {
        setState((prev) => ({ ...prev, completed: completedIds }));
      });
    }
  }, [user]);

  const handleNextChallenge = () => {
    // Navigate back to the challenges menu to claim rewards
    navigate("/play/challenges");

    // Ensure modal closes
    setState((prev) => ({ ...prev, showSuccessModal: false }));
  };

  const handleCloseModal = () => {
    setState((prev) => ({ ...prev, showSuccessModal: false }));
  };

  const currentChallenge = useMemo(
    () => challenges[state.currentChallengeIndex],
    [state.currentChallengeIndex],
  );

  // Initialize code with starter code, sanitizing escaped newlines
  useEffect(() => {
    if (currentChallenge) {
      // Replace literal \\r\\n sequences with actual newlines
      const cleanedCode = currentChallenge.starterCode.replace(/\\r\\n/g, "\n");
      setState((prev) => ({ ...prev, code: cleanedCode, diagnostics: [] }));
    }
  }, [currentChallenge]);

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

    const needsInput = /Console\.ReadLine\(|ReadLine\(/i.test(codeToRun);

    // Reset Prompt Ref
    expectedPromptRef.current = null;

    setState((prev) => ({
      ...prev,
      showTerminal: true,
      output: "Compiling...\n",
      isWaitingForInput: false,
    }));

    if (needsInput) {
      // Heuristic: Try to find the prompt string in the code
      // Look for Console.Write("...") before ReadLine
      const lines = codeToRun.split("\n");
      let foundPrompt = "Input Required";
      let manualPromptFound = false;

      // Find first ReadLine
      const readLineIdx = lines.findIndex((l) => /ReadLine/.test(l));
      if (readLineIdx !== -1) {
        // Scan backwards
        for (let i = readLineIdx - 1; i >= 0; i--) {
          const line = lines[i].trim();
          if (!line || line.startsWith("//")) continue;

          // Check for Console.Write or WriteLine with string literal
          const match = line.match(
            /(?:System\.)?Console\.Write(Line)?\s*\(\s*"([^"]*)"\s*\)/,
          );
          if (match) {
            foundPrompt = match[2];
            manualPromptFound = true;
            expectedPromptRef.current = foundPrompt; // Store to strip later
            // If WriteLine, Piston output will have \n, so regex strip might need care,
            // but basic stripping is a good start.
            if (match[1] === "Line") expectedPromptRef.current += "\r\n"; // Approximate newline expectation
            break;
          }
          // If we hit a statement that isn't a write, stop scanning to avoid false matching
          if (line.endsWith(";") || line.includes("{") || line.includes("}"))
            break;
        }
      }

      const displayPrompt = manualPromptFound
        ? foundPrompt
        : "Input Required (Console.ReadLine). Type value and press Enter:";
      const suffix = manualPromptFound ? "" : "\n> "; // If manual prompt (e.g. "Name: "), don't add newline/arrow, look cleaner.

      // If manual prompt, we kind of want to simulate the prompt appearance:
      // "Name: " -> User types here.
      // So we append "Name: " to output.
      // AND we set suffix to "" so user types directly after.

      setState((prev) => ({
        ...prev,
        output: prev.output + displayPrompt + suffix,
        isWaitingForInput: true,
      }));
      return;
    }

    // No input needed, run immediately
    await executeWithPiston(codeToRun, "");
  };

  const submitTerminalInput = async (inputVal: string) => {
    if (state.isWaitingForInput) {
      // Echo the input to make it look like a terminal session
      // If we used a custom prompt, we might want to add a newline after the input echo
      // because Piston output usually starts on new line (unless we strip it).

      setState((prev) => ({
        ...prev,
        output: prev.output + "\n",
        isWaitingForInput: false,
      }));

      await executeWithPiston(
        state.code,
        inputVal,
        expectedPromptRef.current || undefined,
      );
    }
  };

  const verifySolution = async (): Promise<{
    correct: boolean;
    stars: number;
    feedback: string;
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
      return {
        correct: false,
        stars: 0,
        feedback:
          "Missing Input: Your code must read input using Console.ReadLine().",
      };
    }

    // 2. Output Check
    if (
      !code.includes("Console.WriteLine") &&
      !code.includes("Console.Write")
    ) {
      return {
        correct: false,
        stars: 0,
        feedback:
          "Missing Output: Your code must display output using Console.WriteLine() or Console.Write().",
      };
    }

    // 3. Process Check (Heuristic: Look for assignments, math, or logic)
    // We look for common operators or keywords that imply processing.
    const processPattern = /[\+\-\*\/%]|Math\.|if\s*\(|switch|for|while|do/;
    // Also consider complex assignments beyond simple I/O?
    // Actually, simple variable assignment `int x = ...` is often part of process, but `int x = int.Parse(...)` is input.
    // Let's stick to operators/logic keywords for "Process".
    if (!processPattern.test(code)) {
      // It's possible to have a program that just reads and writes without processing (echo),
      // but most challenges require processing.
      // Start with a warning or strict check? User asked "check if there is code for Process".
      // Let's be strict for now as challenges usually require it.
      return {
        correct: false,
        stars: 0,
        feedback:
          "Missing Process: Your code generally needs to perform calculations or logic (e.g., +, -, *, /, if, loops).",
      };
    }

    for (const inputVal of inputs) {
      try {
        // 1. Get Expected Output from JS Runner
        let expectedOutput = "";
        if (currentChallenge.runner) {
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
        const result = await executeCode("csharp", code, inputVal);
        if (result.stderr) {
          return {
            correct: false,
            stars: 0,
            feedback: `Compilation/Runtime Error:\n${result.stderr}`,
          };
        }

        // 3. Compare
        // Normalize: remove extra whitespace, newlines, case-insensitiveish?
        const normUser = (result.stdout || "").replace(/\s+/g, " ").trim();
        const normExpected = expectedOutput.replace(/\s+/g, " ").trim();

        // Loose comparison: check if expected numbers/keywords appear in user output
        // Perfect matching is hard because of prompts ("Enter radius: ").
        // We check if normExpected is a substring of normUser,
        // OR if normUser ends with output.
        // Given that expectedOutput usually contains the *result sentence*,
        // e.g. "The volume ... is ...", checking includes is reasonable.

        if (!normUser.includes(normExpected)) {
          return {
            correct: false,
            stars: 0,
            feedback: `Test Failed for input: ${inputVal.replace(
              /\n/g,
              ", ",
            )}\n\nExpected output to contain:\n"${normExpected}"\n\nGot:\n"${normUser}"`,
          };
        }
      } catch (err: any) {
        return {
          correct: false,
          stars: 0,
          feedback: `System Error during verification: ${err.message}`,
        };
      }
    }

    // Grading Logic (if correct)
    const solutionLength = currentChallenge.solution.length;
    const userCodeLength = code.length;
    let earnedStars = 1;
    if (userCodeLength <= solutionLength * 1.2) earnedStars = 3;
    else if (userCodeLength <= solutionLength * 1.5) earnedStars = 2;

    return { correct: true, stars: earnedStars, feedback: "All tests passed!" };
  };

  const handleComplete = async () => {
    // Run verification first
    const result = await verifySolution();

    if (!result.correct) {
      setState((prev) => ({
        ...prev,
        output: prev.output + "\n\n❌ " + result.feedback,
      }));
      return;
    }

    // Success! output feedback
    setState((prev) => ({
      ...prev,
      output:
        prev.output +
        "\n\n✅ " +
        result.feedback +
        `\nYou earned ${result.stars} Stars!`,
    }));

    if (!state.completed.includes(currentChallenge.id)) {
      const xpEarned = currentChallenge.xpReward || 20;
      const coinsEarned = currentChallenge.coinsReward || 5;

      const newExp = state.exp + xpEarned;
      const levelUp = newExp >= state.levelThreshold;

      // 1. Optimistic Update
      setState((prev) => ({
        ...prev,
        completed: [...prev.completed, currentChallenge.id],
        stars: {
          ...prev.stars,
          [currentChallenge.id]: result.stars,
        },
        exp: levelUp ? 0 : newExp,
        level: levelUp ? prev.level + 1 : prev.level,
        levelThreshold: levelUp
          ? prev.levelThreshold + 20
          : prev.levelThreshold,
        coins: prev.coins + coinsEarned,
        showHint: false,
        showSuccessModal: true,
      }));

      // 2. Persist to DB
      if (user) {
        console.log(
          "[HandleComplete] Saving progress for user:",
          user.uid,
          "Challenge:",
          currentChallenge.id,
        );
        saveChallengeProgress(user.uid, currentChallenge, {
          stars: result.stars,
          code: state.code,
          executionTime: 0, // Todo: measure
          xpEarned: xpEarned,
          coinsEarned: coinsEarned,
        }).then((res) => {
          if (res.success) console.log("[HandleComplete] Save success!");
          else console.error("[HandleComplete] Save failed:", res.error);
        });
      } else {
        console.warn(
          "[HandleComplete] User not logged in, cannot save progress.",
        );
      }
    } else {
      // Already completed, just show modal
      setState((prev) => ({ ...prev, showSuccessModal: true }));
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
    if (state.coins >= 2) {
      setState((prev) => ({ ...prev, coins: prev.coins - 2 }));
      return true;
    }
    return false;
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
        setCurrentChallengeIndex, // Provide this to the context
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
