// ---------------------------------------------------------------------------
// Shared domain types.
//
// This site only displays REAL TikTok content via TikTok's own official
// embeds (oEmbed + creator/video embed widgets). We deliberately do NOT model
// view/like counts or upload dates, because those cannot be obtained for a
// third-party creator without their authorization — and we won't fabricate
// them. Everything else (quotes, timeline, polls) is clearly fan-made.
// ---------------------------------------------------------------------------

/** A real TikTok video, enriched at runtime from TikTok's official oEmbed. */
export interface SiteVideo {
  /** Original TikTok numeric id (also the /video/[id] route param). */
  id: string;
  /** Canonical TikTok video URL. */
  url: string;
  /** Real caption/title from oEmbed (falls back to a neutral label). */
  caption: string;
  /** Real thumbnail from oEmbed. Signed + expiring, so treated as optional. */
  thumbnailUrl: string | null;
  /** Real author display name from oEmbed. */
  authorName: string;
  /** Fan-assigned category label (editorial, not from TikTok). */
  category: string;
  /** Editorially highlighted on the homepage. */
  highlight: boolean;
  /** Optional fan commentary (clearly our words, not the creator's). */
  note?: string;
  /** True when oEmbed resolved successfully (video is public + live). */
  available: boolean;
}

export interface Creator {
  handle: string;
  displayName: string;
  profileUrl: string;
  avatarUrl: string;
  bio: string;
  location: string;
  verified: boolean;
}

export interface Quote {
  id: string;
  text: string;
  context?: string;
  videoId?: string;
}

export interface Milestone {
  id: string;
  date: string; // ISO
  title: string;
  description: string;
  emoji: string;
}

export interface Poll {
  id: string;
  question: string;
  options: { id: string; label: string; votes: number }[];
}
