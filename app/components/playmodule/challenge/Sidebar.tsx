// app/components/challenge/Sidebar.tsx
import React from "react";
import { useChallengeContext } from "~/contexts/ChallengeContext";
import { Check, Lock, PlayCircle, ChevronRight, Trophy } from "lucide-react";
import { cn } from "~/lib/utils"; // Assuming utility exists, otherwise standard className string interpolation

const Sidebar = () => {
  const {
    challenges,
    currentChallengeIndex,
    setCurrentChallengeIndex,
    completed,
    userProgress,
    currentChallenge,
  } = useChallengeContext();

  if (!currentChallenge) {
    return (
      <div className="w-full lg:w-80 bg-[#1E1E1E] rounded-xl p-4 animate-pulse h-[600px]"></div>
    );
  }

  const isChallengeAccessible = (index: number) => {
    const challenge = challenges[index];
    if (!challenge) return false;
    // Simple logic: accessible if previous is done or it's the current one.
    // Assuming 'completed' contains IDs.
    // If index 0, always open.
    if (index === 0) return true;

    // Check if previous challenge is completed
    const prevChallenge = challenges[index - 1];
    return completed.includes(prevChallenge.id);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#1E1E1E] overflow-hidden">
      {/* Sidebar Header */}
      <div className="p-4 bg-gray-900 border-b border-gray-800">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
          Progress
        </h2>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-300 font-medium">
            <span>Module Completion</span>
            <span>{Math.round(userProgress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${userProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Challenge List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {challenges.map((challenge, index) => {
          const isCurrent = index === currentChallengeIndex;
          const isCompleted = completed.includes(challenge.id);
          const accessible = isChallengeAccessible(index);
          const locked = !accessible && !isCompleted && !isCurrent;

          return (
            <button
              key={challenge.id}
              disabled={locked}
              onClick={() => setCurrentChallengeIndex(index)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 group relative overflow-hidden",
                isCurrent
                  ? "bg-blue-600/10 border border-blue-500/50 text-blue-100"
                  : isCompleted
                  ? "text-gray-400 hover:bg-gray-800/50"
                  : locked
                  ? "text-gray-600 opacity-60 cursor-not-allowed"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white",
              )}
            >
              <div
                className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                  isCurrent
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                    : isCompleted
                    ? "bg-green-500/20 text-green-500"
                    : locked
                    ? "bg-gray-800 text-gray-600"
                    : "bg-gray-700 text-gray-400 group-hover:bg-gray-600 group-hover:text-white",
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : locked ? (
                  <Lock className="w-3 h-3" />
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </div>

              <div className="flex-grow min-w-0">
                <div className="text-sm font-medium truncate">
                  {challenge.title}
                </div>
                {isCurrent && (
                  <div className="text-[10px] text-blue-300 font-medium animate-pulse">
                    Current Task
                  </div>
                )}
              </div>

              {isCurrent && <ChevronRight className="w-4 h-4 text-blue-500" />}
            </button>
          );
        })}
      </div>

      {/* Footer / Stats */}
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        <div className="flex items-center gap-3 text-yellow-500 bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/20">
          <Trophy className="w-4 h-4" />
          <span className="text-xs font-bold">
            Earn Rewards upon Completion
          </span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
