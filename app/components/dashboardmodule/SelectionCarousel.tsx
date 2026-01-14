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
  if (normalized.includes("python")) {
    return {
      icon: Terminal,
      bgGradient: "from-blue-500 to-yellow-400",
      shadow: "shadow-blue-500/25",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-900",
    };
  }
  if (normalized.includes("javascript") || normalized.includes("js")) {
    return {
      icon: Code2,
      bgGradient: "from-yellow-400 to-orange-500",
      shadow: "shadow-yellow-500/25",
      text: "text-yellow-600 dark:text-yellow-400",
      border: "border-yellow-200 dark:border-yellow-900",
    };
  }
  if (normalized.includes("html") || normalized.includes("css")) {
    return {
      icon: Code2,
      bgGradient: "from-orange-500 to-red-500",
      shadow: "shadow-orange-500/25",
      text: "text-orange-600 dark:text-orange-400",
      border: "border-orange-200 dark:border-orange-900",
    };
  }
  if (normalized.includes("react")) {
    return {
      icon: Cpu,
      bgGradient: "from-cyan-400 to-blue-600",
      shadow: "shadow-cyan-500/25",
      text: "text-cyan-600 dark:text-cyan-400",
      border: "border-cyan-200 dark:border-cyan-900",
    };
  }
  return {
    icon: Brain,
    bgGradient: "from-indigo-500 to-purple-600",
    shadow: "shadow-indigo-500/25",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-200 dark:border-indigo-900",
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
      className="w-full py-4"
    >
      {/* --- MOVED ARROWS HERE (Top Right) --- */}
      <div className="flex justify-end gap-2 mb-4 px-1">
        <CarouselPrevious
          className="static translate-y-0 translate-x-0 h-10 w-10 border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 shadow-sm"
          variant="outline"
        />
        <CarouselNext
          className="static translate-y-0 translate-x-0 h-10 w-10 border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 shadow-sm"
          variant="outline"
        />
      </div>

      <CarouselContent className="-ml-4">
        {challenges.map((challenge, index) => {
          // Linear Progression Logic
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
              <VibrantChallengeCard
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

function VibrantChallengeCard({
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
    <div
      className={`
        group relative h-[420px] w-full flex flex-col rounded-[2rem] overflow-hidden 
        transition-all duration-500 ease-out
        ${
          isLocked
            ? "scale-[0.98] opacity-90"
            : "hover:-translate-y-3 hover:shadow-2xl hover:shadow-indigo-500/20"
        }
        bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800
      `}
    >
      {/* ================= BACKGROUND DECORATION ================= */}
      <div
        className={`absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-br ${theme.bgGradient} opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-30`}
      />
      <div
        className={`absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-gradient-to-tr ${theme.bgGradient} opacity-10 blur-3xl`}
      />

      {/* ================= LOCKED STATE OVERLAY ================= */}
      {isLocked && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/30 dark:bg-black/40 backdrop-blur-md transition-all duration-500">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-2xl mb-4 animate-in zoom-in duration-300 border border-gray-100 dark:border-gray-700">
            <Lock className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
            Locked
          </h3>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 px-8 text-center leading-relaxed">
            Complete the previous challenge to unlock this level.
          </p>
        </div>
      )}

      {/* ================= CARD CONTENT ================= */}
      <div className="relative z-10 flex flex-col h-full p-6">
        {/* --- HEADER --- */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Challenge
            </span>
            <span className="text-4xl font-black text-gray-900 dark:text-white font-pixelify">
              {index.toString().padStart(2, "0")}
            </span>
          </div>

          <div
            className={`
            px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border
            ${theme.border} ${theme.text} bg-white dark:bg-gray-800 shadow-sm
          `}
          >
            {challenge.difficulty}
          </div>
        </div>

        {/* --- ICON VISUAL --- */}
        <div className="relative h-32 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
          <div
            className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-20 blur-xl rounded-full scale-75`}
          />
          <Icon
            className={`w-20 h-20 ${theme.text} drop-shadow-md relative z-10`}
          />

          {isCompleted && !isLocked && (
            <div className="absolute -right-2 -bottom-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white dark:border-gray-900 animate-in zoom-in">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* --- TITLE & DESCRIPTION --- */}
        <div className="mb-auto">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {challenge.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {challenge.description}
          </p>
        </div>

        {/* --- FOOTER --- */}
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-1.5 rounded-lg text-yellow-600 dark:text-yellow-400">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">
              {challenge.xp}{" "}
              <span className="text-xs font-normal text-gray-500">XP</span>
            </span>
          </div>

          <Button
            onClick={onSelect}
            disabled={isLocked}
            className={`
              rounded-xl px-6 font-bold shadow-lg transition-all duration-300
              active:scale-95
              ${
                isLocked
                  ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 shadow-none"
                  : `bg-gradient-to-r ${theme.bgGradient} text-white hover:brightness-110 hover:shadow-xl hover:shadow-indigo-500/20`
              }
            `}
          >
            {isCompleted ? "Redo" : "Start"}
            {!isCompleted && <ArrowRight className="w-4 h-4 ml-2" />}
            {isCompleted && <Play className="w-4 h-4 ml-2 fill-current" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
