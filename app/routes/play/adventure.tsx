import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Lock,
  BookOpen,
  Map as MapIcon,
  Loader2,
  X,
  Heart,
  Backpack,
  Trophy,
  RotateCcw,
  Lightbulb,
  Snowflake,
  Clock,
  Zap,
  Medal,
  Star,
  ArrowRight,
  Gift, // New Icon
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "~/components/ui/dialog";
import { toast } from "sonner";

// --- IMPORTS ---
import { supabase } from "~/lib/supabase";
import { useAuth } from "~/contexts/AuthContext";
import { useGameProgress } from "~/hooks/useGameProgress";
import { useHeartSystem, MAX_HEARTS, HEART_COST } from "~/hooks/useHeartSystem";
import {
  QuizActivity,
  BuildingBlocksActivity,
  MatchingActivity,
  type ActivityHandle,
} from "~/components/dashboardmodule/ActivityComponents";
import { AdventureResults } from "~/components/dashboardmodule/AdventureResults";
import { AdventureCompletedCelebration } from "~/components/dashboardmodule/AdventureCompletedCelebration"; // ✅ NEW COMPONENT
import { CHAPTER_VISUALS, CSHARP_LESSONS } from "~/data/adventureContent";
import { useGameSound } from "~/hooks/useGameSound";

const NODE_HEIGHT = 160;
const NODE_GAP = 32;

// --- HELPER: Format Seconds ---
const formatRuntime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

// --- COMPONENT: RANK BADGE ---
function RankBadge({ rank }: { rank: number }) {
  if (!rank || rank === 0) return null;

  if (rank === 1) {
    return (
      <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-600 rounded-full font-bold border border-yellow-500/20 shadow-sm">
        <Medal className="w-4 h-4 fill-yellow-600 text-yellow-600" />
        <span>Rank 1</span>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-200/50 text-slate-600 rounded-full font-bold border border-slate-300 shadow-sm">
        <Medal className="w-4 h-4 fill-slate-400 text-slate-500" />
        <span>Rank 2</span>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-orange-700/10 text-orange-700 rounded-full font-bold border border-orange-700/20 shadow-sm">
        <Medal className="w-4 h-4 fill-orange-700 text-orange-700" />
        <span>Rank 3</span>
      </div>
    );
  }
  return (
    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-secondary/50 text-muted-foreground rounded-full font-bold border border-border">
      <Trophy className="w-4 h-4" />
      <span>#{rank}</span>
    </div>
  );
}

// --- REUSABLE HEART DROPDOWN ---
function HeartDropdown({ hearts, timeRemaining, buyHearts }: any) {
  const isFull = hearts >= MAX_HEARTS;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-1 hover:bg-transparent px-2"
        >
          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          <span className="font-bold text-red-500 text-lg">{hearts}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-2">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Lives</span>
          <Badge
            variant={isFull ? "default" : "outline"}
            className={
              isFull ? "bg-green-500" : "text-orange-500 border-orange-500"
            }
          >
            {isFull ? "MAX" : "REGENERATING"}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="p-3 bg-secondary/30 rounded-md mb-2 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Current Hearts</span>
            <span className="font-bold">
              {hearts} / {MAX_HEARTS}
            </span>
          </div>
          {!isFull && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> Next in
              </span>
              <span className="font-mono font-bold text-orange-500">
                {timeRemaining}
              </span>
            </div>
          )}
        </div>

        <Button
          className="w-full gap-2 font-bold bg-green-500 hover:bg-green-600 text-white"
          size="lg"
          disabled={isFull}
          onClick={() => {
            if (isFull) return;
            buyHearts();
          }}
        >
          <Zap className="w-4 h-4 fill-white" />
          {isFull ? "Hearts are Full" : `Refill Full (${HEART_COST})`}
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// --- COMPONENT: ROADMAP NODE ---
function RoadmapNode({
  chapter,
  status,
  alignment,
  onClick,
  id,
  isAdventureComplete,
}: any) {
  const Icon = chapter.icon;
  const isCompleted = status === "completed";
  const isLocked = status === "locked";
  const isCurrent = status === "current";

  const isClickable = isCurrent || (isCompleted && isAdventureComplete);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.1 } },
  };

  return (
    <TooltipProvider delayDuration={100}>
      <motion.div
        id={id}
        className="relative w-full h-40 flex items-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {/* --- NODE BUTTON --- */}
        <div className="absolute left-8 md:left-1/2 -translate-x-1/2 z-10">
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={isClickable ? { scale: 1.15 } : {}}
                whileTap={isClickable ? { scale: 0.95 } : {}}
                disabled={!isClickable}
                onClick={isClickable ? onClick : undefined}
                className={cn(
                  "w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border-4 border-background transition-all",
                  isLocked
                    ? "bg-muted text-muted-foreground"
                    : cn(
                        chapter.color,
                        "text-white shadow-xl ring-4 ring-offset-4 ring-offset-background ring-indigo-500/20"
                      ),
                  isCompleted && "ring-green-400/50 border-green-100"
                )}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6 md:w-8 md:h-8 stroke-[3]" />
                ) : isLocked ? (
                  <Lock className="w-6 h-6 md:w-8 md:h-8" />
                ) : (
                  <Icon className="w-6 h-6 md:w-8 md:h-8" />
                )}
                {status === "current" && (
                  <span className="absolute inset-0 rounded-full animate-ping opacity-30 bg-white" />
                )}
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>
                {isCompleted && !isAdventureComplete
                  ? "Complete Adventure to Replay"
                  : isCompleted
                  ? "Replay Lesson"
                  : chapter.activityType}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* --- CONTENT CARD --- */}
        <motion.div
          variants={cardVariants}
          className={cn(
            "absolute w-[calc(100%-6rem)] md:w-64",
            "left-20",
            alignment === "left"
              ? "md:left-auto md:right-[calc(50%+5rem)]"
              : "md:left-[calc(50%+5rem)]"
          )}
        >
          <Card
            className={cn(
              "shadow-lg rounded-2xl transition-all border-2",
              isClickable ? "hover:scale-105 cursor-pointer" : "cursor-default",
              isCompleted
                ? "bg-green-50 border-green-500/30 dark:bg-green-900/20 dark:border-green-500/30"
                : isLocked
                ? "opacity-60 grayscale border-dashed"
                : "hover:border-indigo-400"
            )}
            onClick={isClickable ? onClick : undefined}
          >
            <CardHeader className="pb-1 p-3 md:p-4">
              <div className="flex justify-between items-start">
                <Badge
                  variant={isCompleted ? "default" : "outline"}
                  className={cn(
                    "mb-1 md:mb-2 text-[10px]",
                    isCompleted ? "bg-green-600 hover:bg-green-700" : ""
                  )}
                >
                  {isCompleted ? "Completed" : `Chapter ${chapter.order_index}`}
                </Badge>
                {!isLocked && <BookOpen className="w-3 h-3 text-indigo-500" />}
              </div>
              <CardTitle className="text-sm md:text-base leading-tight">
                {chapter.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <p className="text-xs text-muted-foreground line-clamp-2">
                {chapter.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </TooltipProvider>
  );
}

// --- COMPONENT: REGRESS CONFIRMATION MODAL ---
function RegressModal({ open, onClose, onConfirm }: any) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <RotateCcw className="w-5 h-5" /> Regress Adventure?
          </DialogTitle>
          <DialogDescription className="space-y-3 pt-2">
            <p>
              This will <strong>reset your chapter progress</strong> to the very
              beginning.
            </p>
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 p-3 rounded-lg text-sm">
              <p className="font-bold text-red-800 dark:text-red-200">
                What resets:
              </p>
              <ul className="list-disc list-inside text-red-600 dark:text-red-300">
                <li>Completed Chapters (0/10)</li>
                <li>Adventure Run Time (00:00:00)</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              You will <strong>keep</strong> your XP, Coins, Badges, and
              Inventory. This is for speed-runners who want to improve their
              time.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Confirm Reset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- COMPONENT: REWARD MODAL (LEVEL COMPLETION) ---
function RewardModal({ open, onClose, data }: any) {
  const { playSound } = useGameSound();

  if (!open || !data) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-full h-full sm:h-auto max-sm:rounded-none flex flex-col justify-center">
        <DialogHeader>
          <div className="mx-auto w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-4 border-4 border-yellow-200 animate-bounce">
            <Trophy className="w-12 h-12 text-yellow-600" />
          </div>
          <DialogTitle className="text-3xl font-black text-center text-foreground">
            Level Complete!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-6">
          <p className="text-muted-foreground text-center text-lg">
            You've mastered <br />
            <span className="font-bold text-foreground text-xl">
              {data.title}
            </span>
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center p-6 bg-secondary/50 rounded-2xl border-2 border-transparent hover:border-indigo-500/20 transition-colors">
              <span className="text-4xl font-black text-indigo-500">
                +{data.xp}
              </span>
              <span className="text-sm text-muted-foreground uppercase font-bold tracking-wider mt-1">
                XP Earned
              </span>
            </div>
            <div className="flex flex-col items-center p-6 bg-secondary/50 rounded-2xl border-2 border-transparent hover:border-yellow-500/20 transition-colors">
              <span className="text-4xl font-black text-yellow-500">
                +{data.coins}
              </span>
              <span className="text-sm text-muted-foreground uppercase font-bold tracking-wider mt-1">
                Coins
              </span>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 p-4 rounded-xl flex items-center justify-between">
            <div className="text-left">
              <p className="font-bold text-orange-700 dark:text-orange-400 text-sm">
                {data.streakStatus === "continued"
                  ? "Streak Continued!"
                  : "Streak Started!"}
              </p>
              <p className="text-sm text-orange-600/80 dark:text-orange-400/70">
                {data.streakStatus === "continued"
                  ? "You're on fire! Keep it up."
                  : "Great start. Come back tomorrow!"}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-orange-500">
                {data.currentStreak}
              </span>
              <span className="text-[10px] font-bold text-orange-400 uppercase">
                Days
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-center mt-auto sm:mt-0">
          <Button
            onClick={() => {
              playSound("claim");
              onClose();
            }}
            size="lg"
            className="w-full font-bold text-lg h-14 rounded-xl"
          >
            Continue Journey
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- COMPONENT: GAME OVER OVERLAY (Stable External Component) ---
const GameOverOverlay = ({
  onRefill,
  onClose,
  timeRemaining,
}: {
  onRefill: () => void;
  onClose: () => void;
  timeRemaining: string;
}) => (
  <motion.div
    key="game-over-modal"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 z-[60] bg-background/95 backdrop-blur flex items-center justify-center p-4"
  >
    <div className="text-center space-y-6 max-w-md w-full bg-card border shadow-2xl p-8 rounded-3xl">
      <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
        <Heart className="w-12 h-12 text-red-500 fill-red-500" />
      </div>
      <div>
        <h2 className="text-3xl font-black text-foreground">Out of Hearts!</h2>
        <p className="text-muted-foreground mt-2">
          Wait for regeneration or refill instantly.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm font-mono text-muted-foreground">
          <Clock className="w-4 h-4" />
          Next heart in: {timeRemaining || "20:00"}
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-4">
        <Button
          onClick={onRefill}
          size="lg"
          className="gap-2 w-full font-bold bg-green-500 hover:bg-green-600 text-white"
        >
          <Zap className="w-4 h-4 fill-white" />
          Refill for {HEART_COST} Coins
        </Button>
        <Button variant="ghost" onClick={onClose} className="w-full">
          Give Up & Return
        </Button>
      </div>
    </div>
  </motion.div>
);

// --- COMPONENT: FULL SCREEN LESSON VIEW (Old "Page" Style) ---
function FullScreenLesson({
  chapter,
  onClose,
  onComplete,
  inventory,
  onUseHint,
  mistakesSet,
  setMistakesSet,
}: any) {
  const { user } = useAuth();
  const [step, setStep] = useState<"lesson" | "game">("lesson");
  const [isFinished, setIsFinished] = useState(false);
  const { playSound } = useGameSound();

  // --- DYNAMIC QUEUE FOR RETRIES ---
  const [lessonQueue, setLessonQueue] = useState<any[]>([]);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [originalQuestionCount, setOriginalQuestionCount] = useState(0);

  useEffect(() => {
    if (chapter?.activities) {
      const rawActivities = [...chapter.activities];
      const shuffled = rawActivities.sort(() => Math.random() - 0.5);
      const queue = shuffled.map((act: any, idx: number) => ({
        ...act,
        _originalId: idx,
      }));

      setLessonQueue(queue);
      setOriginalQuestionCount(queue.length);
      setCurrentActivityIndex(0);
    }
  }, [chapter]);

  const hintCount =
    inventory?.find((i: any) => i.name === "Hint")?.quantity || 0;

  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [finalTime, setFinalTime] = useState(0);

  useEffect(() => {
    if (step === "game" && !isFinished) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, isFinished, startTime]);

  const { hearts, loseHeart, buyHearts, timeRemaining, setIsGameOver } =
    useHeartSystem(user);

  const [showGameOver, setShowGameOver] = useState(false);

  const [feedbackStatus, setFeedbackStatus] = useState<
    "idle" | "correct" | "wrong"
  >("idle");

  const currentActivity = lessonQueue[currentActivityIndex];
  const activityRef = useRef<ActivityHandle>(null);

  const handleActivitySubmit = async (success: boolean) => {
    if (feedbackStatus !== "idle") return;

    if (success) {
      setFeedbackStatus("correct");
    } else {
      setFeedbackStatus("wrong");

      if (hearts <= 1) {
        playSound("gameover");
        setShowGameOver(true);
        setIsGameOver(true);
        loseHeart();
      } else {
        const isDead = await loseHeart();
        if (isDead) {
          playSound("gameover");
          setShowGameOver(true);
        } else {
          if (currentActivity && currentActivity._originalId !== undefined) {
            setMistakesSet((prev: any) =>
              new Set(prev).add(currentActivity._originalId)
            );
          }
          setLessonQueue((prev) => [...prev, prev[currentActivityIndex]]);
        }
      }
    }
  };

  const handleContinue = () => {
    setFeedbackStatus("idle");
    if (currentActivityIndex < lessonQueue.length - 1) {
      setCurrentActivityIndex((prev) => prev + 1);
    } else {
      playSound("complete");
      const endTime = Date.now();
      const durationSeconds = Math.floor((endTime - startTime) / 1000);
      setFinalTime(durationSeconds);
      setIsFinished(true);
    }
  };

  const handleBuyHearts = async () => {
    await buyHearts();
    setShowGameOver(false);
    setIsGameOver(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* HEADER */}
      <div className="pt-6 pb-2 px-4 sm:px-6 w-full max-w-5xl mx-auto flex flex-col gap-3">
        <div className="flex items-center gap-4 w-full">
          <Button
            variant="ghost"
            onClick={onClose}
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X className="w-6 h-6" />
          </Button>

          {step === "game" && !isFinished ? (
            <div className="flex-1 h-4 bg-secondary rounded-full overflow-hidden relative">
              <div className="absolute top-1 left-2 right-2 h-1 bg-white/10 rounded-full z-10" />
              <motion.div
                className="h-full bg-green-500 rounded-full relative"
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    (currentActivityIndex / lessonQueue.length) * 100
                  }%`,
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <div className="absolute top-1 left-2 right-2 h-1 bg-white/20 rounded-full" />
              </motion.div>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          <div className="flex items-center gap-2 shrink-0">
            {step === "game" && !isFinished && (
              <div className="hidden sm:flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10",
                    hintCount > 0 && "text-yellow-500"
                  )}
                  disabled={hintCount <= 0 || feedbackStatus !== "idle"}
                  onClick={() => activityRef.current?.triggerHint()}
                >
                  <Lightbulb className="w-6 h-6 stroke-[2.5]" />
                </Button>
                <div className="font-bold text-muted-foreground font-mono">
                  {formatRuntime(elapsedTime)}
                </div>
              </div>
            )}
            <HeartDropdown
              hearts={hearts}
              timeRemaining={timeRemaining}
              buyHearts={buyHearts}
            />
          </div>
        </div>

        {step === "game" && !isFinished && (
          <div className="flex sm:hidden items-center justify-center gap-6 pb-2 text-sm font-bold text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {formatRuntime(elapsedTime)}
            </div>
            <button
              onClick={() => activityRef.current?.triggerHint()}
              disabled={hintCount <= 0 || feedbackStatus !== "idle"}
              className={cn(
                "flex items-center gap-2 disabled:opacity-50",
                hintCount > 0 && "text-yellow-500"
              )}
            >
              <Lightbulb className="w-4 h-4" />
              <span>Hint ({hintCount})</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 relative w-full overflow-hidden">
        <AnimatePresence mode="wait">
          {step === "lesson" && (
            <motion.div
              key="lesson"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute inset-0 overflow-y-auto"
            >
              <div className="max-w-4xl mx-auto px-6 py-12 min-h-full flex flex-col justify-center">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h1 className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
                        {chapter.title}
                      </h1>
                      {chapter.isCompleted && (
                        <Badge className="bg-green-500 text-white hover:bg-green-600">
                          Completed
                        </Badge>
                      )}
                    </div>
                    <p className="text-xl text-muted-foreground">
                      {chapter.description}
                    </p>
                  </div>

                  <Card className="border-2 shadow-sm">
                    <CardContent className="p-8 prose dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap font-sans text-lg leading-relaxed">
                        {chapter.content_markdown}
                      </div>
                    </CardContent>
                  </Card>

                  {chapter.codeSnippet && (
                    <div className="relative group rounded-xl overflow-hidden shadow-2xl border border-border">
                      <div className="absolute top-0 right-0 bg-muted px-3 py-1 text-xs font-mono rounded-bl-xl border-l border-b border-border text-muted-foreground">
                        C#
                      </div>
                      <pre className="bg-zinc-950 text-zinc-50 p-6 font-mono text-sm overflow-x-auto">
                        <code>{chapter.codeSnippet}</code>
                      </pre>
                    </div>
                  )}

                  <div className="pt-8 flex justify-end">
                    <Button
                      size="lg"
                      onClick={() => setStep("game")}
                      className="text-lg px-8 h-14 shadow-xl font-bold bg-green-500 hover:bg-green-600 text-white"
                    >
                      {chapter.isCompleted
                        ? "Practice Again"
                        : "Start Challenge"}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === "game" && (
            <motion.div
              key="game"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute inset-0 overflow-hidden flex flex-col items-center justify-center"
            >
              <AnimatePresence>
                {showGameOver && (
                  <GameOverOverlay
                    onRefill={handleBuyHearts}
                    onClose={onClose}
                    timeRemaining={timeRemaining}
                  />
                )}
              </AnimatePresence>

              <div className="w-full max-w-2xl mx-auto p-6 pb-40 overflow-y-auto h-full flex flex-col justify-center custom-scrollbar">
                {!isFinished ? (
                  <>
                    {currentActivity ? (
                      <div className="space-y-8" key={currentActivityIndex}>
                        <div className="text-center space-y-2">
                          <h2 className="text-2xl md:text-3xl font-black text-foreground">
                            {currentActivity.prompt}
                          </h2>
                          <p className="text-muted-foreground font-medium">
                            Question {currentActivityIndex + 1} of{" "}
                            {lessonQueue.length}
                          </p>
                        </div>

                        <Card className="border-none shadow-none bg-transparent">
                          <CardContent className="p-0">
                            {currentActivity.type === "QUIZ" && (
                              <QuizActivity
                                ref={activityRef}
                                data={currentActivity.data}
                                onComplete={handleActivitySubmit}
                                onConsumeHint={onUseHint}
                                disabled={feedbackStatus !== "idle"}
                              />
                            )}
                            {currentActivity.type === "BUILDING_BLOCKS" && (
                              <BuildingBlocksActivity
                                ref={activityRef}
                                data={currentActivity.data}
                                onComplete={handleActivitySubmit}
                                onConsumeHint={onUseHint}
                                disabled={feedbackStatus !== "idle"}
                              />
                            )}
                            {currentActivity.type === "MATCHING" && (
                              <MatchingActivity
                                ref={activityRef}
                                data={currentActivity.data}
                                onComplete={handleActivitySubmit}
                                onConsumeHint={onUseHint}
                                disabled={feedbackStatus !== "idle"}
                              />
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <div className="text-center space-y-6 py-12">
                        <Loader2 className="animate-spin h-8 w-8 mx-auto text-muted-foreground" />
                      </div>
                    )}
                  </>
                ) : (
                  <AdventureResults
                    stats={{
                      timeSeconds: finalTime,
                      accuracy:
                        originalQuestionCount > 0
                          ? Math.max(
                              0,
                              Math.round(
                                ((originalQuestionCount - mistakesSet.size) /
                                  originalQuestionCount) *
                                  100
                              )
                            )
                          : 100,
                      totalQuestions: originalQuestionCount,
                    }}
                    rewards={{
                      xp: chapter.xp_reward || 50,
                      coins: Math.floor((chapter.xp_reward || 50) / 10),
                    }}
                    onContinue={() => onComplete(finalTime)}
                  />
                )}
              </div>

              {/* --- FEEDBACK FOOTER --- */}
              <AnimatePresence>
                {feedbackStatus !== "idle" && !showGameOver && (
                  <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    exit={{ y: 100 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className={cn(
                      "absolute bottom-0 left-0 right-0 p-6 border-t-2 z-50 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl",
                      feedbackStatus === "correct"
                        ? "bg-green-100 border-green-200 dark:bg-green-950/90 dark:border-green-900"
                        : "bg-red-100 border-red-200 dark:bg-red-950/90 dark:border-red-900"
                    )}
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-full flex shrink-0 items-center justify-center border-4 bg-white",
                          feedbackStatus === "correct"
                            ? "border-green-500 text-green-600"
                            : "border-red-500 text-red-600"
                        )}
                      >
                        {feedbackStatus === "correct" ? (
                          <Check className="w-8 h-8 stroke-[3]" />
                        ) : (
                          <X className="w-8 h-8 stroke-[3]" />
                        )}
                      </div>
                      <div className="text-left">
                        <h3
                          className={cn(
                            "text-2xl font-black",
                            feedbackStatus === "correct"
                              ? "text-green-700 dark:text-green-400"
                              : "text-red-700 dark:text-red-400"
                          )}
                        >
                          {feedbackStatus === "correct"
                            ? "Nice job!"
                            : "Incorrect"}
                        </h3>
                        {feedbackStatus === "wrong" && (
                          <p className="text-red-600 dark:text-red-300 text-sm font-medium">
                            Don't worry, keep going!
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={handleContinue}
                      size="lg"
                      className={cn(
                        "w-full sm:w-auto min-w-[150px] font-black text-lg h-12 border-b-4 active:border-b-0 active:translate-y-1 transition-all",
                        feedbackStatus === "correct"
                          ? "bg-green-500 hover:bg-green-600 text-white border-green-700 shadow-green-900/20"
                          : "bg-red-500 hover:bg-red-600 text-white border-red-700 shadow-red-900/20"
                      )}
                    >
                      CONTINUE
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// --- MAIN PAGE ---
export default function AdventurePage() {
  const navigate = useNavigate();
  const { user, syncUser } = useAuth();
  const { grantXP } = useGameProgress();

  const { hearts, timeRemaining, buyHearts } = useHeartSystem(user);

  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [maxCompletedOrder, setMaxCompletedOrder] = useState(0);

  const { playSound } = useGameSound();
  const [showNoHeartsModal, setShowNoHeartsModal] = useState(false);

  const [stats, setStats] = useState({
    level: 1,
    completed_chapters: 0,
    total_chapters: 0,
    total_runtime: 0,
    rank: 0,
  });

  // ✅ New State for Completion Modal
  const [showCelebration, setShowCelebration] = useState(false);
  const [adventureStats, setAdventureStats] = useState({
    averageAccuracy: 0,
    isClaimed: false,
  });

  // Keep track of mistakes in the parent so we can calculate accuracy at the end
  const [mistakesSet, setMistakesSet] = useState<Set<number>>(new Set());

  const [inventory, setInventory] = useState<any[]>([]);
  const [rewardData, setRewardData] = useState<any>(null);
  const [showRegressConfirm, setShowRegressConfirm] = useState(false);

  // ✅ Check hearts BEFORE entering lesson
  const handleNodeClick = (chapter: any) => {
    if (hearts > 0) {
      // Reset mistakes when starting a new lesson
      setMistakesSet(new Set());
      setSelectedChapter(chapter);
    } else {
      playSound("gameover");
      setShowNoHeartsModal(true);
    }
  };

  const loadAdventureProgress = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // 1. Fetch User Stats (Including new adventure_rewards_claimed)
      const { data: userStats, error: statsError } = await supabase
        .from("users")
        .select(
          "level, xp, completed_chapters, hints, streak_freezes, total_runtime, adventure_rewards_claimed"
        )
        .eq("id", user.uid)
        .single();

      if (statsError) console.error("Error fetching stats:", statsError);

      // 2. Fetch Match History to Calculate Average Accuracy
      const { data: history } = await supabase
        .from("match_history")
        .select("results")
        .eq("user_id", user.uid)
        .ilike("mode", "Adventure%");

      let totalAccuracy = 0;
      let count = 0;

      if (history && history.length > 0) {
        history.forEach((match) => {
          // Assume first result is the user's
          const result = match.results?.[0];
          if (result && result.accuracy) {
            const accNum = parseInt(
              result.accuracy.toString().replace("%", ""),
              10
            );
            if (!isNaN(accNum)) {
              totalAccuracy += accNum;
              count++;
            }
          }
        });
      }
      const avgAccuracy = count > 0 ? Math.round(totalAccuracy / count) : 0;

      // Update adventure stats state
      setAdventureStats({
        averageAccuracy: avgAccuracy,
        isClaimed: userStats?.adventure_rewards_claimed || false,
      });

      const currentXp = userStats?.xp || 0;
      let rank = 0;

      const restrictedRoles = ["superadmin", "admin", "instructor"];

      if (!restrictedRoles.includes(user.role || "")) {
        const { count: higherXpCount, error: rankError } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .gt("xp", currentXp)
          .eq("role", "user");

        if (rankError) {
          console.error("Error fetching rank:", rankError);
          rank = 0;
        } else {
          rank = (higherXpCount || 0) + 1;
        }
      } else {
        rank = 0;
      }

      const { data: dbLessons } = await supabase
        .from("lessons")
        .select("id, order_index")
        .order("order_index", { ascending: true });

      const totalChapters = dbLessons?.length || 0;
      const completedChaptersArray = userStats?.completed_chapters || [];

      let maxOrder = 0;
      if (dbLessons) {
        const completedDbLessons = dbLessons.filter((l) =>
          completedChaptersArray.includes(l.id)
        );
        if (completedDbLessons.length > 0) {
          maxOrder = Math.max(...completedDbLessons.map((l) => l.order_index));
        }
      }
      setMaxCompletedOrder(maxOrder);

      if (userStats) {
        setStats({
          level: userStats.level || 1,
          completed_chapters: completedChaptersArray.length,
          total_chapters: totalChapters,
          total_runtime: userStats.total_runtime || 0,
          rank: rank,
        });

        const items = [
          {
            name: "Hint",
            quantity: userStats.hints || 0,
            icon: Lightbulb,
            color: "text-yellow-500",
            description:
              "Reveals part of the answer or removes a wrong option.",
          },
          {
            name: "Streak Freeze",
            quantity: userStats.streak_freezes || 0,
            icon: Snowflake,
            color: "text-blue-500",
            description:
              "Prevents you from losing your streak if you miss a day.",
          },
        ];
        setInventory(items.filter((i) => i.quantity > 0));
      }

      const mergedLessons = CHAPTER_VISUALS.map((visual) => {
        const localContent = CSHARP_LESSONS.find((c) => c.id === visual.id);
        const dbMatch = dbLessons?.find((l) => l.order_index === visual.id);

        const isCompleted = dbMatch
          ? completedChaptersArray.includes(dbMatch.id)
          : false;

        return {
          ...visual,
          ...localContent,
          id: dbMatch?.id || visual.id,
          activities: localContent?.activities || [],
          order_index: visual.id,
          activityType: visual.activityLabel,
          isCompleted: isCompleted,
        };
      });

      setLessons(mergedLessons);
    } catch (err) {
      console.error("Failed to load adventure progress:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAdventureProgress();
  }, [loadAdventureProgress]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading && lessons.length > 0) {
        const activeNode = document.getElementById("active-chapter-node");
        if (activeNode) {
          activeNode.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [loading, lessons]);

  const handleConsumeHint = async (): Promise<boolean> => {
    if (!user) return false;

    const hintItem = inventory.find((i) => i.name === "Hint");
    if (!hintItem || hintItem.quantity <= 0) {
      toast.error("No hints left! Visit the shop.");
      return false;
    }

    const newQuantity = hintItem.quantity - 1;
    setInventory((prev) =>
      prev.map((i) => (i.name === "Hint" ? { ...i, quantity: newQuantity } : i))
    );

    const { error } = await supabase
      .from("users")
      .update({ hints: newQuantity })
      .eq("id", user.uid);

    if (error) {
      setInventory((prev) =>
        prev.map((i) =>
          i.name === "Hint" ? { ...i, quantity: hintItem.quantity } : i
        )
      );
      toast.error("Failed to use hint.");
      return false;
    }

    return true;
  };

  const handleRegress = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("users")
      .update({
        completed_chapters: [],
        total_runtime: 0,
        adventure_rewards_claimed: false, // Reset rewards claim too
      })
      .eq("id", user.uid);

    if (error) {
      toast.error("Failed to regress.");
      return;
    }

    setStats((prev) => ({ ...prev, completed_chapters: 0, total_runtime: 0 }));
    setAdventureStats((prev) => ({ ...prev, isClaimed: false })); // Reset local state
    setMaxCompletedOrder(0);
    setLessons((prev) => prev.map((l) => ({ ...l, isCompleted: false })));
    setShowRegressConfirm(false);
    toast.success("Adventure Reset! Good luck speedrunning.");
  };

  // ✅ ONE-TIME CLAIM FUNCTION
  const handleClaimGrandPrize = async () => {
    if (!user) return;
    try {
      // Update DB
      const { error } = await supabase
        .from("users")
        .update({
          adventure_rewards_claimed: true,
          coins: (user.coins || 0) + 500,
          xp: (user.xp || 0) + 1000,
        })
        .eq("id", user.uid);

      if (error) throw error;

      // Update Local State
      setAdventureStats((prev) => ({ ...prev, isClaimed: true }));
      syncUser({
        ...user,
        coins: (user.coins || 0) + 500,
        xp: (user.xp || 0) + 1000,
      });

      toast.success("🏆 Grand Prize Claimed!");
    } catch (err) {
      console.error("Claim error:", err);
      toast.error("Failed to claim rewards.");
    }
  };

  const recordChapterCompletion = async (
    coinsEarned: number,
    lessonId: string,
    timeTaken: number
  ) => {
    if (!user) return;

    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("coins, completed_chapters, total_runtime, badges")
      .eq("id", user.uid)
      .single();

    if (fetchError || !userData) return;

    const currentChapters: string[] = userData.completed_chapters || [];
    const isReplay = currentChapters.includes(lessonId);
    let updatedChapters = [...currentChapters];

    if (!isReplay) {
      updatedChapters.push(lessonId);
    }

    let currentTotalTime = userData.total_runtime || 0;
    let newTotalTime = currentTotalTime;

    if (isReplay) {
      const { data: oldProgress } = await supabase
        .from("user_lesson_progress")
        .select("completion_time")
        .eq("user_id", user.uid)
        .eq("lesson_id", lessonId)
        .single();

      const oldTime = oldProgress?.completion_time || 0;
      newTotalTime = Math.max(0, currentTotalTime - oldTime) + timeTaken;
    } else {
      newTotalTime = currentTotalTime + timeTaken;
    }

    let currentBadges = userData.badges || [];
    let badgeUnlocked = false;
    const BADGE_NAME = "Adventure Champion";

    if (updatedChapters.length === lessons.length) {
      if (!currentBadges.includes(BADGE_NAME)) {
        currentBadges.push(BADGE_NAME);
        badgeUnlocked = true;
      }
    }

    const newCoins = (userData.coins || 0) + coinsEarned;

    const { error: updateError } = await supabase
      .from("users")
      .update({
        coins: newCoins,
        completed_chapters: updatedChapters,
        total_runtime: newTotalTime,
        badges: currentBadges,
      })
      .eq("id", user.uid);

    if (!updateError) {
      setStats((prev) => ({
        ...prev,
        completed_chapters: updatedChapters.length,
        total_runtime: newTotalTime,
        badges: currentBadges,
      }));

      setLessons((prevLessons) =>
        prevLessons.map((l) => {
          if (l.id === lessonId) return { ...l, isCompleted: true };
          return l;
        })
      );

      const justCompletedLesson = lessons.find((l) => l.id === lessonId);
      if (
        justCompletedLesson &&
        justCompletedLesson.order_index > maxCompletedOrder
      ) {
        setMaxCompletedOrder(justCompletedLesson.order_index);
      }

      if (badgeUnlocked) {
        toast.success("🏆 BADGE UNLOCKED: Adventure Champion!", {
          style: {
            border: "2px solid #EAB308",
            backgroundColor: "#FEF9C3",
            color: "#854D0E",
          },
        });
      }
    }
  };

  const currentChapterIndex = maxCompletedOrder + 1;
  const progressHeight =
    currentChapterIndex > 1
      ? (currentChapterIndex - 1) * (NODE_HEIGHT + NODE_GAP) + NODE_HEIGHT / 2
      : 0;

  const isAdventureFinished =
    stats.completed_chapters >= lessons.length && lessons.length > 0;

  const handleChapterComplete = async (timeTaken: number) => {
    if (!selectedChapter || !user) return;

    const xpEarned = selectedChapter.xp_reward || 50;
    const coinsEarned = Math.floor(xpEarned / 10);

    grantXP(xpEarned);

    // 1. Calculate Accuracy for History
    const totalQuestions = selectedChapter.activities?.length || 0;
    const accuracy =
      totalQuestions > 0
        ? Math.max(
            0,
            Math.round(
              ((totalQuestions - mistakesSet.size) / totalQuestions) * 100
            )
          )
        : 100;

    // 2. Record to Match History
    await supabase.from("match_history").insert({
      mode: `Adventure: ${selectedChapter.title}`,
      played_at: new Date().toISOString(),
      winner_name: user.displayName || "Player",
      participants_count: 1,
      user_id: user.uid,
      duration_seconds: timeTaken,
      results: [
        {
          rank: 1,
          name: user.displayName || "Player",
          score: xpEarned,
          accuracy: `${accuracy}%`,
          time: timeTaken,
        },
      ],
    });

    await recordChapterCompletion(coinsEarned, selectedChapter.id, timeTaken);

    // ... (Streak Logic) ...
    const getLocalYYYYMMDD = (d: Date) => {
      const offset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - offset).toISOString().split("T")[0];
    };
    const today = getLocalYYYYMMDD(new Date());
    const lastActive = user.activeDates?.[user.activeDates.length - 1];

    let streakStatus: "started" | "continued" | "none" = "started";
    let newStreak = user.streaks || 0;

    if (lastActive !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getLocalYYYYMMDD(yesterday);

      if (lastActive === yesterdayStr) {
        streakStatus = "continued";
        newStreak += 1;
      } else {
        streakStatus = "started";
        newStreak = 1;
      }
      const newDates = [...(user.activeDates || []), today];
      syncUser({ ...user, streaks: newStreak, activeDates: newDates });
      await supabase
        .from("users")
        .update({ streaks: newStreak, active_dates: newDates })
        .eq("id", user.uid);
    } else {
      streakStatus = "continued";
    }

    await supabase.from("user_lesson_progress").upsert(
      {
        user_id: user.uid,
        lesson_id: selectedChapter.id,
        status: "completed",
        completed_at: new Date().toISOString(),
        completion_time: timeTaken,
      },
      { onConflict: "user_id, lesson_id" }
    );

    setRewardData({
      title: selectedChapter.title,
      xp: xpEarned,
      coins: coinsEarned,
      streakStatus: streakStatus,
      currentStreak: newStreak,
    });

    await loadAdventureProgress();
    setSelectedChapter(null);
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-background p-6">
      {/* 1. Level Completion Reward */}
      <RewardModal
        open={!!rewardData}
        onClose={() => setRewardData(null)}
        data={rewardData}
      />
      {/* 2. Regress Confirm */}
      <RegressModal
        open={showRegressConfirm}
        onClose={() => setShowRegressConfirm(false)}
        onConfirm={handleRegress}
      />
      {/* 3. Grand Prize Celebration */}
      <AdventureCompletedCelebration
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        onClaim={handleClaimGrandPrize}
        stats={{
          totalRuntime: stats.total_runtime,
          averageAccuracy: adventureStats.averageAccuracy,
          isClaimed: adventureStats.isClaimed,
        }}
      />

      <AnimatePresence>
        {showNoHeartsModal && (
          <GameOverOverlay
            onRefill={async () => {
              await buyHearts();
              setShowNoHeartsModal(false);
            }}
            onClose={() => setShowNoHeartsModal(false)}
            timeRemaining={timeRemaining}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!selectedChapter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-4xl mx-auto space-y-8 pb-24"
          >
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  className="w-fit -ml-4 text-muted-foreground hover:text-foreground"
                  onClick={() => (window.location.href = "/dashboard")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Button>

                {/* --- BUTTONS AREA --- */}
                <div className="flex gap-2">
                  {/* NEW: Grand Prize Button */}
                  {isAdventureFinished && (
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "gap-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20",
                        !adventureStats.isClaimed &&
                          "animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                      )}
                      onClick={() => setShowCelebration(true)}
                    >
                      <Gift className="w-4 h-4" />
                      {adventureStats.isClaimed
                        ? "View Certificate"
                        : "Claim Prize"}
                    </Button>
                  )}

                  {isAdventureFinished && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                      onClick={() => setShowRegressConfirm(true)}
                    >
                      <RotateCcw className="w-4 h-4" /> Regress
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-2xl">
                    <MapIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-foreground">
                      C# Adventure
                    </h1>
                    <p className="text-muted-foreground">
                      Your journey from Novice to Architect.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto justify-end">
                  <TooltipProvider>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full w-10 h-10 border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-800"
                        >
                          <Backpack className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64">
                        <DropdownMenuLabel>Backpack</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {inventory.length > 0 ? (
                          inventory.map((item, idx) => (
                            <DropdownMenuItem
                              key={idx}
                              className="flex justify-between cursor-pointer py-3"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={cn(
                                    "p-1 rounded-md bg-secondary",
                                    item.color
                                  )}
                                >
                                  <item.icon className="w-4 h-4" />
                                </div>
                                <span className="font-medium">{item.name}</span>
                              </div>
                              <Badge
                                variant="secondary"
                                className="h-5 px-1.5 font-bold"
                              >
                                {item.quantity}x
                              </Badge>
                            </DropdownMenuItem>
                          ))
                        ) : (
                          <div className="p-4 text-sm text-muted-foreground text-center">
                            Your backpack is empty.
                          </div>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TooltipProvider>

                  <RankBadge rank={stats.rank} />

                  <TooltipProvider>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-600 rounded-full font-bold border border-blue-500/20 cursor-default">
                          <Clock className="w-4 h-4 text-blue-600" />
                          {formatRuntime(stats.total_runtime)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total Adventure Time</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <HeartDropdown
                    hearts={hearts}
                    timeRemaining={timeRemaining}
                    buyHearts={buyHearts}
                  />
                </div>
              </div>
            </div>

            <div className="relative w-full mt-12">
              <div className="absolute top-0 left-8 md:left-1/2 -translate-x-1/2 h-full w-2 bg-muted rounded-full" />
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: progressHeight }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute top-0 left-8 md:left-1/2 -translate-x-1/2 w-2 bg-gradient-to-b from-green-400 to-green-600 rounded-full z-0 shadow-[0_0_15px_rgba(34,197,94,0.6)]"
              />
              <div className="relative z-10 flex flex-col gap-8">
                {lessons.map((chapter, index) => {
                  const level = index + 1;
                  let status: "locked" | "current" | "completed" = "locked";
                  if (chapter.isCompleted) status = "completed";
                  else if (level === maxCompletedOrder + 1) status = "current";

                  return (
                    <RoadmapNode
                      key={chapter.id}
                      id={
                        status === "current" ? "active-chapter-node" : undefined
                      }
                      chapter={chapter}
                      status={status}
                      alignment={index % 2 === 0 ? "left" : "right"}
                      isAdventureComplete={isAdventureFinished}
                      onClick={() => handleNodeClick(chapter)}
                    />
                  );
                })}
              </div>
              <div className="flex justify-start md:justify-center mt-12 pl-2 md:pl-0">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/20 rounded-full flex items-center justify-center border-4 border-yellow-400 shadow-xl z-10"
                >
                  <Star className="w-12 h-12 text-yellow-600 fill-yellow-500" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedChapter && (
          <FullScreenLesson
            chapter={selectedChapter}
            onClose={() => setSelectedChapter(null)}
            onComplete={handleChapterComplete}
            inventory={inventory}
            onUseHint={handleConsumeHint}
            mistakesSet={mistakesSet}
            setMistakesSet={setMistakesSet}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
