// app/components/dashboardmodule/PlayTab.tsx
import { useNavigate } from "@remix-run/react";
import { motion } from "framer-motion";
import { Users, Code2, ArrowRight, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { useAuth } from "~/contexts/AuthContext";
import { cn } from "~/lib/utils";
import { ControllerIcon, MapIcon } from "../ui/Icons";

// Import the Updated MatchHistoryTab
import { MatchHistoryTab } from "./MatchHistoryTab";

export function PlayTab() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentLevel = user?.level || 1;

  const gameModes = [
    {
      id: "adventure",
      title: "C# Adventures",
      description:
        "Your main journey. Master C# concepts step-by-step through interactive lessons and mini-games.",
      icon: MapIcon,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "hover:border-emerald-500/50",
      route: "/play/adventure",
      minLevel: 1,
    },
    {
      id: "multiplayer",
      title: "Multiplayer Arena",
      description:
        "Compete with peers in real-time coding battles. Prove your speed and accuracy.",
      icon: Users,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
      borderColor: "hover:border-indigo-500/50",
      route: "/play/multiplayer",
      minLevel: 5,
    },
    {
      id: "challenges",
      title: "C#allenges",
      description:
        "Test your logic with raw machine problems. No hand-holding, just code.",
      icon: Code2,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      borderColor: "hover:border-orange-500/50",
      route: "/play/challenges",
      minLevel: 1,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 pt-4 px-4">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
            <ControllerIcon className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              Game Center
            </h1>
            <p className="text-muted-foreground">
              Choose your path and level up your skills.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {gameModes.map((mode, index) => {
          const isLocked = currentLevel < mode.minLevel;

          return (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="h-full"
            >
              <Card
                className={cn(
                  "h-full relative overflow-hidden transition-all duration-300 border-2",
                  isLocked
                    ? "opacity-80 grayscale-[0.5] border-dashed"
                    : `cursor-pointer hover:shadow-xl hover:-translate-y-1 ${mode.borderColor}`
                )}
                onClick={() => !isLocked && navigate(mode.route)}
              >
                {/* Locked Overlay */}
                {isLocked && (
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] z-20 flex flex-col items-center justify-center text-center p-6">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="font-bold text-foreground">Locked</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Reach Level {mode.minLevel} to unlock
                    </p>
                  </div>
                )}

                {/* Decorative Background Gradient */}
                <div
                  className={cn(
                    "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 opacity-20",
                    mode.color.replace("text-", "bg-")
                  )}
                />

                <CardHeader>
                  <div
                    className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                      mode.bgColor
                    )}
                  >
                    <mode.icon className={cn("w-10 h-10", mode.color)} />
                  </div>
                  <CardTitle className="text-xl flex items-center justify-between">
                    {mode.title}
                    {!isLocked && mode.id === "adventure" && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      >
                        RECOMMENDED
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                  <p className="text-muted-foreground text-sm leading-relaxed min-h-[60px]">
                    {mode.description}
                  </p>

                  <Button
                    variant={isLocked ? "outline" : "default"}
                    className={cn(
                      "w-full justify-between group",
                      !isLocked &&
                        "bg-foreground text-background hover:bg-foreground/90"
                    )}
                    disabled={isLocked}
                  >
                    {isLocked ? "Locked" : "Play Now"}
                    {!isLocked && (
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* History Table */}
      <div className="mt-8">
        <MatchHistoryTab />
      </div>
    </div>
  );
}
