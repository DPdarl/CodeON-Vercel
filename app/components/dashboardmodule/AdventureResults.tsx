import { useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Trophy,
  Clock,
  Target,
  Zap,
  Coins,
  ArrowRight,
  Share2,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

// Props interface to receive data from the game engine
interface AdventureResultsProps {
  stats: {
    timeSeconds: number;
    accuracy: number; // 0 to 100
    totalQuestions: number;
  };
  rewards: {
    xp: number;
    coins: number;
  };
  unlockedBadge?: {
    name: string;
    icon: string; // URL or emoji
    description: string;
  };
  onContinue: () => void;
}

export function AdventureResults({
  stats,
  rewards,
  unlockedBadge,
  onContinue,
}: AdventureResultsProps) {
  // Confetti on mount
  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#6366f1", "#10b981", "#f59e0b"], // Indigo, Emerald, Amber
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#6366f1", "#10b981", "#f59e0b"],
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // ✅ FIXED: Explicitly typed variants to resolve TS Errors
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", bounce: 0.5 },
    },
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-6 text-center space-y-8 bg-background/95 backdrop-blur-sm">
      {/* 1. Header Celebration */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-yellow-400 blur-[50px] opacity-20 rounded-full" />
        <Trophy className="w-24 h-24 text-yellow-500 mx-auto drop-shadow-lg" />
      </motion.div>

      <div className="space-y-2">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-black text-indigo-900 dark:text-indigo-100 uppercase tracking-tight"
        >
          Lesson Complete!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground font-medium"
        >
          You're crushing it! Keep the momentum going.
        </motion.p>
      </div>

      {/* 2. Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-4 w-full max-w-sm"
      >
        {/* Run-Time */}
        <motion.div variants={item}>
          <Card className="p-4 border-2 border-indigo-100 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20">
            <div className="flex flex-col items-center gap-2">
              <Clock className="w-6 h-6 text-indigo-500" />
              <div>
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Time
                </div>
                <div className="text-2xl font-black text-indigo-700 dark:text-indigo-300">
                  {formatTime(stats.timeSeconds)}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Accuracy */}
        <motion.div variants={item}>
          <Card className="p-4 border-2 border-emerald-100 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20">
            <div className="flex flex-col items-center gap-2">
              <Target className="w-6 h-6 text-emerald-500" />
              <div>
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Accuracy
                </div>
                <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                  {stats.accuracy}%
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* 3. Rewards Section (Loot) */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-sm space-y-3"
      >
        <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-left pl-1">
          Rewards
        </div>

        {/* XP & Coins Row */}
        <motion.div variants={item} className="flex gap-3">
          <div className="flex-1 bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-3 flex items-center gap-3">
            <div className="p-2 bg-yellow-400 rounded-lg text-yellow-900">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase">
                Total XP
              </div>
              <div className="text-xl font-black text-yellow-700 dark:text-yellow-300">
                +{rewards.xp}
              </div>
            </div>
          </div>

          <div className="flex-1 bg-blue-400/10 border border-blue-400/20 rounded-xl p-3 flex items-center gap-3">
            <div className="p-2 bg-blue-400 rounded-lg text-blue-900">
              <Coins className="w-5 h-5 fill-current" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">
                Coins
              </div>
              <div className="text-xl font-black text-blue-700 dark:text-blue-300">
                +{rewards.coins}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Optional Badge Unlock */}
        {unlockedBadge && (
          <motion.div variants={item} className="mt-4">
            <Card className="p-4 border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 bg-purple-500 text-white text-[10px] font-bold px-6 py-1 rotate-45">
                NEW!
              </div>
              <div className="flex items-center gap-4">
                <div className="text-4xl">{unlockedBadge.icon}</div>
                <div className="text-left">
                  <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    Badge Unlocked
                  </div>
                  <div className="text-lg font-black text-purple-900 dark:text-purple-100">
                    {unlockedBadge.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {unlockedBadge.description}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* 4. Footer Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }} // Delay buttons so user looks at stats first
        className="w-full max-w-sm space-y-3 pt-4"
      >
        <Button
          size="lg"
          className="w-full h-14 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] transition-all shadow-xl shadow-indigo-500/20"
          onClick={onContinue}
        >
          Claim Rewards <ArrowRight className="w-5 h-5 ml-2" />
        </Button>

        <Button
          variant="ghost"
          className="w-full text-muted-foreground hover:text-indigo-500"
        >
          <Share2 className="w-4 h-4 mr-2" /> Share Result
        </Button>
      </motion.div>
    </div>
  );
}
