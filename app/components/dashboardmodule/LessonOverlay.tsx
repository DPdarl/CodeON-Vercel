// app/components/dashboardmodule/LessonOverlay.tsx
import { Dialog, DialogContent } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, BookOpen, CheckCircle, X } from "lucide-react";
import { Badge } from "~/components/ui/badge";

export function LessonOverlay({ chapter, onClose, onComplete }: any) {
  const [step, setStep] = useState<"lesson" | "game">("lesson");

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] p-0 overflow-hidden flex flex-col bg-background/95 backdrop-blur-xl border-none shadow-2xl">
        {/* Header Bar */}
        <div
          className={`p-6 flex items-center justify-between border-b ${
            step === "lesson"
              ? "bg-indigo-50/50 dark:bg-indigo-950/20"
              : "bg-orange-50/50 dark:bg-orange-950/20"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`p-2 rounded-lg ${
                step === "lesson"
                  ? "bg-indigo-500 text-white"
                  : "bg-orange-500 text-white"
              }`}
            >
              {step === "lesson" ? (
                <BookOpen className="w-5 h-5" />
              ) : (
                <chapter.icon className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">{chapter.title}</h2>
              <p className="text-sm text-muted-foreground">
                {step === "lesson"
                  ? "Read the Lesson"
                  : `Mini-Game: ${chapter.activityType}`}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto relative">
          <AnimatePresence mode="wait">
            {/* 1. ARTICLE VIEW */}
            {step === "lesson" ? (
              <motion.div
                key="lesson"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 max-w-2xl mx-auto space-y-6"
              >
                <Badge variant="outline" className="mb-4">
                  Part 1: The Concept
                </Badge>
                <div className="prose dark:prose-invert prose-lg">
                  <h3 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {chapter.title}
                  </h3>
                  <p className="lead">
                    This is where the AI-generated friendly article will go.
                    Imagine a clear, simple explanation using everyday
                    analogies.
                  </p>
                  <div className="bg-muted p-6 rounded-xl my-6 border-l-4 border-indigo-500">
                    <code className="text-sm font-mono">
                      // Example Code Block
                      <br />
                      Console.WriteLine("Hello CodeON!");
                    </code>
                  </div>
                  <p>
                    Short paragraphs, engaging tone, and storytelling elements
                    to make the concept stick.
                  </p>
                </div>
              </motion.div>
            ) : (
              /* 2. MINI-GAME VIEW (Placeholder for actual Game Components) */
              <motion.div
                key="game"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="w-32 h-32 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-6 animate-bounce">
                  <chapter.icon className="w-16 h-16 text-orange-500" />
                </div>
                <h2 className="text-3xl font-black mb-2">Ready to Play?</h2>
                <p className="text-muted-foreground mb-8 max-w-md">
                  You've read the theory. Now prove your skills in
                  <strong className="text-orange-500">
                    {" "}
                    {chapter.activityType}
                  </strong>
                  .
                </p>

                {/* Mock Game Interface */}
                <div className="w-full max-w-md bg-card border rounded-xl p-8 shadow-inner mb-8 min-h-[200px] flex items-center justify-center">
                  <span className="text-sm text-muted-foreground font-mono">
                    [ {chapter.activityType} Component Loads Here ]
                  </span>
                </div>

                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white gap-2"
                  onClick={onComplete}
                >
                  <CheckCircle className="w-5 h-5" /> Complete Chapter
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="p-6 border-t bg-background flex justify-end">
          {step === "lesson" && (
            <Button
              size="lg"
              onClick={() => setStep("game")}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Start Activity <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
