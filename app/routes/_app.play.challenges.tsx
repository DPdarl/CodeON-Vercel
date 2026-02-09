// app/routes/play.challenges.tsx
import { useState, useMemo } from "react";
import { Link, useNavigate } from "@remix-run/react";
import {
  ChevronDown,
  ChevronUp,
  Play,
  CheckCircle2,
  Lock,
  User,
  Zap,
  Book,
  Code,
  Award,
  Star,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { challenges } from "~/data/challenges"; // Import actual challenge data
import { useAuth } from "~/contexts/AuthContext"; // Import Auth Context
import {
  useChallengeContext,
  ChallengeProvider,
} from "~/contexts/ChallengeContext"; // Import Challenge Context
import { AvatarDisplay } from "~/components/dashboardmodule/AvatarDisplay";
import { MODULES, type ModuleData } from "~/data/challenges"; // Import shared MODULES

// --- Module Definitions removed (using shared) ---

// --- Components ---

const StatusButton = ({
  status,
  onClick,
}: {
  status: "completed" | "active" | "locked";
  onClick?: () => void;
}) => {
  if (status === "completed") {
    return (
      <Button
        variant="outline"
        className="border-green-500/50 text-green-400 hover:bg-green-500/10 hover:text-green-300 w-24 h-8 text-xs font-bold"
      >
        Done!
      </Button>
    );
  }
  if (status === "active") {
    return (
      <Button
        className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)] w-24 h-8 text-xs font-bold animate-pulse-subtle"
        onClick={onClick}
      >
        Start
      </Button>
    );
  }
  return (
    <Button variant="ghost" disabled className="text-gray-600 w-24 h-8 text-xs">
      ???
    </Button>
  );
};

const isModuleLocked = (moduleId: number, completedIds: string[]) => {
  if (moduleId === 1) return false;

  // Check if previous module is fully completed?
  // OR just check if the last challenge of the previous module is done (easier linear check)
  // Let's go with lineal check: Find the last challenge of module (N-1)
  const prevModuleChallenges = challenges.filter(
    (c) => c.moduleId === moduleId - 1,
  );
  if (prevModuleChallenges.length === 0) return false; // Should not happen

  const lastChallenge = prevModuleChallenges[prevModuleChallenges.length - 1];
  return !completedIds.includes(lastChallenge.id);
};

const ChallengeRow = ({
  challenge,
  index,
  isLocked,
}: {
  challenge: any;
  index: number;
  isLocked: boolean;
}) => {
  const navigate = useNavigate();
  const { stars, completed } = useChallengeContext();

  const isCompleted = completed.includes(challenge.id);
  // Status logic:
  // - Completed: In completed array
  // - Active: Not completed, not locked
  // - Locked: Locked
  const status = isCompleted ? "completed" : isLocked ? "locked" : "active";

  const earnedStars = stars[challenge.id] || 0;

  const handleStart = () => {
    if (status !== "locked") {
      navigate(`/machine-problem?id=${challenge.id}`);
    }
  };

  return (
    <div
      className={`flex items-center justify-between py-3 px-4 border-b border-gray-100 dark:border-gray-800/50 last:border-0 rounded-lg transition-colors group ${
        status === "locked"
          ? "opacity-60 cursor-not-allowed bg-transparent"
          : "hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer"
      }`}
      onClick={handleStart} // Make whole row clickable if active
    >
      <div className="flex items-center gap-4">
        <span className="text-gray-400 dark:text-gray-500 font-mono text-xs w-20 flex items-center gap-1">
          {status === "locked" && <Lock size={10} />}
          Exercise {challenge.id}
        </span>
        <div className="flex flex-col">
          <span
            className={`font-medium text-sm ${
              status === "locked"
                ? "text-gray-400 dark:text-gray-500"
                : "text-gray-900 dark:text-gray-200"
            }`}
          >
            {challenge.title}
          </span>

          {/* Star Rating Display */}
          <div className="flex gap-0.5 mt-1">
            {[1, 2, 3].map((star) => (
              <Star
                key={star}
                size={12}
                className={
                  isCompleted
                    ? star <= earnedStars
                      ? "text-yellow-400 fill-yellow-400" // Earned
                      : "text-gray-300 dark:text-gray-700" // Unearned but completed
                    : "text-gray-200 dark:text-gray-800" // Not yet completed (Hollow/Dim)
                }
              />
            ))}
          </div>
        </div>
      </div>
      <div onClick={(e) => e.stopPropagation()}>
        <StatusButton status={status} onClick={handleStart} />
      </div>
    </div>
  );
};

const ModuleSection = ({
  module,
  isOpen,
  onToggle,
  isLocked,
}: {
  module: ModuleData;
  isOpen: boolean;
  onToggle: () => void;
  isLocked: boolean;
}) => {
  // Filter challenges for this module
  const moduleChallenges = useMemo(
    () => challenges.filter((c) => c.moduleId === module.id),
    [module.id],
  );

  const { completed } = useChallengeContext();

  return (
    <div
      className={`relative pl-12 pb-8 ${
        isLocked ? "opacity-75 grayscale" : ""
      }`}
    >
      {/* Connector */}
      <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-800" />

      {/* Number Badge */}
      <button
        onClick={isLocked ? undefined : onToggle}
        disabled={isLocked}
        className={`
                absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10 border-2 transition-all duration-300
                ${
                  isLocked
                    ? "bg-[#0F172A] border-gray-700 text-gray-500 cursor-not-allowed"
                    : isOpen
                    ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] cursor-pointer"
                    : "bg-[#0F172A] border-blue-500 text-blue-400 hover:bg-blue-500/10 cursor-pointer"
                }
            `}
      >
        {isLocked ? <Lock size={12} /> : module.id}
      </button>

      {/* Card */}
      <div
        className={`bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 shadow-sm dark:shadow-none ${
          isLocked ? "opacity-80" : ""
        }`}
      >
        <div
          className={`p-5 flex items-center justify-between transition-colors ${
            isLocked
              ? "cursor-not-allowed"
              : "cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5"
          }`}
          onClick={isLocked ? undefined : onToggle}
        >
          <div>
            <h3
              className={`text-lg font-bold flex items-center gap-3 ${
                isLocked ? "text-gray-500" : "text-gray-900 dark:text-white"
              }`}
            >
              {module.title}
              {isLocked && (
                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-500 border border-gray-200 dark:border-gray-700">
                  Locked
                </span>
              )}
            </h3>
            {isOpen && (
              <div className="mt-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {module.description}
                </p>
                <Badge
                  variant="outline"
                  className="mt-2 text-[10px] py-0 h-5 border-blue-500/20 text-blue-500 dark:text-blue-400 bg-blue-500/5"
                >
                  {module.csharpTopic}
                </Badge>
              </div>
            )}
          </div>
          <div className="text-gray-400">
            {isLocked ? null : isOpen ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </div>
        </div>

        {/* Content */}
        {isOpen && !isLocked && (
          <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#161b22] p-2">
            <div className="bg-white dark:bg-[#0F172A]/50 rounded-lg p-2 border border-gray-200 dark:border-transparent">
              {moduleChallenges.length > 0 ? (
                moduleChallenges.map((challenge, idx) => {
                  // Calculate if this specific challenge is locked
                  // A challenge is locked if:
                  // 1. It's not the first global challenge (index > 0)
                  // 2. The *previous* global challenge is NOT completed.

                  const globalIndex = challenges.findIndex(
                    (c) => c.id === challenge.id,
                  );
                  const isChallengeLocked =
                    globalIndex > 0 &&
                    !completed.includes(challenges[globalIndex - 1].id);

                  return (
                    <ChallengeRow
                      key={challenge.id}
                      challenge={challenge}
                      index={idx}
                      isLocked={isChallengeLocked}
                    />
                  );
                })
              ) : (
                <div className="py-4 text-center text-gray-500 text-sm italic">
                  Content coming soon...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Sidebar Widgets (Connected to Real Data) ---

const ProfileWidget = ({ user }: { user: any }) => (
  <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6 shadow-sm dark:shadow-none">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12">
        {user.avatarConfig ? (
          <AvatarDisplay
            config={user.avatarConfig}
            className="w-full h-full border-2 border-blue-500 rounded-full bg-gray-100 dark:bg-gray-800"
            headOnly
          />
        ) : user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="w-full h-full rounded-full border-2 border-blue-500"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl ring-2 ring-white/10">
            {user.displayName?.charAt(0) || "U"}
          </div>
        )}
      </div>
      <div>
        <h3 className="font-bold text-gray-900 dark:text-white truncate max-w-[150px]">
          {user.displayName || "Coder"}
        </h3>
        <p className="text-sm text-blue-500 dark:text-blue-400 font-medium">
          Level {user.level || 1}
        </p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2 mb-4">
      <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded border border-gray-200 dark:border-gray-800 flex flex-col items-center">
        <span className="text-xs text-gray-500 uppercase">Stars</span>
        <span className="text-lg font-bold text-yellow-500 flex items-center gap-1">
          {user.stars || 0} <span className="text-[10px]">⭐</span>
        </span>
      </div>
      <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded border border-gray-200 dark:border-gray-800 flex flex-col items-center">
        <span className="text-xs text-gray-500 uppercase">Coins</span>
        <span className="text-lg font-bold text-yellow-500 flex items-center gap-1">
          {user.coins || 0} <span className="text-[10px]">🪙</span>
        </span>
      </div>
    </div>
    <Link to="/profile">
      <Button className="w-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold border border-gray-200 dark:border-gray-700 h-9 transition-colors">
        View Profile
      </Button>
    </Link>
  </div>
);

const ProgressWidget = ({
  user,
  completed,
}: {
  user: any;
  completed: string[];
}) => {
  // Machine Problems Progress
  const totalChallenges = challenges.length;
  const completedCount = completed.length;
  const mpProgress =
    totalChallenges > 0 ? (completedCount / totalChallenges) * 100 : 0;

  // Stars Progress
  const totalPossibleStars = totalChallenges * 3;
  const userStars = user.stars || 0;
  const starProgress =
    totalPossibleStars > 0 ? (userStars / totalPossibleStars) * 100 : 0;

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6 shadow-sm dark:shadow-none">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Award className="text-yellow-500" size={18} />
        Course Progress
      </h3>

      <div className="space-y-5">
        {/* Machine Problems Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2 font-medium">
              <Code size={14} className="text-blue-500 dark:text-blue-400" />{" "}
              Machine Problems
            </span>
            <span className="text-gray-700 dark:text-gray-200 font-mono text-xs">
              {completedCount} / {totalChallenges}
            </span>
          </div>
          <Progress
            value={mpProgress}
            className="h-1.5 bg-gray-100 dark:bg-gray-800"
          />
        </div>

        {/* Stars Claimed Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2 font-medium">
              <Star size={14} className="text-yellow-400" /> Stars Claimed
            </span>
            <span className="text-gray-700 dark:text-gray-200 font-mono text-xs">
              {userStars} / {totalPossibleStars}
            </span>
          </div>
          <Progress
            value={starProgress}
            className="h-1.5 bg-gray-100 dark:bg-gray-800 text-yellow-500"
          />
        </div>
      </div>
    </div>
  );
};

const BadgesWidget = ({ user }: { user: any }) => (
  <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm dark:shadow-none">
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-bold text-gray-900 dark:text-white">Certificates</h3>
      <span className="text-xs text-gray-500">0/6</span>
    </div>
    <div className="grid grid-cols-4 gap-2">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="aspect-square bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center justify-center group relative cursor-pointer hover:border-blue-500/50 transition-colors"
          title={`Module ${i} Badge`}
        >
          <Award className="text-gray-400 dark:text-gray-700 w-6 h-6 group-hover:text-blue-500 transition-colors" />
        </div>
      ))}
    </div>
  </div>
);

// --- Main Page Component ---

// ... (ChallengesContent holding the logic)
const ChallengesContent = () => {
  const { user } = useAuth();
  const { completed } = useChallengeContext(); // Get completed challenges

  // State for which module is expanded. Default to 1.
  const [expandedModule, setExpandedModule] = useState<number | null>(1);

  const toggleModule = (id: number) => {
    setExpandedModule(expandedModule === id ? null : id);
  };

  if (!user) return null; // Or Loading state

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white font-sans selection:bg-blue-500/30">
      {/* Navigation Bar Placeholder (if any, typically App Header covers this) */}

      <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8">
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className="border-green-500/30 text-green-600 dark:text-green-400 bg-green-500/10 uppercase tracking-widest text-[10px]"
              >
                Learning Path
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
              C# Mastery
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl">
              From "Hello World" to advanced Software Architecture. Your journey
              to becoming a .NET Developer starts here.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/dashboard">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold border border-blue-500 shadow-sm shadow-blue-500/20">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Roadmap */}
          <div className="lg:col-span-2">
            <div className="space-y-0">
              {MODULES.map((module) => (
                <ModuleSection
                  key={module.id}
                  module={module}
                  isOpen={expandedModule === module.id}
                  onToggle={() => toggleModule(module.id)}
                  isLocked={isModuleLocked(module.id, completed)}
                />
              ))}
            </div>

            {/* End Node */}
            <div className="relative pl-12 pt-4">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-800 to-transparent h-16" />
              <div className="w-8 h-8 rounded-full bg-gray-900 border-2 border-dashed border-gray-700 flex items-center justify-center text-gray-600 font-bold text-xs absolute left-0">
                <Star size={14} />
              </div>
              <div className="text-gray-500 text-sm ml-2 pt-1 font-medium italic">
                More modules coming soon...
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar Stats */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <ProfileWidget user={user} />
              <ProgressWidget user={user} completed={completed} />
              <BadgesWidget user={user} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ChallengesPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <ChallengeProvider>
      <ChallengesContent />
    </ChallengeProvider>
  );
}
