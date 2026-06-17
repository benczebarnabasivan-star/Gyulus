import 'server-only';
import type { SiteVideo } from '@/types';
import { curatedVideos, videoUrl } from '@/lib/data/realVideos';
import { fetchOEmbed } from '@/lib/services/oembed';

// ---------------------------------------------------------------------------
// videoService — resolves the curated list of REAL videos into displayable
// records by enriching each with TikTok's official oEmbed data (real caption,
// real thumbnail, real author). No fabricated stats or dates.
//
// Results are memoised per server instance for the cache TTL; the underlying
// oEmbed fetches are also cached by Next's data cache.
// ---------------------------------------------------------------------------

const CACHE_TTL_MS =
  (Number(process.env.TIKTOK_CACHE_TTL ?? '3600') || 3600) * 1000;

let cache: { data: SiteVideo[]; at: number } | null = null;

async function loadAll(): Promise<SiteVideo[]> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.data;

  const resolved = await Promise.all(
    curatedVideos.map(async (c): Promise<SiteVideo> => {
      const url = videoUrl(c.id);
      const oembed = await fetchOEmbed(url);
      return {
        id: c.id,
        url,
        caption: oembed?.title ?? 'Vadász Gyula videó',
        thumbnailUrl: oembed?.thumbnailUrl ?? null,
        authorName: oembed?.authorName ?? 'Vadász Gyula',
        category: c.category,
        highlight: !!c.highlight,
        note: c.note,
        available: oembed !== null,
      };
    }),
  );

  cache = { data: resolved, at: Date.now() };
  return resolved;
}

/** Manually invalidate the cache (admin "refresh" action). */
export function invalidateCache(): void {
  cache = null;
}

/** All curated videos that are currently live/public. */
export async function getVideos(): Promise<SiteVideo[]> {
  const all = await loadAll();
  return all.filter((v) => v.available);
}

/** Highlighted videos for the homepage. */
export async function getFeatured(): Promise<SiteVideo[]> {
  const all = await getVideos();
  const highlighted = all.filter((v) => v.highlight);
  return highlighted.length > 0 ? highlighted : all;
}

/** Single video lookup by TikTok id. */
export async function getVideo(id: string): Promise<SiteVideo | null> {
  const all = await loadAll();
  return all.find((v) => v.id === id && v.available) ?? null;
}

/** Related videos: same category first, then others. */
export async function getRelated(
  video: SiteVideo,
  limit = 4,
): Promise<SiteVideo[]> {
  const all = await getVideos();
  const others = all.filter((v) => v.id !== video.id);
  const sameCat = others.filter((v) => v.category === video.category);
  const rest = others.filter((v) => v.category !== video.category);
  return [...sameCat, ...rest].slice(0, limit);
}

/** Distinct fan categories with counts. */
export async function getCategories(): Promise<
  { name: string; count: number }[]
> {
  const all = await getVideos();
  const map = new Map<string, number>();
  for (const v of all) map.set(v.category, (map.get(v.category) ?? 0) + 1);
  return [...map.entries()].map(([name, count]) => ({ name, count }));
}
