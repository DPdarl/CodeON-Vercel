// app/components/playmodule/challenge/ChallengeFooter.tsx
import React from "react";
import { Link } from "@remix-run/react";
import { useChallengeContext } from "~/contexts/ChallengeContext";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  List,
  Maximize2,
  Loader2,
  PenLine,
  Lock,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";

interface ChallengeFooterProps {
  onRun?: () => void;
  onSubmit?: () => void;
}

const ChallengeFooter = ({ onRun, onSubmit }: ChallengeFooterProps) => {
  const {
    handleRun,
    handleComplete,
    handlePrevious,
    handleNext,
    currentChallengeIndex,
    challenges,
    output,
    isLoading,
    isExecuting,
    isReviewMode, // [NEW]
    handleRetry, // [NEW]
    isMobileEditMode, // [NEW] Needed for toggle
    setIsMobileEditMode, // [NEW] Needed for toggle
  } = useChallengeContext();

  const isFirst = currentChallengeIndex === 0;
  const isLast = currentChallengeIndex === challenges.length - 1;

  return (
    <footer className="h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border flex items-center justify-between px-4 z-50 select-none">
      {/* Left: Info (Hidden on Mobile) */}
      <div className="hidden md:flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
            Current Exercise
          </span>
          <span className="text-sm font-medium text-foreground">
            {challenges[currentChallengeIndex]?.title}
          </span>
        </div>
      </div>

      {/* Center: Actions */}
      <div className="flex items-center gap-3">
        {isReviewMode ? (
          <Button
            onClick={handleRetry}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold min-w-[140px] shadow-sm animate-pulse"
          >
            Retry Challenge
          </Button>
        ) : (
          <>
            <Button
              onClick={() => {
                handleRun();
                onRun?.();
              }}
              variant="secondary"
              className="border border-border font-semibold gap-2 min-w-[80px]"
              disabled={isExecuting}
            >
              {isExecuting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isExecuting ? "Running..." : "Run"}
            </Button>

            <Button
              onClick={() => {
                handleComplete();
                onSubmit?.();
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold min-w-[140px] shadow-sm"
            >
              Submit Answer
            </Button>
          </>
        )}
      </div>

      {/* Right: Toggle (Mobile Only) */}
      {!isReviewMode && (
        <div className="md:hidden flex items-center">
          <Button
            onClick={() => {
              const newMode = !isMobileEditMode;
              setIsMobileEditMode(newMode);
              if (newMode) {
                toast.success("Edit Mode: Keyboard enabled");
              } else {
                toast.info("Read Mode: Keyboard disabled for scrolling");
              }
            }}
            variant="ghost"
            size="sm"
            className={`h-10 px-3 gap-2 border transition-all ${
              isMobileEditMode
                ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                : "bg-gray-100 text-gray-600 border-transparent dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            {isMobileEditMode ? <PenLine size={16} /> : <Lock size={16} />}
            <span className="text-xs font-semibold">
              {isMobileEditMode ? "Edit" : "Read"}
            </span>
          </Button>
        </div>
      )}

      {/* Right: Navigation (Compact on Mobile) */}
      {/* Right: Navigation (Compact on Mobile) */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Removed Back/Next buttons as requested */}
      </div>
    </footer>
  );
};

export default ChallengeFooter;
