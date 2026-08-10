import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AlertTriangle, CalendarDays, ExternalLink, MapPin, Ticket } from 'lucide-react';

import { LineupPoster } from '@/components/festival/LineupPoster';
import { Timetable } from '@/components/festival/Timetable';
import { Badge } from '@/components/ui/Badge';
import { SpotifyButton } from '@/components/ui/SpotifyButton';
import { ArtistAvatar } from '@/components/visual/ArtistAvatar';
import { FestivalArt } from '@/components/visual/FestivalArt';
import { Reveal } from '@/components/visual/Reveal';
import { ScoreRing } from '@/components/visual/ScoreRing';
import { getFestivalBySlug } from '@/lib/festivals';
import { matchFestival } from '@/lib/festivals/match';
import { CURRENCY_SYMBOL, slotMinutes } from '@/lib/festivals/types';
import { isSpotifyConfigured } from '@/lib/spotify/auth';
import { getTasteProfile } from '@/lib/spotify/session';
import { cn, countdownLabel, formatDayLong, formatDayNumber, formatRange, formatWeekday } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ day?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const festival = getFestivalBySlug(slug);
  if (!festival) return { title: 'Festival not found' };

  return {
    title: festival.name,
    description: `${festival.tagline} ${formatRange(festival.startDate, festival.endDate)} in ${festival.city}.`,
  };
}

export default async function FestivalPage({ params, searchParams }: PageProps) {
  const [{ slug }, { day: dayParam }] = await Promise.all([params, searchParams]);

  const festival = getFestivalBySlug(slug);
  if (!festival) notFound();

  const taste = await getTasteProfile();
  const match = taste ? matchFestival(festival, taste) : null;

  // Highlighted sets for this listener.
  const matchedSlotIds = new Set(
    match?.artists.flatMap((a) => a.sets.map((s) => s.slot.id)) ?? [],
  );
  const clashingSlotIds = new Set(
    match?.artists.flatMap((a) => a.sets.filter((s) => s.clash).map((s) => s.slot.id)) ?? [],
  );
  const myArtistNames = new Set(
    match?.artists.flatMap((a) => a.sets.map((s) => s.slot.artist)) ?? [],
  );

  // Selected day: ?day= when valid, otherwise the day with most of your artists.
  const validDay = festival.days.find((d) => d.date === dayParam);
  const activeDay = validDay ?? festival.days.find((d) => d.date === match?.bestDay?.date) ?? festival.days[0];

  const mySetsToday = (match?.artists ?? [])
    .flatMap((a) => a.sets.filter((s) => s.date === activeDay.date).map((s) => ({ artist: a, set: s })))
    .sort((a, b) => slotMinutes(a.set.slot.start) - slotMinutes(b.set.slot.start));

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative isolate min-h-[62vh] overflow-hidden">
        <FestivalArt festival={festival} detailed className="-z-10" />

        <div className="mx-auto flex min-h-[62vh] max-w-7xl flex-col justify-end px-5 py-16 sm:px-8">
          <Reveal>
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge tone="neutral">{countdownLabel(festival.startDate)}</Badge>
              {festival.genres.slice(0, 3).map((genre) => (
                <Badge key={genre} tone="neutral">
                  {genre}
                </Badge>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="display mt-6 text-[clamp(3rem,11vw,9rem)] uppercase leading-[0.82]">
              {festival.name}
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">
              {festival.tagline}
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-white/80">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" aria-hidden />
                {festival.city}, {festival.country}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" aria-hidden />
                {formatRange(festival.startDate, festival.endDate)}
              </span>
              <span className="inline-flex items-center gap-2">
                <Ticket className="h-4 w-4" aria-hidden />
                From {CURRENCY_SYMBOL[festival.currency]}
                {festival.priceFrom}
              </span>
              <a
                href={festival.website}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 text-white/60 transition hover:text-white"
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                Official site
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* ── Your match ─────────────────────────────────────── */}
        <section className="-mt-10 relative z-10">
          {match ? (
            <Reveal>
              <div className="glass-strong rounded-4xl p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-6">
                  <ScoreRing score={match.score} size={84} />
                  <div className="min-w-[16rem] flex-1">
                    <div className="text-xs uppercase tracking-[0.2em] text-white/40">
                      Your match
                    </div>
                    <p className="mt-2 text-lg leading-snug text-white/85">{match.reason}</p>
                    {match.clashPairs > 0 && (
                      <p className="mt-2.5 inline-flex items-center gap-2 text-sm text-amber">
                        <AlertTriangle className="h-4 w-4" aria-hidden />
                        {match.clashPairs} overlapping pair
                        {match.clashPairs > 1 ? 's' : ''} in your schedule
                      </p>
                    )}
                  </div>
                </div>

                {match.artists.length > 0 && (
                  <div className="mt-7 flex flex-wrap gap-3 border-t border-white/10 pt-6">
                    {match.artists.map((artistMatch) => (
                      <div
                        key={artistMatch.artist.id}
                        className="flex items-center gap-2.5 rounded-full border border-spot/25 bg-spot/[0.08] py-1 pl-1 pr-3.5"
                      >
                        <ArtistAvatar
                          name={artistMatch.artist.name}
                          image={artistMatch.artist.image}
                          size={30}
                        />
                        <div className="leading-tight">
                          <div className="text-sm font-medium text-spot">
                            {artistMatch.artist.name}
                          </div>
                          <div className="text-[10px] uppercase tracking-wider text-spot/60">
                            {artistMatch.sets.length} set
                            {artistMatch.sets.length > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>
          ) : (
            <Reveal>
              <div className="glass-strong flex flex-wrap items-center justify-between gap-6 rounded-4xl p-6 sm:p-8">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    See this lineup through your own listening
                  </h2>
                  <p className="mt-2 max-w-lg text-sm text-white/55">
                    Connect Spotify and your artists get highlighted across the timetable, with
                    clash warnings when two of them overlap.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {isSpotifyConfigured() && <SpotifyButton size="md" />}
                  <a
                    href="/api/auth/demo"
                    className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.05] px-5 py-2.5 text-sm font-medium text-white/85 transition hover:border-white/30"
                  >
                    Use sample data
                  </a>
                </div>
              </div>
            </Reveal>
          )}
        </section>

        {/* ── Lineup poster ──────────────────────────────────── */}
        <section className="mt-20">
          <Reveal>
            <div className="text-center">
              <div className="text-xs uppercase tracking-[0.25em] text-white/35">The bill</div>
              <div className="mx-auto mt-8 max-w-4xl">
                <LineupPoster festival={festival} mine={myArtistNames} />
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── Timetable ──────────────────────────────────────── */}
        <section className="mt-24">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <h2 className="display text-3xl uppercase tracking-tight sm:text-4xl">
                  Set times
                </h2>
                <p className="mt-2 text-sm text-white/50">
                  {formatDayLong(activeDay.date)} · {activeDay.slots.length} sets
                  {matchedSlotIds.size > 0 && (
                    <span className="text-spot">
                      {' '}
                      · your artists in green
                    </span>
                  )}
                </p>
              </div>

              {/* Day picker */}
              <div className="flex flex-wrap gap-2">
                {festival.days.map((day) => {
                  const isActive = day.date === activeDay.date;
                  const mineCount = day.slots.filter((s) => matchedSlotIds.has(s.id)).length;
                  return (
                    <Link
                      key={day.date}
                      href={`/festivals/${festival.slug}?day=${day.date}`}
                      scroll={false}
                      className={cn(
                        'relative flex min-w-[62px] flex-col items-center rounded-2xl border px-3.5 py-2.5 transition',
                        isActive
                          ? 'border-white/30 bg-white/[0.12] text-white'
                          : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/25 hover:text-white',
                      )}
                    >
                      <span className="text-[10px] uppercase tracking-[0.14em] opacity-60">
                        {formatWeekday(day.date)}
                      </span>
                      <span className="display text-xl leading-tight">
                        {formatDayNumber(day.date)}
                      </span>
                      {mineCount > 0 && (
                        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-spot px-1 text-[10px] font-bold text-black">
                          {mineCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </Reveal>

          {/* Your personal running order for the selected day. */}
          {mySetsToday.length > 0 && (
            <Reveal delay={0.05}>
              <div className="mt-8 rounded-3xl border border-spot/25 bg-spot/[0.06] p-5 sm:p-6">
                <div className="text-xs uppercase tracking-[0.2em] text-spot/80">
                  Your running order
                </div>
                <ol className="mt-4 divide-y divide-spot/15">
                  {mySetsToday.map(({ artist, set }) => (
                    <li
                      key={set.slot.id}
                      className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5"
                    >
                      <span className="w-[104px] shrink-0 text-sm tabular-nums text-spot">
                        {set.slot.start}–{set.slot.end}
                      </span>
                      <span className="min-w-[8rem] flex-1 font-medium">{artist.artist.name}</span>
                      <span className="text-sm text-white/50">{set.slot.stage}</span>
                      {set.clash && (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full bg-amber/15 px-2.5 py-0.5 text-[11px] font-medium text-amber"
                          title={`Overlaps ${set.clashesWith.join(', ')}`}
                        >
                          <AlertTriangle className="h-3 w-3" aria-hidden />
                          overlaps {set.clashesWith[0]}
                          {set.clashesWith.length > 1 && ` +${set.clashesWith.length - 1}`}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
          )}

          <Reveal delay={0.08}>
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.02] p-3 sm:p-5">
              <Timetable
                day={activeDay}
                stages={festival.stages}
                matched={matchedSlotIds}
                clashing={clashingSlotIds}
              />
            </div>
          </Reveal>

          <p className="mt-5 text-xs leading-relaxed text-white/35">
            Sample schedule for demonstration — lineups and set times shown here are illustrative
            and are not announced timetables. Always check{' '}
            <a
              href={festival.website}
              target="_blank"
              rel="noreferrer noopener"
              className="underline underline-offset-2 hover:text-white/60"
            >
              the official site
            </a>{' '}
            before making plans.
          </p>
        </section>

        <div className="h-10" />
      </div>
    </div>
  );
}
