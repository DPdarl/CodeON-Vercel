import { motion, AnimatePresence } from "framer-motion";
import { Star, ArrowRight, X, Trophy } from "lucide-react";
import confetti from "canvas-confetti";
import { useEffect } from "react";
import { Button } from "~/components/ui/button";

interface SuccessModalProps {
  isOpen: boolean;
  stars: number;
  xp: number;
  coins: number;
  message: string;
  onNext: () => void;
  onClose: () => void;
  isLastChallenge?: boolean;
}

export const SuccessModal = ({
  isOpen,
  stars,
  xp,
  coins,
  message,
  onNext,
  onClose,
  isLastChallenge = false,
}: SuccessModalProps) => {
  useEffect(() => {
    if (isOpen) {
      // Trigger confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#60A5FA", "#3B82F6", "#2563EB"], // Blue theme
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#F472B6", "#EC4899", "#DB2777"], // Pink accents
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative bg-[#1E1E1E] border border-gray-800 rounded-2xl w-full max-w-md shadow-[0_0_50px_rgba(37,99,235,0.2)] overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-blue-600/20 to-transparent pointer-events-none" />

            <div className="p-8 flex flex-col items-center text-center relative z-10">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg mb-4 mx-auto">
                  <Trophy className="text-white w-10 h-10" />
                </div>
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-black text-white mb-2"
              >
                Challenge Solved!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-400 mb-8"
              >
                {message || "Great job on your solution."}
              </motion.p>

              {/* Stars Animation */}
              <div className="flex gap-4 mb-8">
                {[1, 2, 3].map((s, i) => (
                  <motion.div
                    key={s}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: 0.5 + i * 0.2, // Staggered stars
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                    }}
                  >
                    <Star
                      size={48}
                      className={`${
                        s <= stars
                          ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                          : "text-gray-700"
                      }`}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Rewards */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="flex items-center gap-6 mb-8 bg-gray-900/50 px-6 py-3 rounded-xl border border-gray-800"
              >
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-bold">
                    {" "}
                    XP Earned
                  </span>
                  <span className="text-xl font-bold text-purple-400">
                    +{xp}
                  </span>
                </div>
                <div className="w-px h-8 bg-gray-800" />
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-bold">
                    Coins Found
                  </span>
                  <span className="text-xl font-bold text-yellow-500">
                    +{coins}
                  </span>
                </div>
              </motion.div>

              {/* Actions */}
              <div className="flex flex-col w-full gap-3">
                <Button
                  onClick={onNext}
                  className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-500 text-white shadow-[0_4px_0_#15803d] active:shadow-none active:translate-y-1 transition-all"
                >
                  Claim Rewards <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="w-full text-gray-500 hover:text-white"
                >
                  Stay Here
                </Button>
              </div>
            </div>

            {/* Close X */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
