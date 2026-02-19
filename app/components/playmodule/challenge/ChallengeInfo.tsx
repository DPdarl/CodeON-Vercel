// app/components/challenge/ChallengeInfo.tsx
import React, { useState } from "react";
import { useChallengeContext } from "~/contexts/ChallengeContext";
import {
  BookOpen,
  Lightbulb,
  CheckCircle,
  HelpCircle,
  Code2,
  Terminal,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ChallengeInfo = () => {
  const {
    currentChallenge,
    showHint,
    toggleHint,
    handleComplete,
    useHint,
    hints,
    buyHint,
    coins,
  } = useChallengeContext();

  const [activeTab, setActiveTab] = useState("description");

  const handleHintClick = () => {
    if (showHint) {
      toggleHint();
    } else {
      if (hints > 0) {
        if (useHint()) {
          toggleHint();
        }
      } else {
        // No hints, try to buy
        if (confirm(`Buy a hint for 50 coins? (You have ${coins} coins)`)) {
          buyHint();
        }
      }
    }
  };

  if (!currentChallenge) {
    return (
      <div className="bg-card rounded-xl p-8 flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Extract module ID from challenge ID (e.g. "1.1" -> Module 1)
  const moduleId = currentChallenge.id.split(".")[0];
  const challengeNum = currentChallenge.id.split(".")[1];

  return (
    <div className="bg-card rounded-none overflow-hidden flex flex-col h-full border-r border-border/50">
      {/* Header Area */}
      <div className="p-6 border-b border-border/50 bg-gradient-to-b from-muted/20 to-transparent">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
                <Terminal className="w-3 h-3" />
                <span>Module {moduleId}</span>
                <span className="text-border">/</span>
                <span>Challenge {challengeNum}</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                {currentChallenge.title}
              </h2>
            </div>
            <Badge
              variant={
                currentChallenge.difficulty === "Easy"
                  ? "default"
                  : currentChallenge.difficulty === "Medium"
                  ? "secondary"
                  : "destructive"
              }
              className="capitalize shadow-sm"
            >
              {currentChallenge.difficulty || "Easy"}
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-dashed border-border hover:bg-muted/50 text-muted-foreground transition-all duration-200"
              onClick={handleHintClick}
            >
              {showHint ? (
                <>
                  <HelpCircle className="w-4 h-4 mr-2" /> Hide HINT
                </>
              ) : hints > 0 ? (
                <>
                  <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
                  Get Hint{" "}
                  <span className="ml-1 opacity-70">({hints} left)</span>
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4 mr-2 text-muted-foreground" />
                  Buy Hint <span className="ml-1 opacity-70">(50 🪙)</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-grow flex flex-col min-h-0">
        <Tabs
          defaultValue="description"
          className="flex-grow flex flex-col"
          onValueChange={setActiveTab}
        >
          <div className="px-6 pt-2">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-border/50 rounded-none gap-6">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2 font-medium text-muted-foreground data-[state=active]:text-foreground transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Description
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="hint"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2 font-medium text-muted-foreground data-[state=active]:text-foreground transition-all duration-200"
                disabled={!showHint}
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Hint
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-grow overflow-y-auto px-6 py-4 custom-scrollbar">
            <TabsContent
              value="description"
              className="mt-0 h-full animate-in fade-in slide-in-from-bottom-2 duration-300 focus-visible:outline-none"
            >
              <div
                className="prose prose-base dark:prose-invert max-w-none 
                prose-headings:font-bold prose-headings:tracking-tight 
                prose-p:leading-relaxed prose-p:text-muted-foreground
                prose-strong:text-foreground prose-strong:font-semibold
                prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-muted prose-pre:text-muted-foreground prose-pre:border prose-pre:border-border/50
                prose-li:text-muted-foreground
                "
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {currentChallenge.description}
                </ReactMarkdown>
              </div>
            </TabsContent>

            <TabsContent
              value="hint"
              className="mt-0 h-full animate-in fade-in slide-in-from-bottom-2 duration-300 focus-visible:outline-none"
            >
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Lightbulb className="w-24 h-24 text-yellow-500" />
                </div>
                <h4 className="flex items-center text-yellow-600 dark:text-yellow-400 font-bold mb-3 text-lg">
                  <Lightbulb className="w-5 h-5 mr-2" /> Hint
                </h4>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground relative z-10">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {currentChallenge.hint}
                  </ReactMarkdown>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default ChallengeInfo;
