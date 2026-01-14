// app/hooks/useKeyboardShortcuts.ts
import { useEffect } from "react";

type ShortcutBinding = [string, (event: KeyboardEvent) => void];

/**
 * Attaches global keyboard shortcuts.
 * Example: [["Ctrl+Enter", () => console.log("Pressed!")]]
 */
export function useKeyboardShortcuts(bindings: ShortcutBinding[]) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      for (const [keyCombination, callback] of bindings) {
        const keys = keyCombination.split("+");
        const requiredKey = keys[keys.length - 1];
        const hasCtrl =
          keys.includes("Ctrl") && (event.ctrlKey || event.metaKey);
        const hasAlt = keys.includes("Alt") && event.altKey;
        const hasShift = keys.includes("Shift") && event.shiftKey;

        // Check if the main key matches
        if (event.key.toLowerCase() !== requiredKey.toLowerCase()) continue;

        // Check if all modifiers match (or are not required)
        if (
          (!keys.includes("Ctrl") || hasCtrl) &&
          (!keys.includes("Alt") || hasAlt) &&
          (!keys.includes("Shift") || hasShift)
        ) {
          event.preventDefault();
          callback(event);
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [bindings]);
}
