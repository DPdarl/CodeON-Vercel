import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  Code2,
  ArrowRight,
  Loader2,
  Zap,
  Sparkles,
  Compass,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { useNavigate } from "@remix-run/react";
import { useAuth } from "~/contexts/AuthContext";
import { supabase } from "~/lib/supabase";
import { Challenge } from "~/types/challenge.types";
import { SelectionCarousel } from "./SelectionCarousel";
import { calculateProgress } from "~/lib/leveling-system";
import { TrophyIcon, CrownIcon, StarIcon } from "../ui/Icons"; // Removed FlameIcon

// --- NEW IMPORTS FOR GAME LOGIC ---
import { useGameProgress } from "~/hooks/useGameProgress";
import { LevelUpModal } from "./LevelUpModal";
import { HomeSkeleton } from "./HomeSkeleton"; // ADDED

interface HomeTabProps {
  onTabChange: (tab: string) => void;
  isActive?: boolean;
}

export function HomeTab({ onTabChange, isActive = true }: HomeTabProps) {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  // Ref to track if we have fetched data for this 'activation'
  const hasFetchedRef = useRef(false);

  // --- DYNAMIC PROGRESS STATE ---
  const [adventureProgress, setAdventureProgress] = useState({
    chapter: 1,
    title: "Loading...",
    isCompleted: false,
  });

  const { grantXP, levelUpModal, isProcessing } = useGameProgress();

  // --- LOAD CURRENT CHAPTER LOGIC ---
  const loadCurrentChapter = useCallback(async () => {
    if (!user) return;

    try {
      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("id, title, order_index")
        .order("order_index", { ascending: true });

      if (lessonsError) console.error("Error fetching lessons:", lessonsError);

      if (lessonsData) {
        const completedIds = user?.completedChapters || [];
        const nextLesson = lessonsData.find(
          (l) => !completedIds.includes(l.id),
        );

        if (nextLesson) {
          setAdventureProgress({
            chapter: nextLesson.order_index,
            title: nextLesson.title,
            isCompleted: false,
          });
        } else if (lessonsData.length > 0) {
          setAdventureProgress({
            chapter: lessonsData.length,
            title: "Mastery Reached",
            isCompleted: true,
          });
        } else {
          setAdventureProgress({
            chapter: 1,
            title: "The Beginning",
            isCompleted: false,
          });
        }
      }
    } catch (err) {
      console.error("Failed to calculate current chapter:", err);
    }
  }, [user?.completedChapters]);

  // --- DATA FETCHING FUNCTION ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Challenges
      const { data: challengeData, error: challengeError } = await supabase
        .from("challenges")
        .select("*");

      if (challengeError) throw challengeError;
      if (challengeData) {
        const sorted = (challengeData as Challenge[]).sort(
          (a, b) => a.page - b.page,
        );
        setChallenges(sorted);
      }

      // 2. Refresh User Data (Silent update)
      if (refreshUser) await refreshUser();

      // 3. Recalculate chapter
      await loadCurrentChapter();
    } catch (error) {
      console.error("Error refreshing home tab:", error);
    } finally {
      setLoading(false);
    }
  }, [refreshUser, loadCurrentChapter]);

  // --- AUTO REFRESH EFFECT ---
  useEffect(() => {
    if (isActive) {
      if (!hasFetchedRef.current) {
        fetchData();
        hasFetchedRef.current = true;
      }
    } else {
      hasFetchedRef.current = false;
    }
  }, [isActive, fetchData]);

  // --- CALCULATE STATS ---
  const progressData = calculateProgress(user?.xp || 0);

  // Use explicit 'any' cast here if 'completedChallenges' is not yet in your UserData interface
  // This ensures the UI works now (showing 0) and works later when you add the DB field.
  const completedChallengesCount =
    (user as any)?.completedChallenges?.length || 0;

  const stats = {
    level: progressData.currentLevel,
    currentBarXP: progressData.currentXP,
    maxBarXP: progressData.xpForNextLevel,
    challengesDone: completedChallengesCount, // New Metric
    trophies: user?.trophies || 0,
    league: user?.league || "Novice",
    chaptersDone: user?.completedChapters?.length || 0, // Adventure Metric
  };

  const handleSelectChallenge = (challenge: Challenge) => {
    navigate(`/solo-challenge`, { state: { challenge } });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const isAdminOrSuper = user?.role === "admin" || user?.role === "superadmin";

  // --- BUTTON TEXT LOGIC ---
  let adventureBtnText = "Start Journey";
  if (adventureProgress.isCompleted) {
    adventureBtnText = "Replay Levels";
  } else if (adventureProgress.chapter > 1) {
    adventureBtnText = "Resume Journey";
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <LevelUpModal
        isOpen={levelUpModal.isOpen}
        newLevel={levelUpModal.newLevel}
        rewards={levelUpModal.rewards}
        onClose={() => {
          levelUpModal.close();
          hasFetchedRef.current = false;
          fetchData();
        }}
      />

      {/* --- Hero Section --- */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl"
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div className="relative p-8 md:p-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  {stats.league} League
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight font-pixelify">
                Welcome back, {user?.displayName || "Traveler"}!
              </h1>

              {/* ✅ TEST BUTTON: ONLY FOR ADMINS */}
              {isAdminOrSuper && (
                <div className="mt-6 flex flex-wrap gap-4 items-center">
                  <Button
                    onClick={() => grantXP(100)}
                    disabled={isProcessing}
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-0 transition-all active:scale-95"
                  >
                    {isProcessing ? (
                      <span className="animate-pulse">Adding...</span>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2 text-yellow-300 fill-yellow-300" />{" "}
                        Test: Give 100 XP
                      </>
                    )}
                  </Button>
                  <span className="text-[10px] text-indigo-200 opacity-70">
                    * Admin Only: Test Level Up
                  </span>
                </div>
              )}
            </div>

            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 min-w-[280px] border border-white/10">
              <div className="flex justify-between items-end mb-2">
                <span className="text-2xl font-black flex items-center gap-2">
                  Level {stats.level}
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                </span>
                <span className="text-sm text-indigo-200 font-mono">
                  {Math.round(stats.currentBarXP)}/{stats.maxBarXP} XP
                </span>
              </div>
              <Progress
                value={(stats.currentBarXP / stats.maxBarXP) * 100}
                className="h-3 bg-black/30"
                indicatorClassName="bg-gradient-to-r from-yellow-300 to-yellow-500"
              />
              <p className="text-xs text-indigo-200 mt-3 text-right">
                {Math.round(stats.maxBarXP - stats.currentBarXP)} XP to Level{" "}
                {stats.level + 1}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* --- Stats Row --- */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 1. CHAPTERS DONE (Adventure Mode) */}
        <StatCard
          icon={StarIcon}
          label="Chapters Done"
          value={stats.chaptersDone.toString()}
          color="text-blue-500"
          bgColor="bg-blue-50 dark:bg-blue-950/30"
        />
        {/* 2. COMPLETED CHALLENGES (Replaces Streak) */}
        <StatCard
          icon={Code2}
          label="Completed Challenges"
          value={stats.challengesDone.toString()}
          color="text-green-500"
          bgColor="bg-green-50 dark:bg-green-950/30"
          iconClassName="h-6 w-5"
        />
        {/* 3. TOTAL TROPHIES */}
        <StatCard
          icon={TrophyIcon}
          label="Total Trophies"
          value={stats.trophies.toLocaleString()}
          color="text-yellow-500"
          bgColor="bg-yellow-50 dark:bg-yellow-950/30"
        />
        {/* 4. CURRENT LEAGUE */}
        <StatCard
          icon={CrownIcon}
          label="Current League"
          value={stats.league}
          color="text-purple-500"
          bgColor="bg-purple-50 dark:bg-purple-950/30"
        />
      </div>

      {/* --- Adventure Banner (Dynamic) --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="group relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-md hover:shadow-xl transition-all duration-300"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 dark:from-orange-900/20 dark:to-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="h-16 w-16 shrink-0 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 shadow-sm">
              <Compass className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                  Adventure Mode
                </span>
                {adventureProgress.isCompleted && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">
                    Completed
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {adventureProgress.isCompleted
                  ? "All Adventures Completed!"
                  : "Where you left off"}
              </h3>

              <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-md">
                {adventureProgress.isCompleted ? (
                  "You have mastered all currently available chapters. Feel free to replay any level."
                ) : (
                  <>
                    You are currently facing challenges in{" "}
                    <span className="font-bold text-orange-600 dark:text-orange-400">
                      Chapter {adventureProgress.chapter}:{" "}
                      {adventureProgress.title}
                    </span>
                    . Ready to continue your journey?
                  </>
                )}
              </p>
            </div>
          </div>

          <Button
            onClick={() => navigate("/play/adventure")}
            className="w-full md:w-auto h-12 px-8 text-base font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-lg shadow-orange-500/20 transition-transform active:scale-95"
          >
            {/* ✅ UPDATED BUTTON LOGIC */}
            {adventureBtnText}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </motion.div>

      {/* --- Practice Arena Carousel --- */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4 pt-2"
      >
        <div className="flex justify-between items-end px-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Code2 className="w-6 h-6 text-indigo-500" />
              Practice Arena
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Complete challenges in order to unlock the next one.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-900/50 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

          <div className="relative z-10">
            {loading ? (
              <HomeSkeleton />
            ) : challenges.length > 0 ? (
              <SelectionCarousel
                challenges={challenges}
                onSelectChallenge={handleSelectChallenge}
                // NOTE: If you are using 'completedChapters' for this logic currently, keep it.
                // If you have a separate array for challenges, switch this to: user?.completedChallenges || []
                completedChallenges={user?.completedChapters || []}
              />
            ) : (
              <div className="text-center py-20 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-gray-500 text-lg">
                  No challenges found in the database.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bgColor }: any) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm dark:hover:shadow-white hover:shadow-md flex items-center gap-4 transition-transform hover:scale-105">
      <div className={`p-3 rounded-xl ${bgColor}`}>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
      <div>
        <div className="text-2xl font-black text-gray-900 dark:text-white">
          {value}
        </div>
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {label}
        </div>
      </div>
    </div>
  );
}
