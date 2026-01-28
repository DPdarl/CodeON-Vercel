import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/contexts/AuthContext";
import { getStreakState, getPhDateString } from "~/lib/streak-logic"; // Ensure this matches actual path
import { Flame, Clock, HeartCrack, CheckCircle2 } from "lucide-react";
import { useNavigate } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";

type CheckerState = "IDLE" | "SUCCESS" | "REMINDER" | "BROKEN";

const STORAGE_KEY_DATE = "streak_checker_last_date";
const STORAGE_KEY_STATE = "streak_checker_last_status";

export function StreakChecker() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modalState, setModalState] = useState<CheckerState>("IDLE");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkStatus = () => {
      const currentState = getStreakState(user); // "ACTIVE" | "PENDING" | "BROKEN" | "FROZEN"
      const today = getPhDateString();

      const lastSeenDate = localStorage.getItem(STORAGE_KEY_DATE);
      const lastSeenStatus = localStorage.getItem(STORAGE_KEY_STATE); // The status WE stored last time

      console.log("[StreakChecker]", {
        currentState,
        lastSeenStatus,
        lastSeenDate,
        today,
      });

      // 1. SUCCESS: Just became ACTIVE (and wasn't effectively active before in our eyes)
      //    We check if we already showed "SUCCESS" for today.
      if (currentState === "ACTIVE") {
        if (lastSeenStatus !== "ACTIVE" || lastSeenDate !== today) {
          // It's a new success event!
          setModalState("SUCCESS");
          setIsOpen(true);
          updateStorage(today, "ACTIVE");
          return;
        }
      }

      // 2. REMINDER: It's PENDING (not played today)
      //    Show once per day.
      if (currentState === "PENDING") {
        if (lastSeenDate !== today) {
          setModalState("REMINDER");
          setIsOpen(true);
          updateStorage(today, "PENDING"); // We mark as pending so we don't show again today
          return;
        }
      }

      // 3. BROKEN: Just became BROKEN
      //    We check if we already showed "BROKEN" recently.
      if (currentState === "BROKEN") {
        // If we haven't acknowledged the break yet
        if (lastSeenStatus !== "BROKEN") {
          setModalState("BROKEN");
          setIsOpen(true);
          updateStorage(today, "BROKEN");
          return;
        }
      }
    };

    // Run check with a small delay to ensure hydration/sync stable
    const timer = setTimeout(checkStatus, 1000);
    return () => clearTimeout(timer);
  }, [user]);

  const updateStorage = (date: string, status: string) => {
    localStorage.setItem(STORAGE_KEY_DATE, date);
    localStorage.setItem(STORAGE_KEY_STATE, status);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleAction = () => {
    setIsOpen(false);
    if (modalState === "REMINDER") {
      navigate("/play");
    }
  };

  if (modalState === "IDLE") return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md text-center p-0 overflow-hidden bg-transparent border-none shadow-none">
        <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-6 border-4 border-white/20 shadow-2xl">
          <AnimatePresence mode="wait">
            {modalState === "SUCCESS" && (
              <motion.div
                key="success"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                <div className="mx-auto w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center animate-bounce">
                  <Flame className="w-12 h-12 text-orange-500 fill-orange-500" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                    Streak Extended!
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    You're on fire! 🔥 Your streak is safe for another day.
                  </p>
                </div>
                <div className="pt-4">
                  <Button
                    onClick={handleClose}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-12 rounded-xl text-lg shadow-lg shadow-orange-500/20"
                  >
                    Awesome!
                  </Button>
                </div>
              </motion.div>
            )}

            {modalState === "REMINDER" && (
              <motion.div
                key="reminder"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                <div className="mx-auto w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center animate-pulse">
                  <Clock className="w-12 h-12 text-yellow-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                    Streak at Risk!
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    You haven't practiced today. Solve a challenge now to keep
                    your streak!
                  </p>
                </div>
                <div className="pt-4 flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={handleClose}
                    className="flex-1 font-bold"
                  >
                    Later
                  </Button>
                  <Button
                    onClick={handleAction}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold h-12 rounded-xl text-lg shadow-lg shadow-green-500/20"
                  >
                    Play Now
                  </Button>
                </div>
              </motion.div>
            )}

            {modalState === "BROKEN" && (
              <motion.div
                key="broken"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                  <HeartCrack className="w-12 h-12 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                    Streak Lost
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    You missed a day. Don't worry, start a new streak today!
                  </p>
                </div>
                <div className="pt-4">
                  <Button
                    onClick={handleClose}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold h-12 rounded-xl text-lg"
                  >
                    I'll do better
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
