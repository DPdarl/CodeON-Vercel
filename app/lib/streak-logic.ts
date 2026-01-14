// app/lib/streak-logic.ts
import { UserData } from "~/contexts/AuthContext";

/* -------------------------------- CONFIG -------------------------------- */

export const STREAK_MILESTONES: Record<
  number,
  { coins: number; badge?: string; title?: string }
> = {
  3: { coins: 50, title: "3-Day Spark" },
  7: { coins: 100, badge: "week-warrior", title: "Week Warrior" },
  14: { coins: 250, title: "Fortnight Fighter" },
  30: { coins: 500, badge: "consistency-king", title: "Consistency King" },
  100: { coins: 1000, badge: "century-club", title: "Century Club" },
};

/* ----------------------------- DATE HELPERS ------------------------------ */

// Robust PH Date Getter (YYYY-MM-DD)
// Uses Intl.DateTimeFormat to avoid local timezone shifts during ISO conversion
export const getPhDateString = (offsetDays = 0) => {
  const now = new Date();
  if (offsetDays !== 0) {
    now.setDate(now.getDate() + offsetDays);
  }

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // en-CA outputs YYYY-MM-DD directly
  return formatter.format(now);
};

const diffInDays = (a: string, b: string) => {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
};

/* ----------------------------- RESULT TYPE ------------------------------ */

export type StreakStatus =
  | "CONTINUED"
  | "FROZEN"
  | "BROKEN"
  | "FIRST"
  | "NONE"
  | "RECOVERED";

export interface StreakUpdateResult {
  shouldUpdate: boolean;
  status: StreakStatus;
  newStreak: number;
  newActiveDates: string[];
  newFrozenDates: string[];
  newCoins: number;
  newFreezes: number;
  newBadges: string[];
  messages: string[];
}

/* --------------------------- HELPER: GET CURRENT STATE ------------------- */

export type UIVisualState = "ACTIVE" | "FROZEN" | "BROKEN";

/**
 * Determines the visual state of the streak (Orange, Blue, or Gray)
 * based on the user's history relative to TODAY (PH Time).
 */
export function getStreakState(user: UserData | null): UIVisualState {
  if (!user) return "BROKEN";

  const today = getPhDateString();
  const activeDates = user.activeDates ?? [];
  const frozenDates = (user as any).frozenDates ?? [];

  // 1. Played Today? -> Active
  if (activeDates.includes(today)) return "ACTIVE";

  const lastActive = activeDates.at(-1);
  if (!lastActive) return "BROKEN"; // No history

  const yesterday = getPhDateString(-1);

  // 2. Played Yesterday? -> Active (waiting for today)
  if (lastActive === yesterday) return "ACTIVE";

  // 3. Frozen Yesterday? -> Frozen (Blue state)
  // This means they missed yesterday but it was caught by a freeze
  if (frozenDates.includes(yesterday)) return "FROZEN";

  // 4. Check if we ARE currently in a frozen gap (for gaps > 1 day)
  // If the last active date is far back, but ALL days since then are in frozenDates
  // Check the most recent missing day (yesterday). If it is frozen, we are SAFE.
  if (frozenDates.includes(yesterday)) return "FROZEN";

  // 5. Otherwise -> Broken (Gray state)
  return "BROKEN";
}

/* --------------------------- MAIN STREAK LOGIC --------------------------- */

export function calculateStreakUpdate(user: UserData): StreakUpdateResult {
  const today = getPhDateString();
  const activeDates = user.activeDates ?? [];
  const frozenDates = (user as any).frozenDates ?? [];

  const lastActive = activeDates.at(-1) ?? null;

  const result: StreakUpdateResult = {
    shouldUpdate: false,
    status: "NONE",
    newStreak: user.streaks ?? 0,
    newActiveDates: [...activeDates],
    newFrozenDates: [...frozenDates],
    newCoins: user.coins ?? 0,
    newFreezes: user.streakFreezes ?? 0,
    newBadges: user.badges ?? [],
    messages: [],
  };

  /* 1️⃣ Already active today */
  if (lastActive === today) return result;

  result.shouldUpdate = true;
  result.newActiveDates.push(today);

  /* 2️⃣ First ever streak */
  if (!lastActive) {
    result.newStreak = 1;
    result.status = "FIRST";
    result.messages.push("🔥 Streak Started!");
    return rewardMilestone(result);
  }

  const dayGap = diffInDays(lastActive, today);

  /* 3️⃣ Logic Evaluation */
  if (dayGap <= 1) {
    // --- Normal continuation (1 day gap or 0 if same day logic failed above) ---
    // Note: diffInDays might return 0 if called on same day, but we handled that.
    // dayGap 1 means Yesterday -> Today
    result.newStreak += 1;
    result.status = "CONTINUED";
    result.messages.push("🔥 Streak Continued!");
    return rewardMilestone(result);
  } else {
    // --- Gap Detected (> 1 day) ---
    const daysMissed = dayGap - 1;

    if (result.newFreezes >= daysMissed) {
      // --- FROZEN: Has enough freezes to cover the gap ---
      result.newFreezes -= daysMissed;
      // We extend the streak because they technically "saved" it
      result.newStreak += 1;
      result.status = "FROZEN";

      // Mark the missed days as "Frozen"
      for (let i = 1; i <= daysMissed; i++) {
        const missedDate = getPhDateString(-i);
        if (!result.newFrozenDates.includes(missedDate)) {
          result.newFrozenDates.push(missedDate);
        }
      }

      result.messages.push(
        `❄️ Streak Frozen! Used ${daysMissed} freeze(s) to save your streak.`
      );
    } else {
      // --- BROKEN: Not enough freezes ---
      result.newStreak = 1; // Reset to 1
      result.status = "BROKEN";
      result.messages.push("💔 Streak Broken. Starting fresh!");
    }
  }

  return result;
}

/* --------------------------- MILESTONE REWARD --------------------------- */

function rewardMilestone(result: StreakUpdateResult): StreakUpdateResult {
  const milestone = STREAK_MILESTONES[result.newStreak];

  if (!milestone) return result;

  const alreadyHasBadge =
    milestone.badge && result.newBadges.includes(milestone.badge);

  if (!alreadyHasBadge) {
    result.newCoins += milestone.coins;
    result.messages.push(`🎉 ${milestone.title}! +${milestone.coins} Coins`);

    if (milestone.badge) {
      result.newBadges.push(milestone.badge);
      result.messages.push(`🏅 Badge Unlocked: ${milestone.title}`);
    }
  }

  return result;
}
