// app/components/dashboardmodule/LevelUpModal.tsx
import { Dialog, DialogContent } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { motion } from "framer-motion";
import { Trophy, Coins, Award, Check, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface LevelUpModalProps {
  isOpen: boolean;
  newLevel: number;
  rewards: { type: "coin" | "badge" | "unlock"; label: string }[];
  onClose: () => void;
}

export function LevelUpModal({
  isOpen,
  newLevel,
  rewards,
  onClose,
}: LevelUpModalProps) {
  // Simple internal confetti effect logic (optional)
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-transparent border-none shadow-none p-0 flex items-center justify-center min-h-[500px]">
        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-gradient-to-b from-indigo-900 to-slate-900 border-2 border-indigo-500/50 p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl relative overflow-hidden"
        >
          {/* Background Effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-indigo-500/20 blur-3xl rounded-full -z-10" />
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none bg-yellow-500/10 animate-pulse z-0" />
          )}

          {/* Level Badge Animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg relative z-10"
          >
            <span className="text-4xl font-black text-white drop-shadow-md">
              {newLevel}
            </span>
            <Trophy className="absolute -top-6 -right-6 w-12 h-12 text-yellow-300 drop-shadow-lg animate-bounce" />
          </motion.div>

          <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-wide">
            Level Up!
          </h2>
          <p className="text-indigo-200 mb-8 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            You are getting stronger!
          </p>

          {/* Rewards List */}
          <div className="space-y-3 mb-8 text-left bg-black/20 p-4 rounded-2xl border border-white/10">
            <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">
              Rewards Claimed
            </p>
            {rewards.map((reward, i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3 bg-white/5 p-2 rounded-lg"
              >
                {reward.type === "coin" && (
                  <div className="p-2 bg-yellow-500/20 rounded-full">
                    <Coins className="w-5 h-5 text-yellow-400" />
                  </div>
                )}
                {reward.type === "badge" && (
                  <div className="p-2 bg-purple-500/20 rounded-full">
                    <Award className="w-5 h-5 text-purple-400" />
                  </div>
                )}
                {reward.type === "unlock" && (
                  <div className="p-2 bg-green-500/20 rounded-full">
                    <Check className="w-5 h-5 text-green-400" />
                  </div>
                )}
                <span className="font-bold text-white text-sm">
                  {reward.label}
                </span>
              </motion.div>
            ))}
          </div>

          <Button
            onClick={onClose}
            className="w-full h-12 text-lg font-bold bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-lg shadow-green-500/25 transition-all hover:scale-105 active:scale-95"
          >
            Claim Rewards
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
