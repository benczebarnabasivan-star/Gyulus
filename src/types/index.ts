// ---------------------------------------------------------------------------
// Shared domain types for the Vadász Gyula fan site.
// These mirror the Prisma models but are decoupled so the UI can run against
// the seed dataset, a live scraper, or the database interchangeably.
// ---------------------------------------------------------------------------

export interface VideoStats {
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface Video {
  /** Internal/site id (also used in the /video/[id] route). */
  id: string;
  /** Original TikTok numeric id. */
  tiktokId: string;
  /** Full TikTok URL to the video. */
  url: string;
  /** Caption text as posted on TikTok (Hungarian). */
  caption: string;
  /** Slugified caption used for search + nicer URLs. */
  slug: string;
  thumbnailUrl: string;
  /** ISO date string of upload. */
  uploadedAt: string;
  durationSec: number;
  stats: VideoStats;
  keywords: string[];
  categories: string[];
  /** Editorially marked as a "funniest clip". */
  funny: boolean;
  /** Editorially featured (hero / homepage). */
  featured: boolean;
}

export interface Creator {
  handle: string;
  displayName: string;
  profileUrl: string;
  avatarUrl: string;
  bio: string;
  location: string;
  /** Stats are illustrative unless wired to a live source — see README. */
  followers: number | null;
  totalLikes: number | null;
  verified: boolean;
}

export interface Quote {
  id: string;
  text: string;
  context?: string;
  /** Optional related video id. */
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

export type SortKey = 'recent' | 'views' | 'likes' | 'favorites';

export interface VideoQuery {
  sort?: SortKey;
  funnyOnly?: boolean;
  featuredOnly?: boolean;
  search?: string;
  category?: string;
  limit?: number;
  cursor?: number; // offset-based cursor for infinite scroll
}

export interface Paginated<T> {
  items: T[];
  nextCursor: number | null;
  total: number;
}
