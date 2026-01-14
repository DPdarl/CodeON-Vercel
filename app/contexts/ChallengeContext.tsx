// app/contexts/ChallengeContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useMemo,
} from "react";
import { challenges } from "~/data/challenges";
import type { Challenge } from "~/types/challenge.types";

// 1. Define the shape of the state
interface ChallengeState {
  currentChallengeIndex: number;
  completed: string[]; // Array of challenge IDs
  code: string;
  output: string;
  exp: number;
  level: number;
  coins: number;
  levelThreshold: number;
  showHint: boolean;
  showTerminal: boolean;
  userProgress: number;
}

// 2. Define the shape of the context value (state + functions)
interface ChallengeContextType extends ChallengeState {
  challenges: Challenge[];
  currentChallenge: Challenge;
  setCode: (code: string) => void;
  setOutput: (output: string) => void;
  handleRun: () => void;
  handleComplete: () => void;
  handlePrevious: () => void;
  handleNext: () => void;
  toggleHint: () => void;
  useHint: () => boolean;
  setCurrentChallengeIndex: (index: number) => void; // Added for Sidebar
}

// 3. Create the context with a default value (or null)
export const ChallengeContext = createContext<ChallengeContextType | undefined>(
  undefined
);

// 4. Define props for the provider
interface ChallengeProviderProps {
  children: React.ReactNode;
}

export const ChallengeProvider = ({ children }: ChallengeProviderProps) => {
  const [state, setState] = useState<ChallengeState>({
    currentChallengeIndex: 0,
    completed: [],
    code: "",
    output: "",
    exp: 0,
    level: 1,
    coins: 10,
    levelThreshold: 20,
    showHint: false,
    showTerminal: false,
    userProgress: 0,
  });

  const currentChallenge = useMemo(
    () => challenges[state.currentChallengeIndex],
    [state.currentChallengeIndex]
  );

  // Initialize code with starter code
  useEffect(() => {
    if (currentChallenge) {
      setState((prev) => ({ ...prev, code: currentChallenge.starterCode }));
    }
  }, [currentChallenge]);

  // Calculate progress
  useEffect(() => {
    const progress = (state.completed.length / challenges.length) * 100;
    setState((prev) => ({ ...prev, userProgress: progress }));
  }, [state.completed]);

  const handleRun = () => {
    setState((prev) => ({
      ...prev,
      showTerminal: true,
      output: "Ready to execute code...\n> ",
    }));
    // TODO: Add actual code execution logic here
  };

  const handleComplete = () => {
    if (!state.completed.includes(currentChallenge.id)) {
      const newExp = state.exp + 20;
      const levelUp = newExp >= state.levelThreshold;

      setState((prev) => ({
        ...prev,
        completed: [...prev.completed, currentChallenge.id],
        exp: levelUp ? 0 : newExp,
        level: levelUp ? prev.level + 1 : prev.level,
        levelThreshold: levelUp
          ? prev.levelThreshold + 20
          : prev.levelThreshold,
        coins: prev.coins + 5,
        showTerminal: false,
        showHint: false,
      }));
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
        handleComplete,
        handlePrevious,
        handleNext,
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
      "useChallengeContext must be used within a ChallengeProvider"
    );
  }
  return context;
};
