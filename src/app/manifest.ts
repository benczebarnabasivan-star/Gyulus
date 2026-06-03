import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

/** PWA manifest (installable app + offline shell via service worker). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0B',
    theme_color: '#FE2C55',
    orientation: 'portrait',
    categories: ['entertainment', 'social'],
    lang: 'hu',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon-maskable.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
