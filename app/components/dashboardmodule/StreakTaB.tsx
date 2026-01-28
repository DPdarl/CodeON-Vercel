import { useState, useEffect, useMemo } from "react"; // ✅ Added useMemo
import { useAuth } from "~/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "~/components/ui/dialog";
import {
  Flame,
  Calendar,
  Snowflake,
  Store,
  Award,
  Check,
  Lock,
  Crown,
  Frown,
  Heart,
  Repeat,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "~/lib/utils";
import {
  STREAK_MILESTONES,
  calculateStreakUpdate,
  getStreakState,
  StreakStatus,
  getPhDateString,
  UIVisualState,
  calculateEffectiveStreak,
  getRepairStatus,
  repairStreak,
} from "~/lib/streak-logic";
import { FlameIcon, SnowflakeIcon } from "../ui/Icons";
import { StreakSkeleton } from "./StreakSkeleton"; // ✅ Added Import

/* --------------------------- ANIMATIONS --------------------------- */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

// ✅ FIX 1: Define a static empty array outside the component
const NO_DATES: string[] = [];

/* --------------------------- COMPONENT --------------------------- */

export function StreakTab() {
  const { user, updateProfile } = useAuth();

  // ✅ 1. SKELETON LOADING STATE
  if (!user) {
    return <StreakSkeleton />;
  }

  const [claimedMilestones, setClaimedMilestones] = useState<number[]>([]);

  useEffect(() => {
    if (user?.settings?.claimedMilestones) {
      setClaimedMilestones(user.settings.claimedMilestones);
    }
  }, [user]);

  const [calendarDays, setCalendarDays] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState("");
  const [justClaimed, setJustClaimed] = useState<any>(null); // For simplified celebration if needed

  // Modals
  const [selectedMilestone, setSelectedMilestone] = useState<any | null>(null);
  const [streakStatusModal, setStreakStatusModal] = useState<{
    show: boolean;
    status: StreakStatus;
    message: string;
  }>({ show: false, status: "NONE", message: "" });

  // Repair State
  const repairStatus = useMemo(() => getRepairStatus(user), [user]);
  const [isRepairing, setIsRepairing] = useState(false);

  const currentStreak = useMemo(() => calculateEffectiveStreak(user), [user]);
  const freezeCount = user?.streakFreezes || 0;

  // ✅ FIX 2: Use the static array to ensure reference stability
  const activeDatesRaw = user?.activeDates || NO_DATES;
  const frozenDatesRaw = (user as any)?.frozenDates || NO_DATES;

  // Determine Visual State
  const visualState = getStreakState(user);
  const todayDate = getPhDateString();
  const hasPlayedToday = activeDatesRaw.includes(todayDate);

  /* --------------------------- MILESTONES --------------------------- */

  const milestonesList = Object.entries(STREAK_MILESTONES)
    .map(([days, reward]) => {
      const daysNum = Number(days);
      const isReached = currentStreak >= daysNum;
      const isClaimed = claimedMilestones.includes(daysNum);

      return {
        days: daysNum,
        ...reward,
        isReached,
        isClaimed,
        status: isClaimed ? "claimed" : isReached ? "claimable" : "locked",
      };
    })
    .sort((a, b) => a.days - b.days);

  const handleClaim = async (milestone: any) => {
    if (!user || !milestone.isReached || milestone.isClaimed) return;

    try {
      const newClaimed = [...claimedMilestones, milestone.days];
      setClaimedMilestones(newClaimed); // Optimistic

      const newSettings = {
        ...(user.settings || {}),
        claimedMilestones: newClaimed,
      };

      const newBadges = [...(user.badges || [])];
      if (milestone.badge && !newBadges.includes(milestone.badge)) {
        newBadges.push(milestone.badge);
      }

      const newCoins = (user.coins || 0) + milestone.coins;

      await updateProfile({
        coins: newCoins,
        badges: newBadges,
        settings: newSettings,
      });

      setSelectedMilestone(milestone); // Show celebration modal
    } catch (e) {
      console.error("Claim failed", e);
      // Revert optimistic update? For now just log.
    }
  };

  /* --------------------------- CALENDAR --------------------------- */

  useEffect(() => {
    // Generate Calendar based on PH time
    const today = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }),
    );

    setCurrentMonth(today.toLocaleString("default", { month: "long" }));

    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: any[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push({ isPadding: true });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d, 12, 0, 0);
      const dateStr = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(dateObj);

      const isToday = dateStr === todayDate;

      days.push({
        day: d,
        isPadding: false,
        isToday,
        isActive: activeDatesRaw.includes(dateStr),
        isFrozen: frozenDatesRaw.includes(dateStr),
        isFuture: dateStr > todayDate,
      });
    }

    setCalendarDays(days);

    // ✅ FIX 3: JSON.stringify ensures we only re-run if the *content* changes, not the memory reference.
    // This completely stops the infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentStreak,
    JSON.stringify(activeDatesRaw),
    JSON.stringify(frozenDatesRaw),
    todayDate,
  ]);

  /* --------------------------- REPAIR BUTTON --------------------------- */

  const handleRepairStreak = async () => {
    if (!user || isRepairing || !repairStatus.canRepair) return;
    setIsRepairing(true);

    try {
      const result = repairStreak(user);

      if (!result.shouldUpdate) {
        alert(result.messages.join(" ") || "Cannot repair streak.");
        setIsRepairing(false);
        return;
      }

      await updateProfile({
        activeDates: result.newActiveDates,
        coins: result.newCoins,
        streakFreezes: result.newFreezes,
        badges: result.newBadges,
        // @ts-ignore
        frozenDates: result.newFrozenDates,
      });

      setStreakStatusModal({
        show: true,
        status: result.status,
        message: result.messages.join(" "),
      });
    } catch (e) {
      console.error(e);
      alert("❌ Failed to repair streak.");
    } finally {
      setIsRepairing(false);
    }
  };

  /* --------------------------- UI --------------------------- */

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <FlameIcon className="w-8 h-8 text-orange-500" />
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            Your Streak
          </h1>
        </div>
      </motion.div>

      {/* Main Grid */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          {repairStatus.canRepair && currentStreak === 0 && (
            <div className="bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-900/50 p-4 rounded-3xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full animate-pulse">
                  <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-600 dark:text-red-400">
                    Streak Broken!
                  </h3>
                  <p className="text-sm text-red-500 dark:text-red-300">
                    You missed a day. Repair it now to keep your progress!
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                onClick={handleRepairStreak}
                disabled={isRepairing || (user?.coins || 0) < repairStatus.cost}
                className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/30"
              >
                {isRepairing
                  ? "Repairing..."
                  : `Repair (-${repairStatus.cost} 🪙)`}
              </Button>
            </div>
          )}

          <CurrentStreakCard streak={currentStreak} visualState={visualState} />
          <StreakCalendarCard
            month={currentMonth}
            days={calendarDays}
            visualState={visualState}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
          <StreakInventoryCard freezeCount={freezeCount} />
          <StreakMilestonesCard
            milestones={milestonesList}
            onViewMilestone={setSelectedMilestone}
            onClaim={handleClaim}
          />
        </motion.div>
      </motion.div>

      {/* --- STATUS MODAL (BROKEN / FROZEN / CONTINUED) --- */}
      <Dialog
        open={streakStatusModal.show}
        onOpenChange={(open) =>
          !open && setStreakStatusModal((prev) => ({ ...prev, show: false }))
        }
      >
        <DialogContent className="sm:max-w-sm text-center">
          <div className="flex flex-col items-center gap-4 py-4">
            {streakStatusModal.status === "FROZEN" && (
              <>
                <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2 animate-bounce">
                  <Snowflake className="w-12 h-12 text-blue-500" />
                </div>
                <h2 className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  Streak Frozen!
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  You missed a day, but your{" "}
                  <span className="font-bold">Streak Freeze</span> saved you.
                </p>
              </>
            )}

            {streakStatusModal.status === "BROKEN" && (
              <>
                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mb-2 grayscale">
                  <Frown className="w-12 h-12 text-gray-500" />
                </div>
                <h2 className="text-2xl font-black text-gray-700 dark:text-gray-300">
                  Streak Broken
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  You missed a day without a freeze. Your streak has reset to 1.
                </p>
              </>
            )}

            {(streakStatusModal.status === "CONTINUED" ||
              streakStatusModal.status === "FIRST") && (
              <>
                <div className="w-24 h-24 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-2 animate-pulse">
                  <Flame className="w-12 h-12 text-orange-500 fill-orange-500" />
                </div>
                <h2 className="text-2xl font-black text-orange-500">
                  Streak Extended!
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Keep up the great work!
                </p>
              </>
            )}

            <Button
              className="w-full mt-4"
              variant={
                streakStatusModal.status === "FROZEN"
                  ? "default"
                  : streakStatusModal.status === "BROKEN"
                  ? "secondary"
                  : "default"
              }
              onClick={() =>
                setStreakStatusModal((prev) => ({ ...prev, show: false }))
              }
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- MILESTONE MODAL --- */}
      <Dialog
        open={!!selectedMilestone}
        onOpenChange={(open) => !open && setSelectedMilestone(null)}
      >
        <DialogContent className="sm:max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex flex-col items-center gap-2">
              <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-2">
                <TrophyIcon className="w-12 h-12 text-yellow-500" />
              </div>
              {selectedMilestone?.title}
            </DialogTitle>
            <DialogDescription className="text-center text-lg">
              You've officially reached a {selectedMilestone?.days} day streak!
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            <div className="flex items-center justify-center gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-2xl border-2 border-yellow-200 dark:border-yellow-800 animate-in zoom-in-50 duration-300">
              <div className="flex flex-col items-center">
                <span className="text-xs uppercase font-bold text-yellow-600 dark:text-yellow-400">
                  Reward
                </span>
                <div className="flex items-center gap-2 text-2xl font-black text-yellow-500">
                  <img
                    src="/assets/icons/coinv2.png"
                    className="w-8 h-8"
                    alt="Coin"
                  />
                  +{selectedMilestone?.coins}
                </div>
              </div>

              {selectedMilestone?.badge && (
                <>
                  <div className="w-[1px] h-12 bg-yellow-300 dark:bg-yellow-700" />
                  <div className="flex flex-col items-center">
                    <span className="text-xs uppercase font-bold text-yellow-600 dark:text-yellow-400">
                      New Badge
                    </span>
                    <div className="flex items-center gap-2 text-xl font-bold text-purple-600 dark:text-purple-400">
                      <Award className="w-6 h-6" />
                      Unlocked
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <DialogFooter className="sm:justify-center">
            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
              onClick={() => setSelectedMilestone(null)}
            >
              Awesome!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Sub-components (KEEP THESE AS THEY WERE) ---

function CurrentStreakCard({
  streak,
  visualState,
}: {
  streak: number;
  visualState: UIVisualState;
}) {
  let bgColor = "bg-gray-200 dark:bg-gray-800";
  let textColor = "text-gray-500 dark:text-gray-400";
  let flameColor = "text-gray-400 fill-gray-400";
  let statusText = "Streak Inactive";
  let statusIcon = <Flame className="w-16 h-16 drop-shadow-md" />;

  if (visualState === "ACTIVE") {
    bgColor = "bg-gradient-to-br from-orange-400 to-red-500";
    textColor = "text-white";
    flameColor = "text-white fill-white animate-pulse";
    statusText = "🔥 You're on fire!";
  } else if (visualState === "FROZEN") {
    bgColor = "bg-gradient-to-br from-blue-400 to-cyan-500";
    textColor = "text-white";
    flameColor = "text-white fill-white";
    statusText = "❄️ Streak Frozen";
    statusIcon = <Snowflake className="w-16 h-16 drop-shadow-md text-white" />;
  } else if (visualState === "PENDING") {
    // Pending (Logged in yesterday, not today) - Grayscale
    bgColor = "bg-gray-200 dark:bg-gray-800";
    textColor = "text-gray-500 dark:text-gray-400";
    flameColor = "text-gray-400 fill-gray-400 grayscale";
    statusText = "🔥 Continue your streak!";
  } else {
    // Broken - Grayscale / Gray
    bgColor = "bg-gray-200 dark:bg-gray-800";
    textColor = "text-gray-500 dark:text-gray-400";
    flameColor = "text-gray-300 fill-gray-300 grayscale opacity-50";
    statusText = "⚠️ Start a streak!";
  }

  return (
    <Card
      className={cn(
        "rounded-3xl shadow-lg overflow-hidden relative transition-all duration-500",
        bgColor,
        textColor,
      )}
    >
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

      <CardContent className="p-8 flex items-center gap-6 relative z-10">
        <div
          className={cn(
            "p-4 rounded-full backdrop-blur-sm shadow-inner transition-all",
            visualState === "ACTIVE" || visualState === "FROZEN"
              ? "bg-white/20"
              : "bg-gray-300 dark:bg-gray-700",
          )}
        >
          {visualState === "FROZEN" ? (
            statusIcon
          ) : (
            <Flame
              className={cn(
                "w-16 h-16 drop-shadow-md transition-all",
                flameColor,
              )}
            />
          )}
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wider opacity-80 mb-1">
            Current Streak
          </p>
          <p className="text-6xl font-black drop-shadow-sm leading-none mb-2">
            {streak}
          </p>
          <div
            className={cn(
              "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm",
              visualState === "ACTIVE" || visualState === "FROZEN"
                ? "bg-white/20"
                : "bg-black/5 dark:bg-white/5",
            )}
          >
            {statusText}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StreakCalendarCard({
  month,
  days,
  visualState,
}: {
  month: string;
  days: any[];
  visualState: UIVisualState;
}) {
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card className="bg-white dark:bg-gray-900 shadow-lg border-gray-100 dark:border-gray-800 rounded-3xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center justify-between">
          <span>{month}</span>
          <div
            className={`text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 ${
              days.find((d) => d.isToday)?.isActive
                ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                : "bg-gray-100 text-gray-500 dark:bg-gray-800"
            }`}
          >
            {days.find((d) => d.isToday)?.isActive
              ? "Streak Saved"
              : visualState === "PENDING"
              ? "Pending"
              : visualState === "FROZEN"
              ? "Frozen"
              : "Broken"}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-3">
          {dayLabels.map((label) => (
            <div
              key={label}
              className="text-center text-[10px] font-bold text-gray-400 uppercase"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const isMissedToday = day.isToday && !day.isActive;

            return (
              <div
                key={index}
                className={cn(
                  "relative aspect-square rounded-xl flex items-center justify-center font-bold text-sm transition-all",
                  day.isPadding && "bg-transparent",

                  // Future Days
                  day.isFuture &&
                    "bg-gray-50 dark:bg-gray-800/20 text-gray-300 dark:text-gray-700",

                  // Past/Present Inactive (Default)
                  !day.isPadding &&
                    !day.isFuture &&
                    !day.isActive &&
                    !day.isFrozen &&
                    !day.isToday &&
                    "bg-gray-100 dark:bg-gray-800/50 text-gray-400",

                  // Active (Orange)
                  day.isActive &&
                    "bg-orange-500 text-white shadow-md shadow-orange-500/20 scale-105 border-2 border-white dark:border-gray-900",

                  // Frozen (Blue)
                  day.isFrozen &&
                    "bg-blue-500 text-white shadow-md shadow-blue-500/20 border-2 border-white dark:border-gray-900",

                  // Today Missing (Red Flashing)
                  isMissedToday &&
                    "bg-transparent text-gray-900 dark:text-white border-2 border-dashed border-red-400 dark:border-red-500 animate-pulse bg-red-50 dark:bg-red-900/10",

                  // Today Active Ring
                  day.isToday &&
                    day.isActive &&
                    "ring-2 ring-offset-2 ring-orange-500 dark:ring-offset-gray-900",
                )}
              >
                {!day.isPadding && <span>{day.day}</span>}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function StreakInventoryCard({ freezeCount }: { freezeCount: number }) {
  return (
    <Card className="bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 rounded-3xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">Power-Ups</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-blue-900 rounded-xl shadow-sm">
              <SnowflakeIcon className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <div className="font-bold text-blue-900 dark:text-blue-100">
                Streak Freeze
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-300">
                Auto-equips on miss
              </div>
            </div>
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            x{freezeCount}
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full mt-2 text-indigo-600 hover:text-indigo-700 h-auto py-2 text-xs"
        >
          <Store className="w-3 h-3 mr-1" /> Get more in Store
        </Button>
      </CardContent>
    </Card>
  );
}

function StreakMilestonesCard({
  milestones,
  onViewMilestone,
  onClaim,
}: {
  milestones: any[];
  onViewMilestone: (m: any) => void;
  onClaim: (m: any) => void;
}) {
  return (
    <Card className="bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden">
      <CardHeader className="border-b border-gray-50 dark:border-gray-800 pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" /> Goal Roadmap
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {milestones.map((milestone: any, index: number) => {
            const isClaimable = milestone.status === "claimable";
            const isClaimed = milestone.status === "claimed";
            const isLocked = milestone.status === "locked";

            return (
              <div
                key={milestone.days}
                className={cn(
                  "p-4 flex items-center gap-4 transition-all relative",
                  isClaimable && "bg-yellow-50/50 dark:bg-yellow-900/10",
                )}
              >
                {/* Progress Line Connector */}
                {index !== milestones.length - 1 && (
                  <div
                    className={cn(
                      "absolute left-[31px] top-8 bottom-[-34px] w-0.5 z-0",
                      isClaimed || isClaimable
                        ? "bg-yellow-500"
                        : "bg-gray-200 dark:bg-gray-700",
                    )}
                  />
                )}

                {/* Status Icon */}
                <div className="relative z-10 w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-white dark:bg-gray-900 border-2 transition-colors duration-300">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center border-2",
                      isClaimed
                        ? "bg-yellow-100 border-yellow-500 text-yellow-600 dark:bg-yellow-900 dark:border-yellow-500 dark:text-yellow-400"
                        : isClaimable
                        ? "bg-white border-yellow-500 text-yellow-500 animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                        : "bg-gray-100 border-gray-200 text-gray-400 dark:bg-gray-800 dark:border-gray-700",
                    )}
                  >
                    {isClaimed ? (
                      <Check className="w-4 h-4" />
                    ) : isClaimable ? (
                      <Flame className="w-4 h-4 fill-yellow-500" />
                    ) : (
                      <Lock className="w-3 h-3" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4
                      className={cn(
                        "font-bold text-sm",
                        isLocked
                          ? "text-gray-400 dark:text-gray-500"
                          : "text-gray-900 dark:text-white",
                      )}
                    >
                      {milestone.days}-Day Streak
                    </h4>
                    {!isClaimed && !isLocked && (
                      <div className="flex items-center gap-1 text-[10px] font-black uppercase text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 px-1.5 py-0.5 rounded">
                        +{milestone.coins}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {milestone.title}
                  </p>
                </div>

                {/* Action */}
                <div>
                  {isClaimable ? (
                    <Button
                      size="sm"
                      onClick={() => onClaim(milestone)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold h-8 px-3 rounded-lg shadow-lg shadow-yellow-500/20 active:scale-95 transition-all animate-bounce-subtle"
                    >
                      Claim
                    </Button>
                  ) : isClaimed ? (
                    <span
                      onClick={() => onViewMilestone(milestone)}
                      className="text-xs font-bold text-green-500 uppercase tracking-wider cursor-pointer hover:underline"
                    >
                      View
                    </span>
                  ) : (
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-300 dark:text-gray-600">
                      <img
                        src="/assets/icons/coinv2.png"
                        className="w-3 h-3 grayscale opacity-50"
                        alt=""
                      />
                      {milestone.coins}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return <Award className={className} />;
}
