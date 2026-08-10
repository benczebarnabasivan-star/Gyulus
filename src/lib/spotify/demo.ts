import type { RecentPlay, SpotifyArtist, SpotifyTrack, TasteProfile, TimeRange } from './types';

/**
 * A built-in sample listener so the whole product is explorable without
 * Spotify credentials. Everything returned from here is clearly flagged
 * `isDemo: true` and the UI labels it as sample data — it is not, and does
 * not claim to be, anyone's real listening history.
 */

type Seed = { name: string; genres: string[]; popularity: number };

const SEED_ARTISTS: Seed[] = [
  { name: 'Fred again..', genres: ['uk dance', 'house', 'electronic'], popularity: 82 },
  { name: 'Bicep', genres: ['electronica', 'breakbeat', 'house'], popularity: 71 },
  { name: 'Peggy Gou', genres: ['house', 'korean house', 'electronic'], popularity: 73 },
  { name: 'Bonobo', genres: ['downtempo', 'electronica', 'house'], popularity: 70 },
  { name: 'Jamie xx', genres: ['uk dance', 'electronica', 'house'], popularity: 69 },
  { name: 'Four Tet', genres: ['electronica', 'ambient', 'house'], popularity: 66 },
  { name: 'Caribou', genres: ['electronica', 'indietronica'], popularity: 64 },
  { name: 'Overmono', genres: ['uk garage', 'breakbeat', 'electronic'], popularity: 62 },
  { name: 'Charlotte de Witte', genres: ['techno', 'belgian techno'], popularity: 68 },
  { name: 'Amelie Lens', genres: ['techno', 'belgian techno'], popularity: 63 },
  { name: 'Kaytranada', genres: ['alternative r&b', 'house', 'hip hop'], popularity: 74 },
  { name: 'Disclosure', genres: ['uk dance', 'house', 'electronic'], popularity: 72 },
  { name: 'ODESZA', genres: ['electronic', 'indietronica', 'chillwave'], popularity: 70 },
  { name: 'Jungle', genres: ['indietronica', 'neo-soul', 'funk'], popularity: 71 },
  { name: 'Tame Impala', genres: ['psychedelic rock', 'indie', 'neo-psychedelic'], popularity: 79 },
  { name: 'Arctic Monkeys', genres: ['indie rock', 'garage rock', 'rock'], popularity: 84 },
  { name: 'Little Simz', genres: ['uk hip hop', 'grime', 'hip hop'], popularity: 65 },
  { name: 'FKA twigs', genres: ['alternative r&b', 'art pop', 'electronic'], popularity: 66 },
  { name: 'Sammy Virji', genres: ['uk garage', 'bassline', 'electronic'], popularity: 61 },
  { name: 'The Blaze', genres: ['french house', 'electronica'], popularity: 58 },
  { name: 'Romy', genres: ['uk dance', 'house', 'electronic'], popularity: 55 },
  { name: 'Floating Points', genres: ['electronica', 'house', 'jazz'], popularity: 57 },
  { name: 'HAAi', genres: ['techno', 'electronic'], popularity: 50 },
  { name: 'Barry Can’t Swim', genres: ['house', 'electronica'], popularity: 59 },
];

const SEED_TRACKS: { name: string; artist: string; album: string; ms: number }[] = [
  { name: 'Delilah (pull me out of this)', artist: 'Fred again..', album: 'Actual Life 3', ms: 213_000 },
  { name: 'Glue', artist: 'Bicep', album: 'Bicep', ms: 268_000 },
  { name: '(It Goes Like) Nanana', artist: 'Peggy Gou', album: 'I Hear You', ms: 191_000 },
  { name: 'Kerala', artist: 'Bonobo', album: 'Migration', ms: 231_000 },
  { name: 'Gosh', artist: 'Jamie xx', album: 'In Colour', ms: 315_000 },
  { name: 'Baby Again..', artist: 'Fred again..', album: 'Single', ms: 190_000 },
  { name: 'Two Thousand and Seventeen', artist: 'Four Tet', album: 'New Energy', ms: 226_000 },
  { name: 'Never Come Back', artist: 'Caribou', album: 'Suddenly', ms: 227_000 },
  { name: 'Is It Cold In The Water?', artist: 'Overmono', album: 'Good Lies', ms: 244_000 },
  { name: 'Doppler', artist: 'Charlotte de Witte', album: 'Formula EP', ms: 342_000 },
  { name: 'Intimidated', artist: 'Kaytranada', album: 'Intimidated', ms: 195_000 },
  { name: 'Latch', artist: 'Disclosure', album: 'Settle', ms: 256_000 },
  { name: 'Back On 74', artist: 'Jungle', album: 'Volcano', ms: 180_000 },
  { name: 'Let It Happen', artist: 'Tame Impala', album: 'Currents', ms: 467_000 },
  { name: 'Gorilla', artist: 'Little Simz', album: 'NO THANK YOU', ms: 209_000 },
  { name: 'Two Weeks', artist: 'FKA twigs', album: 'LP1', ms: 245_000 },
  { name: 'Shella', artist: 'Sammy Virji', album: 'Single', ms: 202_000 },
  { name: 'Territory', artist: 'The Blaze', album: 'Dancehall', ms: 234_000 },
  { name: 'Loveher', artist: 'Romy', album: 'Mid Air', ms: 205_000 },
  { name: 'Birds', artist: 'Floating Points', album: 'Cascade', ms: 288_000 },
];

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Rank is conveyed by array order, matching the shape of Spotify's top-artists response.
const demoArtists: SpotifyArtist[] = SEED_ARTISTS.map((seed) => ({
  id: `demo-artist-${slug(seed.name)}`,
  name: seed.name,
  genres: seed.genres,
  popularity: seed.popularity,
  image: null,
  url: `https://open.spotify.com/search/${encodeURIComponent(seed.name)}`,
}));

const demoTracks: SpotifyTrack[] = SEED_TRACKS.map((t) => ({
  id: `demo-track-${slug(t.artist)}-${slug(t.name)}`,
  name: t.name,
  artists: [t.artist],
  album: t.album,
  image: null,
  url: `https://open.spotify.com/search/${encodeURIComponent(`${t.artist} ${t.name}`)}`,
  durationMs: t.ms,
}));

/**
 * Recent plays are generated relative to now so the "x minutes ago" copy stays
 * sensible whenever the demo is opened.
 */
function demoRecent(): RecentPlay[] {
  const now = Date.now();
  return demoTracks.slice(0, 12).map((track, i) => ({
    track,
    playedAt: new Date(now - (i + 1) * 17 * 60_000).toISOString(),
  }));
}

/**
 * Deterministic reordering per time range, so the dashboard's range switcher
 * visibly changes the sample listener's taste the way a real account would.
 * Recent listening skews electronic; the all-time list pulls the band and
 * hip-hop entries back up.
 */
function reorderFor<T>(items: T[], range: TimeRange): T[] {
  if (range === 'medium_term') return items;

  const rotation = range === 'short_term' ? 5 : 11;
  const rotated = [...items.slice(rotation), ...items.slice(0, rotation)];
  // All-time keeps a longer tail; the 4-week window is necessarily narrower.
  return range === 'short_term' ? rotated.slice(0, Math.ceil(items.length * 0.7)) : rotated;
}

export function demoTasteProfile(range: TimeRange = 'medium_term'): TasteProfile {
  const topArtists = reorderFor(demoArtists, range);
  const topTracks = reorderFor(demoTracks, range);

  return {
    profile: {
      id: 'demo-listener',
      displayName: 'Sample Listener',
      image: null,
      country: 'HU',
      product: 'demo',
    },
    topArtists,
    topTracks,
    nowPlaying: {
      isPlaying: true,
      progressMs: 74_000,
      track: demoTracks[0],
    },
    recent: demoRecent(),
    isDemo: true,
  };
}
