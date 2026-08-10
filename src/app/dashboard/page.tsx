import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FlaskConical, TrendingUp } from 'lucide-react';

import { NowPlayingPanel } from '@/components/dashboard/NowPlaying';
import { TopArtistsRail } from '@/components/dashboard/TopArtistsRail';
import { UpcomingSets } from '@/components/dashboard/UpcomingSets';
import { FestivalCard } from '@/components/festival/FestivalCard';
import { Badge } from '@/components/ui/Badge';
import { Aurora } from '@/components/visual/Aurora';
import { Reveal } from '@/components/visual/Reveal';
import { getFestivals } from '@/lib/festivals';
import { rankFestivals, upcomingSetsFor } from '@/lib/festivals/match';
import { getTasteProfile } from '@/lib/spotify/session';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'For you',
  description: 'Festivals ranked against your Spotify listening, with set times for your artists.',
};

export default async function DashboardPage() {
  const taste = await getTasteProfile();
  if (!taste) redirect('/');

  const matches = rankFestivals(getFestivals(), taste);
  const withMatches = matches.filter((m) => m.artists.length > 0);
  const [top, ...rest] = matches;
  const upcoming = upcomingSetsFor(withMatches, 10);

  // Artists that appear on at least one lineup, for the "Live" pip on the rail.
  const playingSoon = new Set(
    withMatches.flatMap((m) => m.artists.map((a) => a.artist.id)),
  );

  const totalSets = withMatches.reduce(
    (sum, m) => sum + m.artists.reduce((n, a) => n + a.sets.length, 0),
    0,
  );
  const genres = [...new Set(taste.topArtists.flatMap((a) => a.genres))].slice(0, 8);

  return (
    <div className="relative isolate">
      <Aurora
        palette={['#1ed760', '#8b5cf6', '#22e4ff']}
        intensity="soft"
        className="-z-10 h-[70vh]"
      />

      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        {/* ── Header ─────────────────────────────────────────── */}
        <Reveal>
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              {taste.isDemo && (
                <Badge tone="amber" className="mb-4">
                  <FlaskConical className="h-3 w-3" aria-hidden />
                  Sample listener
                </Badge>
              )}
              <h1 className="display max-w-[16ch] break-words text-[clamp(2.25rem,6vw,4.5rem)] uppercase leading-[0.88]">
                <span className="text-white/50">Hey</span>
                <br />
                <span className="text-gradient-hot">{taste.profile.displayName}</span>
              </h1>
              <p className="mt-5 max-w-lg text-white/60">
                {withMatches.length > 0 ? (
                  <>
                    <span className="font-semibold text-white">{playingSoon.size}</span> of your top
                    artists are playing{' '}
                    <span className="font-semibold text-white">{totalSets}</span> sets across{' '}
                    <span className="font-semibold text-white">{withMatches.length}</span>{' '}
                    festivals.
                  </>
                ) : (
                  'None of your top artists are on these lineups — but the genre match still points somewhere.'
                )}
              </p>
            </div>

            <div className="w-full max-w-sm">
              <NowPlayingPanel nowPlaying={taste.nowPlaying} lastPlay={taste.recent[0] ?? null} />
            </div>
          </div>
        </Reveal>

        {taste.isDemo && (
          <Reveal delay={0.05}>
            <div className="mt-8 rounded-2xl border border-amber/25 bg-amber/[0.07] px-5 py-4 text-sm text-amber/90">
              You are exploring with a built-in sample listening history, and the lineups below are
              sample data too. Connect a real Spotify account to rank these against your own top
              artists.
            </div>
          </Reveal>
        )}

        {/* ── Top artists ────────────────────────────────────── */}
        <section className="mt-16">
          <Reveal>
            <div className="flex items-end justify-between gap-4">
              <h2 className="display text-2xl uppercase tracking-tight sm:text-3xl">
                Your top artists
              </h2>
              <span className="text-xs uppercase tracking-[0.18em] text-white/35">
                Last 6 months
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <div className="mt-7">
              <TopArtistsRail artists={taste.topArtists.slice(0, 18)} playingSoon={playingSoon} />
            </div>
          </Reveal>

          {genres.length > 0 && (
            <Reveal delay={0.1}>
              <div className="mt-7 flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/55"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </Reveal>
          )}
        </section>

        {/* ── Best match ─────────────────────────────────────── */}
        {top && (
          <section className="mt-20">
            <Reveal>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-spot" aria-hidden />
                <h2 className="display text-2xl uppercase tracking-tight sm:text-3xl">
                  Your best match
                </h2>
              </div>
              <p className="mt-2 text-sm text-white/50">{top.reason}</p>
            </Reveal>
            <Reveal delay={0.07}>
              <div className="mt-7">
                <FestivalCard festival={top.festival} match={top} featured />
              </div>
            </Reveal>
          </section>
        )}

        {/* ── Set times ──────────────────────────────────────── */}
        <section className="mt-20 grid gap-10 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <Reveal>
              <h2 className="display text-2xl uppercase tracking-tight sm:text-3xl">
                When your artists are on
              </h2>
              <p className="mt-2 text-sm text-white/50">
                Every set by one of your top artists, in chronological order.
              </p>
            </Reveal>
            <Reveal delay={0.06}>
              <div className="mt-7">
                <UpcomingSets sets={upcoming} />
              </div>
            </Reveal>
          </div>

          <div>
            <Reveal>
              <h2 className="display text-2xl uppercase tracking-tight sm:text-3xl">
                On repeat
              </h2>
              <p className="mt-2 text-sm text-white/50">Your most played tracks right now.</p>
            </Reveal>
            <Reveal delay={0.06}>
              <ol className="mt-7 space-y-1">
                {taste.topTracks.slice(0, 8).map((track, i) => (
                  <li key={track.id}>
                    <a
                      href={track.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex items-center gap-4 rounded-xl px-3 py-2.5 transition hover:bg-white/[0.05]"
                    >
                      <span className="w-5 shrink-0 text-right text-sm tabular-nums text-white/30">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{track.name}</div>
                        <div className="truncate text-xs text-white/45">
                          {track.artists.join(', ')}
                        </div>
                      </div>
                    </a>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </section>

        {/* ── Everything else ────────────────────────────────── */}
        {rest.length > 0 && (
          <section className="mt-20">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 className="display text-2xl uppercase tracking-tight sm:text-3xl">
                  Ranked for you
                </h2>
                <Link
                  href="/festivals"
                  className="text-sm text-white/50 transition hover:text-white"
                >
                  Browse all →
                </Link>
              </div>
            </Reveal>
            <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((match, i) => (
                <Reveal key={match.festival.slug} delay={Math.min(i, 5) * 0.05}>
                  <FestivalCard festival={match.festival} match={match} className="h-full" />
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
