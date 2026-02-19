import { Skeleton } from "~/components/ui/skeleton";
import { QuestListSkeleton } from "./QuestListSkeleton";

export function QuestSkeleton() {
  return (
    <div className="fixed top-14 bottom-16 inset-x-0 z-0 flex flex-col bg-gray-50 dark:bg-gray-950 lg:bg-transparent lg:static lg:h-[calc(100vh-140px)] lg:max-w-7xl lg:mx-auto font-pixelify">
      {/* 1. TOP HEADER SKELETON */}
      <div className="flex-none bg-white dark:bg-gray-900 lg:rounded-t-3xl p-4 sm:p-6 shadow-sm dark:shadow-xl border-b border-gray-200 dark:border-gray-800 z-10 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-800" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32 bg-gray-200 dark:bg-gray-800" />
              <Skeleton className="h-3 w-48 bg-gray-200 dark:bg-gray-800" />
            </div>
          </div>
          <Skeleton className="h-8 w-16 bg-gray-200 dark:bg-gray-800 rounded-md" />
        </div>

        {/* Progress Bar Skeleton */}
        <Skeleton className="h-4 w-full rounded-full bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* 2. MAIN CONTENT SKELETON */}
      <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-950 lg:bg-white/50 dark:bg-gray-900/50 lg:backdrop-blur-md lg:rounded-b-3xl lg:border-x lg:border-b border-gray-200 dark:border-gray-800">
        <div className="h-full overflow-y-auto p-4 lg:p-6 pb-24 space-y-4 custom-scrollbar">
          {/* Re-use the list skeleton for the items */}
          <div className="max-w-4xl mx-auto space-y-4">
            <QuestListSkeleton />
            <QuestListSkeleton />
          </div>
        </div>
      </div>

      {/* 3. FLOATING TABS SKELETON */}
      <div className="absolute bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 z-30">
        <Skeleton className="h-12 w-64 rounded-full bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-2xl" />
      </div>
    </div>
  );
}
