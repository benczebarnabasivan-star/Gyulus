import type { Video } from '@/types';
import { VideoCard } from '@/components/video/VideoCard';

interface VideoGridProps {
  videos: Video[];
  priorityCount?: number;
}

/** Responsive grid of video cards (mobile-first: 2 → 3 → 4 columns). */
export function VideoGrid({ videos, priorityCount = 4 }: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <div className="surface grid place-items-center px-6 py-16 text-center">
        <p className="text-4xl">🤷‍♂️</p>
        <p className="mt-3 text-lg font-semibold">Nincs találat</p>
        <p className="mt-1 text-sm text-brand-muted">
          Próbálj másik keresőszót vagy nézz körül a legújabb videók között.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {videos.map((video, i) => (
        <VideoCard
          key={video.id}
          video={video}
          index={i}
          priority={i < priorityCount}
        />
      ))}
    </div>
  );
}
