import type {
  NowPlaying,
  RecentPlay,
  SpotifyArtist,
  SpotifyImage,
  SpotifyProfile,
  SpotifyTrack,
  TimeRange,
} from './types';

const API = 'https://api.spotify.com/v1';

class SpotifyError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'SpotifyError';
  }
}

async function call<T>(path: string, token: string): Promise<T | null> {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  // 204 = nothing playing; 404 = no active device. Both are normal, not failures.
  if (res.status === 204 || res.status === 404) return null;
  if (!res.ok) {
    throw new SpotifyError(`Spotify ${path} failed with ${res.status}`, res.status);
  }
  return (await res.json()) as T;
}

function pickImage(images: SpotifyImage[] | undefined): string | null {
  if (!images?.length) return null;
  return images[0]?.url ?? null;
}

type RawArtist = {
  id: string;
  name: string;
  genres?: string[];
  popularity?: number;
  images?: SpotifyImage[];
  external_urls?: { spotify?: string };
};

type RawTrack = {
  id: string;
  name: string;
  duration_ms: number;
  artists: { name: string }[];
  album: { name: string; images?: SpotifyImage[] };
  external_urls?: { spotify?: string };
};

function mapArtist(a: RawArtist): SpotifyArtist {
  return {
    id: a.id,
    name: a.name,
    genres: a.genres ?? [],
    popularity: a.popularity ?? 0,
    image: pickImage(a.images),
    url: a.external_urls?.spotify ?? `https://open.spotify.com/artist/${a.id}`,
  };
}

function mapTrack(t: RawTrack): SpotifyTrack {
  return {
    id: t.id,
    name: t.name,
    artists: t.artists.map((x) => x.name),
    album: t.album?.name ?? '',
    image: pickImage(t.album?.images),
    url: t.external_urls?.spotify ?? `https://open.spotify.com/track/${t.id}`,
    durationMs: t.duration_ms,
  };
}

export async function fetchProfile(token: string): Promise<SpotifyProfile> {
  const raw = await call<{
    id: string;
    display_name: string | null;
    images?: SpotifyImage[];
    country?: string;
    product?: string;
  }>('/me', token);

  if (!raw) throw new SpotifyError('Profile unavailable', 500);

  return {
    id: raw.id,
    displayName: raw.display_name ?? 'Listener',
    image: pickImage(raw.images),
    country: raw.country ?? null,
    product: raw.product ?? null,
  };
}

export async function fetchTopArtists(
  token: string,
  range: TimeRange = 'medium_term',
  limit = 50,
): Promise<SpotifyArtist[]> {
  const raw = await call<{ items: RawArtist[] }>(
    `/me/top/artists?time_range=${range}&limit=${limit}`,
    token,
  );
  return (raw?.items ?? []).map(mapArtist);
}

export async function fetchTopTracks(
  token: string,
  range: TimeRange = 'medium_term',
  limit = 20,
): Promise<SpotifyTrack[]> {
  const raw = await call<{ items: RawTrack[] }>(
    `/me/top/tracks?time_range=${range}&limit=${limit}`,
    token,
  );
  return (raw?.items ?? []).map(mapTrack);
}

export async function fetchNowPlaying(token: string): Promise<NowPlaying | null> {
  const raw = await call<{
    is_playing: boolean;
    progress_ms: number | null;
    item: RawTrack | null;
  }>('/me/player/currently-playing', token);

  if (!raw?.item) return null;
  return {
    isPlaying: raw.is_playing,
    progressMs: raw.progress_ms ?? 0,
    track: mapTrack(raw.item),
  };
}

export async function fetchRecentlyPlayed(token: string, limit = 20): Promise<RecentPlay[]> {
  const raw = await call<{ items: { track: RawTrack; played_at: string }[] }>(
    `/me/player/recently-played?limit=${limit}`,
    token,
  );
  return (raw?.items ?? []).map((i) => ({ track: mapTrack(i.track), playedAt: i.played_at }));
}
