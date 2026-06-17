import { cn } from '@/lib/utils';

/** Generic shimmer block. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-xl', className)} />;
}

/** Loading placeholder shaped like a vertical video card. */
export function VideoCardSkeleton() {
  return (
    <div className="surface overflow-hidden">
      <Skeleton className="aspect-[9/16] w-full rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

/** Grid of skeletons for list pages. */
export function VideoGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  );
}
