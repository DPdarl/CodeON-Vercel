import { Skeleton } from "~/components/ui/skeleton";

export function PlaySkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 pt-4 px-4 animate-pulse">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-80 w-full rounded-xl bg-muted/10 border border-muted/20 p-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <Skeleton className="h-14 w-14 rounded-2xl" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>

      {/* History Table */}
      <div className="mt-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
