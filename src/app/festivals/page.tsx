import type { Metadata } from 'next';
import Link from 'next/link';
import { SearchX } from 'lucide-react';

import { FestivalCard } from '@/components/festival/FestivalCard';
import { FestivalFilterBar } from '@/components/festival/FestivalFilters';
import { Aurora } from '@/components/visual/Aurora';
import { Reveal } from '@/components/visual/Reveal';
import { getFestivals } from '@/lib/festivals';
import {
  collectCountries,
  collectGenres,
  collectMonths,
  filterFestivals,
  hasActiveFilters,
  type FestivalFilters,
} from '@/lib/festivals/filter';
import { rankFestivals } from '@/lib/festivals/match';
import { getTasteProfile } from '@/lib/spotify/session';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Festivals',
  description: 'Every festival on the calendar, with full day-by-day timetables.',
};

export default async function FestivalsPage({
  searchParams,
}: {
  searchParams: Promise<FestivalFilters>;
}) {
  const params = await searchParams;
  const filters: FestivalFilters = {
    q: params.q?.trim() || undefined,
    genre: params.genre || undefined,
    country: params.country || undefined,
    month: params.month || undefined,
  };

  const all = getFestivals();
  const taste = await getTasteProfile();
  const visible = filterFestivals(all, filters);

  // Rank the filtered set so the ordering still reflects the listener.
  const entries = taste
    ? rankFestivals(visible, taste).map((match) => ({ festival: match.festival, match }))
    : visible.map((festival) => ({ festival, match: undefined }));

  const totalSets = all.reduce((sum, f) => sum + f.days.reduce((n, d) => n + d.slots.length, 0), 0);

  return (
    <div className="relative isolate">
      <Aurora
        palette={['#8b5cf6', '#22e4ff', '#ff2d95']}
        intensity="soft"
        className="-z-10 h-[60vh]"
      />

      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <Reveal>
          <h1 className="display text-[clamp(2.75rem,8vw,6rem)] uppercase leading-[0.88]">
            <span className="text-gradient">The</span>{' '}
            <span className="text-gradient-hot">calendar</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/60">
            {all.length} festivals, {totalSets} sets, full timetables.{' '}
            {taste
              ? 'Sorted by how well each one fits your listening.'
              : 'Connect Spotify and this list re-sorts itself around you.'}
          </p>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="mt-12">
            <FestivalFilterBar
              filters={filters}
              genres={collectGenres(all)}
              countries={collectCountries(all)}
              months={collectMonths(all)}
              resultCount={visible.length}
            />
          </div>
        </Reveal>

        {entries.length > 0 ? (
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {entries.map(({ festival, match }, i) => (
              <Reveal key={festival.slug} delay={Math.min(i, 6) * 0.05}>
                <FestivalCard festival={festival} match={match} className="h-full" />
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal>
            <div className="mt-16 flex flex-col items-center rounded-4xl border border-white/10 bg-white/[0.02] px-6 py-20 text-center">
              <SearchX className="h-8 w-8 text-white/25" aria-hidden />
              <h2 className="mt-5 text-xl font-semibold tracking-tight">Nothing matches that</h2>
              <p className="mt-2 max-w-sm text-sm text-white/50">
                {filters.q
                  ? `No festival, city or artist matching “${filters.q}”.`
                  : 'No festival matches this combination of filters.'}
              </p>
              {hasActiveFilters(filters) && (
                <Link
                  href="/festivals"
                  className="mt-7 rounded-full bg-spot px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110"
                >
                  Clear filters
                </Link>
              )}
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}
