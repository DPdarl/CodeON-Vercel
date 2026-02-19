import { Skeleton } from "~/components/ui/skeleton";

export function QuestListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm"
        >
          {/* Icon Box */}
          <Skeleton className="h-12 w-12 rounded-lg shrink-0 bg-gray-100 dark:bg-gray-700" />

          {/* Info */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4 rounded-md bg-gray-100 dark:bg-gray-700" />
            <Skeleton className="h-3 w-1/2 rounded-md bg-gray-100 dark:bg-gray-700" />
            <Skeleton className="h-1.5 w-full rounded-full mt-2 bg-gray-100 dark:bg-gray-700" />
          </div>

          {/* Button */}
          <Skeleton className="h-9 w-16 rounded-md shrink-0 bg-gray-100 dark:bg-gray-700" />
        </div>
      ))}
    </div>
  );
}
