import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  BarChart3,
  Award,
  Lock,
  Flame,
  Zap,
  CheckCircle2,
  Code2,
  Terminal,
  Cpu,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "~/lib/utils";

// --- MOCK DATA ---
// TODO: Replace these with real data fetched from Firestore
const MOCK_SKILLS = [
  {
    name: "Python",
    level: 5,
    progress: 60, // Percentage to next level
    icon: Terminal,
    color: "from-yellow-400 to-orange-500",
  },
  {
    name: "JavaScript",
    level: 3,
    progress: 30,
    icon: Code2,
    color: "from-yellow-300 to-yellow-500",
  },
  {
    name: "React",
    level: 1,
    progress: 10,
    icon: Cpu,
    color: "from-cyan-400 to-blue-500",
  },
];

const MOCK_ACHIEVEMENTS = [
  {
    id: "a1",
    name: "Streak Starter",
    description: "Achieve a 3-day streak",
    icon: Flame,
    earned: true,
  },
  {
    id: "a2",
    name: "Code Novice",
    description: "Complete your first challenge",
    icon: Award,
    earned: true,
  },
  {
    id: "a3",
    name: "XP Hoarder",
    description: "Earn 1,000 Total XP",
    icon: Zap,
    earned: true,
  },
  {
    id: "a4",
    name: "Pythonista",
    description: "Complete 10 Python challenges",
    icon: Terminal,
    earned: false,
  },
  {
    id: "a5",
    name: "Streak Keeper",
    description: "Achieve a 7-day streak",
    icon: Flame,
    earned: false,
  },
  {
    id: "a6",
    name: "React Apprentice",
    description: "Complete your first React challenge",
    icon: Cpu,
    earned: false,
  },
];

const MOCK_ACTIVITY = [
  {
    id: "r1",
    text: "Completed 'Binary Search'",
    xp: 50,
    time: "2h ago",
  },
  {
    id: "r2",
    text: "Completed 'Two Sum'",
    xp: 25,
    time: "1d ago",
  },
  {
    id: "r3",
    text: "Achieved 'Streak Starter' badge",
    xp: 100,
    time: "1d ago",
  },
];
// --- END MOCK DATA ---

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export function ProgressTab() {
  return (
    // TooltipProvider is needed for the achievements
    <TooltipProvider delayDuration={0}>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <BarChart3 className="w-8 h-8 text-indigo-500" />
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            Your Progress Report
          </h1>
        </motion.div>

        {/* Main Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Column 1: Skill Levels */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <SkillStatsCard />
          </motion.div>

          {/* Column 2: Achievements */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <AchievementsCard />
          </motion.div>
        </motion.div>

        {/* Second Row: Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <RecentActivityCard />
        </motion.div>
      </div>
    </TooltipProvider>
  );
}

// --- Sub-components ---

function SkillStatsCard() {
  return (
    <Card className="bg-white dark:bg-gray-900 shadow-lg border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Skill Levels</CardTitle>
        <CardDescription>Your mastery in each coding language.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {MOCK_SKILLS.map((skill) => (
          <SkillRow
            key={skill.name}
            icon={skill.icon}
            name={skill.name}
            level={skill.level}
            progress={skill.progress}
            color={skill.color}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function SkillRow({ icon: Icon, name, level, progress, color }: any) {
  return (
    <div className="flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-md`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {name}
          </span>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Lvl {level}
          </span>
        </div>
        <Progress
          value={progress}
          className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-800"
          indicatorClassName={`bg-gradient-to-r ${color}`}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 text-right">
          {100 - progress}% to Lvl {level + 1}
        </p>
      </div>
    </div>
  );
}

function AchievementsCard() {
  const earnedCount = MOCK_ACHIEVEMENTS.filter((a) => a.earned).length;
  const totalCount = MOCK_ACHIEVEMENTS.length;

  return (
    <Card className="bg-white dark:bg-gray-900 shadow-lg border-gray-100 dark:border-gray-800 rounded-3xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Trophy Case</CardTitle>
        <CardDescription>
          You've collected {earnedCount} of {totalCount} badges!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-4 gap-4">
          {MOCK_ACHIEVEMENTS.map((badge) => (
            <AchievementBadge key={badge.id} {...badge} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AchievementBadge({ icon: Icon, name, description, earned }: any) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "relative aspect-square rounded-2xl flex items-center justify-center cursor-pointer transition-all",
            "bg-gray-100 dark:bg-gray-800",
            earned
              ? "bg-yellow-100 dark:bg-yellow-950/50 border-2 border-yellow-400 dark:border-yellow-700"
              : "opacity-40"
          )}
        >
          <Icon
            className={cn(
              "w-7 h-7",
              earned ? "text-yellow-600 dark:text-yellow-400" : "text-gray-500"
            )}
          />
          {!earned && (
            <div className="absolute -top-1.5 -right-1.5 p-0.5 bg-gray-700 dark:bg-gray-900 rounded-full">
              <Lock className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="text-sm font-bold">{name}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function RecentActivityCard() {
  return (
    <Card className="bg-white dark:bg-gray-900 shadow-lg border-gray-100 dark:border-gray-800 rounded-3xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Recent Activity</CardTitle>
        <CardDescription>A log of your latest accomplishments.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {MOCK_ACTIVITY.map((activity) => (
            <li
              key={activity.id}
              className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {activity.text}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </p>
                </div>
              </div>
              <div className="text-sm font-bold text-green-600 dark:text-green-400">
                +{activity.xp} XP
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
