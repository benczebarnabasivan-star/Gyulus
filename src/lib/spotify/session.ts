import { cache } from 'react';

import { getAccessToken, isDemoSession } from './auth';
import {
  fetchNowPlaying,
  fetchProfile,
  fetchRecentlyPlayed,
  fetchTopArtists,
  fetchTopTracks,
} from './client';
import { demoTasteProfile } from './demo';
import type { TasteProfile, TimeRange } from './types';

/**
 * Resolves the current listener, from either a real Spotify session or the
 * built-in sample listener. Returns null when nobody is connected.
 *
 * Wrapped in React's `cache` so a single render pass hits Spotify once even
 * though several components ask for the taste profile.
 */
export const getTasteProfile = cache(
  async (range: TimeRange = 'medium_term'): Promise<TasteProfile | null> => {
    if (await isDemoSession()) return demoTasteProfile(range);

    const token = await getAccessToken();
    if (!token) return null;

    try {
      // Profile first: it is the cheapest way to learn the token is dead.
      const profile = await fetchProfile(token);

      const [topArtists, topTracks, nowPlaying, recent] = await Promise.all([
        fetchTopArtists(token, range, 50),
        fetchTopTracks(token, range, 20),
        fetchNowPlaying(token).catch(() => null),
        fetchRecentlyPlayed(token, 20).catch(() => []),
      ]);

      return { profile, topArtists, topTracks, nowPlaying, recent, isDemo: false };
    } catch {
      // Revoked scope, expired refresh, Spotify outage — treat as signed out
      // rather than crashing the page.
      return null;
    }
  },
);
