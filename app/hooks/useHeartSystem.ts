import { useState, useEffect, useCallback } from "react";
import { supabase } from "~/lib/supabase";
import { useAuth } from "~/contexts/AuthContext"; // Import useAuth
import { toast } from "sonner";

export const MAX_HEARTS = 5;
export const REGEN_TIME_MS = 20 * 60 * 1000; // 20 Minutes
export const HEART_COST = 250;

// No longer accepts user as arg, gets it from context
export function useHeartSystem() {
  const { user, syncUser } = useAuth(); // Get user and syncUser

  const [hearts, setHearts] = useState(user?.hearts ?? MAX_HEARTS);
  const [isGameOver, setIsGameOver] = useState(false);
  const [nextRegenTime, setNextRegenTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // Update local hearts when user context updates (e.g. refreshUser)
  useEffect(() => {
    if (user?.hearts !== undefined) {
      setHearts(user.hearts);
    }
  }, [user?.hearts]);

  // --- 1. INITIAL SYNC & REGEN CALCULATION ---
  useEffect(() => {
    if (!user) return;

    const calculateOfflineRegen = async () => {
      const { data: dbUser } = await supabase
        .from("users")
        .select("hearts, last_heart_regen")
        .eq("id", user.uid)
        .single();

      if (!dbUser) return;

      const currentHearts = dbUser.hearts;
      if (currentHearts === 0) setIsGameOver(true);

      const lastRegen = new Date(dbUser.last_heart_regen).getTime();
      const now = Date.now();

      if (currentHearts < MAX_HEARTS) {
        const timePassed = now - lastRegen;
        const heartsGained = Math.floor(timePassed / REGEN_TIME_MS);

        if (heartsGained > 0) {
          const newHeartCount = Math.min(
            MAX_HEARTS,
            currentHearts + heartsGained,
          );
          const timeIntoNextCycle = timePassed % REGEN_TIME_MS;
          const newLastRegen = new Date(now - timeIntoNextCycle).toISOString();

          await supabase
            .from("users")
            .update({
              hearts: newHeartCount,
              last_heart_regen: newLastRegen,
            })
            .eq("id", user.uid);

          setHearts(newHeartCount);
          syncUser({ ...user, hearts: newHeartCount }); // ✅ SYNC GLOBAL

          if (newHeartCount > 0) setIsGameOver(false);

          if (newHeartCount < MAX_HEARTS) {
            setNextRegenTime(now + (REGEN_TIME_MS - timeIntoNextCycle));
          } else {
            setNextRegenTime(null);
          }
        } else {
          setHearts(currentHearts);
          // Don't need to sync if no change, but good to be safe?
          // Actually if local != db, we might want to?
          // For now, trust DB is authority.
          setNextRegenTime(lastRegen + REGEN_TIME_MS);
        }
      } else {
        setHearts(MAX_HEARTS);
        setNextRegenTime(null);
      }
    };

    calculateOfflineRegen();
  }, [user?.uid]); // syncUser is stable

  // --- 2. LIVE TIMER ---
  useEffect(() => {
    if (hearts >= MAX_HEARTS) {
      setTimeRemaining("");
      return;
    }

    const interval = setInterval(() => {
      if (!nextRegenTime) return;

      const now = Date.now();
      const diff = nextRegenTime - now;

      if (diff <= 0) {
        setHearts((prev) => {
          const newValue = Math.min(MAX_HEARTS, prev + 1);
          if (newValue > 0) setIsGameOver(false);

          // Update DB & Global State
          if (user) {
            const updates: any = { hearts: newValue };
            if (newValue < MAX_HEARTS) {
              updates.last_heart_regen = new Date().toISOString();
              setNextRegenTime(Date.now() + REGEN_TIME_MS);
            } else {
              setNextRegenTime(null);
            }

            supabase.from("users").update(updates).eq("id", user.uid).then();
            syncUser({ ...user, hearts: newValue }); // ✅ SYNC GLOBAL
          }

          return newValue;
        });
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, "0")}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [hearts, nextRegenTime, user]);

  // --- 3. ACTIONS ---
  const loseHeart = useCallback(async () => {
    if (!user) return false;

    let didDie = false;

    // Calculate new state first
    let newHearts = hearts;
    let updates: any = {};

    // We need to act on the LATEST hearts.
    // SetState with callback gives us latest.
    setHearts((currentHearts) => {
      if (currentHearts > 0) {
        newHearts = currentHearts - 1;

        if (currentHearts === MAX_HEARTS) {
          const now = new Date().toISOString();
          setNextRegenTime(Date.now() + REGEN_TIME_MS);
          updates = { hearts: newHearts, last_heart_regen: now };
        } else {
          updates = { hearts: newHearts };
        }

        supabase.from("users").update(updates).eq("id", user.uid).then();
        syncUser({ ...user, hearts: newHearts }); // ✅ SYNC GLOBAL

        if (newHearts === 0) {
          didDie = true;
          setIsGameOver(true);
        }
        return newHearts;
      }
      return 0;
    });

    return didDie;
  }, [user, hearts, syncUser]); // syncing on hearts changes might be tricky inside callback...
  // Actually setHearts callback is cleaner for local state, but for async/syncUser we need value.
  // The logic above inside setHearts callback for side effects (syncUser) is slightly risky if multiple rapid changes.
  // But for hearts (slow interaction), it's okay.

  const buyHearts = useCallback(async () => {
    if (!user) return;

    if ((user.coins || 0) >= HEART_COST) {
      const newCoins = (user.coins || 0) - HEART_COST;

      setHearts(MAX_HEARTS);
      setIsGameOver(false);
      setNextRegenTime(null);

      syncUser({ ...user, hearts: MAX_HEARTS, coins: newCoins }); // ✅ SYNC GLOBAL

      const { error } = await supabase
        .from("users")
        .update({
          hearts: MAX_HEARTS,
          coins: newCoins,
        })
        .eq("id", user.uid);

      if (!error) {
        toast.success("Hearts Refilled! ❤️");
      } else {
        toast.error("Purchase failed.");
        // Revert? simpler to just let it be or refresh.
      }
    } else {
      toast.error("Not enough coins!");
    }
  }, [user, syncUser]);

  return {
    hearts,
    timeRemaining,
    loseHeart,
    buyHearts,
    isGameOver,
    setIsGameOver,
  };
}
