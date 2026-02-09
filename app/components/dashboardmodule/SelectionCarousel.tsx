import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import { Button } from "~/components/ui/button";
import { Challenge } from "~/types/challenge.types";
import {
  Zap,
  Brain,
  Code2,
  Terminal,
  Cpu,
  ArrowRight,
  Lock,
  CheckCircle2,
  Play,
} from "lucide-react";

// Helper to get vibrant, "alive" styles
const getTheme = (lang: string) => {
  const normalized = lang?.toLowerCase() || "";

  // Base themes for Light Mode (Vibrant)
  if (normalized.includes("python")) {
    return {
      icon: Terminal,
      bgGradient: "from-blue-500 to-yellow-400",
      shadow: "shadow-blue-500/25",
      text: "text-blue-600 dark:text-indigo-400",
      border: "border-blue-200 dark:border-gray-800",
      lightBg: "bg-blue-50",
    };
  }
  if (normalized.includes("javascript") || normalized.includes("js")) {
    return {
      icon: Code2,
      bgGradient: "from-yellow-400 to-orange-500",
      shadow: "shadow-yellow-500/25",
      text: "text-yellow-600 dark:text-indigo-400",
      border: "border-yellow-200 dark:border-gray-800",
      lightBg: "bg-yellow-50",
    };
  }
  if (normalized.includes("html") || normalized.includes("css")) {
    return {
      icon: Code2,
      bgGradient: "from-orange-500 to-red-500",
      shadow: "shadow-orange-500/25",
      text: "text-orange-600 dark:text-indigo-400",
      border: "border-orange-200 dark:border-gray-800",
      lightBg: "bg-orange-50",
    };
  }
  if (normalized.includes("react")) {
    return {
      icon: Cpu,
      bgGradient: "from-cyan-400 to-blue-600",
      shadow: "shadow-cyan-500/25",
      text: "text-cyan-600 dark:text-indigo-400",
      border: "border-cyan-200 dark:border-gray-800",
      lightBg: "bg-cyan-50",
    };
  }

  // Default/Fallback Logic (consistent with Midnight for Dark Mode, but generic for Light)
  return {
    icon: Brain,
    bgGradient: "from-violet-600 to-indigo-600",
    shadow: "shadow-indigo-500/20",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-gray-200 dark:border-gray-800",
    lightBg: "bg-white",
  };
};

interface SelectionCarouselProps {
  challenges: Challenge[];
  onSelectChallenge: (challenge: Challenge) => void;
  completedChallenges: string[];
}

export function SelectionCarousel({
  challenges,
  onSelectChallenge,
  completedChallenges,
}: SelectionCarouselProps) {
  return (
    <Carousel
      opts={{
        align: "start",
        loop: false,
      }}
      className="w-full relative py-12"
    >
      {/* --- ARROWS --- */}
      <div className="absolute top-0 right-1 flex gap-2 z-20">
        <CarouselPrevious
          className="static translate-y-0 translate-x-0 h-10 w-10 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B0B15] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white rounded-full transition-colors"
          variant="ghost"
        />
        <CarouselNext
          className="static translate-y-0 translate-x-0 h-10 w-10 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B0B15] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white rounded-full transition-colors"
          variant="ghost"
        />
      </div>

      <CarouselContent className="-ml-4">
        {challenges.map((challenge, index) => {
          const previousChallenge = index > 0 ? challenges[index - 1] : null;
          const isPreviousCompleted = previousChallenge
            ? completedChallenges.includes(previousChallenge.id)
            : true;

          const isLocked = !isPreviousCompleted;
          const isCompleted = completedChallenges.includes(challenge.id);

          return (
            <CarouselItem
              key={challenge.id}
              className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/3"
            >
              <AdaptiveChallengeCard
                challenge={challenge}
                onSelect={() => onSelectChallenge(challenge)}
                isLocked={isLocked}
                isCompleted={isCompleted}
                index={index + 1}
              />
            </CarouselItem>
          );
        })}
      </CarouselContent>
    </Carousel>
  );
}

function AdaptiveChallengeCard({
  challenge,
  onSelect,
  isLocked,
  isCompleted,
  index,
}: {
  challenge: Challenge;
  onSelect: () => void;
  isLocked: boolean;
  isCompleted: boolean;
  index: number;
}) {
  const theme = getTheme(challenge.language || "General");
  const Icon = theme.icon;

  return (
    <div className="h-[480px] w-full py-4">
      {/* Wrapper with padding */}
      <div
        className={`
          group relative h-full w-full flex flex-col rounded-[2rem] overflow-hidden 
          transition-all duration-300 ease-out
          ${
            isLocked
              ? "bg-gray-100 dark:bg-[#0B0B15]/50 border-gray-200 dark:border-gray-800"
              : "bg-white dark:bg-[#0B0B15] border-gray-100 dark:border-gray-800/60 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/10"
          }
          border 
        `}
      >
        {/* ================= BACKGROUND GLOW (Dark Mode Only) ================= */}
        {/* Only render complex glows if NOT locked to match 'opacity-50' intent without the performance cost of filters, or reduce intensity */}
        {!isLocked && (
          <div className="hidden dark:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-indigo-600/20 blur-[80px] rounded-full group-hover:bg-indigo-600/30 transition-colors" />
        )}

        {/* ================= BACKGROUND GRADIENT (Light Mode Only) ================= */}
        {!isLocked && (
          <div
            className={`dark:hidden absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-br ${theme.bgGradient} opacity-10 blur-3xl transition-opacity duration-500 group-hover:opacity-20`}
          />
        )}

        {/* ================= LOCKED OVERLAY ================= */}
        {isLocked && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-black/80">
            <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 mb-3">
              <Lock className="w-6 h-6 text-gray-400" />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Locked
            </span>
          </div>
        )}

        {/* ================= CARD CONTENT ================= */}
        <div
          className={`relative z-10 flex flex-col h-full p-8 ${
            isLocked ? "opacity-20 pointer-events-none grayscale" : ""
          }`}
        >
          {/* --- HEADER --- */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-1">
                CHALLENGE
              </span>
              <span className="text-4xl font-black text-gray-900 dark:text-white font-mono tracking-tighter">
                {index.toString().padStart(2, "0")}
              </span>
            </div>

            <div
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-50 dark:bg-[#1A1A2E] ${theme.text} border ${theme.border} dark:border-indigo-500/30`}
            >
              {challenge.difficulty || "EASY"}
            </div>
          </div>

          {/* --- CENTER ICON --- */}
          <div className="flex-1 flex items-center justify-center relative my-6">
            <div className="relative">
              {/* Light Mode Icon (Theme Specific) */}
              <Icon
                className={`w-24 h-24 ${theme.text} dark:hidden drop-shadow-md transition-transform group-hover:scale-105 duration-500`}
              />

              {/* Dark Mode Icon (Brain Default or Theme) */}
              <Brain className="hidden dark:block w-24 h-24 text-indigo-500 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-transform group-hover:scale-105 duration-500" />

              {/* Completed Checkmark */}
              {isCompleted && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1 rounded-full shadow-lg border-4 border-white dark:border-[#0B0B15]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>

          {/* --- TEXT CONTENT --- */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
              {challenge.title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
              {challenge.description}
            </p>
          </div>

          {/* --- FOOTER --- */}
          <div className="flex items-center justify-between mt-auto">
            {/* XP Pill */}
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#151520] px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800">
              <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 pointer-cursor">
                {challenge.xpReward || 20} XP
              </span>
            </div>

            {/* Action Button */}
            <Button
              onClick={onSelect}
              disabled={isLocked}
              className={`
                h-10 px-6 rounded-xl font-bold text-xs uppercase tracking-wide
                transition-all duration-300
                ${
                  isCompleted
                    ? "bg-indigo-500 hover:bg-indigo-600 dark:bg-[#6366F1] dark:hover:bg-[#5356E0] text-white shadow-lg shadow-indigo-500/20"
                    : "bg-indigo-500 hover:bg-indigo-600 dark:bg-[#6366F1] dark:hover:bg-[#5356E0] text-white shadow-lg shadow-indigo-500/20"
                }
              `}
            >
              {isCompleted ? "Redo" : "Start"}
              <Play className="w-3 h-3 ml-2 fill-current" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
