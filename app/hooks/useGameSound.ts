import { useCallback, useEffect } from "react";

// ✅ Global Cache: Created once, persists across all component re-renders and unmounts.
const audioCache: Record<string, HTMLAudioElement> = {};

// Sound mapping
const SOUND_FILES = {
  click: "/sounds/click-minecraftsound.mp3",
  correct: "/sounds/duolingo-correct.mp3",
  wrong: "/sounds/duolingo-incorrect.mp3",
  complete: "/sounds/duolingo-completed-chapter.mp3",
  gameover: "/sounds/fah.mp3",
  claim: "/sounds/happy-happy-happy-cat.mp3",
};

export function useGameSound() {
  useEffect(() => {
    // 1. Preload all sounds immediately when this hook is first used
    if (typeof window !== "undefined") {
      Object.entries(SOUND_FILES).forEach(([key, src]) => {
        if (!audioCache[key]) {
          const audio = new Audio(src);
          audio.preload = "auto"; // Force browser to fetch headers/data
          audio.volume = 0.5;
          audioCache[key] = audio;
        }
      });
    }
  }, []);

  const playSound = useCallback((type: keyof typeof SOUND_FILES) => {
    const audio = audioCache[type];
    if (audio) {
      // 2. Reset time to 0 allows "rapid fire" clicking (e.g. typing sounds)
      audio.currentTime = 0;

      // 3. Play immediately. Catch error if user hasn't interacted with page yet.
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Audio playback prevented:", error);
        });
      }
    }
  }, []);

  return { playSound };
}
