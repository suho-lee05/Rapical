/**
 * Skeleton Loaders — reusable loading shimmer components
 * Used across Feed, Inbox, Search etc. for loading states
 */

function Shimmer({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-muted rounded-lg ${className || ""}`} />
  );
}

export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-border/40 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Shimmer className="w-14 h-4 rounded-lg" />
            <Shimmer className="w-20 h-4 rounded-lg" />
            <div className="flex-1" />
            <Shimmer className="w-12 h-3 rounded-lg" />
          </div>
          <Shimmer className="w-3/4 h-5 rounded-lg" />
          <Shimmer className="w-full h-4 rounded-lg" />
          <Shimmer className="w-2/3 h-4 rounded-lg" />
          <div className="flex gap-2 pt-1">
            <Shimmer className="w-14 h-6 rounded-lg" />
            <Shimmer className="w-14 h-6 rounded-lg" />
            <Shimmer className="w-14 h-6 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function InboxSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 px-4 py-3.5 border-b border-border/40">
          <Shimmer className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2 pt-0.5">
            <div className="flex items-center justify-between">
              <Shimmer className="w-28 h-3.5 rounded-lg" />
              <Shimmer className="w-14 h-3 rounded-lg" />
            </div>
            <Shimmer className="w-4/5 h-4 rounded-lg" />
            <div className="flex gap-2">
              <Shimmer className="w-12 h-4 rounded-lg" />
              <Shimmer className="w-16 h-4 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-border/40 p-5 space-y-4">
      <Shimmer className="w-1/2 h-5 rounded-lg" />
      <div className="space-y-2">
        <Shimmer className="w-full h-4 rounded-lg" />
        <Shimmer className="w-3/4 h-4 rounded-lg" />
      </div>
      <Shimmer className="w-full h-8 rounded-lg" />
    </div>
  );
}

export function PinnedSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-border/40 px-4 py-3 flex items-center gap-3">
          <Shimmer className="w-8 h-8 rounded-lg shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Shimmer className="w-3/4 h-4 rounded-lg" />
            <Shimmer className="w-1/2 h-3 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
