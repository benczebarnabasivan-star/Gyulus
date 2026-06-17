import type { Creator } from '@/types';

// ---------------------------------------------------------------------------
// Creator profile.
//
// VERIFIED facts (public TikTok profile @vadasz_gyula, confirmed via TikTok's
// official oEmbed: author "🥰❤️🌈Vadász Gyula🌈❤🥰", unique id "vadasz_gyula"):
//   - Display name: Vadász Gyula
//   - Handle: @vadasz_gyula
//   - Location: Nagyrábé, Hungary
//   - Hungarian-language creator known for everyday/comedic clips.
//
// We intentionally do NOT store follower/like counts: they can't be obtained
// for a third-party creator without their authorization, and we won't
// fabricate them. The live profile link is shown instead.
// ---------------------------------------------------------------------------
export const creator: Creator = {
  handle: 'vadasz_gyula',
  displayName: 'Vadász Gyula',
  profileUrl: 'https://www.tiktok.com/@vadasz_gyula',
  // Local avatar placeholder shipped in /public (no external/avatar scraping).
  avatarUrl: '/avatar-placeholder.svg',
  bio: 'Magyar TikTokos Nagyrábéról. Mindennapi pillanatok, őszinte humor és a közönség kedvence — a Sárréttől a fesztiválokig.',
  location: 'Nagyrábé, Magyarország',
  verified: false,
};
