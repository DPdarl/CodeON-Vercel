// app/components/challenge/NavigationButtons.tsx
import React from "react";
import { useChallengeContext } from "~/contexts/ChallengeContext";
import { useKeyboardShortcuts } from "~/hooks/useKeyboardShortcuts";

const NavigationButtons = () => {
  const {
    currentChallengeIndex,
    challenges,
    completed,
    handlePrevious,
    handleNext,
  } = useChallengeContext();

  useKeyboardShortcuts([
    ["Ctrl+ArrowLeft", handlePrevious],
    ["Ctrl+ArrowRight", handleNext],
  ]);

  // ▼▼▼ ADD THIS GUARD CLAUSE ▼▼▼
  // Get the challenge object safely
  const currentChallenge = challenges[currentChallengeIndex];
  if (!currentChallenge) {
    // Don't render buttons if challenge data isn't ready
    return null;
  }
  // ▲▲▲ END GUARD CLAUSE ▲▲▲

  const isPreviousDisabled = currentChallengeIndex === 0;
  const isNextDisabled =
    currentChallengeIndex >= challenges.length - 1 ||
    !completed.includes(currentChallenge.id); // This is now safe

  return (
    <div className="flex justify-between mt-4">
      <button
        onClick={handlePrevious}
        disabled={isPreviousDisabled}
        className={`px-4 py-2 rounded transition-all ${
          isPreviousDisabled
            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
        }`}
      >
        Previous Challenge
      </button>

      <button
        onClick={handleNext}
        disabled={isNextDisabled}
        className={`px-4 py-2 rounded transition-all ${
          isNextDisabled
            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
        }`}
      >
        Next Challenge
      </button>
    </div>
  );
};

export default NavigationButtons;
