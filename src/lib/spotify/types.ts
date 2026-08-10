export type SpotifyImage = {
  url: string;
  width: number | null;
  height: number | null;
};

export type SpotifyProfile = {
  id: string;
  displayName: string;
  image: string | null;
  country: string | null;
  product: string | null;
};

export type SpotifyArtist = {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  image: string | null;
  url: string;
};

export type SpotifyTrack = {
  id: string;
  name: string;
  artists: string[];
  album: string;
  image: string | null;
  url: string;
  durationMs: number;
};

export type NowPlaying = {
  isPlaying: boolean;
  track: SpotifyTrack;
  progressMs: number;
};

export type RecentPlay = {
  track: SpotifyTrack;
  playedAt: string;
};

/** Everything the recommendation engine and dashboard need about a listener. */
export type TasteProfile = {
  profile: SpotifyProfile;
  topArtists: SpotifyArtist[];
  topTracks: SpotifyTrack[];
  nowPlaying: NowPlaying | null;
  recent: RecentPlay[];
  /** True when the data is the built-in sample listener, not a real account. */
  isDemo: boolean;
};

export type TimeRange = 'short_term' | 'medium_term' | 'long_term';

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  short_term: 'Last 4 weeks',
  medium_term: 'Last 6 months',
  long_term: 'All time',
};
