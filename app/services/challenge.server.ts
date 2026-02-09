import { createClient } from "@supabase/supabase-js";

// Initialize standard client (assuming env vars are available,
// or simpler: pass the client/request context if using auth-helper.
// For now, I'll use a standard construction pattern or expect the loader to pass the client).
// Actually, in Remix with Supabase, we usually get the client from the loader args (request).
// But for a service function, it's cleaner to accept the client as an argument.

export const saveChallengeProgress = async (
  supabase: any,
  userId: string,
  challengeId: string,
  results: {
    stars: number;
    code: string;
    executionTime: number;
    xpEarned: number;
    coinsEarned: number;
  },
) => {
  // 1. Upsert Challenge Progress
  const now = new Date().toISOString();

  const { error: progressError } = await supabase
    .from("user_challenge_progress")
    .upsert(
      {
        user_id: userId,
        challenge_id: challengeId,
        status: "completed",
        stars: results.stars,
        code_submitted: results.code,
        execution_time_ms: results.executionTime,
        executed_at: now,
      },
      { onConflict: "user_id, challenge_id" },
    );

  if (progressError) {
    console.error("Error saving progress:", progressError);
    throw progressError;
  }

  // 2. Insert Match History (as requested)
  // Mode: 'challenge', Winner: 'User' (Single player), Results: JSON
  const { error: historyError } = await supabase.from("match_history").insert({
    user_id: userId, // Ensure player can see this history
    mode: "challenge",
    winner_name: "You", // Or fetch user name? "You" is fine for single view, or leave null.
    participants_count: 1,
    results: {
      challengeId,
      stars: results.stars,
      xp: results.xpEarned,
      coins: results.coinsEarned,
    },
    played_at: now,
  });

  if (historyError) console.error("Error saving history:", historyError);

  // 3. Update User Stats (RPC is safer, but direct update for MVP)
  // We need to fetch current stats first to increment, OR use an RPC 'increment_stats'.
  // Let's try to fetch and update.
  const { data: userData, error: userFetchError } = await supabase
    .from("users")
    .select("xp, coins, level, levelThreshold") // Assuming standard RPG columns
    .eq("id", userId)
    .single();

  if (!userFetchError && userData) {
    const newXp = (userData.xp || 0) + results.xpEarned;
    const newCoins = (userData.coins || 0) + results.coinsEarned;
    // Simple level logic (can be moved to a util)
    // If we want to duplicate the client logic (20 xp threshold? dynamic?)
    // Use the client logic: if (newXp >= userData.levelThreshold) ...
    // For now, let's just increment XP and Coins, and let client/another service handle leveling if complex.
    // Or just save what we calculated.

    await supabase
      .from("users")
      .update({
        xp: newXp,
        coins: newCoins,
      })
      .eq("id", userId);
  }

  return { success: true };
};

export const getUserChallengeProgress = async (
  supabase: any,
  userId: string,
) => {
  const { data, error } = await supabase
    .from("user_challenge_progress")
    .select("challenge_id, status, stars")
    .eq("user_id", userId);

  if (error) return [];
  return data;
};
