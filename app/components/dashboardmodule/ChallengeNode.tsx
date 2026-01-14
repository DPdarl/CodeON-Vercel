// app/components/dashboardmodule/ChallengeNode.tsx
import { Challenge } from "~/types/challenge.types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { Lock, Check, Code2, Terminal, Cpu, Brain, Zap } from "lucide-react";
import { motion } from "framer-motion";

const getLanguageIcon = (lang: string) => {
  if (lang === "python") return Terminal;
  if (lang === "javascript") return Code2;
  return Brain;
};

export function ChallengeNode({ challenge, status, alignment, onSelect }: any) {
  const Icon = getLanguageIcon(String(challenge.language));
  const isDisabled = status === "locked";

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, x: alignment === "left" ? -20 : 20 },
    visible: { opacity: 1, x: 0, transition: { delay: 0.1 } },
  };

  return (
    <TooltipProvider delayDuration={100}>
      <motion.div
        className="relative w-full h-40"
        initial="hidden"
        animate="visible"
        viewport={{ once: true }}
      >
        {/* 1. Info Card (Offset from center) */}
        <motion.div
          variants={cardVariants}
          className={cn(
            "absolute w-64 top-1/2 -translate-y-1/2", // Vertically Centered
            alignment === "left"
              ? "right-[calc(50%+5rem)]"
              : "left-[calc(50%+5rem)]"
          )}
        >
          <Card
            className={cn(
              "shadow-lg rounded-2xl transition-all",
              status === "unlocked"
                ? "hover:scale-105 cursor-pointer"
                : "opacity-80"
            )}
            onClick={onSelect}
          >
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-base">{challenge.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex gap-2">
              <Badge>{challenge.difficulty}</Badge>
              <Badge variant="outline">{challenge.language}</Badge>
            </CardContent>
          </Card>
        </motion.div>

        {/* 2. Node Circle (Perfectly Centered) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              whileHover={status === "unlocked" ? { scale: 1.1 } : {}}
              disabled={isDisabled}
              onClick={onSelect}
              className={cn(
                "absolute z-10 w-20 h-20 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-950 transition-all",
                "left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2", // EXACT CENTER
                status === "locked"
                  ? "bg-gray-200 text-gray-400"
                  : "bg-indigo-600 text-white shadow-lg"
              )}
            >
              {status === "locked" ? (
                <Lock />
              ) : status === "completed" ? (
                <Check />
              ) : (
                <Icon className="w-8 h-8" />
              )}
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side={alignment === "left" ? "right" : "left"}>
            <p>{challenge.description}</p>
          </TooltipContent>
        </Tooltip>
      </motion.div>
    </TooltipProvider>
  );
}
