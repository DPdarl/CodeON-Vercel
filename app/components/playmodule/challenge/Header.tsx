// app/components/playmodule/challenge/Header.tsx
import React from "react";
import { useChallengeContext } from "~/contexts/ChallengeContext";
import { Zap, Coins, X } from "lucide-react";
import { Link } from "@remix-run/react";
import { useHeartSystem } from "~/hooks/useHeartSystem";
import { HeartDropdown } from "~/components/playmodule/common/HeartDropdown";
import { Button } from "~/components/ui/button";

const Header = () => {
  const { exp, coins, currentChallenge } = useChallengeContext();
  const { hearts, buyHearts, timeRemaining } = useHeartSystem();

  return (
    <header className="h-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border flex items-center justify-between px-4 z-50 select-none sticky top-0">
      {/* Left: Branding & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <Link
          to="/play/challenges"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
        >
          <div className="flex items-center gap-2">
            <img
              src="/assets/logo-icon.svg"
              alt="CodeON"
              className="w-6 h-6 hidden"
            />
            {/* Fallback Icon if no logo */}
            <div className="w-8 h-8 flex items-center justify-center font-black text-xl text-primary">
              C#
            </div>
          </div>
          <span className="font-bold text-foreground text-lg hidden sm:block tracking-tight group-hover:text-primary transition-colors">
            CodeON
          </span>
        </Link>

        {/* Separator / Breadcrumbs */}
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground font-mono">
          <span>/</span>
          <span className="text-foreground/80">Basic Syntax</span>
          <div className="h-1 w-24 bg-secondary rounded-full ml-4 overflow-hidden">
            <div className="h-full bg-green-500 w-[71%]" />
          </div>
          <span className="text-muted-foreground text-xs">71%</span>
        </div>
      </div>

      {/* Right: User Stats */}
      <div className="flex items-center gap-6">
        {/* Challenge Name (Center-ish on mobile) */}
        <div className="text-muted-foreground text-sm font-bold truncate max-w-[150px] md:hidden">
          {currentChallenge?.title}
        </div>

        <div className="flex items-center gap-4">
          {/* Stats Icons */}
          <div className="flex items-center gap-3">
            {/* Hearts */}
            <div className="scale-90 origin-right">
              <HeartDropdown
                hearts={hearts}
                timeRemaining={timeRemaining}
                buyHearts={buyHearts}
              />
            </div>

            {/* Notifications (Mock) */}
            <div className="relative cursor-pointer hover:text-foreground text-muted-foreground transition-colors">
              <div className="w-2 h-2 bg-red-500 rounded-full absolute -top-0.5 -right-0.5 border-2 border-background" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
            </div>

            {/* User Avatar (Small) */}
            <div className="w-8 h-8 rounded-full bg-secondary border border-border overflow-hidden cursor-pointer hover:border-primary transition-colors">
              {/* Placeholder or use UserContext */}
              <img src="https://github.com/shadcn.png" alt="User" />
            </div>
          </div>

          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-8 text-xs px-4 rounded-lg shadow-sm">
            Join Club
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
