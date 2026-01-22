import { Skeleton } from "~/components/ui/skeleton";

export function AdventureSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 animate-pulse p-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-14 h-14 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto justify-end">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="w-10 h-10 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Roadmap Skeleton */}
      <div className="relative w-full mt-12">
        <div className="absolute top-0 left-8 md:left-1/2 -translate-x-1/2 h-full w-2 bg-muted rounded-full" />

        <div className="relative z-10 flex flex-col gap-12">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`flex w-full ${
                i % 2 === 0
                  ? "justify-start md:justify-end"
                  : "justify-start md:justify-start"
              }`}
            >
              <div
                className={`flex items-center gap-6 w-full md:w-1/2 ${
                  i % 2 === 0 ? "flex-row-reverse md:flex-row" : ""
                } px-4`}
              >
                <Skeleton className="w-16 h-16 rounded-full shrink-0 border-4 border-background" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
