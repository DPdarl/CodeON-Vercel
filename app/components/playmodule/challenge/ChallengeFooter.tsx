// app/components/playmodule/challenge/ChallengeFooter.tsx
import React from "react";
import { Link } from "@remix-run/react";
import { useChallengeContext } from "~/contexts/ChallengeContext";
import { ChevronLeft, ChevronRight, Play, List, Maximize2 } from "lucide-react";
import { Button } from "~/components/ui/button";

interface ChallengeFooterProps {}

const ChallengeFooter = ({}: ChallengeFooterProps) => {
  const {
    handleRun,
    handleComplete,
    handlePrevious,
    handleNext,
    currentChallengeIndex,
    challenges,
    output,
  } = useChallengeContext();

  const isFirst = currentChallengeIndex === 0;
  const isLast = currentChallengeIndex === challenges.length - 1;

  return (
    <footer className="h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border flex items-center justify-between px-4 z-50 select-none">
      {/* Left: Info */}
      <div className="flex items-center gap-4">
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
          onClick={handleRun}
          variant="secondary"
          className="border border-border font-semibold gap-2 min-w-[100px]"
        >
          <Play className="w-4 h-4" /> Run
        </Button>

        <Button
          onClick={handleComplete}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold min-w-[140px] shadow-sm"
        >
          Submit Answer
        </Button>
      </div>

      {/* Right: Navigation */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          onClick={handlePrevious}
          disabled={isFirst}
          className="text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30"
        >
          Back
        </Button>
        <Button
          variant="outline"
          onClick={handleNext}
          disabled={isLast}
          className="border-border bg-transparent text-foreground hover:bg-secondary disabled:opacity-30 gap-1"
        >
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </footer>
  );
};

export default ChallengeFooter;
