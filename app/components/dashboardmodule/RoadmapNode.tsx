// app/components/dashboardmodule/RoadmapNode.tsx
import { motion } from "framer-motion";
import { Check, Lock, BookOpen } from "lucide-react";
import { cn } from "~/lib/utils";
import { RoadmapChapter } from "~/data/roadmap";

interface RoadmapNodeProps {
  chapter: RoadmapChapter;
  status: "locked" | "current" | "completed";
  alignment: "left" | "right";
  onClick: () => void;
}

export function RoadmapNode({
  chapter,
  status,
  alignment,
  onClick,
}: RoadmapNodeProps) {
  const Icon = chapter.icon;
  const isLocked = status === "locked";

  return (
    <div
      className={cn("relative flex w-full items-center justify-center h-40")}
    >
      {/* 1. The Card (Text Info) */}
      <motion.div
        initial={{ opacity: 0, x: alignment === "left" ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className={cn(
          "absolute w-64 p-4 rounded-2xl border-2 bg-card shadow-sm cursor-pointer hover:shadow-md transition-all",
          alignment === "left" ? "right-[55%]" : "left-[55%]",
          isLocked ? "opacity-50 grayscale border-dashed" : "border-solid"
        )}
        onClick={!isLocked ? onClick : undefined}
      >
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Chapter {chapter.id}
          </span>
          {!isLocked && <BookOpen className="w-4 h-4 text-indigo-500" />}
        </div>
        <h3 className="font-bold text-lg leading-tight mb-1">
          {chapter.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {chapter.description}
        </p>

        {!isLocked && (
          <div className="mt-3 flex gap-2">
            <span className="text-[10px] px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-semibold">
              {chapter.lessonType}
            </span>
            <span className="text-[10px] px-2 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 font-semibold">
              {chapter.activityType}
            </span>
          </div>
        )}
      </motion.div>

      {/* 2. The Node (Circle Icon) */}
      <motion.button
        whileHover={!isLocked ? { scale: 1.15 } : {}}
        whileTap={!isLocked ? { scale: 0.95 } : {}}
        onClick={!isLocked ? onClick : undefined}
        className={cn(
          "relative z-10 w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-xl transition-all",
          "border-background",
          status === "completed"
            ? "bg-green-500 text-white"
            : status === "current"
            ? cn(
                chapter.color,
                "text-white ring-4 ring-offset-4 ring-offset-background ring-indigo-500/30"
              )
            : "bg-muted text-muted-foreground"
        )}
      >
        {status === "completed" ? (
          <Check className="w-8 h-8 stroke-[3]" />
        ) : isLocked ? (
          <Lock className="w-8 h-8" />
        ) : (
          <Icon className="w-9 h-9" />
        )}

        {/* Pulsing effect for current node */}
        {status === "current" && (
          <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-white" />
        )}
      </motion.button>
    </div>
  );
}
