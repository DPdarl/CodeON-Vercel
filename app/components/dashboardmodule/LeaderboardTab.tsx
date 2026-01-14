// app/components/dashboardmodule/LeaderboardTab.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "~/contexts/AuthContext";
import { supabase } from "~/lib/supabase";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Award,
  Crown,
  Calendar,
  Info,
  Filter,
  ChevronDown,
  Gamepad2,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { AvatarDisplay } from "./AvatarDisplay";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  MedalBronze,
  MedalGold,
  MedalSilver,
  TrophyIcon,
  StarIcon,
} from "../ui/Icons";
import { getLeagueFromXP } from "~/lib/leaderboard-logic";

// --- LEAGUE DATA CONSTANT ---
export const LEAGUES = [
  { name: "Novice", minXp: 0, color: "text-gray-500" },
  { name: "Bronze", minXp: 500, color: "text-orange-600" },
  { name: "Silver", minXp: 2000, color: "text-slate-400" },
  { name: "Gold", minXp: 5000, color: "text-yellow-500" },
  { name: "Platinum", minXp: 10000, color: "text-cyan-400" },
  { name: "Diamond", minXp: 25000, color: "text-indigo-400" },
];

const SECTIONS = ["ALL", "BSCS", "BSIS", "BSAIS", "ACT"];
const GAMEMODES = [
  { id: "MULTIPLAYER", label: "Multiplayer", icon: TrophyIcon },
  { id: "CHALLENGES", label: "Challenges", icon: StarIcon },
  { id: "ADVENTURE", label: "Adventure", icon: Clock },
];

interface LeaderboardUser {
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
  section?: string;
  stars?: number;
  // REFACTORED: Now using totalRuntime from DB
  totalRuntime?: number;
}

const LEADERBOARD_CACHE_KEY = "codeon_leaderboard_cache";
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to format seconds into MM:SS
const formatTime = (seconds: number) => {
  if (!seconds && seconds !== 0) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export function LeaderboardTab() {
  const { user, updateProfile } = useAuth();
  const [selectedUser, setSelectedUser] = useState<LeaderboardUser | null>(
    null
  );
  const [sectionFilter, setSectionFilter] = useState("ALL");
  const [gamemode, setGamemode] = useState("MULTIPLAYER");

  const [users, setUsers] = useState<LeaderboardUser[]>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(LEADERBOARD_CACHE_KEY);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {}
      }
    }
    return [];
  });

  const [loading, setLoading] = useState(users.length === 0);

  const fetchUsers = useCallback(
    async (isBackground = false) => {
      if (!isBackground) setLoading(true);

      let attempt = 0;
      const maxRetries = 3;
      let success = false;

      while (attempt < maxRetries && !success) {
        try {
          let query = supabase.from("users").select("*");

          // --- DYNAMIC SORTING BASED ON GAMEMODE ---
          if (gamemode === "MULTIPLAYER") {
            query = query.order("trophies", { ascending: false });
          } else if (gamemode === "CHALLENGES") {
            query = query.order("stars", { ascending: false }); // Assuming 'stars' exists
          } else if (gamemode === "ADVENTURE") {
            // REFACTORED QUERY: Sort by total_runtime ASC
            // Filter out '0' values (users who haven't played)
            query = query
              .gt("total_runtime", 0)
              .order("total_runtime", { ascending: true });
          }

          const { data, error } = await query.limit(100);

          if (error) throw error;

          const fetchedUsers: LeaderboardUser[] = (data || []).map(
            (u: any) => ({
              id: u.id,
              displayName: u.display_name || "Anonymous User",
              photoURL: u.photo_url || null,
              xp: u.xp || 0,
              level: u.level || 1,
              trophies: u.trophies || 0,
              league: u.league || "Novice",
              avatarConfig: u.avatar_config || null,
              joinedAt: u.joined_at,
              badges: u.badges || [],
              streaks: u.streaks || 0,
              section: u.section,
              stars: u.stars || 0,
              // Map DB column to Interface
              totalRuntime: u.total_runtime,
            })
          );

          setUsers(fetchedUsers);
          localStorage.setItem(
            LEADERBOARD_CACHE_KEY,
            JSON.stringify(fetchedUsers)
          );
          success = true;
        } catch (error) {
          console.error("Fetch error:", error);
          attempt++;
          if (attempt < maxRetries) await wait(1000);
        }
      }

      if (!isBackground) setLoading(false);
    },
    [gamemode]
  );

  useEffect(() => {
    fetchUsers(false);

    const onFocus = () => {
      setTimeout(() => {
        if (document.visibilityState === "visible") fetchUsers(true);
      }, 500);
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchUsers]);

  // Real-time updates for basic stats
  useEffect(() => {
    if (user && users.length > 0) {
      setUsers((prevUsers) => {
        const index = prevUsers.findIndex((u) => u.id === user.uid);
        if (index !== -1) {
          if (
            prevUsers[index].xp !== user.xp ||
            prevUsers[index].level !== user.level
          ) {
            const newUsers = [...prevUsers];
            newUsers[index] = {
              ...newUsers[index],
              xp: user.xp || 0,
              level: user.level || 1,
              league:
                LEAGUES.slice()
                  .reverse()
                  .find((l) => (user.xp || 0) >= l.minXp)?.name || "",
            };
            return newUsers;
          }
        }
        return prevUsers;
      });
    }
  }, [user]);

  // Auto-correct league
  useEffect(() => {
    if (user?.xp) {
      const correctLeague = getLeagueFromXP(user.xp);
      if (user.league !== correctLeague) {
        updateProfile({ league: correctLeague });
      }
    }
  }, [user?.xp, user?.league, updateProfile]);

  const filteredUsers = useMemo(() => {
    if (sectionFilter === "ALL") return users;
    return users.filter((u) =>
      u.section?.toUpperCase().includes(sectionFilter)
    );
  }, [users, sectionFilter]);

  const topThree = filteredUsers.slice(0, 3);
  const restOfUsers = filteredUsers.slice(3);

  const currentUserRank = filteredUsers.findIndex((u) => u.id === user?.uid);
  const currentUserData =
    currentUserRank !== -1 ? filteredUsers[currentUserRank] : null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const ActiveModeIcon =
    GAMEMODES.find((g) => g.id === gamemode)?.icon || TrophyIcon;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative"
      >
        <TrophyIcon className="w-20 h-20 text-yellow-500 mx-auto drop-shadow-lg" />
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mt-4 font-pixelify tracking-wide">
          Hall of Champions
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-4 relative z-20">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-help">
                  <Info className="w-5 h-5 text-gray-400 hover:text-indigo-500" />
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="p-4 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 shadow-xl rounded-2xl w-64"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b pb-2 mb-2 dark:border-gray-800">
                    <Award className="w-4 h-4 text-indigo-500" />
                    <h4 className="font-bold text-sm">League System</h4>
                  </div>
                  <div className="space-y-2">
                    {LEAGUES.map((league) => (
                      <div
                        key={league.name}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className={`font-bold ${league.color}`}>
                          {league.name}
                        </span>
                        <span className="text-muted-foreground font-mono">
                          {league.minXp.toLocaleString()}+ XP
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Gamemode Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-9 rounded-full px-4 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-semibold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Gamepad2 className="w-3.5 h-3.5 mr-2 text-orange-500" />
                {GAMEMODES.find((g) => g.id === gamemode)?.label}
                <ChevronDown className="w-3.5 h-3.5 ml-2 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-40">
              {GAMEMODES.map((mode) => (
                <DropdownMenuItem
                  key={mode.id}
                  onClick={() => setGamemode(mode.id)}
                  className={`cursor-pointer font-medium ${
                    gamemode === mode.id
                      ? "text-orange-600 bg-orange-50 dark:bg-orange-950/30"
                      : ""
                  }`}
                >
                  <mode.icon className="w-4 h-4 mr-2" />
                  {mode.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Section Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-9 rounded-full px-4 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-semibold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Filter className="w-3.5 h-3.5 mr-2 text-indigo-500" />
                {sectionFilter === "ALL" ? "All Sections" : sectionFilter}
                <ChevronDown className="w-3.5 h-3.5 ml-2 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-40">
              {SECTIONS.map((sec) => (
                <DropdownMenuItem
                  key={sec}
                  onClick={() => setSectionFilter(sec)}
                  className={`cursor-pointer font-medium ${
                    sectionFilter === sec
                      ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30"
                      : ""
                  }`}
                >
                  {sec === "ALL" ? "All Sections" : sec}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Ranked by {GAMEMODES.find((g) => g.id === gamemode)?.label}
        </p>
      </motion.div>

      {loading && <LeaderboardSkeleton />}

      {!loading && filteredUsers.length > 0 && (
        <>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              className="md:mt-8 order-2 md:order-1"
            >
              {topThree[1] && (
                <PodiumCard
                  user={topThree[1]}
                  rank={2}
                  onClick={() => setSelectedUser(topThree[1])}
                  gamemode={gamemode}
                />
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="order-1 md:order-2">
              {topThree[0] && (
                <PodiumCard
                  user={topThree[0]}
                  rank={1}
                  onClick={() => setSelectedUser(topThree[0])}
                  gamemode={gamemode}
                />
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="md:mt-8 order-3">
              {topThree[2] && (
                <PodiumCard
                  user={topThree[2]}
                  rank={3}
                  onClick={() => setSelectedUser(topThree[2])}
                  gamemode={gamemode}
                />
              )}
            </motion.div>
          </motion.div>

          <motion.div
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {restOfUsers.map((leaderboardUser, index) => (
              <motion.div key={leaderboardUser.id} variants={itemVariants}>
                <UserRankRow
                  user={leaderboardUser}
                  rank={index + 4}
                  isCurrentUser={leaderboardUser.id === user?.uid}
                  onClick={() => setSelectedUser(leaderboardUser)}
                  gamemode={gamemode}
                />
              </motion.div>
            ))}
          </motion.div>
        </>
      )}

      {!loading && filteredUsers.length === 0 && (
        <Card className="p-12 text-center bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm rounded-3xl">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <ActiveModeIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            No Champions Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            No one matches the current filters yet.
          </p>
        </Card>
      )}

      {currentUserData && (
        <motion.div
          className="sticky bottom-6 z-20"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <div className="mx-4 md:mx-0 shadow-2xl rounded-xl">
            <UserRankRow
              user={currentUserData}
              rank={currentUserRank + 1}
              isCurrentUser={true}
              isSticky={true}
              onClick={() => setSelectedUser(currentUserData)}
              gamemode={gamemode}
            />
          </div>
        </motion.div>
      )}

      <UserProfileModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
}

function UserProfileModal({
  user,
  onClose,
}: {
  user: LeaderboardUser | null;
  onClose: () => void;
}) {
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
              {user.section && (
                <>
                  <span>•</span>
                  <span className="font-bold text-gray-600 dark:text-gray-400">
                    {user.section}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl flex flex-col items-center justify-center gap-1 border border-gray-100 dark:border-gray-700">
              <TrophyIcon className="w-8 h-8 text-yellow-500" />
              <span className="text-lg font-bold">{user.trophies}</span>
              <span className="text-[10px] uppercase text-gray-400 font-bold">
                Trophies
              </span>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl flex flex-col items-center justify-center gap-1 border border-gray-100 dark:border-gray-700">
              <StarIcon className="w-8 h-8 text-yellow-400" />
              <span className="text-lg font-bold">{user.stars || 0}</span>
              <span className="text-[10px] uppercase text-gray-400 font-bold">
                Stars
              </span>
            </div>

            {/* Added Total Runtime Stat */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl flex flex-col items-center justify-center gap-1 border border-gray-100 dark:border-gray-700">
              <Clock className="w-8 h-8 text-blue-500" />
              <span className="text-lg font-bold">
                {user.totalRuntime ? formatTime(user.totalRuntime) : "--"}
              </span>
              <span className="text-[10px] uppercase text-gray-400 font-bold">
                Total Run Time
              </span>
            </div>
          </div>

          <div className="w-full space-y-3">
            <div className="text-sm font-bold uppercase text-gray-400 tracking-wider ml-1">
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

function PodiumCard({
  user,
  rank,
  onClick,
  gamemode,
}: {
  user: LeaderboardUser;
  rank: number;
  onClick: () => void;
  gamemode: string;
}) {
  const isFirst = rank === 1;
  const isSecond = rank === 2;
  const isThird = rank === 3;

  const renderMetric = () => {
    if (gamemode === "MULTIPLAYER") {
      return (
        <>
          <TrophyIcon
            className={`w-5 h-5 ${
              isFirst ? "text-yellow-400" : "text-gray-300"
            }`}
          />
          {user.trophies}
        </>
      );
    } else if (gamemode === "CHALLENGES") {
      return (
        <>
          <StarIcon className={`w-5 h-5 text-yellow-400`} />
          {user.stars || 0}
        </>
      );
    } else if (gamemode === "ADVENTURE") {
      return (
        <>
          <Clock className={`w-5 h-5 text-blue-400`} />
          <span className="text-lg">
            {user.totalRuntime ? formatTime(user.totalRuntime) : "--"}
          </span>
        </>
      );
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative rounded-3xl p-6 flex flex-col items-center text-center shadow-lg transition-all hover:scale-[1.03] cursor-pointer group
      ${
        isFirst
          ? "bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-900/20 dark:to-gray-900 border-2 border-yellow-400"
          : ""
      }
      ${
        isSecond
          ? "bg-gradient-to-b from-gray-50 to-white dark:from-gray-800/40 dark:to-gray-900 border border-gray-300 dark:border-gray-600"
          : ""
      }
      ${
        isThird
          ? "bg-gradient-to-b from-orange-50 to-white dark:from-orange-900/20 dark:to-gray-900 border border-orange-300 dark:border-orange-700"
          : ""
      }
    `}
    >
      <div
        className={`absolute -top-6 w-12 h-12 rounded-full flex items-center justify-center border-4 shadow-md z-10
        ${isFirst ? `bg-yellow-400 border-white dark:border-gray-900` : ""}
        ${isSecond ? `bg-gray-300 border-white dark:border-gray-900` : ""}
        ${isThird ? `bg-orange-500 border-white dark:border-gray-900` : ""}
      `}
      >
        {isFirst ? (
          <MedalGold className="w-8 h-8 text-white fill-current" />
        ) : isSecond ? (
          <MedalSilver className="w-8 h-8 text-white fill-current" />
        ) : isThird ? (
          <MedalBronze className="w-8 h-8 text-white fill-current" />
        ) : null}
      </div>

      <div
        className={`mt-6 w-24 h-24 rounded-full overflow-hidden border-4 bg-gray-100 dark:bg-gray-800 flex-shrink-0 relative transition-transform group-hover:scale-105
          ${
            isFirst
              ? "border-yellow-400 ring-4 ring-yellow-400/20"
              : "border-gray-200 dark:border-gray-700"
          }
      `}
      >
        <AvatarDisplay config={user.avatarConfig} headOnly />
      </div>

      <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-4 truncate w-full px-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {user.displayName}
      </h3>

      <div className="flex flex-col items-center mt-1 space-y-1">
        <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {user.league}
        </span>
        <span className="text-xs text-indigo-500 font-semibold">
          Level {user.level}
        </span>
        {user.section && (
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {user.section}
          </span>
        )}
      </div>

      <div className="mt-4 bg-gray-900 dark:bg-white/10 rounded-xl px-4 py-2 text-xl font-black text-white flex items-center gap-2 shadow-inner">
        {renderMetric()}
      </div>
    </div>
  );
}

function UserRankRow({
  user,
  rank,
  isCurrentUser,
  isSticky = false,
  onClick,
  gamemode,
}: {
  user: LeaderboardUser;
  rank: number;
  isCurrentUser: boolean;
  isSticky?: boolean;
  onClick: () => void;
  gamemode: string;
}) {
  let bgColor = "bg-white dark:bg-gray-900";
  let borderColor = "border-gray-100 dark:border-gray-800";
  let highlightClass = "";

  if (isCurrentUser) {
    if (rank === 1) {
      bgColor = "bg-yellow-50 dark:bg-yellow-900";
      borderColor = "border-yellow-400";
      highlightClass =
        "ring-2 ring-yellow-400 ring-offset-2 dark:ring-offset-gray-900";
    } else if (rank === 2) {
      bgColor = "bg-gray-100 dark:bg-gray-800";
      borderColor = "border-gray-400";
      highlightClass =
        "ring-2 ring-gray-400 ring-offset-2 dark:ring-offset-gray-900";
    } else if (rank === 3) {
      bgColor = "bg-orange-50 dark:bg-orange-900";
      borderColor = "border-orange-400";
      highlightClass =
        "ring-2 ring-orange-400 ring-offset-2 dark:ring-offset-gray-900";
    } else {
      bgColor = "bg-indigo-50 dark:bg-indigo-950";
      borderColor = "border-indigo-200 dark:border-indigo-800";
    }
  }

  const renderMetric = () => {
    if (gamemode === "MULTIPLAYER") {
      return (
        <>
          <TrophyIcon className="w-4 h-4 text-yellow-500 fill-current" />
          {user.trophies}
        </>
      );
    } else if (gamemode === "CHALLENGES") {
      return (
        <>
          <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
          {user.stars || 0}
        </>
      );
    } else if (gamemode === "ADVENTURE") {
      return (
        <>
          <Clock className="w-4 h-4 text-blue-500" />
          {user.totalRuntime ? formatTime(user.totalRuntime) : "--"}
        </>
      );
    }
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center p-4 rounded-xl transition-all border cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.99]
      ${bgColor} ${borderColor} ${highlightClass}
      ${isSticky ? "shadow-2xl" : "shadow-sm"}
    `}
    >
      <div
        className={`w-10 text-center text-lg font-black italic ${
          rank <= 3
            ? "text-gray-900 dark:text-white scale-110"
            : "text-gray-400 dark:text-gray-500"
        }`}
      >
        #{rank}
      </div>

      <div className="flex-1 flex items-center gap-3 ml-3 overflow-hidden">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex-shrink-0 relative">
          <AvatarDisplay config={user.avatarConfig} headOnly />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-sm font-bold text-gray-900 dark:text-white truncate hover:text-indigo-500 transition-colors">
              {user.displayName} {isCurrentUser && "(You)"}
            </div>
            {rank === 1 && (
              <Crown className="w-3 h-3 text-yellow-500 fill-current" />
            )}
          </div>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-2">
            <span className="font-semibold text-indigo-500">{user.league}</span>
            <span>•</span>
            <span>Lvl {user.level}</span>
            {user.section && (
              <>
                <span>•</span>
                <span className="uppercase font-bold tracking-wide">
                  {user.section}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="text-right pl-2">
        <div
          className={`flex items-center justify-end gap-1.5 text-base font-black ${
            isCurrentUser
              ? "text-indigo-700 dark:text-indigo-300"
              : "text-gray-900 dark:text-white"
          }`}
        >
          {renderMetric()}
        </div>
      </div>
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`p-6 rounded-3xl border border-gray-200 dark:border-gray-800 flex flex-col items-center ${
              i !== 2 ? "md:mt-8" : ""
            }`}
          >
            <Skeleton className="w-20 h-20 rounded-full" />
            <Skeleton className="h-6 w-3/4 mt-4" />
            <Skeleton className="h-4 w-1/3 mt-2" />
            <Skeleton className="h-10 w-1/2 mt-4 rounded-xl" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
          >
            <Skeleton className="h-6 w-8 rounded" />
            <Skeleton className="w-10 h-10 rounded-full ml-3" />
            <div className="flex-1 ml-3 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-6 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
