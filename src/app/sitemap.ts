import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { getVideos } from '@/lib/services/videoService';

/** Dynamic sitemap including static pages + every live video detail page. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/latest`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/funny`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/community`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const videos = await getVideos();
  const videoRoutes: MetadataRoute.Sitemap = videos.map((v) => ({
    url: `${base}/video/${v.id}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...videoRoutes];
}
