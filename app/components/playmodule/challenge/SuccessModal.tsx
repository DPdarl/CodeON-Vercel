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
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#60A5FA", "#3B82F6", "#2563EB"],
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#F472B6", "#EC4899", "#DB2777"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isOpen]);

  // Dynamic Content based on stars
  const getContent = () => {
    switch (stars) {
      case 3:
        return {
          title: "Challenge Solved!",
          subTitle: "Perfect solution! You've mastered this concept.",
          color: "text-yellow-400",
          shadow: "shadow-yellow-500/20",
          trophyGradient: "from-yellow-400 to-yellow-600",
        };
      case 2:
        return {
          title: "Great Job!",
          subTitle: "Good work! Attempt to optimize for a better score.",
          color: "text-blue-400",
          shadow: "shadow-blue-500/20",
          trophyGradient: "from-blue-400 to-blue-600",
        };
      case 1:
      default:
        return {
          title: "Completed!",
          subTitle: "You solved it! Keep practicing to improve efficiency.",
          color: "text-orange-400",
          shadow: "shadow-orange-500/20",
          trophyGradient: "from-orange-400 to-orange-600",
        };
    }
  };

  const content = getContent();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={`relative bg-[#1E1E1E] border border-gray-800 rounded-2xl w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)] ${content.shadow} overflow-hidden`}
          >
            {/* Background Glow */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            <div className="p-8 flex flex-col items-center text-center relative z-10">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div
                  className={`w-20 h-20 bg-gradient-to-tr ${content.trophyGradient} rounded-full flex items-center justify-center shadow-lg mb-4 mx-auto`}
                >
                  <Trophy className="text-white w-10 h-10" />
                </div>
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-black text-white mb-2"
              >
                {content.title}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-400 mb-8"
              >
                {content.subTitle}
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
                          ? `${content.color} fill-current drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]`
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
                    +{stars >= 1 ? xp : 0}
                  </span>
                </div>
                <div className="w-px h-8 bg-gray-800" />
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-bold">
                    Coins Found
                  </span>
                  <span className="text-xl font-bold text-yellow-500">
                    +{stars >= 1 ? coins : 0}
                  </span>
                </div>
              </motion.div>

              {/* Actions */}
              <div className="flex flex-col w-full gap-3">
                <Button
                  onClick={onNext}
                  className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-500 text-white shadow-[0_4px_0_#15803d] active:shadow-none active:translate-y-1 transition-all"
                >
                  {isLastChallenge ? "Finish Module" : "Next Challenge"}{" "}
                  <ArrowRight className="ml-2 w-5 h-5" />
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
