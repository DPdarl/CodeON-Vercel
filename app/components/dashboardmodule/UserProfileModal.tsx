import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Calendar, Zap, Shield } from "lucide-react";
import { AvatarDisplay } from "./AvatarDisplay";
import TrophyIcon from "../ui/TrophyIcon";
import { Badge } from "~/components/ui/badge";

// Shared Interface
export interface LeaderboardUser {
  id: string;
  displayName: string | null;
  photoURL: string | null;
  xp: number;
  level: number;
  trophies: number;
  league: string;
  avatarConfig?: any;
  joinedAt?: string;
  badges?: string[];
  streaks?: number;
}

interface UserProfileModalProps {
  user: LeaderboardUser | null;
  onClose: () => void;
}

export function UserProfileModal({ user, onClose }: UserProfileModalProps) {
  if (!user) return null;

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 p-0 overflow-hidden rounded-3xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-center text-xl font-bold font-pixelify">
            Player Card
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center p-6 space-y-6">
          {/* Avatar Section */}
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500 bg-gray-100 dark:bg-gray-800 shadow-xl relative">
            <AvatarDisplay config={user.avatarConfig} headOnly />
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
              {user.displayName}
            </h2>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 font-medium">
              <span className="uppercase tracking-wider">
                {user.league} League
              </span>
              <span>•</span>
              <span className="text-indigo-500">Lvl {user.level}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 w-full">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl flex flex-col items-center justify-center gap-1 border border-gray-100 dark:border-gray-700">
              <TrophyIcon className="w-5 h-5 text-yellow-500" />
              <span className="text-lg font-bold">{user.trophies}</span>
              <span className="text-[10px] uppercase text-gray-400 font-bold">
                Trophies
              </span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl flex flex-col items-center justify-center gap-1 border border-gray-100 dark:border-gray-700">
              <Zap className="w-5 h-5 text-orange-500" />
              <span className="text-lg font-bold">{user.streaks || 0}</span>
              <span className="text-[10px] uppercase text-gray-400 font-bold">
                Streak
              </span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl flex flex-col items-center justify-center gap-1 border border-gray-100 dark:border-gray-700">
              <Shield className="w-5 h-5 text-blue-500" />
              <span className="text-lg font-bold">{user.xp}</span>
              <span className="text-[10px] uppercase text-gray-400 font-bold">
                Total XP
              </span>
            </div>
          </div>

          {/* Badges Section */}
          <div className="w-full space-y-3">
            <div className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-1">
              Badges Earned
            </div>
            {user.badges && user.badges.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.badges.map((badge, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="px-3 py-1 text-xs"
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-400 italic bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl text-center">
                No badges earned yet.
              </div>
            )}
          </div>

          {/* Footer Info */}
          {user.joinedAt && (
            <div className="flex items-center text-xs text-gray-400 gap-1 pt-2">
              <Calendar className="w-3 h-3" />
              Joined {new Date(user.joinedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
