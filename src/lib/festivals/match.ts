import type { SpotifyArtist, TasteProfile } from '@/lib/spotify/types';

import type { Festival, SetSlot } from './types';
import { slotMinutes } from './types';

/** Lowercase, strip diacritics and punctuation so "Fred again.." === "fred again". */
export function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

export type MatchedSet = {
  slot: SetSlot;
  date: string;
  /** Overlaps another matched set of yours on the same day. */
  clash: boolean;
  /** Which of your other artists this set runs into. */
  clashesWith: string[];
};

export type ArtistMatch = {
  artist: SpotifyArtist;
  /** 1-based position in the listener's top artists. */
  rank: number;
  sets: MatchedSet[];
};

export type FestivalMatch = {
  festival: Festival;
  /** 0–100 fit score. */
  score: number;
  artists: ArtistMatch[];
  genreOverlap: string[];
  reason: string;
  /** The day with the most of your artists on it. */
  bestDay: { date: string; count: number } | null;
  /** Number of overlapping pairs, not the number of affected sets. */
  clashPairs: number;
};

const BILLING_WEIGHT = { headliner: 1.3, major: 1.0, support: 0.82 } as const;

/** Top-of-list artists count for much more than the tail. */
function rankWeight(rank: number): number {
  return Math.exp(-(rank - 1) / 18);
}

/** Genre tags are messy ("belgian techno" vs "techno"), so match loosely. */
function genresRelated(a: string, b: string): boolean {
  const x = a.toLowerCase();
  const y = b.toLowerCase();
  return x === y || x.includes(y) || y.includes(x);
}

function buildGenreWeights(artists: SpotifyArtist[]): Map<string, number> {
  const weights = new Map<string, number>();
  artists.forEach((artist, i) => {
    const w = rankWeight(i + 1);
    for (const genre of artist.genres) {
      weights.set(genre, (weights.get(genre) ?? 0) + w);
    }
  });
  return weights;
}

function overlaps(a: SetSlot, b: SetSlot): boolean {
  return slotMinutes(a.start) < slotMinutes(b.end) && slotMinutes(b.start) < slotMinutes(a.end);
}

function listNames(names: string[], max = 3): string {
  const head = names.slice(0, max);
  if (names.length <= max) {
    return head.length > 1 ? `${head.slice(0, -1).join(', ')} and ${head.at(-1)}` : head[0];
  }
  return `${head.join(', ')} +${names.length - max} more`;
}

export function matchFestival(festival: Festival, taste: TasteProfile): FestivalMatch {
  const byName = new Map<string, { artist: SpotifyArtist; rank: number }>();
  taste.topArtists.forEach((artist, i) => {
    byName.set(normalizeName(artist.name), { artist, rank: i + 1 });
  });

  // Collect every set played by an artist in the listener's top list.
  const found = new Map<string, ArtistMatch>();
  for (const day of festival.days) {
    for (const slot of day.slots) {
      const hit = byName.get(normalizeName(slot.artist));
      if (!hit) continue;

      const existing = found.get(hit.artist.id);
      const entry: MatchedSet = { slot, date: day.date, clash: false, clashesWith: [] };
      if (existing) existing.sets.push(entry);
      else found.set(hit.artist.id, { artist: hit.artist, rank: hit.rank, sets: [entry] });
    }
  }

  const artists = [...found.values()].sort((a, b) => a.rank - b.rank);

  // Flag time collisions between two of your own sets on the same day, and
  // record who each one runs into — "clash" alone is not actionable.
  const allSets = artists.flatMap((a) => a.sets);
  let clashPairs = 0;
  for (let i = 0; i < allSets.length; i += 1) {
    for (let j = i + 1; j < allSets.length; j += 1) {
      if (allSets[i].date !== allSets[j].date) continue;
      if (!overlaps(allSets[i].slot, allSets[j].slot)) continue;
      allSets[i].clash = true;
      allSets[j].clash = true;
      allSets[i].clashesWith.push(allSets[j].slot.artist);
      allSets[j].clashesWith.push(allSets[i].slot.artist);
      clashPairs += 1;
    }
  }

  // Artist component: what share of your total listening weight is on this
  // bill. Expressing it as coverage rather than an unbounded sum keeps the
  // scale meaningful — a lineup with your top 3 scores far below one with your
  // top 20, instead of both pinning at the ceiling.
  const totalPossible =
    taste.topArtists.reduce((sum, _artist, i) => sum + rankWeight(i + 1), 0) || 1;
  const captured = artists.reduce((sum, m) => {
    const best = Math.max(...m.sets.map((s) => BILLING_WEIGHT[s.slot.billing]));
    return sum + rankWeight(m.rank) * best;
  }, 0);
  const artistScore = Math.min(1, captured / totalPossible);

  // Genre component: how much of your listening weight this festival covers.
  const genreWeights = buildGenreWeights(taste.topArtists);
  const totalWeight = [...genreWeights.values()].reduce((a, b) => a + b, 0) || 1;
  const overlapTags = new Set<string>();
  let matchedWeight = 0;
  for (const [genre, weight] of genreWeights) {
    const hit = festival.genres.find((g) => genresRelated(g, genre));
    if (!hit) continue;
    matchedWeight += weight;
    overlapTags.add(hit);
  }
  const genreScore = Math.min(1, matchedWeight / totalWeight);

  const score = Math.round(100 * (0.72 * artistScore + 0.28 * genreScore));

  // Which day has the most of your artists?
  const perDay = new Map<string, number>();
  for (const set of allSets) perDay.set(set.date, (perDay.get(set.date) ?? 0) + 1);
  const bestDayEntry = [...perDay.entries()].sort((a, b) => b[1] - a[1])[0];
  const bestDay = bestDayEntry ? { date: bestDayEntry[0], count: bestDayEntry[1] } : null;

  const reason = artists.length
    ? `${artists.length} of your artists on the bill — ${listNames(artists.map((a) => a.artist.name))}`
    : overlapTags.size
      ? `No direct matches, but it leans ${[...overlapTags].slice(0, 2).join(' and ')}`
      : 'Outside your usual listening';

  return {
    festival,
    score,
    artists,
    genreOverlap: [...overlapTags],
    reason,
    bestDay,
    clashPairs,
  };
}

export function rankFestivals(festivals: Festival[], taste: TasteProfile): FestivalMatch[] {
  return festivals
    .map((f) => matchFestival(f, taste))
    .sort((a, b) => b.score - a.score || a.festival.startDate.localeCompare(b.festival.startDate));
}

/**
 * Every upcoming set by one of your artists, across all festivals, in
 * chronological order. This is the "when is my favourite act actually on?" feed.
 */
export type UpcomingSet = {
  festival: Festival;
  artist: SpotifyArtist;
  rank: number;
  slot: SetSlot;
  date: string;
};

export function upcomingSetsFor(matches: FestivalMatch[], limit = 12): UpcomingSet[] {
  const rows: UpcomingSet[] = [];
  for (const match of matches) {
    for (const artistMatch of match.artists) {
      for (const set of artistMatch.sets) {
        rows.push({
          festival: match.festival,
          artist: artistMatch.artist,
          rank: artistMatch.rank,
          slot: set.slot,
          date: set.date,
        });
      }
    }
  }
  return rows
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) || slotMinutes(a.slot.start) - slotMinutes(b.slot.start),
    )
    .slice(0, limit);
}
