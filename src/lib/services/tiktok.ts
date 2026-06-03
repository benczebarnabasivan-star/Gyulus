import 'server-only';
import type { Video } from '@/types';
import { slugify } from '@/lib/data/videos';

// ---------------------------------------------------------------------------
// TikTok data adapter.
//
// Goal: pull the creator's newest public videos when a data source is
// configured, otherwise return null so the app falls back to the seed dataset.
//
// IMPORTANT — Terms of Service:
//   - The OFFICIAL path uses the TikTok Display API, which requires app review
//     and a user-authorized access token. This is the compliant integration.
//   - The RAPIDAPI path delegates to a third-party provider; ensure the chosen
//     provider's usage complies with TikTok's ToS and the provider's terms.
//     Always cache aggressively (see videoService) to avoid excessive requests.
//
// Configure via TIKTOK_DATA_SOURCE = "seed" | "official" | "rapidapi".
// ---------------------------------------------------------------------------

type RawItem = {
  id: string;
  desc?: string;
  cover?: string;
  duration?: number;
  createTime?: number; // unix seconds
  playCount?: number;
  diggCount?: number;
  commentCount?: number;
  shareCount?: number;
};

const USERNAME = process.env.TIKTOK_USERNAME ?? 'vadasz_gyula';

function normalize(raw: RawItem): Video {
  const caption = raw.desc?.trim() || 'Vadász Gyula videó';
  const uploadedAt = raw.createTime
    ? new Date(raw.createTime * 1000).toISOString()
    : new Date().toISOString();
  return {
    id: raw.id,
    tiktokId: raw.id,
    url: `https://www.tiktok.com/@${USERNAME}/video/${raw.id}`,
    caption,
    slug: `${slugify(caption)}-${raw.id}`,
    thumbnailUrl: raw.cover ?? `https://picsum.photos/seed/${raw.id}/720/1280`,
    uploadedAt,
    durationSec: raw.duration ?? 0,
    stats: {
      views: raw.playCount ?? 0,
      likes: raw.diggCount ?? 0,
      comments: raw.commentCount ?? 0,
      shares: raw.shareCount ?? 0,
    },
    keywords: extractHashtags(caption),
    categories: ['Legújabb'],
    funny: false,
    featured: false,
  };
}

function extractHashtags(text: string): string[] {
  return Array.from(text.matchAll(/#(\w+)/g)).map((m) => m[1].toLowerCase());
}

/** RapidAPI third-party scraper provider (tiktok-scraper7-compatible shape). */
async function fetchViaRapidApi(): Promise<Video[] | null> {
  const key = process.env.RAPIDAPI_KEY;
  const host = process.env.RAPIDAPI_HOST;
  if (!key || !host) return null;

  const res = await fetch(
    `https://${host}/user/posts?unique_id=${encodeURIComponent(USERNAME)}&count=30`,
    {
      headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': host },
      // Revalidate via Next's data cache.
      next: { revalidate: Number(process.env.TIKTOK_CACHE_TTL ?? '3600') },
    },
  );
  if (!res.ok) throw new Error(`RapidAPI responded ${res.status}`);

  const json = (await res.json()) as {
    data?: { videos?: Record<string, unknown>[] };
  };
  const videos = json.data?.videos ?? [];
  return videos.map((item) =>
    normalize({
      id: String(item.video_id ?? item.aweme_id ?? item.id ?? ''),
      desc: String(item.title ?? item.desc ?? ''),
      cover: (item.cover as string) ?? (item.origin_cover as string),
      duration: Number(item.duration ?? 0),
      createTime: Number(item.create_time ?? 0),
      playCount: Number(item.play_count ?? 0),
      diggCount: Number(item.digg_count ?? 0),
      commentCount: Number(item.comment_count ?? 0),
      shareCount: Number(item.share_count ?? 0),
    }),
  );
}

/** Official TikTok Display API (requires authorized access token). */
async function fetchViaOfficial(): Promise<Video[] | null> {
  const token = process.env.TIKTOK_ACCESS_TOKEN;
  if (!token) return null;

  const res = await fetch(
    'https://open.tiktokapis.com/v2/video/list/?fields=' +
      'id,title,video_description,duration,cover_image_url,create_time,' +
      'view_count,like_count,comment_count,share_count',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ max_count: 20 }),
      next: { revalidate: Number(process.env.TIKTOK_CACHE_TTL ?? '3600') },
    },
  );
  if (!res.ok) throw new Error(`TikTok API responded ${res.status}`);

  const json = (await res.json()) as {
    data?: { videos?: Record<string, unknown>[] };
  };
  const videos = json.data?.videos ?? [];
  return videos.map((item) =>
    normalize({
      id: String(item.id ?? ''),
      desc: String(item.title ?? item.video_description ?? ''),
      cover: item.cover_image_url as string,
      duration: Number(item.duration ?? 0),
      createTime: Number(item.create_time ?? 0),
      playCount: Number(item.view_count ?? 0),
      diggCount: Number(item.like_count ?? 0),
      commentCount: Number(item.comment_count ?? 0),
      shareCount: Number(item.share_count ?? 0),
    }),
  );
}

/**
 * Returns live videos from the configured source, or `null` to signal the
 * caller to use the seed dataset. Never throws to callers that don't want it —
 * videoService handles the fallback.
 */
export async function getTikTokVideos(): Promise<Video[] | null> {
  const source = process.env.TIKTOK_DATA_SOURCE ?? 'seed';
  switch (source) {
    case 'official':
      return fetchViaOfficial();
    case 'rapidapi':
      return fetchViaRapidApi();
    case 'seed':
    default:
      return null;
  }
}
