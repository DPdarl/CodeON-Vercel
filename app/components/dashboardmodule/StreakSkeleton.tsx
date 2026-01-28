import { Skeleton } from "~/components/ui/skeleton";

export function StreakSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="h-10 w-48 rounded-xl" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Streak Card */}
          <div className="relative overflow-hidden rounded-3xl bg-muted/10 p-8 h-64 border border-muted/20">
            <div className="flex items-center gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-16 w-16" />
                <Skeleton className="h-6 w-48" />
              </div>
            </div>
          </div>

          {/* Calendar Card */}
          <div className="rounded-3xl bg-muted/10 border border-muted/20 h-96 p-6">
            <div className="flex justify-between mb-6">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="grid grid-cols-7 gap-4">
              {[...Array(35)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* Inventory */}
          <div className="rounded-3xl bg-muted/10 border border-muted/20 h-40 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-20 h-3" />
                </div>
              </div>
              <Skeleton className="w-8 h-8" />
            </div>
            <Skeleton className="w-full h-8 rounded-lg" />
          </div>

          {/* Milestones */}
          <div className="rounded-3xl bg-muted/10 border border-muted/20 h-[600px] p-0 flex flex-col">
            <div className="p-6 border-b border-muted/10">
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="p-6 space-y-6 flex-1">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-full h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
