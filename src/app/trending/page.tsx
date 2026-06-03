import type { Metadata } from 'next';
import { Eye, MessageCircle, Share2 } from 'lucide-react';
import { getTrending, queryVideos } from '@/lib/services/videoService';
import { Section } from '@/components/ui/Section';
import { VideoGrid } from '@/components/video/VideoGrid';

export const metadata: Metadata = {
  title: 'Felkapott videók',
  description:
    'A hónap legnézettebb, legtöbbet megosztott és legkommentáltabb Vadász Gyula videói.',
  alternates: { canonical: '/trending' },
};

export const revalidate = 600;

export default async function TrendingPage() {
  const [trending, mostCommented] = await Promise.all([
    getTrending(8),
    queryVideos({ sort: 'recent', limit: 100 }),
  ]);

  const byShares = [...trending].sort((a, b) => b.stats.shares - a.stats.shares).slice(0, 4);
  const byComments = [...mostCommented.items]
    .sort((a, b) => b.stats.comments - a.stats.comments)
    .slice(0, 4);

  return (
    <>
      <Section
        title={
          <span className="flex items-center gap-2">
            <Eye className="h-6 w-6 text-brand-pink" /> Legnézettebb ebben a hónapban
          </span>
        }
        subtitle="A legtöbb megtekintést gyűjtő friss videók."
      >
        <VideoGrid videos={trending} />
      </Section>

      <Section
        title={
          <span className="flex items-center gap-2">
            <Share2 className="h-6 w-6 text-brand-cyan" /> Legtöbbet megosztott
          </span>
        }
      >
        <VideoGrid videos={byShares} priorityCount={0} />
      </Section>

      <Section
        title={
          <span className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-fuchsia-400" /> Legtöbbet kommentált
          </span>
        }
      >
        <VideoGrid videos={byComments} priorityCount={0} />
      </Section>
    </>
  );
}
