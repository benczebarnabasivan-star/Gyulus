import { VideoGridSkeleton } from '@/components/ui/Skeleton';
import { Skeleton } from '@/components/ui/Skeleton';

/** Route-level loading UI (shown during server data fetches). */
export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Skeleton className="mb-3 h-8 w-64" />
      <Skeleton className="mb-8 h-4 w-96" />
      <VideoGridSkeleton count={8} />
    </div>
  );
}
