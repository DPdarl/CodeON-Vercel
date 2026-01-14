// app/lib/user-cache.ts (Create this file or add to utils)
import { UserData } from "~/contexts/AuthContext";

const CACHE_KEY = "codeon_user_cache";
const CACHE_TTL = 5 * 60 * 1000; // 5 Minutes (Adjust as needed)

export function getCachedUser(): UserData | null {
  if (typeof window === "undefined") return null;
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;

  try {
    const parsed = JSON.parse(cached);
    // Optional: Add a 'lastUpdated' field check here for TTL
    return parsed;
  } catch (e) {
    return null;
  }
}

export function cacheUser(user: UserData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CACHE_KEY, JSON.stringify(user));
}
