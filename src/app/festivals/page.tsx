import type { Metadata } from 'next';

import { FestivalCard } from '@/components/festival/FestivalCard';
import { Aurora } from '@/components/visual/Aurora';
import { Reveal } from '@/components/visual/Reveal';
import { getFestivals } from '@/lib/festivals';
import { rankFestivals } from '@/lib/festivals/match';
import { getTasteProfile } from '@/lib/spotify/session';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Festivals',
  description: 'Every festival on the calendar, with full day-by-day timetables.',
};

export default async function FestivalsPage() {
  const festivals = getFestivals();
  const taste = await getTasteProfile();

  const entries = taste
    ? rankFestivals(festivals, taste).map((match) => ({ festival: match.festival, match }))
    : festivals.map((festival) => ({ festival, match: undefined }));

  const totalSets = festivals.reduce(
    (sum, f) => sum + f.days.reduce((n, d) => n + d.slots.length, 0),
    0,
  );

  return (
    <div className="relative isolate">
      <Aurora palette={['#8b5cf6', '#22e4ff', '#ff2d95']} intensity="soft" className="-z-10 h-[60vh]" />

      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <Reveal>
          <h1 className="display text-[clamp(2.75rem,8vw,6rem)] uppercase leading-[0.88]">
            <span className="text-gradient">The</span>{' '}
            <span className="text-gradient-hot">calendar</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/60">
            {festivals.length} festivals, {totalSets} sets, full timetables.{' '}
            {taste
              ? 'Sorted by how well each one fits your listening.'
              : 'Connect Spotify and this list re-sorts itself around you.'}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {entries.map(({ festival, match }, i) => (
            <Reveal key={festival.slug} delay={Math.min(i, 6) * 0.05}>
              <FestivalCard festival={festival} match={match} className="h-full" />
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
