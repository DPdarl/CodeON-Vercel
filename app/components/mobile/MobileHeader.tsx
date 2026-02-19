import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Moon, LogOut, Clock, Zap, User as UserIcon } from "lucide-react";
import { AvatarDisplay } from "~/components/dashboardmodule/AvatarDisplay";
import {
  CoinIcon,
  FlameIcon,
  HeartIcon,
  StreakPendingIcon,
} from "~/components/ui/Icons";
import { useHeartSystem, MAX_HEARTS, HEART_COST } from "~/hooks/useHeartSystem";
import { calculateEffectiveStreak, getStreakState } from "~/lib/streak-logic";
import { calculateProgress } from "~/lib/leveling-system";

// --- SMALLER MOBILE STAT ITEM ---
function MobileStatItem({
  icon,
  value,
  color,
}: {
  icon: React.ReactNode;
  value: number;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full text-sm font-bold shrink-0">
      <div className="w-4 h-4 flex items-center justify-center">{icon}</div>
      <span className={color}>{value}</span>
    </div>
  );
}

export function MobileHeader({
  user,
  stats,
  onSwitchTheme,
  onLogout,
  onProfileClick,
}: {
  user: any;
  stats: any;
  onSwitchTheme: () => void;
  onLogout: () => void;
  onProfileClick: () => void;
}) {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { hearts, timeRemaining, buyHearts } = useHeartSystem();
  const isHeartFull = hearts >= MAX_HEARTS;

  const effectiveStreak = calculateEffectiveStreak(user);
  const streakState = getStreakState(user);
  const { currentLevel, progressPercent } = calculateProgress(user?.xp || 0);

  // SVG Config for Mobile XP Ring
  const radius = 19; // Radius adjusted for 44px container
  const center = 22; // Center point
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (progressPercent / 100) * circumference;

  const confirmLogout = () => {
    setShowLogoutDialog(false);
    setTimeout(() => onLogout(), 300);
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur-md h-14 px-2 flex items-center justify-between gap-1">
        {/* LEFT: Logo Section */}
        <div className="flex-none flex items-center">
          <img
            src="/assets/icons/coinv2.png"
            alt="CodeON"
            className="h-7 w-7 object-contain drop-shadow-sm"
          />
        </div>

        {/* MIDDLE: Stats Row (Centered & Scrollable if needed) */}
        <div className="flex-1 flex justify-center overflow-x-auto no-scrollbar mask-gradient-x mx-1">
          <div className="flex items-center space-x-1.5 shrink-0">
            {/* Level (Small Pill) */}
            {/* Level (Small Pill) - Compact Version */}
            <div className="px-1.5 py-0.5 rounded-md bg-yellow-100 dark:bg-yellow-900/30 text-[10px] font-black text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 uppercase tracking-wider shrink-0 flex items-center gap-0.5">
              <span>L</span>
              <span>{currentLevel}</span>
            </div>

            <MobileStatItem
              icon={
                streakState === "PENDING" || streakState === "BROKEN" ? (
                  <StreakPendingIcon className="h-3.5 w-3.5 opacity-50 grayscale" />
                ) : (
                  <FlameIcon className="h-3.5 w-3.5" />
                )
              }
              value={effectiveStreak}
              color={
                streakState === "PENDING" || streakState === "BROKEN"
                  ? "text-gray-400"
                  : undefined
              }
            />
            <MobileStatItem
              icon={<CoinIcon className="h-3.5 w-3.5" />}
              value={stats.coins}
            />

            {/* Hearts (Clickable) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full text-sm font-bold shrink-0 active:scale-95 transition-transform">
                  <HeartIcon className="h-3.5 w-3.5 text-red-500 fill-red-500" />
                  <span>{hearts}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-64 p-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold">Lives</span>
                  <Badge
                    variant={isHeartFull ? "default" : "outline"}
                    className="text-[10px]"
                  >
                    {isHeartFull ? "FULL" : timeRemaining}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  className="w-full bg-green-500 hover:bg-green-600 text-white h-8 text-xs font-bold"
                  disabled={isHeartFull}
                  onClick={buyHearts}
                >
                  {isHeartFull ? "Max Hearts" : `Refill (${HEART_COST})`}
                </Button>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* RIGHT: Profile Avatar */}
        <div className="flex-none flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="relative flex items-center justify-center w-[44px] h-[44px] cursor-pointer active:scale-90 transition-transform">
                <svg
                  className="absolute w-full h-full transform -rotate-90"
                  viewBox="0 0 44 44"
                >
                  <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    className="stroke-gray-200 dark:stroke-gray-700"
                    strokeWidth="3"
                  />
                  <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    className="stroke-indigo-500 transition-all duration-1000 ease-out"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                  />
                </svg>
                <div className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-800 overflow-hidden z-10">
                  <AvatarDisplay config={user?.avatarConfig} headOnly />
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                My Account{" "}
                <span className="ml-2 text-xs font-normal text-muted-foreground bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded capitalize">
                  {user?.role || "Student"}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Profile Option */}
              <DropdownMenuItem onClick={onProfileClick}>
                <UserIcon className="mr-2 h-4 w-4" /> Profile
              </DropdownMenuItem>

              <DropdownMenuItem onClick={onSwitchTheme}>
                <Moon className="mr-2 h-4 w-4" /> Switch Theme
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowLogoutDialog(true)}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      {/* Logout Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="max-w-xs rounded-2xl">
          <DialogHeader>
            <DialogTitle>Sign out?</DialogTitle>
            <DialogDescription>
              Access will be removed from this device.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 flex-col sm:flex-row">
            <Button variant="ghost" onClick={() => setShowLogoutDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmLogout}>
              Sign out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
