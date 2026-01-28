// app/components/challenge/NavigationButtons.tsx
import React from "react";
import { useChallengeContext } from "~/contexts/ChallengeContext";
import { useKeyboardShortcuts } from "~/hooks/useKeyboardShortcuts";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

  const currentChallenge = challenges[currentChallengeIndex];
  if (!currentChallenge) {
    return null;
  }

  const isPreviousDisabled = currentChallengeIndex === 0;
  // Next is disabled if we are at the end OR if current is locked (not completed).
  // Assuming strict linear progression. If not strict, adjust logic.
  const isNextDisabled =
    currentChallengeIndex >= challenges.length - 1 ||
    !completed.includes(currentChallenge.id);

  return (
    <div className="flex justify-between items-center bg-[#1E1E1E] p-4 rounded-xl border border-gray-800 shadow-xl">
      <button
        onClick={handlePrevious}
        disabled={isPreviousDisabled}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
          isPreviousDisabled
            ? "text-gray-600 cursor-not-allowed bg-gray-800/50"
            : "text-gray-200 bg-gray-800 hover:bg-gray-700 hover:text-white hover:scale-[1.02] border border-gray-700"
        }`}
      >
        <ChevronLeft className="w-5 h-5" />
        Previous
      </button>

      <div className="text-gray-500 text-sm hidden sm:block">
        Challenge {currentChallengeIndex + 1} of {challenges.length}
      </div>

      <button
        onClick={handleNext}
        disabled={isNextDisabled}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
          isNextDisabled
            ? "text-gray-600 cursor-not-allowed bg-gray-800/50"
            : "text-white bg-blue-600 hover:bg-blue-500 hover:scale-[1.02] shadow-lg shadow-blue-500/20"
        }`}
      >
        Next Challenge
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default NavigationButtons;
