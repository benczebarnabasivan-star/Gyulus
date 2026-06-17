import Link from 'next/link';
import { ArrowRight, Radio } from 'lucide-react';
import { creator } from '@/lib/data/creator';
import { quotes } from '@/lib/data/quotes';
import { milestones } from '@/lib/data/timeline';
import { getFeatured } from '@/lib/services/videoService';
import { Hero } from '@/components/home/Hero';
import { Section } from '@/components/ui/Section';
import { RealVideoCard } from '@/components/video/RealVideoCard';
import { QuoteCard } from '@/components/quotes/QuoteCard';
import { Timeline } from '@/components/timeline/Timeline';

// Revalidate hourly so freshly-added videos / refreshed oEmbed data appear.
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
  const featured = await getFeatured();

  return (
    <>
      <Hero creator={creator} />

      {/* Live feed CTA */}
      <Section
        title={
          <span className="flex items-center gap-2">
            <Radio className="h-6 w-6 text-brand-pink" /> Élő TikTok feed
          </span>
        }
        subtitle="Vadász Gyula legfrissebb videói közvetlenül a TikTokról, a hivatalos lejátszón keresztül — mindig naprakészen."
        action={<MoreLink href="/latest">Teljes feed</MoreLink>}
      >
        <div className="surface flex flex-col items-center gap-4 p-8 text-center">
          <p className="text-brand-muted">
            A videók a TikTok hivatalos beágyazásával jelennek meg, így mindig a
            legújabb tartalmakat látod.
          </p>
          <Link
            href="/latest"
            className="rounded-full bg-brand-pink px-6 py-3 font-semibold text-white shadow-glow transition hover:brightness-110"
          >
            Élő feed megnyitása
          </Link>
        </div>
      </Section>

      {/* Featured verified videos */}
      {featured.length > 0 && (
        <Section
          title={<>⭐ Kiemelt videók</>}
          subtitle="Rajongói válogatás Vadász Gyula valódi videóiból (hivatalos TikTok lejátszó)."
          action={<MoreLink href="/funny">Összes válogatott</MoreLink>}
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((v, i) => (
              <RealVideoCard key={v.id} video={v} index={i} />
            ))}
          </div>
        </Section>
      )}

      <Section
        title={<>💬 Emlékezetes idézetek</>}
        subtitle="Rajongói válogatás — a kedvenc beszólások szellemében (nem szó szerinti idézetek)."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {quotes.slice(0, 3).map((q, i) => (
            <QuoteCard key={q.id} quote={q} index={i} />
          ))}
        </div>
      </Section>

      <Section
        title={<>📈 A sikertörténet</>}
        subtitle="Rajongói idővonal — illusztratív mérföldkövek."
      >
        <Timeline milestones={milestones} />
      </Section>
    </>
  );
}
