// app/components/dashboardmodule/QuestTab.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Swords,
  Scroll,
  Trophy,
  Zap,
  CheckCircle2,
  Lock,
  Gift,
  Timer,
  Terminal,
  Bug,
  Code2,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { useAuth } from "~/contexts/AuthContext";
import { ScrollQuestIcon } from "../ui/Icons";

// --- MOCK DATA (To be replaced by Firestore logic later) ---
const DAILY_QUESTS = [
  {
    id: 1,
    title: "Syntax Slayer",
    description: "Complete 2 C# Challenges with 100% accuracy",
    current: 1,
    target: 2,
    reward: 20, // Coins or XP
    icon: Swords,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    status: "in-progress", // 'in-progress' | 'ready-to-claim' | 'claimed'
  },
  {
    id: 2,
    title: "Bug Hunter",
    description: "Fix 5 syntax errors in the playground",
    current: 5,
    target: 5,
    reward: 50,
    icon: Bug,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    status: "ready-to-claim",
  },
  {
    id: 3,
    title: "Runtime Runner",
    description: "Spend 15 minutes coding today",
    current: 15,
    target: 15,
    reward: 30,
    icon: Timer,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    status: "claimed",
  },
];

const ACHIEVEMENTS = [
  {
    id: "a1",
    name: "First Compilation",
    desc: "Run your first code",
    icon: Terminal,
    unlocked: true,
  },
  {
    id: "a2",
    name: "Week Warrior",
    desc: "7 Day Streak",
    icon: Zap,
    unlocked: true,
  },
  {
    id: "a3",
    name: "Code Ninja",
    desc: "Solve a Hard challenge",
    icon: Swords,
    unlocked: false,
  },
  {
    id: "a4",
    name: "Polyglot",
    desc: "Try 3 different languages",
    icon: Code2,
    unlocked: false,
  },
  {
    id: "a5",
    name: "Millionaire",
    desc: "Earn 1,000 Coins",
    icon: Trophy,
    unlocked: false,
  },
];

// --- COMPONENT START ---
export function QuestTab() {
  const { user } = useAuth();

  // State to handle claiming logic (visual only for now)
  const [quests, setQuests] = useState(DAILY_QUESTS);

  const handleClaim = (id: number) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: "claimed" } : q))
    );
    // Play sound effect here in future
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 font-pixelify">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <ScrollQuestIcon className="w-8 h-8 text-indigo-500" />
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Quest Board
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Complete tasks to earn rewards and glory.
            </p>
          </div>
        </div>

        {/* Timer Badge */}
        <div className="hidden md:flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 px-4 py-2 rounded-full text-indigo-600 dark:text-indigo-400 font-bold text-sm">
          <Timer className="w-4 h-4" />
          <span>Resets in 12h 30m</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Daily Quests & Monthly Badge */}
        <div className="lg:col-span-2 space-y-8">
          {/* Monthly Challenge Banner */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 shadow-xl"
          >
            <div className="absolute top-0 right-0 -mr-10 -mt-10 h-40 w-40 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10 flex items-center gap-6">
              <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30 shadow-inner shrink-0">
                <Trophy className="w-10 h-10 text-yellow-300 fill-current" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">November Challenger</h3>
                <p className="text-purple-100 text-sm mb-3">
                  Complete 30 quests this month to unlock this exclusive badge!
                </p>
                <div className="flex items-center gap-3">
                  <Progress
                    value={45}
                    className="h-3 bg-black/20"
                    indicatorClassName="bg-yellow-400"
                  />
                  <span className="text-sm font-bold font-mono">14/30</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Daily Quests List */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500 fill-current" />
              Daily Quests
            </h2>
            <div className="grid gap-4">
              {quests.map((quest, index) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  onClaim={handleClaim}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Achievements */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-orange-500" />
              Lifetime Achievements
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {ACHIEVEMENTS.map((ach) => (
                <AchievementNode key={ach.id} achievement={ach} />
              ))}
            </div>
            <Button
              variant="ghost"
              className="w-full mt-6 text-indigo-500 hover:text-indigo-600"
            >
              View All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function QuestCard({ quest, onClaim, index }: any) {
  const Icon = quest.icon;
  const isClaimed = quest.status === "claimed";
  const isReady = quest.status === "ready-to-claim";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300",
        isClaimed
          ? "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-60 grayscale-[0.5]"
          : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-700 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-800"
      )}
    >
      {/* Icon Box */}
      <div
        className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center shrink-0",
          quest.bgColor
        )}
      >
        <Icon className={cn("w-7 h-7", quest.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <h4
            className={cn(
              "font-bold text-lg truncate",
              isClaimed && "line-through"
            )}
          >
            {quest.title}
          </h4>
          <span className="text-xs font-bold text-gray-400 font-mono">
            {quest.current}/{quest.target}
          </span>
        </div>
        <div className="mb-1 text-sm text-gray-500 dark:text-gray-400 truncate">
          {quest.description}
        </div>
        <Progress
          value={(quest.current / quest.target) * 100}
          className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-800"
          indicatorClassName={isClaimed ? "bg-gray-400" : "bg-green-500"}
        />
      </div>

      {/* Action Button */}
      <div className="shrink-0 w-24 flex justify-end">
        {isReady ? (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Button
              onClick={() => onClaim(quest.id)}
              className="bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-bold shadow-lg shadow-yellow-400/20"
            >
              <Gift className="w-4 h-4 mr-2" />
              Claim
            </Button>
          </motion.div>
        ) : isClaimed ? (
          <div className="flex flex-col items-center text-green-500 font-bold text-xs">
            <CheckCircle2 className="w-6 h-6 mb-1" />
            Done
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-400 font-bold text-xs">
            <span className="text-base">{quest.reward}</span>
            <span>XP</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function AchievementNode({ achievement }: any) {
  const Icon = achievement.icon;
  return (
    <div className="flex flex-col items-center text-center gap-2 group">
      <div
        className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center border-b-4 transition-all duration-300",
          achievement.unlocked
            ? "bg-gradient-to-br from-indigo-400 to-purple-500 text-white border-purple-700 shadow-lg group-hover:-translate-y-1"
            : "bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-300 dark:border-gray-700"
        )}
      >
        {achievement.unlocked ? (
          <Icon className="w-8 h-8" />
        ) : (
          <Lock className="w-6 h-6" />
        )}
      </div>
      <span
        className={cn(
          "text-xs font-bold leading-tight",
          achievement.unlocked
            ? "text-gray-900 dark:text-white"
            : "text-gray-400"
        )}
      >
        {achievement.name}
      </span>
    </div>
  );
}
