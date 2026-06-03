'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { Paginated, SortKey, Video } from '@/types';
import { VideoGrid } from '@/components/video/VideoGrid';
import { VideoGridSkeleton } from '@/components/ui/Skeleton';

interface InfiniteVideoFeedProps {
  initial: Paginated<Video>;
  sort?: SortKey;
  funnyOnly?: boolean;
  featuredOnly?: boolean;
  search?: string;
  category?: string;
  limit?: number;
}

/**
 * Client-side infinite-scroll feed. Hydrates from a server-rendered first page
 * (`initial`) for fast first paint + SEO, then fetches more from /api/videos
 * as the sentinel scrolls into view.
 */
export function InfiniteVideoFeed({
  initial,
  sort = 'recent',
  funnyOnly,
  featuredOnly,
  search,
  category,
  limit = 8,
}: InfiniteVideoFeedProps) {
  const [videos, setVideos] = useState<Video[]>(initial.items);
  const [cursor, setCursor] = useState<number | null>(initial.nextCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinel = useRef<HTMLDivElement | null>(null);

  // Reset when the query changes (e.g. new search term / sort).
  useEffect(() => {
    setVideos(initial.items);
    setCursor(initial.nextCursor);
    setError(null);
  }, [initial]);

  const loadMore = useCallback(async () => {
    if (loading || cursor === null) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        sort,
        cursor: String(cursor),
        limit: String(limit),
      });
      if (funnyOnly) params.set('funny', '1');
      if (featuredOnly) params.set('featured', '1');
      if (search) params.set('q', search);
      if (category) params.set('category', category);

      const res = await fetch(`/api/videos?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Paginated<Video> = await res.json();

      setVideos((prev) => {
        const seen = new Set(prev.map((v) => v.id));
        return [...prev, ...data.items.filter((v) => !seen.has(v.id))];
      });
      setCursor(data.nextCursor);
    } catch {
      setError('Nem sikerült betölteni a további videókat. Próbáld újra.');
    } finally {
      setLoading(false);
    }
  }, [loading, cursor, sort, funnyOnly, featuredOnly, search, category, limit]);

  // IntersectionObserver-driven loading.
  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: '600px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="space-y-8">
      <VideoGrid videos={videos} />

      {loading && <VideoGridSkeleton count={4} />}

      {error && (
        <div className="surface flex flex-col items-center gap-3 p-6 text-center">
          <p className="text-sm text-brand-muted">{error}</p>
          <button
            onClick={loadMore}
            className="rounded-full bg-brand-pink px-4 py-2 text-sm font-semibold text-white"
          >
            Újrapróbálkozás
          </button>
        </div>
      )}

      {/* Infinite-scroll sentinel */}
      {cursor !== null && !error && (
        <div ref={sentinel} className="flex h-12 items-center justify-center">
          {loading && <Loader2 className="h-5 w-5 animate-spin text-brand-pink" />}
        </div>
      )}

      {cursor === null && videos.length > 0 && (
        <p className="py-6 text-center text-sm text-brand-muted">
          Ennyi volt — minden videót láttál! 🎬
        </p>
      )}
    </div>
  );
}
