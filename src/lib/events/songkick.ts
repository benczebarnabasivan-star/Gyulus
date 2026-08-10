import type { MusicEvent, Performance, SourceRef, Venue } from './types';

/**
 * Live listings from the Songkick API.
 *
 * Songkick is used because it is the only provider with real coverage of the
 * Hungarian venues this app cares about — Budapest Park, Sziget, Balaton
 * festivals. (Ticketmaster's Discovery API does not serve Hungary, and
 * Bandsintown requires an approved partner id.)
 *
 * Requires SONGKICK_API_KEY. Request one at
 * https://www.songkick.com/developer — without it the app falls back to the
 * verified static snapshot in ./data/hungary.ts.
 */

const API = 'https://api.songkick.com/api/3.0';

export function isSongkickConfigured(): boolean {
  return Boolean(process.env.SONGKICK_API_KEY);
}

type SongkickEvent = {
  id: number;
  displayName: string;
  type: string;
  uri: string;
  start: { date: string | null; time: string | null; datetime: string | null };
  end?: { date: string | null };
  performance?: { artist: { displayName: string }; billing?: string }[];
  venue?: {
    displayName: string | null;
    lat: number | null;
    lng: number | null;
    metroArea?: { displayName?: string; country?: { displayName?: string } };
  };
  location?: { city?: string };
};

type SongkickResponse<T> = {
  resultsPage: {
    status: string;
    results: T | Record<string, never>;
    totalEntries?: number;
  };
};

async function call<T>(path: string, params: Record<string, string>): Promise<T | null> {
  const key = process.env.SONGKICK_API_KEY;
  if (!key) return null;

  const query = new URLSearchParams({ ...params, apikey: key });

  try {
    const res = await fetch(`${API}${path}?${query}`, {
      // Listings change slowly; an hour of caching keeps us well inside rate limits.
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;

    const body = (await res.json()) as SongkickResponse<T>;
    if (body.resultsPage?.status !== 'ok') return null;

    const results = body.resultsPage.results;
    return results && Object.keys(results).length ? (results as T) : null;
  } catch {
    // A listings outage must not take the page down.
    return null;
  }
}

const PALETTES: [string, string, string][] = [
  ['#ff2d95', '#ffb020', '#2a0b3f'],
  ['#22e4ff', '#5b6bff', '#0b0f2e'],
  ['#8b5cf6', '#22e4ff', '#120a2e'],
  ['#00e0a4', '#22e4ff', '#04182b'],
];

function paletteFor(seed: string): [string, string, string] {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTES[hash % PALETTES.length];
}

function toVenue(event: SongkickEvent): Venue {
  const name = event.venue?.displayName ?? 'Venue TBA';
  const city =
    event.location?.city?.split(',')[0]?.trim() ??
    event.venue?.metroArea?.displayName ??
    'Unknown';
  const country = event.venue?.metroArea?.country?.displayName ?? 'Hungary';

  return {
    slug: `songkick-venue-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name,
    city,
    country,
    countryCode: country === 'Hungary' ? 'HU' : '',
    kind: event.type === 'Festival' ? 'festival' : 'venue',
    website: event.uri,
    palette: paletteFor(name),
  };
}

function toEvent(raw: SongkickEvent): MusicEvent | null {
  const date = raw.start?.date;
  if (!date) return null;

  const source: SourceRef = {
    label: 'Songkick',
    url: raw.uri,
    retrievedAt: new Date().toISOString().slice(0, 10),
    verified: true,
  };

  const artists = (raw.performance ?? []).map((p) => p.artist.displayName);
  // Songkick gives a start time only when the promoter published one.
  const start = raw.start?.time ? raw.start.time.slice(0, 5) : undefined;

  const performances: Performance[] = artists.map((artist, i) => ({
    id: `songkick-${raw.id}-${i}`,
    artist,
    date,
    start,
  }));

  return {
    slug: `songkick-${raw.id}`,
    name: raw.displayName,
    kind: raw.type === 'Festival' ? 'festival' : 'venue',
    venue: toVenue(raw),
    startDate: date,
    endDate: raw.end?.date ?? date,
    genres: [],
    unscheduled: [],
    performances,
    source,
    ticketUrl: raw.uri,
  };
}

/**
 * Upcoming events for one artist name, restricted to a country.
 * Returns [] when the artist is unknown, has no dates, or the key is missing.
 */
export async function eventsForArtist(
  artistName: string,
  countryCode = 'HU',
): Promise<MusicEvent[]> {
  const results = await call<{ event: SongkickEvent[] }>('/events.json', {
    artist_name: artistName,
    per_page: '50',
  });

  const events = (results?.event ?? []).map(toEvent).filter((e): e is MusicEvent => e !== null);

  return events.filter((event) => !countryCode || event.venue.countryCode === countryCode);
}

/**
 * Live Hungarian listings for a set of artists, de-duplicated by event.
 * Lookups run in small batches so a 50-artist top list does not fan out into
 * 50 simultaneous requests.
 */
export async function eventsForArtists(
  artistNames: string[],
  countryCode = 'HU',
): Promise<MusicEvent[]> {
  if (!isSongkickConfigured()) return [];

  const byslug = new Map<string, MusicEvent>();
  const BATCH = 5;

  for (let i = 0; i < artistNames.length; i += BATCH) {
    const batch = artistNames.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map((name) => eventsForArtist(name, countryCode).catch(() => [])),
    );
    for (const event of results.flat()) {
      if (!byslug.has(event.slug)) byslug.set(event.slug, event);
    }
  }

  return [...byslug.values()].sort((a, b) => a.startDate.localeCompare(b.startDate));
}
