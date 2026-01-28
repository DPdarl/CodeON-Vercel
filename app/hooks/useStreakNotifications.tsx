import { useAuth } from "~/contexts/AuthContext";
import { STREAK_MILESTONES } from "~/lib/streak-logic";

export function useStreakNotifications() {
  const { user } = useAuth();

  if (!user || user.streaks === undefined) {
    return { hasUnclaimedStreak: false };
  }

  const hasUnclaimedStreak = Object.keys(STREAK_MILESTONES).some((daysStr) => {
    const days = Number(daysStr);
    const milestone = STREAK_MILESTONES[days];

    // Check if reached
    const isReached = (user.streaks || 0) >= days;

    // Check if claimed
    // user.settings.claimedMilestones is an array of numbers
    const claimedList = user.settings?.claimedMilestones || [];
    const isClaimed = claimedList.includes(days);

    return isReached && !isClaimed;
  });

  return { hasUnclaimedStreak };
}
