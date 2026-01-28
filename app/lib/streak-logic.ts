// app/lib/streak-logic.ts
import { UserData } from "~/contexts/AuthContext";

/* -------------------------------- CONFIG -------------------------------- */

export const STREAK_MILESTONES: Record<
  number,
  { coins: number; badge?: string; title?: string }
> = {
  3: { coins: 100, title: "3-Day Spark" },
  7: { coins: 300, badge: "week-warrior", title: "Week Warrior" },
  14: { coins: 500, title: "Fortnight Fighter" },
  30: { coins: 1000, badge: "consistency-king", title: "Consistency King" },
  100: { coins: 2500, badge: "century-club", title: "Century Club" },
};

/* ----------------------------- DATE HELPERS ------------------------------ */

// Robust PH Date Getter (YYYY-MM-DD)
// Manually shifts UTC time by +8 hours to ensure Philippine Standard Time
export const getPhDateString = (offsetDays = 0) => {
  const now = new Date();

  // 1. Get current UTC time in millis
  // now.getTime() is always UTC
  const utcNow = now.getTime();

  // 2. Add 8 hours for generic PH time (No DST in PH)
  const phOffset = 8 * 60 * 60 * 1000;
  const phTime = new Date(utcNow + phOffset);

  // 3. Apply day offset if needed
  if (offsetDays !== 0) {
    phTime.setDate(phTime.getDate() + offsetDays);
  }

  // 4. Return YYYY-MM-DD using ISO string part
  // Since phTime is shifted, its UTC representation IS the PH time
  return phTime.toISOString().split("T")[0];
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

export type UIVisualState = "ACTIVE" | "FROZEN" | "BROKEN" | "PENDING";

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

  // 2. Played Yesterday? -> Pending (Gray state, waiting for today)
  if (lastActive === yesterday) return "PENDING";

  // 3. Frozen Yesterday? -> Frozen (Blue state)
  // This means they missed yesterday but it was caught by a freeze
  if (frozenDates.includes(yesterday)) return "FROZEN";

  // 4. Check if we ARE currently in a frozen gap (for gaps > 1 day)
  // If the last active date is far back, but ALL days since then are in frozenDates
  // Check the most recent missing day (yesterday). If it is frozen, we are SAFE.
  if (frozenDates.includes(yesterday)) return "FROZEN";

  // 5. Otherwise -> Check if coverable by freezes (Effective State)
  const dayGap = diffInDays(lastActive, today);
  // Note: If gap <= 1, it would have been caught by "ACTIVE" check above.
  // So we are dealing with gap > 1 here.
  const daysMissed = dayGap - 1;
  const currentFreezes = user.streakFreezes ?? 0;

  if (currentFreezes >= daysMissed) {
    return "FROZEN";
  }

  return "BROKEN";
}

/* --------------------------- HELPER: EFFECTIVE STREAK ------------------- */

/**
 * Calculates what the streak SHOULD display right now.
 * If the user has missed days and has no freezes, this returns 0.
 * If they have freezes covering the gap, it returns the saved streak.
 */
export function calculateEffectiveStreak(user: UserData | null): number {
  if (!user || user.streaks === undefined) return 0;

  const today = getPhDateString();
  const activeDates = user.activeDates ?? [];
  const lastActive = activeDates.at(-1);

  // No play history
  if (!lastActive) return 0;

  // Played today
  if (lastActive === today) return user.streaks;

  const dayGap = diffInDays(lastActive, today);

  // Played yesterday (or today, covered above)
  if (dayGap <= 1) return user.streaks;

  // Gap Detected
  const daysMissed = dayGap - 1;
  const currentFreezes = user.streakFreezes ?? 0;

  if (currentFreezes >= daysMissed) {
    return user.streaks;
  } else {
    return 0; // Streak is effectively broken
  }
}

/* --------------------------- REPAIR LOGIC --------------------------- */

export interface RepairResult {
  canRepair: boolean;
  cost: number;
  daysToRepair: number;
}

export function getRepairStatus(user: UserData | null): RepairResult {
  if (!user || user.streaks === undefined)
    return { canRepair: false, cost: 0, daysToRepair: 0 };

  const today = getPhDateString();
  const activeDates = user.activeDates ?? [];
  const lastActive = activeDates.at(-1);

  if (!lastActive) return { canRepair: false, cost: 0, daysToRepair: 0 };
  if (lastActive === today)
    return { canRepair: false, cost: 0, daysToRepair: 0 };

  const dayGap = diffInDays(lastActive, today);
  // Repairable if gap is small (e.g. within 3 days?)
  // Actually, if gap > 1 AND not covered by freezes, it's broken.
  // Duolingo usually offers repair for the immediate break.
  // Let's say if gap is > 1.

  // Logic: The streak IS broken effectively.
  // We check if it is "recently" broken.
  // e.g. Gap is 2 (missed yesterday), or 3 (missed day before yesterday).
  // Let's allow repair if gap is <= 3 (missed up to 2 days).

  if (dayGap > 1 && dayGap <= 3) {
    const daysMissed = dayGap - 1;
    const currentFreezes = user.streakFreezes ?? 0;

    // Only offer repair if NOT covered by freezes (i.e. truly broken)
    if (currentFreezes < daysMissed) {
      return {
        canRepair: true,
        cost: 500, // Fixed cost for now
        daysToRepair: daysMissed,
      };
    }
  }

  return { canRepair: false, cost: 0, daysToRepair: 0 };
}

export function repairStreak(user: UserData): StreakUpdateResult {
  const repairStatus = getRepairStatus(user);
  const result: StreakUpdateResult = {
    shouldUpdate: false,
    status: "RECOVERED",
    newStreak: user.streaks ?? 0,
    newActiveDates: [...(user.activeDates ?? [])],
    newFrozenDates: [...((user as any).frozenDates ?? [])],
    newCoins: user.coins ?? 0,
    newFreezes: user.streakFreezes ?? 0,
    newBadges: user.badges ?? [],
    messages: [],
  };

  if (!repairStatus.canRepair) return result;

  if (result.newCoins < repairStatus.cost) {
    result.messages.push("Checking coins... Not enough!");
    // Caller should handle UI, but we return safe result
    return result;
  }

  result.shouldUpdate = true;
  result.newCoins -= repairStatus.cost;

  // Fill the gaps!
  // We basically pretend they were "frozen" or "active"?
  // Duolingo "Streak Repair" usually keeps the streak number.
  // Let's fill them as "Frozen" dates to denote they were saved,
  // OR we can make a new status "Repaired".
  // For simplicity, let's treat them as "Frozen" dates so they show blue in calendar,
  // indicating they weren't *real* play days but the streak is safe.

  const today = getPhDateString();
  const lastActive = result.newActiveDates.at(-1)!;
  const dayGap = diffInDays(lastActive, today); // e.g. 2

  // fill 1..dayGap-1
  for (let i = 1; i < dayGap; i++) {
    // We need to calculate date string for lastActive + i days
    // Re-using getPhDateString logic is hard relative to lastActive.
    // Easier: iterate BACK from today.
    // missed days are: today-1, today-2...
    // up to dayGap-1 days.
    const missedDate = getPhDateString(-i);
    if (!result.newFrozenDates.includes(missedDate)) {
      result.newFrozenDates.push(missedDate);
    }
  }

  // Streak count technically continues from where it was.
  // But wait! If I missed yesterday, my `user.streak` (e.g. 50) is still 50.
  // So by filling the gap, `calculateEffectiveStreak` will now return 50!
  // Because the "gap" is now covered by "frozenDates" (even though we didn't use freeze items).
  // We don't increment the streak here (you didn't play today yet).
  // You just restored the SAFETY of the 50.

  result.messages.push("❤️ Streak Repaired!");

  return result;
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
  /* 1️⃣ Already active today */
  console.log(
    `[StreakDebug] Checking: Today=${today}, ActiveDates=${JSON.stringify(
      activeDates,
    )}`,
  );
  if (activeDates.includes(today)) {
    console.log(
      "[StreakDebug] Already active today (dates include today). No update.",
    );
    return result;
  }

  // Ensure we sort dates to find the true last active date
  const sortedDates = [...activeDates].sort();
  const trueLastActive = sortedDates.at(-1) || null;
  console.log(`[StreakDebug] True Last Active: ${trueLastActive}`);

  result.shouldUpdate = true;
  result.newActiveDates.push(today);
  console.log(
    `[StreakDebug] Marking today as active. New Count: ${result.newActiveDates.length}`,
  );

  /* 2️⃣ First ever streak */
  if (!trueLastActive) {
    result.newStreak = 1;
    result.status = "FIRST";
    result.messages.push("🔥 Streak Started!");
    return result;
  }

  const dayGap = diffInDays(trueLastActive, today);

  /* 3️⃣ Logic Evaluation */
  if (dayGap <= 1) {
    // --- Normal continuation (1 day gap or 0 if same day logic failed above) ---
    // Note: diffInDays might return 0 if called on same day, but we handled that.
    // dayGap 1 means Yesterday -> Today
    result.newStreak += 1;
    result.status = "CONTINUED";
    result.messages.push("🔥 Streak Continued!");
    return result;
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
        `❄️ Streak Frozen! Used ${daysMissed} freeze(s) to save your streak.`,
      );
    } else {
      // --- BROKEN: Not enough freezes ---
      result.newStreak = 1; // Reset to 1 (Today counts as Day 1)
      result.status = "BROKEN";
      result.messages.push("💔 Streak Broken. Starting fresh!");
    }
  }

  return result;
}
