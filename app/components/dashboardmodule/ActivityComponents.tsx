import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "~/components/ui/button";
import { Check, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "~/lib/utils";
import { useGameSound } from "~/hooks/useGameSound"; // ✅ IMPORT HOOK

// Interface for the Ref to trigger hints
export interface ActivityHandle {
  triggerHint: () => Promise<void>;
}

// --- 1. QUIZ COMPONENT ---
export const QuizActivity = forwardRef<
  ActivityHandle,
  {
    data: any;
    onComplete: (success: boolean) => void;
    onConsumeHint: () => Promise<boolean>;
    disabled?: boolean;
  }
>(({ data, onComplete, onConsumeHint, disabled = false }, ref) => {
  const { playSound } = useGameSound(); // ✅ INIT AUDIO
  const [selected, setSelected] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [disabledOptions, setDisabledOptions] = useState<number[]>([]);

  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [correctShuffledIndex, setCorrectShuffledIndex] = useState<number>(-1);

  useEffect(() => {
    if (data && data.options) {
      const optionsWithOriginalIndex = data.options.map(
        (opt: string, index: number) => ({
          value: opt,
          originalIndex: index,
          isCorrect: opt === data.answer,
        })
      );

      const shuffled = [...optionsWithOriginalIndex].sort(
        () => Math.random() - 0.5
      );

      setShuffledOptions(shuffled.map((item) => item.value));
      setCorrectShuffledIndex(shuffled.findIndex((item) => item.isCorrect));

      setSelected(null);
      setIsChecked(false);
      setDisabledOptions([]);
    }
  }, [data]);

  useImperativeHandle(ref, () => ({
    triggerHint: async () => {
      const success = await onConsumeHint();
      if (!success) return;

      const wrongIndices = shuffledOptions
        .map((_, idx) => idx)
        .filter(
          (idx) =>
            idx !== correctShuffledIndex && !disabledOptions.includes(idx)
        );

      const shuffledWrong = wrongIndices.sort(() => 0.5 - Math.random());
      const toDisable = shuffledWrong.slice(0, 2);

      setDisabledOptions((prev) => [...prev, ...toDisable]);
    },
  }));

  if (!data || !data.options || !Array.isArray(data.options)) return null;

  const handleSubmit = () => {
    setIsChecked(true);
    const isCorrect = selected === correctShuffledIndex;

    // ✅ PLAY RESULT SOUND
    if (isCorrect) playSound("correct");
    else playSound("wrong");

    onComplete(isCorrect);
  };

  const isInteractionDisabled = isChecked || disabled;

  return (
    <div className="space-y-6 w-full max-w-lg mx-auto">
      {data.question && (
        <div className="bg-secondary/30 p-6 rounded-2xl border border-border">
          <h3 className="text-xl md:text-2xl font-bold text-center text-foreground leading-snug">
            {data.question}
          </h3>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shuffledOptions.map((opt: string, idx: number) => {
          const isOptionDisabled = disabledOptions.includes(idx);
          let style =
            "border-2 border-transparent bg-secondary/50 hover:border-indigo-500";

          if (isOptionDisabled) {
            style =
              "opacity-30 cursor-not-allowed bg-gray-100 dark:bg-gray-800 border-transparent scale-95";
          } else if (isChecked) {
            if (idx === correctShuffledIndex)
              style = "bg-green-500 text-white border-green-600 shadow-lg";
            else if (selected === idx)
              style = "bg-red-500 text-white border-red-600";
            else style = "opacity-50 grayscale";
          } else if (selected === idx) {
            style =
              "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-500/20 shadow-md transform scale-[1.02]";
          }

          return (
            <motion.div
              key={idx}
              whileTap={
                !isInteractionDisabled && !isOptionDisabled
                  ? { scale: 0.98 }
                  : {}
              }
              onClick={() => {
                if (!isInteractionDisabled && !isOptionDisabled) {
                  playSound("click"); // ✅ PLAY CLICK
                  setSelected(idx);
                }
              }}
              className={cn(
                `p-5 rounded-xl cursor-pointer font-bold text-lg transition-all text-left ${style}`,
                isInteractionDisabled && "cursor-default"
              )}
            >
              {opt}
            </motion.div>
          );
        })}
      </div>
      <Button
        onClick={handleSubmit}
        disabled={selected === null || isInteractionDisabled}
        className={cn(
          "w-full h-14 text-xl font-black rounded-xl transition-all shadow-xl",
          isChecked && selected === correctShuffledIndex
            ? "bg-green-500 hover:bg-green-600 text-white"
            : isChecked
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-indigo-600 hover:bg-indigo-700 text-white"
        )}
      >
        {isChecked
          ? selected === correctShuffledIndex
            ? "Correct! 🎉"
            : "Incorrect ❌"
          : "Check Answer"}
      </Button>
    </div>
  );
});
QuizActivity.displayName = "QuizActivity";

// --- 2. BUILDING BLOCKS COMPONENT ---
export const BuildingBlocksActivity = forwardRef<
  ActivityHandle,
  {
    data: any;
    onComplete: (success: boolean) => void;
    onConsumeHint: () => Promise<boolean>;
    disabled?: boolean;
  }
>(({ data, onComplete, onConsumeHint, disabled = false }, ref) => {
  const { playSound } = useGameSound(); // ✅ INIT AUDIO
  const [currentOrder, setCurrentOrder] = useState<string[]>([]);
  const [pool, setPool] = useState<string[]>([]);
  const [isWrong, setIsWrong] = useState(false);

  useEffect(() => {
    if (data && data.segments) {
      const scrambled = [...data.segments];
      scrambled.sort(() => Math.random() - 0.5);
      setPool(scrambled);
      setCurrentOrder([]);
      setIsWrong(false);
    }
  }, [data]);

  useImperativeHandle(ref, () => ({
    triggerHint: async () => {
      const nextIndexNeeded = currentOrder.length;
      if (nextIndexNeeded >= data.correctOrder.length) return;

      const correctOriginalIndex = data.correctOrder[nextIndexNeeded];
      const correctValue = data.segments[correctOriginalIndex];
      const isInPool = pool.includes(correctValue);

      if (!isInPool) {
        handleReset();
        return;
      }

      const success = await onConsumeHint();
      if (!success) return;

      setPool((prev) => {
        const idx = prev.indexOf(correctValue);
        if (idx > -1) {
          const newPool = [...prev];
          newPool.splice(idx, 1);
          return newPool;
        }
        return prev;
      });

      setCurrentOrder((prev) => [...prev, correctValue]);
      setIsWrong(false);
    },
  }));

  if (!data || !data.segments) return null;

  const handleSelect = (segment: string) => {
    if (disabled) return;
    playSound("click"); // ✅ PLAY CLICK
    const index = pool.indexOf(segment);
    if (index > -1) {
      const newPool = [...pool];
      newPool.splice(index, 1);
      setPool(newPool);
      setCurrentOrder([...currentOrder, segment]);
      setIsWrong(false);
    }
  };

  const handleRemoveBlock = (indexToRemove: number) => {
    if (disabled) return;
    playSound("click"); // ✅ PLAY CLICK
    const blockToRemove = currentOrder[indexToRemove];
    const newOrder = currentOrder.filter((_, idx) => idx !== indexToRemove);
    setCurrentOrder(newOrder);
    setPool((prev) => [...prev, blockToRemove]);
    setIsWrong(false);
  };

  const handleReset = () => {
    if (disabled) return;
    playSound("click");
    setPool([...pool, ...currentOrder]);
    setCurrentOrder([]);
    setIsWrong(false);
  };

  const handleCheck = () => {
    const expectedStringArray = data.correctOrder.map(
      (index: number) => data.segments[index]
    );
    const isCorrect =
      JSON.stringify(currentOrder) === JSON.stringify(expectedStringArray);

    if (isCorrect) {
      playSound("correct"); // ✅ CORRECT
      onComplete(true);
    } else {
      playSound("wrong"); // ✅ WRONG
      setIsWrong(true);
      const btn = document.getElementById("run-code-btn");
      if (btn) btn.classList.add("animate-shake");
      setTimeout(() => {
        if (btn) btn.classList.remove("animate-shake");
      }, 500);
      onComplete(false);
    }
  };

  return (
    <div className="space-y-8 w-full max-w-2xl mx-auto">
      {/* Code Area (Compiler) */}
      <div
        className={cn(
          "min-h-[140px] p-6 bg-zinc-950 rounded-2xl border-4 border-dashed flex flex-wrap gap-3 content-start transition-all shadow-inner",
          isWrong ? "border-red-500/50 bg-red-950/10" : "border-zinc-800"
        )}
      >
        {currentOrder.length === 0 && (
          <div className="w-full h-full flex items-center justify-center text-zinc-600 text-lg font-medium italic">
            Tap blocks below to build the code...
          </div>
        )}
        <AnimatePresence>
          {currentOrder.map((s, i) => (
            <motion.button
              layout
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              key={`${s}-${i}`}
              onClick={() => handleRemoveBlock(i)}
              disabled={disabled}
              className="px-4 py-3 bg-indigo-600 text-white rounded-lg font-mono text-lg font-bold shadow-lg border-b-4 border-indigo-800 hover:bg-red-500 hover:border-red-700 transition-colors"
              title="Click to remove"
            >
              {s}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Block Pool */}
      <div className="flex flex-wrap gap-4 justify-center min-h-[80px]">
        <AnimatePresence>
          {pool.map((s, i) => (
            <motion.button
              layout
              key={`${s}-${i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              whileTap={!disabled ? { scale: 0.95 } : {}}
              onClick={() => handleSelect(s)}
              disabled={disabled}
              className="px-4 py-3 bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm font-mono text-lg font-semibold hover:border-indigo-500 hover:text-indigo-500 hover:shadow-md transition-all border-b-4 active:border-b-2 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {s}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={disabled}
          className="h-14 w-14 rounded-xl border-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-50"
        >
          <RefreshCcw className="w-6 h-6" />
        </Button>
        <Button
          id="run-code-btn"
          onClick={handleCheck}
          className={cn(
            "flex-1 h-14 text-xl font-black rounded-xl shadow-xl transition-all",
            isWrong
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
          )}
          disabled={currentOrder.length === 0 || disabled}
        >
          {isWrong ? "Incorrect Code" : "Run Code ▶"}
        </Button>
      </div>
    </div>
  );
});
BuildingBlocksActivity.displayName = "BuildingBlocksActivity";

// --- 3. MATCHING COMPONENT ---
export const MatchingActivity = forwardRef<
  ActivityHandle,
  {
    data: any;
    onComplete: (success: boolean) => void;
    onConsumeHint: () => Promise<boolean>;
    disabled?: boolean;
  }
>(({ data, onComplete, onConsumeHint, disabled = false }, ref) => {
  const { playSound } = useGameSound(); // ✅ INIT AUDIO
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);

  const [shuffledLeft, setShuffledLeft] = useState<any[]>([]);
  const [shuffledRight, setShuffledRight] = useState<any[]>([]);

  useEffect(() => {
    setSelectedLeft(null);
    setMatched([]);
    if (data && data.pairs) {
      const lefts = data.pairs.map((p: any) => ({
        val: p.left,
        pairId: p.left,
      }));
      setShuffledLeft(lefts.sort(() => Math.random() - 0.5));

      const rights = data.pairs.map((p: any) => ({
        val: p.right,
        originalLeft: p.left,
      }));
      setShuffledRight(rights.sort(() => Math.random() - 0.5));
    }
  }, [data]);

  useImperativeHandle(ref, () => ({
    triggerHint: async () => {
      const success = await onConsumeHint();
      if (!success) return;

      const firstUnmatched = data.pairs.find(
        (p: any) => !matched.includes(p.left)
      );
      if (!firstUnmatched) return;

      const newMatched = [...matched, firstUnmatched.left];
      setMatched(newMatched);
      playSound("correct"); // Hint match sound

      if (newMatched.length === data.pairs.length) {
        setTimeout(() => onComplete(true), 500);
      }
    },
  }));

  if (!data || !data.pairs) return null;

  const handleLeftClick = (leftVal: string) => {
    if (disabled || matched.includes(leftVal)) return;
    playSound("click"); // ✅ CLICK
    setSelectedLeft(leftVal);
  };

  const handleRightClick = (rightObj: any) => {
    if (disabled || !selectedLeft) return;

    if (selectedLeft === rightObj.originalLeft) {
      const newMatched = [...matched, selectedLeft];
      setMatched(newMatched);
      setSelectedLeft(null);
      playSound("correct"); // ✅ MATCH CORRECT

      if (newMatched.length === data.pairs.length) {
        setTimeout(() => onComplete(true), 500);
      }
    } else {
      playSound("wrong"); // ✅ MATCH WRONG
      const grid = document.getElementById("matching-grid");
      if (grid) {
        grid.classList.add("animate-shake");
        setTimeout(() => grid.classList.remove("animate-shake"), 500);
      }
      setSelectedLeft(null);
      onComplete(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-3xl mx-auto">
      <div id="matching-grid" className="w-full grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="flex flex-col gap-4">
          {shuffledLeft.map((item: any, idx: number) => {
            const isMatched = matched.includes(item.val);
            const isSelected = selectedLeft === item.val;

            return (
              <motion.button
                layout
                key={`left-${idx}`}
                whileTap={!disabled && !isMatched ? { scale: 0.98 } : {}}
                onClick={() => handleLeftClick(item.val)}
                disabled={isMatched || disabled}
                className={cn(
                  "h-24 p-4 rounded-2xl border-b-4 flex items-center justify-center text-base font-bold transition-all shadow-sm",
                  isMatched
                    ? "bg-green-100 border-green-400 text-green-800 opacity-60 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400"
                    : isSelected
                    ? "bg-indigo-100 border-indigo-500 text-indigo-800 dark:bg-indigo-900/40 dark:border-indigo-500 dark:text-indigo-300 transform scale-105 shadow-md"
                    : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {isMatched && <Check className="w-5 h-5 mr-2 text-green-600" />}
                {item.val}
              </motion.button>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">
          {shuffledRight.map((item: any, idx: number) => {
            const isMatched = matched.includes(item.originalLeft);

            return (
              <motion.button
                layout
                key={`right-${idx}`}
                whileTap={!disabled && !isMatched ? { scale: 0.98 } : {}}
                onClick={() => handleRightClick(item)}
                disabled={isMatched || disabled}
                className={cn(
                  "h-24 p-4 rounded-2xl border-b-4 flex items-center justify-center text-base font-bold transition-all shadow-sm",
                  isMatched
                    ? "bg-green-100 border-green-400 text-green-800 opacity-60 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400"
                    : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {item.val}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
});
MatchingActivity.displayName = "MatchingActivity";
