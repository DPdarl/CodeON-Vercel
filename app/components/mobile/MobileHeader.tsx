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
import { Moon, LogOut, Clock, Zap } from "lucide-react";
import { AvatarDisplay } from "~/components/dashboardmodule/AvatarDisplay";
import { CoinIcon, FlameIcon, HeartIcon } from "~/components/ui/Icons";
import { useHeartSystem, MAX_HEARTS, HEART_COST } from "~/hooks/useHeartSystem";

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
}: {
  user: any;
  stats: any;
  onSwitchTheme: () => void;
  onLogout: () => void;
}) {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { hearts, timeRemaining, buyHearts } = useHeartSystem(user);
  const isHeartFull = hearts >= MAX_HEARTS;

  const confirmLogout = () => {
    setShowLogoutDialog(false);
    setTimeout(() => onLogout(), 300);
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur-md h-14 px-3 flex items-center justify-between gap-3">
        {/* LEFT: Stats Row (Scrollable) */}
        <div className="flex-1 overflow-x-auto no-scrollbar mask-gradient-right">
          <div className="flex items-center space-x-2">
            {/* Level (Small Pill) */}
            <div className="px-2 py-0.5 rounded-md bg-yellow-100 dark:bg-yellow-900/30 text-xs font-black text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 uppercase tracking-wider shrink-0">
              LVL {user?.level || 1}
            </div>

            <MobileStatItem
              icon={<FlameIcon className="h-4 w-4" />}
              value={stats.streaks}
            />
            <MobileStatItem
              icon={<CoinIcon className="h-4 w-4" />}
              value={stats.coins}
            />

            {/* Hearts (Clickable) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full text-sm font-bold shrink-0 active:scale-95 transition-transform">
                  <HeartIcon className="h-4 w-4 text-red-500 fill-red-500" />
                  <span>{hearts}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 p-2 ml-2">
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
        <div className="flex-none">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="h-9 w-9 rounded-full border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 overflow-hidden cursor-pointer active:scale-90 transition-transform">
                <AvatarDisplay config={user?.avatarConfig} headOnly />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
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
