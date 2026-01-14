// app/components/challenge/Header.tsx
import React from "react";
import { useChallengeContext } from "~/contexts/ChallengeContext";
import { useBounceAnimation } from "~/hooks/useBounceAnimation";

const Header = () => {
  const { level, exp, levelThreshold, coins } = useChallengeContext();
  const [xpClass, triggerXpBounce] = useBounceAnimation("animate-pulse");

  React.useEffect(() => {
    triggerXpBounce();
  }, [exp, triggerXpBounce]);

  return (
    <header className="bg-gray-800 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-400">
          C#deON Programming Adventures
        </h1>
        <div className="flex items-center space-x-4">
          <div className={`bg-gray-700 rounded-full px-4 py-1 ${xpClass}`}>
            <span className="text-yellow-400 font-bold">Level {level}</span>
          </div>
          <div className="bg-gray-700 rounded-full px-4 py-1">
            <span className="text-green-400 font-bold">
              {exp}/{levelThreshold} XP
            </span>
          </div>
          <div className="bg-purple-600 rounded-full px-4 py-1">
            <span className="text-white font-bold">{coins} Coins</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
