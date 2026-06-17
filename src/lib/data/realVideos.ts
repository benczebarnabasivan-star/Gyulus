// ---------------------------------------------------------------------------
// Curated list of REAL, verified Vadász Gyula (@vadasz_gyula) videos.
//
// Every entry here must be a genuine, public video on the verified account.
// Their captions/thumbnails are fetched live from TikTok's official oEmbed
// endpoint at runtime (see src/lib/services/oembed.ts) — we never hardcode
// fabricated metadata. Videos that become private/deleted are automatically
// dropped (oEmbed fails → `available: false`).
//
// HOW TO ADD MORE: paste the full video URL below. It is validated on load.
// Only add videos from https://www.tiktok.com/@vadasz_gyula — NOT look-alike
// or impersonator accounts.
// ---------------------------------------------------------------------------

export interface CuratedVideo {
  /** TikTok numeric video id. */
  id: string;
  /** Fan category label (editorial). */
  category: string;
  /** Featured on the homepage. */
  highlight?: boolean;
  /** Optional fan commentary — clearly our words. */
  note?: string;
}

export const CREATOR_HANDLE = 'vadasz_gyula';

export const curatedVideos: CuratedVideo[] = [
  {
    id: '7352109254586764576',
    category: 'Fesztivál',
    highlight: true,
    note: 'Vadász Gyula a fesztiválos hangulatban — rajongói kedvenc.',
  },
  // Add more verified @vadasz_gyula video ids here as they are confirmed.
];

/** Build the canonical TikTok URL for a video id. */
export function videoUrl(id: string): string {
  return `https://www.tiktok.com/@${CREATOR_HANDLE}/video/${id}`;
}
