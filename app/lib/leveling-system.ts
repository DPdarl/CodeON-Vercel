// app/lib/leveling-system.ts
import { supabase } from "~/lib/supabase";

export const LEVELING_CONSTANTS = {
  BASE_XP: 100,
  INCREMENT: 50,
  COINS_PER_LEVEL: 50, // Standardized reward constant
};

interface LevelProgress {
  currentLevel: number;
  currentXP: number; // XP gained towards the *next* level
  totalXP: number; // Lifetime accumulated XP
  xpForNextLevel: number;
  progressPercent: number;
}

interface XPGainResult {
  newTotalXP: number;
  newLevel: number;
  levelsGained: number;
  rewards: string[];
  coinsEarned: number; // Added to help with DB updates
}

/**
 * Calculates the XP required to pass a specific level.
 * Formula: Base + (Level - 1) * Increment
 */
export function getXpRequiredForLevel(level: number): number {
  return (
    LEVELING_CONSTANTS.BASE_XP + (level - 1) * LEVELING_CONSTANTS.INCREMENT
  );
}

/**
 * Converts Total XP (lifetime) into current level and partial progress.
 * This handles "overflow" automatically because it recalculates from total.
 */
export function calculateProgress(totalXP: number): LevelProgress {
  let level = 1;
  let xp = totalXP;
  let required = getXpRequiredForLevel(level);

  // Keep subtracting required XP until we don't have enough for the next level
  while (xp >= required) {
    xp -= required;
    level++;
    required = getXpRequiredForLevel(level);
  }

  return {
    currentLevel: level,
    currentXP: xp, // Remaining XP (current bar fill)
    totalXP: totalXP,
    xpForNextLevel: required,
    progressPercent: Math.min(100, (xp / required) * 100),
  };
}

/**
 * Pure calculation: Adds XP and determines if level up occurred.
 * Does NOT touch the database. Used by the async function below.
 */
export function addXP(
  currentTotalXP: number,
  amountToAdd: number
): XPGainResult {
  const oldStats = calculateProgress(currentTotalXP);
  const newTotalXP = currentTotalXP + amountToAdd;
  const newStats = calculateProgress(newTotalXP);

  const levelsGained = newStats.currentLevel - oldStats.currentLevel;
  const rewards: string[] = [];
  let coinsEarned = 0;

  if (levelsGained > 0) {
    // 1. Calculate Coin Reward
    coinsEarned = levelsGained * LEVELING_CONSTANTS.COINS_PER_LEVEL;
    rewards.push(`${coinsEarned} Coins`);

    // 2. Check for Feature Unlocks
    if (oldStats.currentLevel < 5 && newStats.currentLevel >= 5) {
      rewards.push("Multiplayer Unlocked 🔓");
    }

    // 3. Check for Milestone Badges (e.g. Level 10, 20)
    if (newStats.currentLevel % 10 === 0) {
      rewards.push("Milestone Badge 🏅");
    }
  }

  return {
    newTotalXP,
    newLevel: newStats.currentLevel,
    levelsGained,
    rewards,
    coinsEarned,
  };
}

/**
 * DATABASE OPERATION
 * Fetches the user's current stats, calculates the new XP/Level,
 * and saves everything to Supabase.
 * * Usage:
 * await awardXPToUser(user.uid, 50);
 */
export async function awardXPToUser(userId: string, amountToAdd: number) {
  try {
    // 1. Fetch current latest data from DB (Safety check)
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("xp, coins")
      .eq("id", userId)
      .single();

    if (fetchError || !userData)
      throw new Error("User not found or network error.");

    const currentXP = userData.xp || 0;
    const currentCoins = userData.coins || 0;

    // 2. Calculate new stats using the pure logic
    const result = addXP(currentXP, amountToAdd);

    // 3. Prepare the database update object
    const updates: { xp: number; level: number; coins?: number } = {
      xp: result.newTotalXP,
      level: result.newLevel,
    };

    // Only update coins if we actually earned some (to save bandwidth/logic)
    if (result.coinsEarned > 0) {
      updates.coins = currentCoins + result.coinsEarned;
    }

    // 4. Save to Supabase
    const { error: updateError } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId);

    if (updateError) throw updateError;

    // Return the result so the UI can show a "Level Up!" modal
    return result;
  } catch (error) {
    console.error("Failed to award XP:", error);
    throw error;
  }
}
