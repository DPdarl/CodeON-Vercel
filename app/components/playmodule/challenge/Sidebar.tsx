// app/components/challenge/Sidebar.tsx
import React from "react";
import { useChallengeContext } from "~/contexts/ChallengeContext";

const Sidebar = () => {
  const {
    challenges,
    currentChallengeIndex,
    setCurrentChallengeIndex,
    completed,
    userProgress,
    coins,
    currentChallenge, // Get the current challenge
  } = useChallengeContext();

  // ▼▼▼ ADD THIS CHECK ▼▼▼
  // If the challenge isn't loaded yet, don't render the sidebar content
  // This prevents the "cannot read properties of undefined" error
  if (!currentChallenge) {
    return (
      <div className="w-full lg:w-1/3 bg-gray-800 rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4 text-center">Loading...</h2>
      </div>
    );
  }
  // ▲▲▲ END OF FIX ▲▲▲

  const handleChallengeClick = (index: number) => {
    setCurrentChallengeIndex(index);
  };

  const isChallengeAccessible = (index: number) => {
    const challenge = challenges[index];
    if (!challenge) return false;

    // Use currentChallenge.id which we know is safe
    return (
      index <= currentChallengeIndex ||
      completed.includes(challenge.id) ||
      (index === currentChallengeIndex + 1 &&
        completed.includes(currentChallenge.id))
    );
  };

  return (
    <div className="w-full lg:w-1/3 bg-gray-800 rounded-lg p-4 overflow-y-auto max-h-[calc(100vh-150px)]">
      <h2 className="text-xl font-bold mb-4 text-center">
        Module 1: Input / Output
      </h2>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress</span>
          <span>{Math.round(userProgress)}%</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full">
          <div
            className="h-2 bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${userProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Coin balance (mobile visible) */}
      <div className="lg:hidden bg-gray-700 rounded-lg p-2 mb-4 flex justify-between items-center">
        <span className="text-yellow-400 text-sm">Coins:</span>
        <span className="text-white font-bold">{coins}</span>
      </div>

      {/* Challenge list */}
      <h3 className="font-semibold mb-2">Challenges:</h3>
      <div className="space-y-2 overflow-y-auto pr-2">
        {challenges.map((challenge, index) => {
          const isCurrent = index === currentChallengeIndex;
          const isCompleted = completed.includes(challenge.id);
          const isAccessible = isChallengeAccessible(index);

          return (
            <div
              key={challenge.id}
              onClick={() => isAccessible && handleChallengeClick(index)}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 flex items-center border ${
                isCurrent
                  ? "bg-blue-700 border-blue-500"
                  : isCompleted
                  ? "bg-gray-700 border-green-500 hover:bg-gray-600"
                  : isAccessible
                  ? "bg-gray-600 border-gray-500 hover:bg-gray-500"
                  : "bg-gray-800 border-gray-700 cursor-not-allowed opacity-50"
              }`}
            >
              {/* Status icon (omitted for brevity, same as your JSX) */}
              {isCompleted ? "✅" : isCurrent ? "▶️" : "🔒"}

              {/* Challenge info */}
              <div className="flex-grow ml-3">
                <div className="text-sm font-medium">
                  {challenge.id} - {challenge.title}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
