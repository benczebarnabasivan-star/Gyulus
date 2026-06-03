import 'server-only';

// ---------------------------------------------------------------------------
// TikTok oEmbed client.
//
// oEmbed is TikTok's OFFICIAL, public, no-authentication endpoint for
// retrieving display metadata about a single public video:
//   https://developers.tiktok.com/doc/embed-videos
//
// It returns the real title (caption), author name, thumbnail and embed HTML.
// It does NOT return view/like counts or upload dates — and we don't invent
// them. Responses are cached via Next's fetch cache (revalidate window).
// ---------------------------------------------------------------------------

export interface OEmbedResult {
  title: string;
  authorName: string;
  authorUrl: string;
  thumbnailUrl: string | null;
  html: string;
}

const TTL = Number(process.env.TIKTOK_CACHE_TTL ?? '3600') || 3600;

export async function fetchOEmbed(
  videoUrl: string,
): Promise<OEmbedResult | null> {
  try {
    const endpoint = `https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`;
    const res = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
      next: { revalidate: TTL },
    });
    if (!res.ok) return null; // 400/404 => private, deleted or invalid

    const data = (await res.json()) as {
      title?: string;
      author_name?: string;
      author_url?: string;
      thumbnail_url?: string;
    };

    return {
      title: data.title?.trim() || 'Vadász Gyula videó',
      authorName: data.author_name ?? 'Vadász Gyula',
      authorUrl: data.author_url ?? '',
      thumbnailUrl: data.thumbnail_url ?? null,
      html: '',
    };
  } catch (err) {
    console.warn('[oembed] fetch failed for', videoUrl, err);
    return null;
  }
}
