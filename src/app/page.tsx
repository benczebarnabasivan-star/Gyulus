import Link from 'next/link';
import { AlertCircle, CalendarClock, Radar, Sparkles } from 'lucide-react';

import { EventCard } from '@/components/event/EventCard';
import { HeroPreview } from '@/components/home/HeroPreview';
import { Badge } from '@/components/ui/Badge';
import { SpotifyButton } from '@/components/ui/SpotifyButton';
import { Aurora } from '@/components/visual/Aurora';
import { Marquee } from '@/components/visual/Marquee';
import { Reveal } from '@/components/visual/Reveal';
import { getEventFeed } from '@/lib/events';
import { rankEvents, upcomingAppearances, type EventMatch } from '@/lib/events/match';
import { billFor, type MusicEvent } from '@/lib/events/types';
import { isSpotifyConfigured } from '@/lib/spotify/auth';
import { getTasteProfile } from '@/lib/spotify/session';

export const dynamic = 'force-dynamic';

const ERRORS: Record<string, string> = {
  not_configured:
    'Spotify credentials are not set on this deployment yet. You can still explore with sample data.',
  state_mismatch: 'That sign-in attempt expired or did not match. Please try connecting again.',
  token_exchange_failed: 'Spotify rejected the sign-in. Please try connecting again.',
  access_denied: 'You declined the Spotify permissions, so nothing was connected.',
};

const STEPS = [
  {
    icon: Radar,
    title: 'Read your taste',
    body: 'We pull your top artists, top tracks and what you have on right now — straight from the Spotify Web API.',
  },
  {
    icon: Sparkles,
    title: 'Score every bill',
    body: 'Sziget, STRAND, Budapest Park and PLÁZS are matched against your artists by name, then weighted by how high they rank for you.',
  },
  {
    icon: CalendarClock,
    title: 'Get the dates',
    body: 'Which day each of your artists plays, and a calendar file you can import. Set times appear when the organiser publishes them.',
  },
];

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ error }, taste] = await Promise.all([searchParams, getTasteProfile()]);
  const feed = await getEventFeed(taste?.topArtists.map((a) => a.name) ?? []);
  const configured = isSpotifyConfigured();

  const personalised = taste ? rankEvents(feed.events, taste).slice(0, 3) : null;
  const preview: { event: MusicEvent; match?: EventMatch }[] =
    personalised?.map((match) => ({ event: match.event, match })) ??
    feed.events.slice(0, 3).map((event) => ({ event }));

  const personalAppearances = personalised ? upcomingAppearances(personalised, 3) : [];
  const heroSets = personalAppearances.length
    ? personalAppearances.map((row) => ({
        artist: row.artist.name,
        festival: row.event.name,
        stage: row.performance.stage ?? row.event.venue.name,
        date: row.performance.date,
        time: row.performance.start ?? 'time TBA',
      }))
    : feed.events.slice(0, 3).map((event) => ({
        artist: event.performances[0]?.artist ?? billFor(event)[0] ?? event.name,
        festival: event.name,
        stage: event.venue.name,
        date: event.performances[0]?.date ?? event.startDate,
        time: event.performances[0]?.start ?? 'time TBA',
      }));
  const heroScore = personalised?.[0]?.score ?? 74;

  // Real names from the loaded bills, so the ticker is never invented.
  const marqueeNames = [...new Set(feed.events.flatMap(billFor))].slice(0, 14);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <Aurora intensity="loud" className="-z-10" />

        <div className="mx-auto grid min-h-[88vh] max-w-7xl items-center gap-16 px-5 py-24 sm:px-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            {error && (
              <div className="mb-8 flex max-w-2xl items-start gap-3 rounded-2xl border border-amber/30 bg-amber/10 px-4 py-3 text-sm text-amber">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <p>{ERRORS[error] ?? 'Something went wrong connecting to Spotify.'}</p>
              </div>
            )}

            <Reveal>
              <Badge tone="spot" className="mb-7">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-spot" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-spot" />
                </span>
                Hungarian gigs, matched to your Spotify
              </Badge>
            </Reveal>

            <Reveal delay={0.06}>
              <h1 className="display text-[clamp(2.75rem,7.5vw,6rem)] uppercase leading-[0.86]">
                <span className="block whitespace-nowrap text-gradient">Your sound.</span>
                <span className="block whitespace-nowrap text-gradient-hot">Your summer.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/65">
                Connect Spotify and the Hungarian gig calendar re-ranks itself around the artists
                you actually play — Sziget, STRAND, Budapest Park, PLÁZS Siófok — then tells you
                which day they are on.
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                {taste ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 rounded-full bg-spot px-8 py-4 font-semibold text-black transition hover:brightness-110"
                  >
                    Open your matches →
                  </Link>
                ) : (
                  <>
                    {configured && <SpotifyButton />}
                    <a
                      href="/api/auth/demo"
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-7 py-4 font-medium text-white/85 backdrop-blur transition hover:border-white/30 hover:bg-white/10"
                    >
                      {configured ? 'Explore with sample listener' : 'Explore the demo'}
                    </a>
                  </>
                )}
              </div>
            </Reveal>

            <Reveal delay={0.24}>
              <p className="mt-6 max-w-md text-xs leading-relaxed text-white/35">
                Read-only access to your top artists, top tracks and playback state. Tokens stay in
                an httpOnly cookie in your own session — nothing is stored on a server.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.2} className="hidden lg:block">
            <HeroPreview sets={heroSets} score={heroScore} />
          </Reveal>
        </div>

        {marqueeNames.length > 0 && (
          <div className="relative border-y border-white/[0.07] bg-black/25 py-5 backdrop-blur-sm">
            <Marquee items={marqueeNames} duration={44} />
          </div>
        )}
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <Reveal>
          <h2 className="display max-w-2xl text-4xl uppercase leading-tight sm:text-5xl">
            Three steps, no forms
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.08}>
              <div className="glass group h-full rounded-4xl p-7 transition hover:border-white/20">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-spot/25 to-cyan/10 ring-1 ring-inset ring-white/10">
                  <step.icon className="h-5 w-5 text-spot" aria-hidden />
                </div>
                <div className="mt-6 text-xs uppercase tracking-[0.2em] text-white/30">
                  Step {i + 1}
                </div>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Preview ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="display text-4xl uppercase leading-tight sm:text-5xl">
                {personalised ? 'Picked for you' : 'On this season'}
              </h2>
              <p className="mt-3 max-w-lg text-white/55">
                {personalised
                  ? 'Ranked by how much of your listening is actually on the bill.'
                  : 'Real listings from each event’s published source. Connect to see them re-ranked around you.'}
              </p>
            </div>
            <Link
              href="/events"
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/75 transition hover:border-white/35 hover:text-white"
            >
              Browse all {feed.events.length} →
            </Link>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {preview.map(({ event, match }, i) => (
            <Reveal key={event.slug} delay={i * 0.07}>
              <EventCard event={event} match={match} className="h-full" />
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
