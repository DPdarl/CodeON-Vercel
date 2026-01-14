// app/hooks/useBounceAnimation.ts
import { useState, useCallback } from "react";

/**
 * A simple hook to apply a bounce animation class.
 * @returns [animationClass, triggerFunction]
 */
export function useBounceAnimation(
  animationClass = "animate-bounce"
): [string, () => void] {
  const [isBouncing, setIsBouncing] = useState(false);

  const triggerBounce = useCallback(() => {
    setIsBouncing(true);
    setTimeout(() => {
      setIsBouncing(false);
    }, 500); // Duration of the bounce
  }, []);

  return [isBouncing ? animationClass : "", triggerBounce];
}
