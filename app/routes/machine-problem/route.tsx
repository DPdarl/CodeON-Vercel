// app/routes/machine-problem/route.tsx
import { useState } from "react";
import { useSearchParams } from "@remix-run/react";
import { ClientOnly } from "remix-utils/client-only";
import {
  PanelLeft,
  PanelRight,
  Play,
  Maximize2,
  FileCode,
  Terminal as TerminalIcon,
  Layout,
} from "lucide-react";

import {
  ChallengeProvider,
  useChallengeContext,
} from "~/contexts/ChallengeContext";
import Header from "~/components/playmodule/challenge/Header";
import ChallengeInfo from "~/components/playmodule/challenge/ChallengeInfo";
import CodeEditor from "~/components/playmodule/challenge/CodeEditor";
import Terminal from "~/components/playmodule/challenge/Terminal";
import ChallengeFooter from "~/components/playmodule/challenge/ChallengeFooter";
import { SuccessModal } from "~/components/playmodule/challenge/SuccessModal";
import { Button } from "~/components/ui/button";

const EditorFallback = ({ height = "100%" }) => (
  <div
    className="bg-card flex items-center justify-center border border-border h-full w-full"
    style={{ minHeight: "400px" }}
  >
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      <p className="text-muted-foreground text-sm font-medium">
        Loading Workspace...
      </p>
    </div>
  </div>
);

// ... imports ...
import { useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { challenges } from "~/data/challenges";
// ... (existing imports)

const MachineProblemContent = () => {
  const {
    currentChallenge,
    completed,
    showSuccessModal,
    stars,
    handleNextChallenge,
    handleCloseModal,
    challenges,
  } = useChallengeContext(); // Use context
  const navigate = useNavigate();

  const isLastChallenge = currentChallenge
    ? challenges.findIndex((c) => c.id === currentChallenge.id) ===
      challenges.length - 1
    : false;

  const [isInstructionsCollapsed, setIsInstructionsCollapsed] = useState(false);

  // Redirect if locked
  useEffect(() => {
    if (currentChallenge) {
      const index = challenges.findIndex((c) => c.id === currentChallenge.id);
      if (index > 0) {
        const prevChallenge = challenges[index - 1];
        if (!completed.includes(prevChallenge.id)) {
          // Locked!
          // Maybe show a toast or just redirect
          navigate("/play/challenges");
        }
      }
    }
  }, [currentChallenge, completed, navigate]);

  // ... rest of component ...
  return (
    <div className="h-screen bg-background text-foreground flex flex-col font-sans overflow-hidden">
      {/* 1. Header */}
      <Header />

      {/* 2. Main Workspace (3-Column Layout) */}
      <div className="flex-1 flex overflow-hidden relative bg-secondary/20">
        {/* COL 1: Instructions (25%) */}
        {/* ... */}
        {/* COL 1: Instructions (Collapsible) */}
        <div
          className={`border-r border-border flex flex-col bg-card transition-all duration-300 ease-in-out ${
            isInstructionsCollapsed
              ? "w-10 min-w-[2.5rem]"
              : "w-[25%] min-w-[300px]"
          }`}
        >
          <div className="h-10 bg-muted/30 border-b border-border flex items-center justify-between px-2">
            {!isInstructionsCollapsed && (
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 pl-2">
                <Layout className="w-3 h-3" /> Instructions
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 ml-auto"
              onClick={() =>
                setIsInstructionsCollapsed(!isInstructionsCollapsed)
              }
            >
              <PanelLeft
                size={14}
                className={
                  isInstructionsCollapsed
                    ? "text-primary"
                    : "text-muted-foreground"
                }
              />
            </Button>
          </div>

          {!isInstructionsCollapsed && (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <ChallengeInfo />
            </div>
          )}
        </div>

        {/* COL 2: Editor (Flexible) */}
        <div
          className={`flex flex-col border-r border-border relative bg-[#1E1E1E] transition-all duration-300 ease-in-out ${
            isInstructionsCollapsed ? "w-[60%]" : "w-[45%]"
          }`}
        >
          {/* File Tabs - Keeping Darker for Editor Context */}
          <div className="h-10 bg-[#1e1e1e] border-b border-[#333] flex items-center px-2 gap-1">
            <div className="h-8 px-3 bg-[#1e1e1e] border-t-2 border-primary text-gray-200 text-xs flex items-center gap-2 rounded-t-sm">
              <div className="w-3 h-3 bg-primary/20 text-primary rounded flex items-center justify-center font-bold">
                C#
              </div>
              Program.cs
            </div>
            {/* Spacer / Add File Button could go here */}
          </div>

          <div className="flex-1 relative">
            <ClientOnly fallback={<EditorFallback />}>
              {() => (
                <CodeEditor className="h-full border-0 rounded-none shadow-none" />
              )}
            </ClientOnly>
          </div>
        </div>

        {/* COL 3: Preview/Terminal (30%) */}
        <div className="flex-1 min-w-[300px] flex flex-col bg-card">
          <div className="h-10 bg-muted/30 border-b border-border flex items-center justify-between px-4">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <TerminalIcon className="w-3 h-3" /> Console Output
            </span>
          </div>
          <div className="flex-1 p-0 overflow-hidden relative bg-black">
            {/* We reuse Terminal but maybe style it to fill space */}
            <ClientOnly fallback={<EditorFallback />}>
              {() => (
                <Terminal className="h-full w-full border-0 rounded-none shadow-none" />
              )}
            </ClientOnly>

            {/* Placeholder for "Run to see output" overlay if needed */}
          </div>
        </div>
      </div>

      {/* 3. Footer */}
      <ChallengeFooter />

      {/* Success Modal Overlay */}
      <SuccessModal
        isOpen={showSuccessModal}
        stars={currentChallenge ? stars[currentChallenge.id] || 0 : 0}
        xp={20}
        coins={5}
        message="Excellent work! You've mastered this concept."
        onNext={handleNextChallenge}
        onClose={handleCloseModal}
        isLastChallenge={isLastChallenge}
      />
    </div>
  );
};

export default function MachineProblemPage() {
  const [searchParams] = useSearchParams();
  const challengeId = searchParams.get("id");

  return (
    <ChallengeProvider initialChallengeId={challengeId}>
      <MachineProblemContent />
    </ChallengeProvider>
  );
}
