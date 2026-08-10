/**
 * Single source of truth for branding. Change the name or the credit here and
 * it updates the navbar, footer, page metadata and calendar exports at once.
 */
export const siteConfig = {
  name: 'Resonance',
  tagline: 'Your sound. Your summer.',
  description:
    'Connect Spotify to see what you actually listen to, then find the Hungarian festivals and concerts your artists are playing — Sziget, STRAND, Budapest Park and PLÁZS Siófok.',
  /** Shown as the byline in the footer and in page metadata. */
  creator: {
    name: 'Barnabás Bencze',
    url: 'https://github.com/benczebarnabasivan-star',
  },
} as const;

export type SiteConfig = typeof siteConfig;
