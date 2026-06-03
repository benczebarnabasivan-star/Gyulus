import type { Creator } from '@/types';

// ---------------------------------------------------------------------------
// Creator profile.
//
// VERIFIED facts (public TikTok profile @vadasz_gyula):
//   - Display name: Vadász Gyula
//   - Handle: @vadasz_gyula
//   - Location: Nagyrábé, Hungary
//   - Hungarian-language creator known for everyday/comedic clips.
//
// The follower/like counts below are ILLUSTRATIVE placeholders. Public
// counters change constantly and cannot be reliably verified at build time,
// so they are rendered with a "~" and are overridden automatically when a
// live data source is configured (see src/lib/services/tiktok.ts).
// ---------------------------------------------------------------------------
export const creator: Creator = {
  handle: 'vadasz_gyula',
  displayName: 'Vadász Gyula',
  profileUrl: 'https://www.tiktok.com/@vadasz_gyula',
  // Local avatar placeholder shipped in /public (no external/avatar scraping).
  avatarUrl: '/avatar-placeholder.svg',
  bio: 'Magyar TikTokos Nagyrábéról. Mindennapi pillanatok, őszinte humor és a közönség kedvence — a Sárréttől a virális videókig.',
  location: 'Nagyrábé, Magyarország',
  followers: null,
  totalLikes: null,
  verified: false,
};
