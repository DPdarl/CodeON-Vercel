// app/hooks/useGameProgress.tsx
import { useState } from "react";
import { useAuth } from "~/contexts/AuthContext";
import { calculateProgress } from "~/lib/leveling-system";
import { getLeagueFromXP } from "~/lib/leaderboard-logic";
import { toast } from "sonner";

// Define the interface to match LevelUpModalProps
interface Reward {
  type: "coin" | "badge" | "unlock";
  label: string;
}

export function useGameProgress() {
  const { user, updateProfile } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const [levelUpModal, setLevelUpModal] = useState({
    isOpen: false,
    newLevel: 1,
    rewards: [] as Reward[], // ✅ FIX: Correctly typed as Reward objects
  });

  const grantXP = async (amount: number) => {
    if (!user || isProcessing) return;

    setIsProcessing(true);
    const currentXP = user.xp || 0;
    const currentLevel = user.level || 1;
    const currentLeague = user.league || "Novice";

    const newXP = currentXP + amount;

    // 1. Calculate Level Up
    const { currentLevel: calculatedLevel } = calculateProgress(newXP);

    // 2. Calculate League Update
    const newLeague = getLeagueFromXP(newXP);

    const updates: any = {
      xp: newXP,
      level: calculatedLevel,
      // Update active dates to keep track of daily activity
      activeDates: Array.from(
        new Set([
          ...(user.activeDates || []),
          new Date().toISOString().split("T")[0],
        ])
      ),
    };

    // Only update league if it changed (e.g., Novice -> Bronze)
    if (newLeague !== currentLeague) {
      updates.league = newLeague;
      toast.success(`Promoted to ${newLeague} League! 🏆`);
    }

    // Handle Level Up Logic
    if (calculatedLevel > currentLevel) {
      // ✅ FIX: Define rewards as objects, not strings
      const rewards: Reward[] = [
        { type: "coin", label: "100 Coins" },
        { type: "unlock", label: "Streak Freeze" },
      ];

      updates.coins = (user.coins || 0) + 100;
      updates.streakFreezes = (user.streakFreezes || 0) + 1;

      setLevelUpModal({
        isOpen: true,
        newLevel: calculatedLevel,
        rewards,
      });
    } else {
      // Just a simple toast for normal XP gain
      toast.success(`+${amount} XP`);
    }

    // Save to DB (This saves XP, Level, League, and Rewards)
    await updateProfile(updates);

    setIsProcessing(false);
  };

  return {
    grantXP,
    levelUpModal: {
      ...levelUpModal,
      close: () => setLevelUpModal((prev) => ({ ...prev, isOpen: false })),
    },
    isProcessing,
  };
}
