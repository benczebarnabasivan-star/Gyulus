import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { queryVideos } from '@/lib/services/videoService';

/** Dynamic sitemap including all static pages + every video detail page. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/latest`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/funny`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/trending`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/community`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const { items } = await queryVideos({ limit: 1000 });
  const videoRoutes: MetadataRoute.Sitemap = items.map((v) => ({
    url: `${base}/video/${v.id}`,
    lastModified: new Date(v.uploadedAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...videoRoutes];
}
