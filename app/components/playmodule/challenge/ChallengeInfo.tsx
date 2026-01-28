// app/components/challenge/ChallengeInfo.tsx
import React, { useState } from "react";
import { useChallengeContext } from "~/contexts/ChallengeContext";
import { BookOpen, Lightbulb, CheckCircle, HelpCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

const ChallengeInfo = () => {
  // Note: Local toast logic removed in favor of global toast if available,
  // or simplified here. For now, assuming parent handles major notifications
  // or we use a separate Toast context. Using simple alerts for critical feedback if needed.

  const { currentChallenge, showHint, toggleHint, handleComplete, useHint } =
    useChallengeContext();

  const [activeTab, setActiveTab] = useState("description");

  const handleHintClick = () => {
    if (showHint) {
      toggleHint();
    } else if (useHint()) {
      toggleHint();
    } else {
      alert("Not enough coins! Complete challenges to earn more."); // Simple fallback
    }
  };

  const handleSubmit = () => {
    handleComplete();
    // In a real app, this would trigger a global success toast
  };

  if (!currentChallenge) {
    return (
      <div className="bg-card rounded-xl p-8 flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-none overflow-hidden flex flex-col h-full">
      {/* Header Area */}
      <div className="p-6 border-b border-border bg-muted/10">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            {currentChallenge.title}
          </h2>
          <Badge
            variant="outline"
            className="border-primary/50 text-primary bg-primary/10"
          >
            Level {currentChallenge.difficulty || "Easy"}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm group"
          >
            <CheckCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            Submit Solution
          </Button>
          <Button
            variant="outline"
            className="border-border bg-background hover:bg-muted text-muted-foreground"
            onClick={handleHintClick}
          >
            {showHint ? (
              <HelpCircle className="w-4 h-4 mr-2" />
            ) : (
              <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
            )}
            {showHint ? "Hide Hint" : "Get Hint"}
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-grow p-6 overflow-y-auto">
        <Tabs
          defaultValue="description"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-2 bg-muted p-1 rounded-lg mb-6">
            <TabsTrigger
              value="description"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground ml-0.5"
            >
              <BookOpen className="w-4 h-4 mr-2" /> Description
            </TabsTrigger>
            <TabsTrigger
              value="hint"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground mr-0.5"
              disabled={!showHint}
            >
              <Lightbulb className="w-4 h-4 mr-2" /> Hint
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="description"
            className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
              <p className="leading-relaxed text-base">
                {currentChallenge.description}
              </p>
            </div>
          </TabsContent>

          <TabsContent
            value="hint"
            className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <h4 className="flex items-center text-yellow-600 dark:text-yellow-400 font-bold mb-2">
                <Lightbulb className="w-4 h-4 mr-2" /> Hint
              </h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {currentChallenge.hint}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ChallengeInfo;
