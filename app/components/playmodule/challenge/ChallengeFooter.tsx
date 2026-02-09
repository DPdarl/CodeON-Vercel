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
} from "lucide-react";
import { Button } from "~/components/ui/button";

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
      </div>

      {/* Right: Navigation (Compact on Mobile) */}
      {/* Right: Navigation (Compact on Mobile) */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Removed Back/Next buttons as requested */}
      </div>
    </footer>
  );
};

export default ChallengeFooter;
