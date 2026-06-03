// ---------------------------------------------------------------------------
// Central site configuration: branding, navigation, SEO defaults.
// ---------------------------------------------------------------------------

export const siteConfig = {
  name: 'Vadász Gyula Rajongói Oldal',
  shortName: 'Vadász Gyula',
  // Marketing tagline (Hungarian).
  tagline: 'A legviccesebb magyar TikTok pillanatok egy helyen',
  description:
    'Nem hivatalos rajongói weboldal Vadász Gyula magyar TikTokosnak. ' +
    'Itt találod a legújabb és legviccesebb videóit, virális pillanatait és ' +
    'emlékezetes idézeteit — folyamatosan frissülve.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  locale: 'hu_HU',
  creatorHandle: 'vadasz_gyula',
  tiktokUrl: 'https://www.tiktok.com/@vadasz_gyula',
  // Primary SEO keywords (see task brief).
  keywords: [
    'Vadász Gyula',
    'Vadász Gyula TikTok',
    'Vadász Gyula videók',
    'Vicces magyar TikTok videók',
    'Magyar TikTok sztárok',
    'Nagyrábé TikTok',
    'vadaszgyula',
  ],
  ogImage: '/og-image.png',
} as const;

export const navLinks = [
  { href: '/', label: 'Kezdőlap' },
  { href: '/latest', label: 'Legújabb' },
  { href: '/funny', label: 'Legviccesebb' },
  { href: '/trending', label: 'Felkapott' },
  { href: '/community', label: 'Közösség' },
  { href: '/about', label: 'Rólunk' },
] as const;
