import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Trophy, Clock, Target, Star, CheckCircle, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface AdventureCompletedProps {
  isOpen: boolean;
  onClose: () => void;
  onClaim: () => Promise<void>;
  stats: {
    totalRuntime: number; // in seconds
    averageAccuracy: number; // percentage (0-100)
    isClaimed: boolean;
  };
}

export function AdventureCompletedCelebration({
  isOpen,
  onClose,
  onClaim,
  stats,
}: AdventureCompletedProps) {
  const [claiming, setClaiming] = useState(false);

  // Helper to format seconds to HH:MM:SS
  const formatRuntime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  // --- FIREWORKS EFFECT ---
  useEffect(() => {
    if (isOpen && !stats.isClaimed) {
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 100,
      };

      const randomInRange = (min: number, max: number) =>
        Math.random() * (max - min) + min;

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen, stats.isClaimed]);

  const handleClaim = async () => {
    setClaiming(true);
    await onClaim();
    setClaiming(false);
    // Fire one last big burst on claim
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 20 }}
            className="relative w-full max-w-lg"
          >
            <Card className="border-4 border-yellow-500/50 bg-gradient-to-b from-slate-900 to-slate-950 text-white shadow-[0_0_50px_rgba(234,179,8,0.3)] overflow-hidden">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-20"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Decorative Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 bg-yellow-500/20 blur-3xl rounded-full -mt-20" />

              <CardContent className="pt-12 pb-8 px-8 text-center relative z-10">
                {/* Trophy Icon */}
                <motion.div
                  initial={{ y: -20, rotate: -10 }}
                  animate={{ y: 0, rotate: 0 }}
                  transition={{
                    repeat: Infinity,
                    repeatType: "reverse",
                    duration: 2,
                  }}
                  className="mx-auto w-32 h-32 bg-yellow-500/10 rounded-full flex items-center justify-center border-4 border-yellow-500 mb-6 shadow-xl"
                >
                  <Trophy className="w-16 h-16 text-yellow-400 fill-yellow-400" />
                </motion.div>

                <h2 className="text-4xl font-black mb-2 tracking-tight bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 bg-clip-text text-transparent">
                  ADVENTURE COMPLETE!
                </h2>
                <p className="text-slate-400 mb-8 text-lg">
                  You have mastered the path of C#.
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                    <div className="flex items-center justify-center gap-2 text-slate-400 mb-1 text-sm font-bold uppercase tracking-wider">
                      <Clock className="w-4 h-4" /> Final Time
                    </div>
                    <div className="text-2xl font-mono font-bold text-white">
                      {formatRuntime(stats.totalRuntime)}
                    </div>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                    <div className="flex items-center justify-center gap-2 text-slate-400 mb-1 text-sm font-bold uppercase tracking-wider">
                      <Target className="w-4 h-4" /> Accuracy
                    </div>
                    <div className="text-2xl font-mono font-bold text-white">
                      {stats.averageAccuracy}%
                    </div>
                  </div>
                </div>

                {/* Rewards Section */}
                <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-xl p-6 mb-8">
                  <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-4">
                    Grand Prize Rewards
                  </h3>
                  <div className="flex justify-center gap-8">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/50">
                        <div className="text-yellow-400 font-black text-xs">
                          $
                        </div>
                      </div>
                      <span className="font-bold text-yellow-400">
                        +500 Coins
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/50">
                        <Star className="w-6 h-6 text-purple-400 fill-purple-400" />
                      </div>
                      <span className="font-bold text-purple-400">
                        +1000 XP
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                {stats.isClaimed ? (
                  <Button
                    disabled
                    className="w-full h-14 text-lg font-bold bg-slate-800 text-slate-400 border border-slate-700"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" /> Rewards Claimed
                  </Button>
                ) : (
                  <Button
                    onClick={handleClaim}
                    disabled={claiming}
                    className="w-full h-14 text-lg font-bold bg-yellow-500 hover:bg-yellow-400 text-yellow-950 shadow-lg shadow-yellow-500/20 animate-pulse"
                  >
                    {claiming ? "Claiming..." : "CLAIM REWARDS"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
