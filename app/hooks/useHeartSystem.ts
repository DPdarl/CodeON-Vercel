import { useState, useEffect, useCallback } from "react";
import { supabase } from "~/lib/supabase";
import { UserData } from "~/contexts/AuthContext";
import { toast } from "sonner";

export const MAX_HEARTS = 5;
export const REGEN_TIME_MS = 20 * 60 * 1000; // 20 Minutes
export const HEART_COST = 250;

export function useHeartSystem(user: UserData | null) {
  const [hearts, setHearts] = useState(user?.hearts ?? MAX_HEARTS);
  const [isGameOver, setIsGameOver] = useState(false); // Added State
  const [nextRegenTime, setNextRegenTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

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
      // If hearts are 0 when loading, ensure Game Over state is set (unless regenerating)
      if (currentHearts === 0) setIsGameOver(true);

      const lastRegen = new Date(dbUser.last_heart_regen).getTime();
      const now = Date.now();

      if (currentHearts < MAX_HEARTS) {
        const timePassed = now - lastRegen;
        const heartsGained = Math.floor(timePassed / REGEN_TIME_MS);

        if (heartsGained > 0) {
          const newHeartCount = Math.min(
            MAX_HEARTS,
            currentHearts + heartsGained
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
          if (newHeartCount > 0) setIsGameOver(false); // Auto-revive if regen happened

          if (newHeartCount < MAX_HEARTS) {
            setNextRegenTime(now + (REGEN_TIME_MS - timeIntoNextCycle));
          } else {
            setNextRegenTime(null);
          }
        } else {
          setHearts(currentHearts);
          setNextRegenTime(lastRegen + REGEN_TIME_MS);
        }
      } else {
        setHearts(MAX_HEARTS);
        setNextRegenTime(null);
      }
    };

    calculateOfflineRegen();
  }, [user?.uid]);

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
          if (newValue > 0) setIsGameOver(false); // Revive

          if (newValue < MAX_HEARTS) {
            setNextRegenTime(Date.now() + REGEN_TIME_MS);
            supabase
              .from("users")
              .update({
                hearts: newValue,
                last_heart_regen: new Date().toISOString(),
              })
              .eq("id", user?.uid)
              .then();
          } else {
            supabase
              .from("users")
              .update({ hearts: newValue })
              .eq("id", user?.uid)
              .then();
            setNextRegenTime(null);
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
  }, [hearts, nextRegenTime, user?.uid]);

  // --- 3. ACTIONS ---
  const loseHeart = useCallback(async () => {
    if (!user) return false;

    let didDie = false;

    setHearts((currentHearts) => {
      if (currentHearts > 0) {
        const newHearts = currentHearts - 1;

        // Start timer if dropping from max
        if (currentHearts === MAX_HEARTS) {
          const now = new Date().toISOString();
          setNextRegenTime(Date.now() + REGEN_TIME_MS);
          supabase
            .from("users")
            .update({
              hearts: newHearts,
              last_heart_regen: now,
            })
            .eq("id", user.uid)
            .then();
        } else {
          supabase
            .from("users")
            .update({ hearts: newHearts })
            .eq("id", user.uid)
            .then();
        }

        if (newHearts === 0) {
          didDie = true;
          setIsGameOver(true);
        }
        return newHearts;
      }
      return 0;
    });

    return didDie;
  }, [user]);

  const buyHearts = useCallback(async () => {
    if (!user) return;

    if (user.coins && user.coins >= HEART_COST) {
      const newCoins = user.coins - HEART_COST;

      setHearts(MAX_HEARTS);
      setIsGameOver(false); // Revive
      setNextRegenTime(null);

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
      }
    } else {
      toast.error("Not enough coins!");
    }
  }, [user]);

  return {
    hearts,
    timeRemaining,
    loseHeart,
    buyHearts,
    isGameOver, // EXPOSED
    setIsGameOver, // EXPOSED
  };
}
