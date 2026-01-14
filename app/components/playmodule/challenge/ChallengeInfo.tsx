// app/components/challenge/ChallengeInfo.tsx
import React, { useState } from "react";
import { useChallengeContext } from "~/contexts/ChallengeContext";
import Toast from "./Toast"; // Use the refactored Toast

type ToastData = {
  id: number;
  message: string;
  type: "success" | "error" | "info";
};

const ChallengeInfo = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const {
    currentChallenge,
    showHint,
    toggleHint,
    handleRun,
    handleComplete,
    useHint,
  } = useChallengeContext();

  const addToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
  };

  const handleHintClick = () => {
    if (showHint) {
      toggleHint(); // Allow hiding without cost
    } else if (useHint()) {
      toggleHint();
    } else {
      addToast("Not enough coins! Complete challenges to earn more.", "error");
    }
  };

  const handleSubmit = () => {
    handleComplete();
    addToast("Challenge Complete! +20 XP", "success");
    // You might want to add real submission validation here
  };

  if (!currentChallenge) {
    return <div>Loading challenge...</div>;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 relative">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">
          {currentChallenge.id}: {currentChallenge.title}
        </h2>
        <span className="bg-blue-600 text-xs px-2 py-1 rounded">
          Page {currentChallenge.page}
        </span>
      </div>

      <p className="text-gray-300 mb-4">{currentChallenge.description}</p>

      <div className="flex space-x-2">
        <button
          onClick={handleHintClick}
          className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm flex items-center"
        >
          {showHint ? "Hide Hint" : "Show Hint (2 Coins)"}
        </button>

        <button
          onClick={handleRun}
          className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
        >
          Run Code
        </button>

        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
        >
          Submit (+20 XP)
        </button>
      </div>

      {showHint && (
        <div className="mt-4 bg-gray-700 p-3 rounded border-l-4 border-yellow-500">
          <h4 className="font-bold text-yellow-400 mb-1">Hint:</h4>
          <p className="text-sm">{currentChallenge.hint}</p>
        </div>
      )}

      {/* Render toasts */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() =>
              setToasts((prevToasts) =>
                prevToasts.filter((t) => t.id !== toast.id)
              )
            }
          />
        ))}
      </div>
    </div>
  );
};

export default ChallengeInfo;
