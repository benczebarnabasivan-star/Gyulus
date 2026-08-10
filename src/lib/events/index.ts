import { cache } from 'react';

import { HUNGARY_EVENTS } from './data/hungary';
import { eventsForArtists, isSongkickConfigured } from './songkick';
import type { MusicEvent } from './types';

export type DataSourceMode = 'live' | 'snapshot';

export type EventFeed = {
  events: MusicEvent[];
  mode: DataSourceMode;
  /** Shown to the reader so the origin of the listings is never ambiguous. */
  note: string;
};

const SNAPSHOT_NOTE =
  'Verified listings recorded on 10 August 2026 from each event’s published source. Dates are real; set times appear only where a running order was published.';

const LIVE_NOTE = 'Live listings from the Songkick API, matched to your Spotify artists.';

/**
 * The single seam for event data.
 *
 * With SONGKICK_API_KEY set, listings come live from Songkick, filtered to the
 * artists the listener actually plays. Without it, the app serves the verified
 * static snapshot — real events from named sources, not generated filler.
 */
export const getEventFeed = cache(async (artistNames: string[] = []): Promise<EventFeed> => {
  if (isSongkickConfigured() && artistNames.length) {
    const live = await eventsForArtists(artistNames);
    if (live.length) {
      // Keep the curated Hungarian anchors alongside live results so the big
      // festivals stay present even when nobody's top artists point at them.
      const bySlug = new Map(live.map((e) => [e.slug, e]));
      for (const event of HUNGARY_EVENTS) bySlug.set(event.slug, event);
      return {
        events: [...bySlug.values()].sort((a, b) => a.startDate.localeCompare(b.startDate)),
        mode: 'live',
        note: LIVE_NOTE,
      };
    }
  }

  return { events: sortedSnapshot(), mode: 'snapshot', note: SNAPSHOT_NOTE };
});

function sortedSnapshot(): MusicEvent[] {
  return [...HUNGARY_EVENTS].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export function getEventBySlug(slug: string, events: MusicEvent[]): MusicEvent | undefined {
  return events.find((e) => e.slug === slug);
}

export { isSongkickConfigured };
export * from './types';
