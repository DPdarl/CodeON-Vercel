// app/components/ThemeToggle.tsx
import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);

    if (newTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={toggleTheme}
      size="icon"
      className="absolute top-4 right-4 z-50 rounded-2xl !p-7 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
    >
      {isDark ? (
        <Sun className="!h-8 !w-8 text-yellow-500 transition-all" />
      ) : (
        <Moon className="!h-8 !w-8 text-gray-700 transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
