import { supabase } from "~/lib/supabase";
import { Challenge } from "~/types/challenge.types";

export const saveChallengeProgress = async (
  userId: string,
  challenge: Challenge,
  results: {
    stars: number;
    code: string;
    executionTime: number;
    xpEarned: number;
    coinsEarned: number;
    starsToAdd?: number; // New field for delta update
  },
  options?: {
    skipProgressUpdate?: boolean;
  },
) => {
  try {
    // 0. Ensure Challenge Exists in DB (Fixes FK Error)
    // ... (Keep existing logic if needed, but for brevity I assume we just wrap the body)
    // Actually, I'll just keeping the upsert challenge definition as it's safe.

    // Capture timestamp once to ensure consistency
    const now = new Date().toISOString();

    const { error: challengeError } = await supabase.from("challenges").upsert(
      {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        page: challenge.page,
      },
      { onConflict: "id" },
    );

    if (challengeError) {
      console.warn("Error upserting challenge definition:", challengeError);
    }

    // 1. Upsert Challenge Progress (Only if not skipped)
    if (!options?.skipProgressUpdate) {
      const { error: progressError } = await supabase
        .from("user_challenge_progress")
        .upsert(
          {
            user_id: userId,
            challenge_id: challenge.id,
            status: "completed",
            stars: results.stars,
            code_submitted: results.code,
            execution_time_ms: results.executionTime,
            executed_at: now,
          },
          { onConflict: "user_id, challenge_id" },
        );

      if (progressError) throw progressError;
    }

    // 2. Insert Match History
    const { error: historyError } = await supabase
      .from("match_history")
      .insert({
        user_id: userId, // Link to the user
        mode: "challenge",
        winner_name: "You",
        participants_count: 1,
        results: {
          challengeId: challenge.id,
          stars: results.stars,
          xp: results.xpEarned,
          coins: results.coinsEarned,
        },
        played_at: now,
      });

    if (historyError) throw historyError;

    // 3. Update User Stats (Optimistic / Direct Update)
    // Fetch current user stats first to ensure accuracy
    const { data: userData } = await supabase
      .from("users")
      .select("xp, coins, completed_machineproblems, stars")
      .eq("id", userId)
      .single();

    if (userData) {
      const newXp = (userData.xp || 0) + results.xpEarned;
      const newCoins = (userData.coins || 0) + results.coinsEarned;
      const newStars = (userData.stars || 0) + (results.starsToAdd || 0);

      // Update completed_machineproblems
      const currentCompleted = userData.completed_machineproblems || [];
      const updatedCompleted = currentCompleted.includes(challenge.id)
        ? currentCompleted
        : [...currentCompleted, challenge.id];

      // Assuming we might want to update stars in the users table too if that's the total stars logic
      // But the context update seems to handle fetching stars separately.
      // However, if we want to ensure atomic update of everything:

      const updates: any = {
        xp: newXp,
        coins: newCoins,
        completed_machineproblems: updatedCompleted,
        stars: newStars,
      };

      const { error: statsError } = await supabase
        .from("users")
        .update(updates)
        .eq("id", userId);

      if (statsError) throw statsError;
    }

    return { success: true };
  } catch (error) {
    console.error("Error saving challenge progress:", error);
    return { success: false, error };
  }
};

export const fetchUserProgress = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_challenge_progress")
    .select("challenge_id, stars, code_submitted"); // [NEW] Fetch submitted code

  if (error || !data) return [];
  // Return array of { challenge_id, stars, code_submitted }
  return data;
};
