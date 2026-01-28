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
  },
) => {
  try {
    // 0. Ensure Challenge Exists in DB (Fixes FK Error)
    // We only need basic fields for reference
    const { error: challengeError } = await supabase.from("challenges").upsert(
      {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        page: challenge.page, // Assuming numeric
        // Add other fields if schema requires
      },
      { onConflict: "id" },
    );

    if (challengeError) {
      console.warn(
        "Error upserting challenge definition (non-fatal if exists):",
        challengeError,
      );
      // Continue, assuming it might exist or error is minor
    }

    // 1. Upsert Challenge Progress
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
          executed_at: new Date().toISOString(),
        },
        { onConflict: "user_id, challenge_id" },
      );

    if (progressError) throw progressError;

    // 2. Insert Match History
    const { error: historyError } = await supabase
      .from("match_history")
      .insert({
        mode: "challenge",
        winner_name: "You",
        participants_count: 1,
        results: {
          challengeId: challenge.id,
          stars: results.stars,
          xp: results.xpEarned,
          coins: results.coinsEarned,
        },
        played_at: new Date().toISOString(),
      });

    if (historyError) throw historyError;

    // 3. Update User Stats (Optimistic / Direct Update)
    // Fetch current user stats first to ensure accuracy
    const { data: userData } = await supabase
      .from("users")
      .select("xp, coins")
      .eq("id", userId)
      .single();

    if (userData) {
      const newXp = (userData.xp || 0) + results.xpEarned;
      const newCoins = (userData.coins || 0) + results.coinsEarned;

      const { error: statsError } = await supabase
        .from("users")
        .update({
          xp: newXp,
          coins: newCoins,
        })
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
    .select("challenge_id");

  if (error || !data) return [];
  return data.map((d) => d.challenge_id);
};
