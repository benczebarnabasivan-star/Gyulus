import type { SpotifyArtist, TasteProfile } from '@/lib/spotify/types';

import { billFor, slotMinutes, type MusicEvent, type Performance } from './types';

/** Lowercase, strip diacritics and punctuation so "Beton.Hofi" === "beton hofi". */
export function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

export type MatchedAct = {
  artist: SpotifyArtist;
  /** 1-based position in the listener's top artists. */
  rank: number;
  /** Dated appearances. Empty when the act is announced but unscheduled. */
  performances: Performance[];
};

export type EventMatch = {
  event: MusicEvent;
  score: number;
  acts: MatchedAct[];
  genreOverlap: string[];
  reason: string;
};

/** Top-of-list artists count for much more than the tail. */
function rankWeight(rank: number): number {
  return Math.exp(-(rank - 1) / 18);
}

function genresRelated(a: string, b: string): boolean {
  const x = a.toLowerCase();
  const y = b.toLowerCase();
  return x === y || x.includes(y) || y.includes(x);
}

function listNames(names: string[], max = 3): string {
  const head = names.slice(0, max);
  if (names.length <= max) {
    return head.length > 1 ? `${head.slice(0, -1).join(', ')} and ${head.at(-1)}` : head[0];
  }
  return `${head.join(', ')} +${names.length - max} more`;
}

export function matchEvent(event: MusicEvent, taste: TasteProfile): EventMatch {
  const byName = new Map<string, { artist: SpotifyArtist; rank: number }>();
  taste.topArtists.forEach((artist, i) => {
    byName.set(normalizeName(artist.name), { artist, rank: i + 1 });
  });

  const found = new Map<string, MatchedAct>();
  for (const name of billFor(event)) {
    const hit = byName.get(normalizeName(name));
    if (!hit) continue;

    const performances = event.performances.filter(
      (p) => normalizeName(p.artist) === normalizeName(name),
    );
    found.set(hit.artist.id, { artist: hit.artist, rank: hit.rank, performances });
  }

  const acts = [...found.values()].sort((a, b) => a.rank - b.rank);

  // Share of the listener's total rank-weighted listening that is on this bill.
  const totalPossible =
    taste.topArtists.reduce((sum, _artist, i) => sum + rankWeight(i + 1), 0) || 1;
  const captured = acts.reduce((sum, act) => sum + rankWeight(act.rank), 0);
  const artistScore = Math.min(1, captured / totalPossible);

  // Genre affinity, weighted by how high each artist ranks for the listener.
  const genreWeights = new Map<string, number>();
  taste.topArtists.forEach((artist, i) => {
    for (const genre of artist.genres) {
      genreWeights.set(genre, (genreWeights.get(genre) ?? 0) + rankWeight(i + 1));
    }
  });
  const totalGenreWeight = [...genreWeights.values()].reduce((a, b) => a + b, 0) || 1;
  const overlapTags = new Set<string>();
  let matchedWeight = 0;
  for (const [genre, weight] of genreWeights) {
    const hit = event.genres.find((g) => genresRelated(g, genre));
    if (!hit) continue;
    matchedWeight += weight;
    overlapTags.add(hit);
  }
  const genreScore = Math.min(1, matchedWeight / totalGenreWeight);

  const score = Math.round(100 * (0.72 * artistScore + 0.28 * genreScore));

  const reason = acts.length
    ? `${acts.length} of your artists on the bill — ${listNames(acts.map((a) => a.artist.name))}`
    : overlapTags.size
      ? `No direct matches, but it leans ${[...overlapTags].slice(0, 2).join(' and ')}`
      : 'Outside your usual listening';

  return { event, score, acts, genreOverlap: [...overlapTags], reason };
}

export function rankEvents(events: MusicEvent[], taste: TasteProfile): EventMatch[] {
  return events
    .map((event) => matchEvent(event, taste))
    .sort((a, b) => b.score - a.score || a.event.startDate.localeCompare(b.event.startDate));
}

export type UpcomingAppearance = {
  event: MusicEvent;
  artist: SpotifyArtist;
  rank: number;
  performance: Performance;
};

/** Every dated appearance by one of your artists, chronologically. */
export function upcomingAppearances(matches: EventMatch[], limit = 12): UpcomingAppearance[] {
  const rows: UpcomingAppearance[] = [];
  for (const match of matches) {
    for (const act of match.acts) {
      for (const performance of act.performances) {
        rows.push({ event: match.event, artist: act.artist, rank: act.rank, performance });
      }
    }
  }

  return rows
    .sort((a, b) => {
      const byDate = a.performance.date.localeCompare(b.performance.date);
      if (byDate !== 0) return byDate;
      // Undated-within-day entries sort last.
      const at = a.performance.start ? slotMinutes(a.performance.start) : Number.MAX_SAFE_INTEGER;
      const bt = b.performance.start ? slotMinutes(b.performance.start) : Number.MAX_SAFE_INTEGER;
      return at - bt;
    })
    .slice(0, limit);
}
