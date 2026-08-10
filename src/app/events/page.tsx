import type { Metadata } from 'next';
import { Database, Radio } from 'lucide-react';

import { EventCard } from '@/components/event/EventCard';
import { Aurora } from '@/components/visual/Aurora';
import { Reveal } from '@/components/visual/Reveal';
import { getEventFeed } from '@/lib/events';
import { rankEvents } from '@/lib/events/match';
import { getTasteProfile } from '@/lib/spotify/session';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Hungarian gigs',
  description: 'Upcoming festivals and concerts in Hungary, matched to your Spotify listening.',
};

export default async function EventsPage() {
  const taste = await getTasteProfile();
  const feed = await getEventFeed(taste?.topArtists.map((a) => a.name) ?? []);

  const entries = taste
    ? rankEvents(feed.events, taste).map((match) => ({ event: match.event, match }))
    : feed.events.map((event) => ({ event, match: undefined }));

  const festivals = feed.events.filter((e) => e.kind === 'festival').length;
  const concerts = feed.events.length - festivals;

  return (
    <div className="relative isolate">
      <Aurora
        palette={['#ff2d95', '#ffb020', '#22e4ff']}
        intensity="soft"
        className="-z-10 h-[60vh]"
      />

      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <Reveal>
          <h1 className="display text-[clamp(2.75rem,8vw,6rem)] uppercase leading-[0.88]">
            <span className="text-gradient">Hungary</span>
            <br />
            <span className="text-gradient-hot">this season</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/60">
            {festivals} {festivals === 1 ? 'festival' : 'festivals'} and {concerts}{' '}
            {concerts === 1 ? 'concert' : 'concerts'} — Sziget, STRAND, Budapest Park and PLÁZS
            Siófok.{' '}
            {taste
              ? 'Ranked by how much of your listening is on each bill.'
              : 'Connect Spotify and this list re-sorts itself around you.'}
          </p>
        </Reveal>

        {/* Where these listings came from — stated up front, not buried. */}
        <Reveal delay={0.05}>
          <div
            className={
              'mt-8 flex max-w-3xl items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm leading-relaxed ' +
              (feed.mode === 'live'
                ? 'border-spot/25 bg-spot/[0.07] text-spot/90'
                : 'border-white/10 bg-white/[0.03] text-white/55')
            }
          >
            {feed.mode === 'live' ? (
              <Radio className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <Database className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            )}
            <p>{feed.note}</p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {entries.map(({ event, match }, i) => (
            <Reveal key={event.slug} delay={Math.min(i, 6) * 0.05}>
              <EventCard event={event} match={match} className="h-full" />
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
