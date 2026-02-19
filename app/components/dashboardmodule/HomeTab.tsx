import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  Code2,
  ArrowRight,
  Loader2,
  Zap,
  Sparkles,
  Compass,
  CheckCircle2,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { useNavigate } from "@remix-run/react";
import { useAuth } from "~/contexts/AuthContext";
import { supabase } from "~/lib/supabase";
import { Challenge } from "~/types/challenge.types";
import { MODULES } from "~/data/challenges"; // Imported MODULES
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
        const mapped = (challengeData as any[]).map((c) => ({
          ...c,
          // Map DB snake_case to camelCase
          starterCode: c.starter_code || c.starterCode,
          xpReward: c.xp_reward || c.xpReward,
          coinsReward: c.coins_reward || c.coinsReward,
          moduleId: c.module_id || parseInt(c.id.split(".")[0]), // Derive module ID if missing
          difficulty: c.difficulty || "Easy", // Fallback
          // Add other mappings if necessary, e.g., targetTimeMinutes -> target_time_minutes
        })) as Challenge[];

        const sorted = mapped.sort((a, b) => (a.page || 0) - (b.page || 0));
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
  // using completedMachineProblems as per investigation
  const completedMachineProblems =
    (user as any)?.completedMachineProblems || [];

  const completedChallengesCount = completedMachineProblems.length;

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
    navigate(`/play/challenges`);
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

  // ✅ SKELETON LOADING
  if (loading && !challenges.length) {
    return <HomeSkeleton />;
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
        className="group relative overflow-hidden rounded-[2rem] border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B0B15] shadow-xl hover:shadow-2xl transition-all duration-300"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 dark:from-orange-500/10 dark:to-red-500/10 opacity-100 dark:opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-100 dark:bg-orange-600/20 rounded-full blur-[80px] pointer-events-none opacity-50 dark:opacity-100" />

        <div className="relative p-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 shrink-0 rounded-2xl bg-orange-50 dark:bg-[#151520] border border-orange-100 dark:border-gray-800 flex items-center justify-center text-orange-500 shadow-sm dark:shadow-orange-900/20 group-hover:scale-110 transition-transform duration-500">
              <Compass className="w-10 h-10 drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30">
                  Adventure Mode
                </span>
                {adventureProgress.isCompleted && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/30">
                    Completed
                  </span>
                )}
              </div>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                {adventureProgress.isCompleted
                  ? "All Adventures Completed!"
                  : "Where you left off"}
              </h3>

              <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-lg text-sm">
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
            className="w-full md:w-auto h-14 px-8 text-base font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 border border-orange-500/20"
          >
            {/* ✅ UPDATED BUTTON LOGIC */}
            {adventureBtnText}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </motion.div>

      {/* --- Practice Arena Carousel --- */}
      {/* --- Practice Arena Carousel --- */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4 pt-2"
      >
        {(() => {
          // --- CENTRALIZED MODULE SELECTION LOGIC ---
          let activeModule = MODULES[0];
          let isModuleCompleted = false;

          for (const mod of MODULES) {
            const modChallenges = challenges.filter(
              (c) => c.moduleId === mod.id,
            );

            // Skip empty modules
            if (modChallenges.length === 0) {
              continue;
            }

            activeModule = mod;
            const allDone = modChallenges.every((c) =>
              completedMachineProblems.includes(c.id),
            );

            if (!allDone) {
              isModuleCompleted = false;
              break; // Found the current active module
            } else {
              isModuleCompleted = true; // This module is done, continue checking next
            }
          }

          // If we went through all modules and the last one with content is also completed:
          // activeModule is the last non-empty module, and isModuleCompleted is true.

          const activeChallenges = challenges.filter(
            (c) => c.moduleId === activeModule.id,
          );
          const firstId =
            activeChallenges.length > 0 ? activeChallenges[0].id : "?";
          const lastId =
            activeChallenges.length > 0
              ? activeChallenges[activeChallenges.length - 1].id
              : "?";

          const completedCount = activeChallenges.filter((c) =>
            completedMachineProblems.includes(c.id),
          ).length;
          const totalCount = activeChallenges.length;
          const percentage =
            totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

          return (
            <>
              <div className="flex justify-between items-end px-2">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Code2 className="w-6 h-6 text-indigo-500" />
                    <span className="flex items-center gap-2 text-xl font-bold">
                      <span className="text-gray-900 dark:text-white">
                        Module {activeModule.id} : {activeModule.title}
                      </span>
                      <span className="text-gray-500 text-base font-normal">
                        ({firstId} - {lastId})
                      </span>
                    </span>
                  </h2>

                  {/* Progress Bar */}
                  <div className="mt-3 max-w-lg min-w-[200px]">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 font-mono font-bold">
                        {Math.round(percentage)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#050510] rounded-[2rem] p-6 border border-gray-200 dark:border-gray-800 shadow-xl relative overflow-hidden transition-colors duration-300">
                {/* Subtle Glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />

                <div className="relative z-10">
                  {isModuleCompleted ? (
                    <div className="text-center py-12 md:py-16">
                      <div className="inline-flex p-4 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-6 ring-4 ring-green-50 dark:ring-green-900/10">
                        <CheckCircle2 className="w-12 h-12" />
                      </div>
                      <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-3">
                        Module Completed!
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
                        You have successfully finished all challenges in this
                        module. Great job!
                      </p>
                      <Button
                        onClick={() => navigate("/play/challenges")}
                        className="h-12 px-8 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg active:scale-95 transition-all"
                      >
                        Review Challenges
                      </Button>
                    </div>
                  ) : challenges.length > 0 ? (
                    <SelectionCarousel
                      challenges={activeChallenges}
                      onSelectChallenge={handleSelectChallenge}
                      completedChallenges={completedMachineProblems}
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
            </>
          );
        })()}
      </motion.div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bgColor }: any) {
  return (
    <div className="group bg-white dark:bg-[#0B0B15] rounded-[1.5rem] p-5 border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
      <div
        className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}
      >
        <Icon className="w-24 h-24 transform translate-x-8 -translate-y-8" />
      </div>
      <div
        className={`w-12 h-12 rounded-xl bg-gray-50 dark:bg-[#151520] border border-gray-100 dark:border-gray-800 flex items-center justify-center mb-4 ${color}`}
      >
        <Icon
          className={`w-6 h-6 drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]`}
        />
      </div>
      <div>
        <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight font-mono">
          {value}
        </div>
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
          {label}
        </div>
      </div>
    </div>
  );
}
