import { supabase } from "./supabase";

export type QuestMetric =
  | "codes_run"
  | "bugs_fixed"
  | "daily_logins"
  | "challenges_completed"
  | "items_bought"
  | "variables_declared"
  | "console_logs"
  | "quiz_answers"
  | "try_catch_used"
  | "code_formatted"
  | "streaks"
  | "total_coins_earned"
  | "perfect_quizzes"
  | "methods_created"
  | "loops_written"
  | "modes_played"
  | "minutes_played"
  | "completed_chapters_count"
  | "libs_imported"
  | "speed_runs"
  | "students_helped" // Mock
  | "referrals" // Mock
  | "levels_without_hints"; // ADDED

/**
 * Tracks a specific user action and updates their quest stats in Supabase.
 * @param userId The user's UUID.
 * @param metric The metric key to update (must match the database enum/keys).
 * @param incrementBy Amount to increment (default 1).
 */
export async function trackQuestEvent(
  userId: string,
  metric: QuestMetric,
  incrementBy: number = 1,
) {
  if (!userId) return;

  console.log(
    `[QuestTracker] Tracking ${metric} +${incrementBy} for ${userId}`,
  );

  try {
    // 1. Fetch current stats
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("stats")
      .eq("id", userId)
      .single();

    if (fetchError) throw fetchError;

    const currentStats = user?.stats || {};
    const currentVal = currentStats[metric] || 0;
    const newVal = currentVal + incrementBy;

    // 2. Update stats
    const updates = {
      stats: {
        ...currentStats,
        [metric]: newVal,
      },
    };

    const { error: updateError } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId);

    if (updateError) throw updateError;

    console.log(`[QuestTracker] Success. New ${metric}: ${newVal}`);
    return { success: true, newVal };
  } catch (err) {
    console.error("[QuestTracker] Error tracking event:", err);
    return { success: false, error: err };
  }
}

/**
 * Analyzes a code snippet to determine if it meets specific coding quest criteria.
 * Returns an object with the counts of found features.
 */
export function analyzeCodeForMetrics(code: string) {
  const metrics: Partial<Record<QuestMetric, number>> = {};

  if (!code) return metrics;

  // 1. Loops (for, while, do...while)
  const loopRegex = /\b(for|while|do)\s*\(/g;
  const loopMatches = code.match(loopRegex);
  if (loopMatches) metrics.loops_written = loopMatches.length;

  // 2. Variables (var, let, const, int, string, bool, etc. - covering JS/TS/C# basics)
  const varRegex =
    /\b(var|let|const|int|string|boolean|bool|double|float|char)\s+[a-zA-Z_]\w*/g;
  const varMatches = code.match(varRegex);
  if (varMatches) metrics.variables_declared = varMatches.length;

  // 3. Console Logs (console.log or Console.WriteLine)
  const logRegex = /\b(console\.log|Console\.WriteLine)\s*\(/g;
  const logMatches = code.match(logRegex);
  if (logMatches) metrics.console_logs = logMatches.length;

  // 4. Methods/Functions (function foo, void foo, public static void, arrow funcs)
  // Simplified regex for detection
  const methodRegex =
    /\b(function\s+\w+|void\s+\w+|public\s+.*void\s+\w+|const\s+\w+\s*=\s*\(.*\)\s*=>)/g;
  const methodMatches = code.match(methodRegex);
  if (methodMatches) metrics.methods_created = methodMatches.length;

  // 5. Try/Catch
  const tryCatchRegex = /\btry\s*\{/g;
  const tryMatches = code.match(tryCatchRegex);
  if (tryMatches) metrics.try_catch_used = tryMatches.length;

  // 6. Libraries (import ... or using ...)
  const importRegex = /\b(import\s+.*from|using\s+[a-zA-Z0-9_.]+;)/g;
  const importMatches = code.match(importRegex);
  if (importMatches) metrics.libs_imported = importMatches.length;

  return metrics;
}
