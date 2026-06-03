import 'server-only';
import type { Paginated, Video, VideoQuery } from '@/types';
import { seedVideos } from '@/lib/data/videos';
import { getTikTokVideos } from '@/lib/services/tiktok';

// ---------------------------------------------------------------------------
// videoService — the single source of truth the UI/API query through.
//
// It abstracts WHERE the data comes from (seed dataset, live TikTok adapter,
// or — in a full deployment — Prisma/PostgreSQL). Swapping the source only
// requires changing `loadAll()`; every page keeps working unchanged.
//
// A tiny in-memory cache avoids recomputing/refetching on every request.
// ---------------------------------------------------------------------------

const CACHE_TTL_MS =
  Number(process.env.TIKTOK_CACHE_TTL ?? '3600') * 1000 || 3_600_000;

let cache: { data: Video[]; at: number } | null = null;

/** Compute a "funny score" used to rank the funniest clips. */
function funnyScore(v: Video): number {
  const engagement =
    v.stats.likes * 1.0 + v.stats.shares * 2.0 + v.stats.comments * 1.5;
  const reach = Math.max(v.stats.views, 1);
  // Reward high engagement-per-view plus an explicit editorial "funny" flag.
  return (engagement / reach) * 1000 + (v.funny ? 250 : 0);
}

async function loadAll(): Promise<Video[]> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return cache.data;
  }

  // Try the configured live source; fall back to the curated seed dataset.
  let data: Video[];
  try {
    const live = await getTikTokVideos();
    data = live && live.length > 0 ? live : seedVideos;
  } catch (err) {
    console.warn('[videoService] live source failed, using seed:', err);
    data = seedVideos;
  }

  cache = { data, at: Date.now() };
  return data;
}

/** Manually invalidate the cache (used by the admin "refresh" action). */
export function invalidateCache(): void {
  cache = null;
}

function applySort(items: Video[], sort: VideoQuery['sort']): Video[] {
  const copy = [...items];
  switch (sort) {
    case 'views':
      return copy.sort((a, b) => b.stats.views - a.stats.views);
    case 'likes':
      return copy.sort((a, b) => b.stats.likes - a.stats.likes);
    case 'favorites':
      return copy.sort((a, b) => funnyScore(b) - funnyScore(a));
    case 'recent':
    default:
      return copy.sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
      );
  }
}

function matchesSearch(v: Video, q: string): boolean {
  const needle = q.toLowerCase().trim();
  if (!needle) return true;
  const haystack = [
    v.caption,
    v.keywords.join(' '),
    v.categories.join(' '),
  ]
    .join(' ')
    .toLowerCase();
  return needle.split(/\s+/).every((token) => haystack.includes(token));
}

/** Main query entry point with filtering, search, sorting and pagination. */
export async function queryVideos(
  query: VideoQuery = {},
): Promise<Paginated<Video>> {
  const {
    sort = 'recent',
    funnyOnly,
    featuredOnly,
    search,
    category,
    limit = 8,
    cursor = 0,
  } = query;

  let items = await loadAll();

  if (funnyOnly) items = items.filter((v) => v.funny);
  if (featuredOnly) items = items.filter((v) => v.featured);
  if (category) {
    items = items.filter((v) =>
      v.categories.some((c) => c.toLowerCase() === category.toLowerCase()),
    );
  }
  if (search) items = items.filter((v) => matchesSearch(v, search));

  items = applySort(items, sort);

  const total = items.length;
  const page = items.slice(cursor, cursor + limit);
  const nextCursor = cursor + limit < total ? cursor + limit : null;

  return { items: page, nextCursor, total };
}

/** Look up a single video by site id or slug. */
export async function getVideo(idOrSlug: string): Promise<Video | null> {
  const all = await loadAll();
  return (
    all.find((v) => v.id === idOrSlug || v.slug === idOrSlug) ?? null
  );
}

/** Related videos: same category, excluding the current one. */
export async function getRelated(video: Video, limit = 4): Promise<Video[]> {
  const all = await loadAll();
  return all
    .filter(
      (v) =>
        v.id !== video.id &&
        v.categories.some((c) => video.categories.includes(c)),
    )
    .sort((a, b) => b.stats.views - a.stats.views)
    .slice(0, limit);
}

/** Featured clips for the homepage hero/carousel. */
export async function getFeatured(limit = 6): Promise<Video[]> {
  const { items } = await queryVideos({ featuredOnly: true, sort: 'favorites', limit });
  return items;
}

/** Trending this month: highest views among recent uploads. */
export async function getTrending(limit = 6): Promise<Video[]> {
  const all = await loadAll();
  const monthAgo = Date.now() - 1000 * 60 * 60 * 24 * 45;
  const recent = all.filter((v) => new Date(v.uploadedAt).getTime() > monthAgo);
  const pool = recent.length >= limit ? recent : all;
  return [...pool]
    .sort((a, b) => b.stats.views - a.stats.views)
    .slice(0, limit);
}

/** All distinct categories with counts. */
export async function getCategories(): Promise<
  { name: string; count: number }[]
> {
  const all = await loadAll();
  const map = new Map<string, number>();
  for (const v of all) {
    for (const c of v.categories) map.set(c, (map.get(c) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
