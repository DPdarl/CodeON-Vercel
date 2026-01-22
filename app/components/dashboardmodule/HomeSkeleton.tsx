import { Skeleton } from "~/components/ui/skeleton";

export function HomeSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-pulse">
      {/* Hero Section */}
      <div className="h-80 w-full rounded-3xl bg-muted/20 p-8 flex flex-col justify-end">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-48 rounded-lg" />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 rounded-2xl bg-muted/10 border border-muted/20 p-4 flex items-center gap-4"
          >
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>

      {/* Adventure Banner */}
      <div className="h-48 w-full rounded-3xl bg-muted/20 p-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Skeleton className="h-16 w-16 rounded-2xl" />
          <div className="space-y-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Skeleton className="h-12 w-48 rounded-xl hidden md:block" />
      </div>

      {/* Carousel */}
      <div className="h-64 w-full rounded-[2rem] bg-muted/10 border border-muted/20 p-6">
        <div className="flex justify-center items-center h-full">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}
