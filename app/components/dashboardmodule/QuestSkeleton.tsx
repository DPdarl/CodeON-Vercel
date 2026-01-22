import { Skeleton } from "~/components/ui/skeleton";

export function QuestSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 animate-pulse">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-4 w-64 rounded-lg" />
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((col) => (
          <div key={col} className="space-y-4">
            {/* Column Header */}
            <div className="flex items-center justify-between p-2">
              <Skeleton className="h-6 w-32 rounded-full" />
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>

            {/* Cards */}
            {[1, 2, 3].map((card) => (
              <div
                key={card}
                className="h-32 w-full rounded-2xl bg-muted/10 border border-muted/20 p-4 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16 rounded-md" />
                </div>
                <Skeleton className="h-2 w-full rounded-full mt-4" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
