import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { creator } from '@/lib/data/creator';
import { quotes } from '@/lib/data/quotes';
import { milestones } from '@/lib/data/timeline';
import {
  getFeatured,
  getTrending,
  queryVideos,
} from '@/lib/services/videoService';
import { Hero } from '@/components/home/Hero';
import { Section } from '@/components/ui/Section';
import { VideoGrid } from '@/components/video/VideoGrid';
import { QuoteCard } from '@/components/quotes/QuoteCard';
import { Timeline } from '@/components/timeline/Timeline';

// Revalidate the homepage hourly (data is cached upstream too).
export const revalidate = 3600;

function MoreLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
    >
      {children} <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

export default async function HomePage() {
  const [featured, latest, trending] = await Promise.all([
    getFeatured(4),
    queryVideos({ sort: 'recent', limit: 8 }),
    getTrending(4),
  ]);

  return (
    <>
      <Hero creator={creator} />

      <Section
        title={<>😂 Legviccesebb klipek</>}
        subtitle="A közönség kedvencei — a legtöbbet nevettető pillanatok."
        action={<MoreLink href="/funny">Összes vicces</MoreLink>}
      >
        <VideoGrid videos={featured} />
      </Section>

      <Section
        title={<>🆕 Legújabb videók</>}
        subtitle="Frissen feltöltött tartalmak, automatikusan frissülve."
        action={<MoreLink href="/latest">Összes legújabb</MoreLink>}
      >
        <VideoGrid videos={latest.items.slice(0, 8)} />
      </Section>

      <Section
        title={<>🔥 Most felkapott</>}
        subtitle="A hónap legnézettebb videói."
        action={<MoreLink href="/trending">Felkapott videók</MoreLink>}
      >
        <VideoGrid videos={trending} />
      </Section>

      <Section
        title={<>💬 Emlékezetes idézetek</>}
        subtitle="A leghíresebb beszólások és mondatok."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {quotes.slice(0, 3).map((q, i) => (
            <QuoteCard key={q.id} quote={q} index={i} />
          ))}
        </div>
      </Section>

      <Section
        title={<>📈 A sikertörténet</>}
        subtitle="Vadász Gyula útja az első videótól a virális pillanatokig."
      >
        <Timeline milestones={milestones} />
      </Section>
    </>
  );
}
