import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Swords,
  Scroll,
  Trophy,
  Zap,
  CheckCircle2,
  Gift,
  Timer,
  Terminal,
  Bug,
  Code2,
  Sparkles,
  Repeat,
  Layers,
  Braces,
  Box,
  Target,
  HelpCircle,
  EyeOff,
  ShoppingBag,
  Star,
  Crown,
  Globe,
  Book,
  Shield,
  Map as MapIcon,
  Loader2,
  GraduationCap,
  Users,
  Medal,
  Lock,
} from "lucide-react";
import { Card } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { useAuth } from "~/contexts/AuthContext";
import { supabase } from "~/lib/supabase";
import { toast } from "sonner";
import { ScrollQuestIcon } from "../ui/Icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { useGameSound } from "~/hooks/useGameSound";
import { QuestSkeleton } from "./QuestSkeleton";
import { QuestListSkeleton } from "./QuestListSkeleton"; // ADDED

// --- ICON MAPPING ---
const ICON_MAP: Record<string, any> = {
  swords: Swords,
  scroll: Scroll,
  trophy: Trophy,
  zap: Zap,
  timer: Timer,
  terminal: Terminal,
  bug: Bug,
  code: Code2,
  sparkles: Sparkles,
  repeat: Repeat,
  layers: Layers,
  braces: Braces,
  box: Box,
  target: Target,
  "help-circle": HelpCircle,
  "eye-off": EyeOff,
  coins: Trophy,
  "shopping-bag": ShoppingBag,
  star: Star,
  crown: Crown,
  globe: Globe,
  book: Book,
  shield: Shield,
  map: MapIcon,
  flame: Zap,
  "graduation-cap": GraduationCap,
  users: Users,
  medal: Medal,
};

// --- TYPES ---
type QuestCategory = "Bronze" | "Silver" | "Gold";

interface Quest {
  id: string;
  title: string;
  description: string;
  target_quantity: number;
  current_progress: number;
  reward_coins: number;
  reward_xp: number;
  reward_badge: string | null;
  metric_key: string;
  icon_key: string;
  category: QuestCategory;
  tag: string; // ADDED
  status: "in-progress" | "ready-to-claim" | "claimed";
}

export function QuestTab() {
  const { user, refreshUser } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  // ✅ Active Category State (Default Bronze)
  const [activeCategory, setActiveCategory] = useState<QuestCategory>("Bronze");
  const [switching, setSwitching] = useState(false); // ADDED

  // Reward Modal State
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [justClaimedQuest, setJustClaimedQuest] = useState<Quest | null>(null);
  const { playSound } = useGameSound();

  // --- FETCH DATA ---
  const loadQuests = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // 1. Fetch Quest Definitions
      const { data: questDefs, error: questError } = await supabase
        .from("quests")
        .select("*")
        .order("reward_coins", { ascending: true });

      if (questError) throw questError;

      // 2. Fetch User Stats
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select(
          "coins, xp, streaks, completed_chapters, stats, claimed_quests, badges",
        )
        .eq("id", user.uid)
        .single();

      if (userError) throw userError;

      // 3. Map & Calculate Progress
      const mappedQuests: Quest[] = questDefs.map((q: any) => {
        let progress = 0;
        const userStats: Record<string, number> = userData.stats || {};

        // Normalize Category (Handle lowercase from DB)
        const rawCategory = (q.category || "Bronze").toLowerCase();
        const category: QuestCategory = (rawCategory.charAt(0).toUpperCase() +
          rawCategory.slice(1)) as QuestCategory;

        switch (q.metric_key) {
          case "streaks":
            progress = userData.streaks || 0;
            break;
          case "completed_chapters_count":
            progress = userData.completed_chapters?.length || 0;
            break;
          case "total_coins_earned":
            progress = userStats.total_coins_earned || userData.coins || 0;
            break;
          case "total_xp_gained":
            progress = userData.xp || 0;
            break;
          case "badges_earned_count":
            progress = userData.badges?.length || 0;
            break;
          default:
            progress = userStats[q.metric_key] || 0;
        }

        const isClaimed = (userData.claimed_quests || []).includes(q.id);
        let status: Quest["status"] = "in-progress";

        if (isClaimed) {
          status = "claimed";
        } else if (progress >= q.target_quantity) {
          status = "ready-to-claim";
        }

        return {
          ...q,
          category, // Use normalized category
          current_progress: Math.min(progress, q.target_quantity),
          status,
        };
      });

      // Sort: Ready first, then In-Progress, then Claimed (pushed to bottom)
      const sortedQuests = mappedQuests.sort((a, b) => {
        const score = (status: string) => {
          if (status === "ready-to-claim") return 0;
          if (status === "in-progress") return 1;
          return 2;
        };
        return score(a.status) - score(b.status);
      });

      setQuests(sortedQuests);
    } catch (err) {
      console.error("Error loading quests:", err);
      toast.error("Failed to load quests.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadQuests();
  }, [loadQuests]);

  // --- HANDLE CLAIM ---
  const handleClaim = async (quest: Quest) => {
    if (!user || claimingId) return;
    setClaimingId(quest.id);

    try {
      const { data: currentUser } = await supabase
        .from("users")
        .select("coins, xp, claimed_quests, badges")
        .eq("id", user.uid)
        .single();

      if (!currentUser) throw new Error("User not found");

      const newCoins = (currentUser.coins || 0) + quest.reward_coins;
      const newXP = (currentUser.xp || 0) + quest.reward_xp;
      const newClaimed = [...(currentUser.claimed_quests || []), quest.id];

      let newBadges = currentUser.badges || [];
      if (quest.reward_badge && !newBadges.includes(quest.reward_badge)) {
        newBadges = [...newBadges, quest.reward_badge];
        toast.success(`New Title Unlocked: ${quest.reward_badge}!`, {
          style: { border: "1px solid #FFD700", color: "#B45309" },
        });
      }

      const { error } = await supabase
        .from("users")
        .update({
          coins: newCoins,
          xp: newXP,
          claimed_quests: newClaimed,
          badges: newBadges,
        })
        .eq("id", user.uid);

      if (error) throw error;

      // Removed generic toast to show Modal instead
      // toast.success(`Claimed: ${quest.reward_coins} Coins & ${quest.reward_xp} XP!`);

      await refreshUser();

      setQuests((prev) =>
        prev.map((q) => (q.id === quest.id ? { ...q, status: "claimed" } : q)),
      );

      // Open Reward Modal
      setJustClaimedQuest(quest);
      setRewardModalOpen(true);
      playSound("claim"); // Play sound effect
    } catch (err) {
      console.error("Claim failed:", err);
      toast.error("Could not claim reward.");
    } finally {
      setClaimingId(null);
    }
  };

  // --- FILTERING ---
  const filteredQuests = quests.filter((q) => q.category === activeCategory);

  // Handle Category Switch with Skeleton
  const handleCategorySwitch = (category: QuestCategory) => {
    if (category === activeCategory) return;
    setSwitching(true);
    setActiveCategory(category);
    setTimeout(() => setSwitching(false), 300); // 300ms transition
  };

  // Filter for Desktop Layout
  const bronzeQuests = quests.filter((q) => q.category === "Bronze");
  const silverQuests = quests.filter((q) => q.category === "Silver");
  const goldQuests = quests.filter((q) => q.category === "Gold");

  // Overall Progress for the Header
  const totalQuests = quests.length;
  const completedQuests = quests.filter((q) => q.status === "claimed").length;
  const progressPercentage =
    totalQuests > 0 ? (completedQuests / totalQuests) * 100 : 0;

  if (loading) {
    return <QuestSkeleton />;
  }

  return (
    <div className="fixed top-14 bottom-16 inset-x-0 z-0 flex flex-col bg-gray-50 dark:bg-gray-950 lg:bg-transparent lg:static lg:h-[calc(100vh-140px)] lg:max-w-7xl lg:mx-auto font-pixelify">
      {/* 1. TOP HEADER (Progress) */}
      <div className="flex-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white lg:rounded-t-3xl p-4 sm:p-6 shadow-sm dark:shadow-xl border-b border-gray-200 dark:border-gray-800 z-10">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-500/20 rounded-lg">
              <ScrollQuestIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Quests </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Master the code to unlock rewards
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {completedQuests}
            </span>
            <span className="text-sm text-gray-500"> / {totalQuests}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-500 to-yellow-400"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>

      {/* --- MOBILE VIEW (< lg) --- */}
      <div className="flex-1 flex flex-col lg:hidden min-h-0 relative">
        {/* 2. SCROLLABLE LIST */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-4 pt-4 pb-24 space-y-3 custom-scrollbar">
          {switching ? (
            <QuestListSkeleton />
          ) : (
            <AnimatePresence>
              {filteredQuests.length > 0 ? (
                filteredQuests.map((quest) => (
                  <QuestItem
                    key={quest.id}
                    quest={quest}
                    onClaim={handleClaim}
                    isClaiming={claimingId === quest.id}
                  />
                ))
              ) : (
                <div className="text-center py-20 text-gray-500">
                  <Lock className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>No quests found in this category.</p>
                </div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* 3. BOTTOM TABS (Floating Pill) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-auto max-w-[90%]">
          <div className="flex items-center gap-1.5 p-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-2xl rounded-full">
            <CategoryTab
              label="Bronze"
              isActive={activeCategory === "Bronze"}
              onClick={() => handleCategorySwitch("Bronze")}
              color="bg-orange-100 dark:bg-orange-600"
              textColor="text-orange-700 dark:text-orange-50"
              borderColor="border-orange-200 dark:border-orange-500"
              notificationCount={
                quests.filter(
                  (q) =>
                    q.category === "Bronze" && q.status === "ready-to-claim",
                ).length
              }
            />
            <CategoryTab
              label="Silver"
              isActive={activeCategory === "Silver"}
              onClick={() => handleCategorySwitch("Silver")}
              color="bg-slate-100 dark:bg-slate-400"
              textColor="text-slate-700 dark:text-slate-900"
              borderColor="border-slate-200 dark:border-slate-400"
              notificationCount={
                quests.filter(
                  (q) =>
                    q.category === "Silver" && q.status === "ready-to-claim",
                ).length
              }
            />
            <CategoryTab
              label="Gold"
              isActive={activeCategory === "Gold"}
              onClick={() => handleCategorySwitch("Gold")}
              color="bg-yellow-100 dark:bg-yellow-500"
              textColor="text-yellow-800 dark:text-yellow-950"
              borderColor="border-yellow-200 dark:border-yellow-500"
              notificationCount={
                quests.filter(
                  (q) => q.category === "Gold" && q.status === "ready-to-claim",
                ).length
              }
            />
          </div>
        </div>
      </div>

      {/* --- DESKTOP VIEW (>= lg) --- */}
      <div className="hidden lg:flex flex-col flex-1 h-full min-h-0 bg-transparent relative">
        {/* Connected Container (Full Width, connecting to header) */}
        <div className="w-full h-full flex flex-col relative bg-white/50 dark:bg-gray-900/50 backdrop-blur-md rounded-b-3xl border-x border-b border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
          {/* Scrollable List Area (Centered Content) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-40">
            <div className="max-w-4xl mx-auto space-y-4">
              {switching ? (
                <QuestListSkeleton />
              ) : (
                <AnimatePresence>
                  {filteredQuests.length > 0 ? (
                    filteredQuests.map((quest) => (
                      <QuestItem
                        key={quest.id}
                        quest={quest}
                        onClaim={handleClaim}
                        isClaiming={claimingId === quest.id}
                      />
                    ))
                  ) : (
                    <div className="text-center py-20 text-gray-500">
                      <Lock className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p className="text-lg font-medium">
                        No quests in this category.
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Floating Tabs (Desktop Sized & Positioned) */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
            <div className="flex items-center gap-2 p-2 bg-white/90 dark:bg-gray-950/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-2xl rounded-full scale-110 origin-bottom hover:scale-115 transition-transform duration-300">
              <CategoryTab
                label="Bronze"
                isActive={activeCategory === "Bronze"}
                onClick={() => handleCategorySwitch("Bronze")}
                color="bg-orange-100 dark:bg-orange-600"
                textColor="text-orange-700 dark:text-orange-50"
                borderColor="border-orange-200 dark:border-orange-500"
                notificationCount={
                  quests.filter(
                    (q) =>
                      q.category === "Bronze" && q.status === "ready-to-claim",
                  ).length
                }
              />
              <CategoryTab
                label="Silver"
                isActive={activeCategory === "Silver"}
                onClick={() => handleCategorySwitch("Silver")}
                color="bg-slate-100 dark:bg-slate-400"
                textColor="text-slate-700 dark:text-slate-900"
                borderColor="border-slate-200 dark:border-slate-400"
                notificationCount={
                  quests.filter(
                    (q) =>
                      q.category === "Silver" && q.status === "ready-to-claim",
                  ).length
                }
              />
              <CategoryTab
                label="Gold"
                isActive={activeCategory === "Gold"}
                onClick={() => handleCategorySwitch("Gold")}
                color="bg-yellow-100 dark:bg-yellow-500"
                textColor="text-yellow-800 dark:text-yellow-950"
                borderColor="border-yellow-200 dark:border-yellow-500"
                notificationCount={
                  quests.filter(
                    (q) =>
                      q.category === "Gold" && q.status === "ready-to-claim",
                  ).length
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reward Modal */}
      <QuestRewardModal
        open={rewardModalOpen}
        onClose={() => setRewardModalOpen(false)}
        quest={justClaimedQuest}
      />
    </div>
  );
}

// --- REWARD MODAL COMPONENT ---
function QuestRewardModal({
  open,
  onClose,
  quest,
}: {
  open: boolean;
  onClose: () => void;
  quest: Quest | null;
}) {
  if (!quest) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95%] sm:w-full border-none shadow-2xl bg-transparent p-0 overflow-visible fixed bottom-4 left-1/2 -translate-x-1/2 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 rounded-3xl">
        <div className="relative bg-white dark:bg-gray-950 p-5 sm:p-6 rounded-3xl border-2 border-yellow-500/20 shadow-2xl overflow-hidden">
          {/* Background Glow Effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -z-10" />

          <DialogHeader className="flex flex-col items-center relative z-10">
            {/* Animated Trophy - Smaller on mobile */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="relative mb-4 sm:mb-6"
            >
              <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-40 animate-pulse" />
              <div className="relative w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center border-4 border-yellow-200 shadow-xl">
                <Trophy className="w-10 h-10 sm:w-14 sm:h-14 text-yellow-600 drop-shadow-sm" />
              </div>

              {/* Floating Sparkles */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 pointer-events-none"
              >
                <Sparkles className="absolute top-0 right-0 w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 fill-yellow-400" />
                <Sparkles className="absolute bottom-2 left-0 w-3 h-3 sm:w-4 sm:h-4 text-orange-400 fill-orange-400" />
              </motion.div>
            </motion.div>

            <DialogTitle className="text-2xl sm:text-3xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 uppercase tracking-wide">
              Quest Complete!
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 sm:space-y-6 py-2 sm:py-4 text-center relative z-10">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
                {quest.title}
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-[90%] mx-auto leading-relaxed line-clamp-2">
                {quest.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* XP Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center p-3 sm:p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900 shadow-sm"
              >
                <span className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400">
                  +{quest.reward_xp}
                </span>
                <span className="text-[10px] sm:text-xs text-indigo-400 dark:text-indigo-300 uppercase font-extrabold tracking-wider mt-1">
                  XP Gained
                </span>
              </motion.div>

              {/* Coins Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center p-3 sm:p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 rounded-2xl border border-yellow-100 dark:border-yellow-900 shadow-sm"
              >
                <span className="text-3xl sm:text-4xl font-black text-yellow-600 dark:text-yellow-500">
                  +{quest.reward_coins}
                </span>
                <span className="text-[10px] sm:text-xs text-yellow-500/80 uppercase font-extrabold tracking-wider mt-1">
                  Coins
                </span>
              </motion.div>
            </div>

            {quest.reward_badge && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-blue-50 dark:bg-blue-900/20 p-2 sm:p-3 rounded-xl border border-blue-200 dark:border-blue-800 flex items-center gap-3 sm:gap-4 text-left shadow-sm"
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                  <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider">
                    New Title Unlocked
                  </p>
                  <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                    {quest.reward_badge}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          <DialogFooter className="sm:justify-center relative z-10 mt-2 sm:mt-2">
            <Button
              onClick={onClose}
              size="lg"
              className="w-full font-bold text-base sm:text-lg rounded-xl h-12 sm:h-14 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg shadow-orange-500/20 border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 transition-all"
            >
              Awesome!
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- SUB-COMPONENTS ---

function QuestItem({
  quest,
  onClaim,
  isClaiming,
}: {
  quest: Quest;
  onClaim: (quest: Quest) => void;
  isClaiming: boolean;
}) {
  const Icon = ICON_MAP[quest.icon_key] || Scroll;
  const isReady = quest.status === "ready-to-claim";
  const isClaimed = quest.status === "claimed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border-2 transition-all shadow-sm",
        isClaimed
          ? "bg-gray-200 dark:bg-gray-900/50 border-transparent opacity-60"
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
      )}
    >
      {/* Icon Box */}
      <div
        className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border-b-4",
          isClaimed
            ? "bg-gray-300 dark:bg-gray-800 border-gray-400 dark:border-gray-700"
            : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
        )}
      >
        <Icon className="w-6 h-6" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4
          className={cn(
            "font-bold text-sm truncate",
            isClaimed && "line-through text-gray-500",
          )}
        >
          {quest.title}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {quest.description}
        </p>

        {/* Rewards Row */}
        {!isClaimed && (
          <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-gray-400">
            {quest.reward_coins > 0 && (
              <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500">
                <Trophy className="w-3 h-3" /> {quest.reward_coins}
              </span>
            )}
            {quest.reward_xp > 0 && (
              <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                <Zap className="w-3 h-3" /> {quest.reward_xp}
              </span>
            )}
            {/* TAG Display */}
            {quest.tag && (
              <span className="flex items-center gap-1 text-cyan-500 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/20 px-1.5 py-0.5 rounded border border-cyan-200 dark:border-cyan-800">
                <MapIcon className="w-3 h-3" /> {quest.tag}
              </span>
            )}
            {quest.reward_badge && (
              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-1.5 rounded">
                <Medal className="w-3 h-3" /> {quest.reward_badge}
              </span>
            )}
          </div>
        )}

        {/* Progress Bar */}
        <div className="mt-2 h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-500",
              isClaimed ? "bg-gray-400" : "bg-green-500",
            )}
            style={{
              width: `${
                (quest.current_progress / quest.target_quantity) * 100
              }%`,
            }}
          />
        </div>
      </div>

      {/* Button */}
      <div className="shrink-0">
        {isReady ? (
          <Button
            size="sm"
            onClick={() => onClaim(quest)}
            disabled={isClaiming}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold h-9 px-3 shadow-sm border-b-4 border-yellow-700 active:border-b-0 active:translate-y-1 transition-all"
          >
            {isClaiming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Claim"
            )}
          </Button>
        ) : isClaimed ? (
          <div className="text-green-600 dark:text-green-500">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        ) : (
          <div className="w-16 text-center text-xs font-mono font-bold text-gray-400">
            {quest.current_progress}/{quest.target_quantity}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function CategoryTab({
  label,
  isActive,
  onClick,
  color,
  textColor,
  borderColor,
  notificationCount = 0,
}: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 py-2 px-4 rounded-full font-bold text-sm transition-all border-b-4 active:border-b-0 active:translate-y-1 relative",
        isActive
          ? `${color} ${textColor} ${
              borderColor || "border-black/20"
            } shadow-lg scale-105 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-950 ring-transparent`
          : "bg-transparent text-gray-500 dark:text-gray-400 border-transparent hover:bg-black/5 dark:hover:bg-white/5",
      )}
    >
      {label}
      {notificationCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white dark:border-gray-900 items-center justify-center">
            {/* Optional: Show number if needed, but a dot is usually cleaner for small tabs */}
            {/* <span className="text-[8px] text-white">{notificationCount}</span> */}
          </span>
        </span>
      )}
    </button>
  );
}
