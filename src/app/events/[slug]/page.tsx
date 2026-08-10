import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CalendarDays, CalendarPlus, Clock, ExternalLink, Info, MapPin } from 'lucide-react';

import { SourceNote } from '@/components/event/SourceNote';
import { Badge } from '@/components/ui/Badge';
import { SpotifyButton } from '@/components/ui/SpotifyButton';
import { ArtistAvatar } from '@/components/visual/ArtistAvatar';
import { FestivalArt } from '@/components/visual/FestivalArt';
import { Reveal } from '@/components/visual/Reveal';
import { ScoreRing } from '@/components/visual/ScoreRing';
import { getEventBySlug, getEventFeed } from '@/lib/events';
import { matchEvent, normalizeName } from '@/lib/events/match';
import { billFor, eventDates, hasSetTimes, type MusicEvent } from '@/lib/events/types';
import { isSpotifyConfigured } from '@/lib/spotify/auth';
import { getTasteProfile } from '@/lib/spotify/session';
import { cn, countdownLabel, formatDayLong, formatRange } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ slug: string }> };

async function loadEvent(slug: string): Promise<MusicEvent | undefined> {
  const taste = await getTasteProfile();
  const feed = await getEventFeed(taste?.topArtists.map((a) => a.name) ?? []);
  return getEventBySlug(slug, feed.events);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await loadEvent(slug);
  if (!event) return { title: 'Event not found' };

  return {
    title: event.name,
    description: `${event.name} — ${event.venue.name}, ${event.venue.city}. ${formatRange(
      event.startDate,
      event.endDate,
    )}.`,
  };
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await loadEvent(slug);
  if (!event) notFound();

  const taste = await getTasteProfile();
  const match = taste ? matchEvent(event, taste) : null;

  const mine = new Set(match?.acts.map((a) => normalizeName(a.artist.name)) ?? []);
  const dates = eventDates(event);
  const bill = billFor(event);
  const timesPublished = hasSetTimes(event);

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative isolate min-h-[56vh] overflow-hidden">
        <FestivalArt
          festival={{ slug: event.slug, palette: event.venue.palette, name: event.name }}
          detailed
          className="-z-10"
        />

        <div className="mx-auto flex min-h-[56vh] max-w-7xl flex-col justify-end px-5 py-16 sm:px-8">
          <Reveal>
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge tone="neutral">{countdownLabel(event.startDate)}</Badge>
              <Badge tone="neutral">
                {event.kind === 'festival' ? 'Festival' : 'Concert'}
              </Badge>
              {event.genres.slice(0, 2).map((genre) => (
                <Badge key={genre} tone="neutral">
                  {genre}
                </Badge>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="display mt-6 text-[clamp(2.25rem,7vw,5.5rem)] uppercase leading-[0.86]">
              {event.name}
            </h1>
          </Reveal>

          {event.tagline && (
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">
                {event.tagline}
              </p>
            </Reveal>
          )}

          <Reveal delay={0.15}>
            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-white/80">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" aria-hidden />
                {event.venue.name}, {event.venue.city}
                {event.venue.region ? ` (${event.venue.region})` : ''}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" aria-hidden />
                {formatRange(event.startDate, event.endDate)}
              </span>
              <a
                href={event.ticketUrl ?? event.venue.website}
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
        {/* ── Provenance ─────────────────────────────────────── */}
        <section className="-mt-6 relative z-10">
          <Reveal>
            <SourceNote source={event.source} />
          </Reveal>
        </section>

        {/* ── Your match ─────────────────────────────────────── */}
        <section className="mt-10">
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
                  </div>

                  {match.acts.some((a) => a.performances.length > 0) && (
                    <a
                      href={`/api/events/${event.slug}/calendar`}
                      className="inline-flex items-center gap-2 rounded-full border border-spot/35 bg-spot/10 px-5 py-2.5 text-sm font-medium text-spot transition hover:bg-spot/20"
                    >
                      <CalendarPlus className="h-4 w-4" aria-hidden />
                      Add your acts to calendar
                    </a>
                  )}
                </div>

                {match.acts.length > 0 && (
                  <div className="mt-7 flex flex-wrap gap-3 border-t border-white/10 pt-6">
                    {match.acts.map((act) => (
                      <div
                        key={act.artist.id}
                        className="flex items-center gap-2.5 rounded-full border border-spot/25 bg-spot/[0.08] py-1 pl-1 pr-3.5"
                      >
                        <ArtistAvatar name={act.artist.name} image={act.artist.image} size={30} />
                        <div className="leading-tight">
                          <div className="text-sm font-medium text-spot">{act.artist.name}</div>
                          <div className="text-[10px] uppercase tracking-wider text-spot/60">
                            {act.performances.length
                              ? act.performances
                                  .map((p) => formatDayLong(p.date).split(' ').slice(0, 3).join(' '))
                                  .join(' · ')
                              : 'day TBA'}
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
                    See this bill through your own listening
                  </h2>
                  <p className="mt-2 max-w-lg text-sm text-white/55">
                    Connect Spotify and your artists get picked out of the lineup automatically.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {isSpotifyConfigured() && <SpotifyButton size="md" />}
                  <a
                    href="/api/auth/demo"
                    className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.05] px-5 py-2.5 text-sm font-medium text-white/85 transition hover:border-white/30"
                  >
                    Use sample listener
                  </a>
                </div>
              </div>
            </Reveal>
          )}
        </section>

        {/* ── Schedule ───────────────────────────────────────── */}
        <section className="mt-20">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="display text-3xl uppercase tracking-tight sm:text-4xl">
                {dates.length > 1 ? 'Day by day' : 'The bill'}
              </h2>
              <span className="text-sm text-white/45">
                {bill.length} {bill.length === 1 ? 'act' : 'acts'} announced
              </span>
            </div>
          </Reveal>

          {/* Honest statement about set times, rather than inventing them. */}
          {!timesPublished && (
            <Reveal delay={0.04}>
              <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs leading-relaxed text-white/55">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                <p>
                  Stage-by-stage set times have not been published for this event yet, so none are
                  shown. Hungarian festivals typically release the full running order in the days
                  before the gates open —{' '}
                  <a
                    href={event.ticketUrl ?? event.venue.website}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline underline-offset-2 hover:text-white"
                  >
                    check the official programme
                  </a>
                  .
                </p>
              </div>
            </Reveal>
          )}

          {dates.length > 0 ? (
            <div className="mt-10 space-y-10">
              {dates.map((date, i) => {
                const acts = event.performances.filter((p) => p.date === date);
                return (
                  <Reveal key={date} delay={Math.min(i, 5) * 0.05}>
                    <div>
                      <div className="flex items-baseline gap-4 border-b border-white/10 pb-3">
                        <h3 className="display text-xl uppercase tracking-tight sm:text-2xl">
                          {formatDayLong(date)}
                        </h3>
                        <span className="text-xs text-white/35">
                          {acts.length} {acts.length === 1 ? 'act' : 'acts'}
                        </span>
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2.5">
                        {acts.map((performance) => {
                          const isMine = mine.has(normalizeName(performance.artist));
                          return (
                            <span
                              key={performance.id}
                              className={cn(
                                'inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm transition',
                                isMine
                                  ? 'border-spot/45 bg-spot/[0.12] font-semibold text-spot'
                                  : 'border-white/10 bg-white/[0.04] text-white/80',
                              )}
                            >
                              {performance.artist}
                              {performance.start && (
                                <span
                                  className={cn(
                                    'inline-flex items-center gap-1 text-xs tabular-nums',
                                    isMine ? 'text-spot/70' : 'text-white/45',
                                  )}
                                >
                                  <Clock className="h-3 w-3" aria-hidden />
                                  {performance.start}
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          ) : null}

          {event.unscheduled.length > 0 && (
            <Reveal delay={0.06}>
              <div className="mt-12">
                <div className="flex items-baseline gap-4 border-b border-white/10 pb-3">
                  <h3 className="display text-xl uppercase tracking-tight sm:text-2xl">
                    Announced
                  </h3>
                  <span className="text-xs text-white/35">day not yet assigned</span>
                </div>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  {event.unscheduled.map((artist) => {
                    const isMine = mine.has(normalizeName(artist));
                    return (
                      <span
                        key={artist}
                        className={cn(
                          'rounded-2xl border px-4 py-2.5 text-sm',
                          isMine
                            ? 'border-spot/45 bg-spot/[0.12] font-semibold text-spot'
                            : 'border-white/10 bg-white/[0.04] text-white/80',
                        )}
                      >
                        {artist}
                      </span>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          )}
        </section>

        <div className="h-16" />
      </div>
    </div>
  );
}
