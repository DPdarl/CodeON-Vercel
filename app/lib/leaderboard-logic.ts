import { supabase } from "~/lib/supabase";

export const LEAGUES = [
  { name: "Novice", minXp: 0, color: "text-gray-500" },
  { name: "Bronze", minXp: 500, color: "text-orange-600" },
  { name: "Silver", minXp: 2000, color: "text-slate-400" },
  { name: "Gold", minXp: 5000, color: "text-yellow-500" },
  { name: "Platinum", minXp: 10000, color: "text-cyan-400" },
  { name: "Diamond", minXp: 25000, color: "text-indigo-400" },
];

/**
 * Calculates the appropriate league based on total XP.
 */
export function getLeagueFromXP(xp: number): string {
  // [...LEAGUES].reverse() creates a copy so we don't mutate the original array
  const league = [...LEAGUES].reverse().find((l) => xp >= l.minXp);
  return league ? league.name : "Novice";
}

/**
 * Checks if the user needs a league update.
 * Returns the new league name if update is needed, otherwise null.
 */
export function checkLeagueUpdate(
  currentXp: number,
  currentLeague: string
): string | null {
  const correctLeague = getLeagueFromXP(currentXp);
  if (correctLeague !== currentLeague) {
    return correctLeague;
  }
  return null;
}

export async function getUserRank(userTrophies: number): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gt("trophies", userTrophies);

    if (error) throw error;

    return (count || 0) + 1;
  } catch (error) {
    console.error("Error fetching rank:", error);
    return 0;
  }
}
