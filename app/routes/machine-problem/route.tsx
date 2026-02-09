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
import { useAuth } from "~/contexts/AuthContext";
import MachineProblemHeader from "~/components/playmodule/challenge/MachineProblemHeader";
import ChallengeInfo from "~/components/playmodule/challenge/ChallengeInfo";
import CodeEditor from "~/components/playmodule/challenge/CodeEditor";
import Terminal from "~/components/playmodule/challenge/Terminal";
import ChallengeFooter from "~/components/playmodule/challenge/ChallengeFooter";
import { SuccessModal } from "~/components/playmodule/challenge/SuccessModal";
import { Button } from "~/components/ui/button";

import { Skeleton } from "~/components/ui/skeleton";
import { useBlocker } from "@remix-run/react";
import { ExitConfirmationModal } from "~/components/playmodule/challenge/ExitConfirmationModal";

// ... (imports)

const MachineProblemSkeleton = () => (
  <div className="h-[100dvh] bg-background text-foreground flex flex-col font-sans overflow-hidden">
    {/* Header Skeleton */}
    <div className="h-14 border-b border-border bg-card/50 flex items-center px-4 justify-between">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-8 rounded-md" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-9 w-24 rounded-full" />
    </div>

    {/* Main Workspace Skeleton */}
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative bg-secondary/20">
      {/* Mobile Tabs Skeleton */}
      <div className="md:hidden h-12 bg-card border-b border-border flex items-center justify-around px-2">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>

      {/* Col 1: Instructions (Hidden on mobile for skeleton simplicity, or could show if that's default tab) */}
      <div className="hidden md:flex w-[25%] min-w-[300px] border-r border-border flex-col bg-card p-4 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="space-y-2 mt-4">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      </div>

      {/* Col 2: Editor (Visible on mobile as "active" tab representation) */}
      <div className="flex-1 w-full md:w-[45%] border-r border-border bg-white dark:bg-[#1E1E1E] flex flex-col">
        {/* Tabs */}
        <div className="h-10 border-b border-gray-200 dark:border-[#333] flex items-center px-2">
          <Skeleton className="h-6 w-24 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="flex-1 p-4 space-y-3">
          <Skeleton className="h-4 w-1/2 bg-gray-100 dark:bg-gray-800" />
          <Skeleton className="h-4 w-1/3 bg-gray-100 dark:bg-gray-800" />
          <Skeleton className="h-4 w-2/3 bg-gray-100 dark:bg-gray-800" />
          <Skeleton className="h-4 w-1/4 bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>

      {/* Col 3: Terminal (Hidden on mobile) */}
      <div className="hidden md:flex flex-1 min-w-[300px] bg-card flex-col">
        <div className="h-10 border-b border-border flex items-center px-4">
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex-1 bg-white dark:bg-[#282a36] p-4">
          <Skeleton className="h-full w-full bg-gray-100 dark:bg-gray-900/50 rounded" />
        </div>
      </div>
    </div>
  </div>
);

const ComponentSkeleton = () => (
  <div className="h-full w-full bg-card/50 p-4 space-y-2">
    <Skeleton className="h-4 w-1/2 opacity-20" />
    <Skeleton className="h-4 w-3/4 opacity-20" />
    <Skeleton className="h-4 w-2/3 opacity-20" />
  </div>
);

// ... imports ...
import { useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { challenges } from "~/data/challenges"; // Removed duplicate challenges import line if present in source, but replacement covers the block.
// ... (existing imports)
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
    isLoading,
    lastEarnedStars,
    handleRun, // Destructure handleRun
  } = useChallengeContext();
  const { user } = useAuth(); // Get user
  const navigate = useNavigate();

  // Navigation Blocker
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      currentLocation.pathname !== nextLocation.pathname,
  );

  const isLastChallenge = currentChallenge
    ? challenges.findIndex((c) => c.id === currentChallenge.id) ===
      challenges.length - 1
    : false;

  const [isInstructionsCollapsed, setIsInstructionsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"learn" | "code" | "output">(
    "learn",
  );

  // Anti-Cheat & Global Hotkey
  useEffect(() => {
    const handleAntiCheat = (e: ClipboardEvent) => {
      // Allow copy/paste for admins/instructors
      const role = user?.role?.toLowerCase();
      if (role === "superadmin" || role === "instructor" || role === "admin")
        return;

      e.preventDefault();
      // Optional: Toast notification here if desired
      // toast.error("Copy/Paste is disabled for this challenge.");
    };

    const handleGlobalKeydown = (e: KeyboardEvent) => {
      // Ctrl + Enter to Run
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        setActiveTab("output");
        handleRun();
      }
    };

    document.addEventListener("copy", handleAntiCheat);
    document.addEventListener("cut", handleAntiCheat);
    document.addEventListener("paste", handleAntiCheat);
    document.addEventListener("keydown", handleGlobalKeydown);

    return () => {
      document.removeEventListener("copy", handleAntiCheat);
      document.removeEventListener("cut", handleAntiCheat);
      document.removeEventListener("paste", handleAntiCheat);
      document.removeEventListener("keydown", handleGlobalKeydown);
    };
  }, [user?.role, handleRun]);

  // Redirect if locked (Only when not loading)
  useEffect(() => {
    if (!isLoading && currentChallenge) {
      const index = challenges.findIndex((c) => c.id === currentChallenge.id);
      if (index > 0) {
        const prevChallenge = challenges[index - 1];
        if (!completed.includes(prevChallenge.id)) {
          navigate("/play/challenges");
        }
      }
    }
  }, [currentChallenge, completed, navigate, isLoading]);

  if (isLoading) return <MachineProblemSkeleton />;

  // ... rest of component ...
  return (
    <div className="h-[100dvh] bg-background text-foreground flex flex-col font-sans overflow-hidden">
      {/* 1. Header */}
      <MachineProblemHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 2. Main Workspace (3-Column Layout on Desktop, Tabbed on Mobile) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative bg-secondary/20">
        {/* COL 1: Instructions (25%) */}
        {/* ... */}
        {/* COL 1: Instructions (Collapsible) */}
        <div
          className={`border-r border-border flex flex-col bg-card transition-all duration-300 ease-in-out ${
            // Desktop width logic
            isInstructionsCollapsed
              ? "md:w-10 md:min-w-[2.5rem]"
              : "md:w-[25%] md:min-w-[300px]"
          } ${
            // Mobile visibility
            activeTab === "learn" ? "flex w-full" : "hidden md:flex"
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
            // Desktop width logic
            isInstructionsCollapsed ? "md:w-[60%]" : "md:w-[45%]"
          } ${
            // Mobile visibility
            activeTab === "code" ? "flex w-full h-full" : "hidden md:flex"
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
            <ClientOnly fallback={<ComponentSkeleton />}>
              {() => (
                <CodeEditor
                  className="h-full border-0 rounded-none shadow-none"
                  disableCopyPaste={user?.role === "user"}
                />
              )}
            </ClientOnly>
          </div>
        </div>

        {/* COL 3: Preview/Terminal (30% on Desktop) */}
        <div
          className={`flex-1 md:min-w-[300px] flex-col bg-card ${
            activeTab === "output" ? "flex w-full h-full" : "hidden md:flex"
          }`}
        >
          <div className="h-10 bg-muted/30 border-b border-border flex items-center justify-between px-4">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <TerminalIcon className="w-3 h-3" /> Console Output
            </span>
          </div>
          <div className="flex-1 p-0 overflow-hidden relative bg-black">
            {/* We reuse Terminal but maybe style it to fill space */}
            <ClientOnly fallback={<ComponentSkeleton />}>
              {() => (
                <Terminal className="h-full w-full border-0 rounded-none shadow-none" />
              )}
            </ClientOnly>

            {/* Placeholder for "Run to see output" overlay if needed */}
          </div>
        </div>
      </div>

      {/* 3. Footer */}
      <ChallengeFooter
        onRun={() => setActiveTab("output")}
        onSubmit={() => setActiveTab("output")}
      />

      {/* Exit Confirmation Modal */}
      <ExitConfirmationModal
        isOpen={blocker.state === "blocked"}
        onConfirm={() => blocker.state === "blocked" && blocker.proceed()}
        onCancel={() => blocker.state === "blocked" && blocker.reset()}
      />

      {/* Success Modal Overlay */}
      <SuccessModal
        isOpen={showSuccessModal}
        stars={currentChallenge ? lastEarnedStars || 0 : 0}
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
