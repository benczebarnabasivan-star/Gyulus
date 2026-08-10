import { normalizeName } from './match';
import type { Festival } from './types';

export type FestivalFilters = {
  /** Free text across festival name, city, country and lineup artists. */
  q?: string;
  genre?: string;
  country?: string;
  /** Month as "YYYY-MM". */
  month?: string;
};

/** Every genre tag in the dataset, most common first. */
export function collectGenres(festivals: Festival[]): string[] {
  const counts = new Map<string, number>();
  for (const festival of festivals) {
    for (const genre of festival.genres) {
      counts.set(genre, (counts.get(genre) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([g]) => g);
}

export function collectCountries(festivals: Festival[]): string[] {
  return [...new Set(festivals.map((f) => f.country))].sort((a, b) => a.localeCompare(b));
}

/** Months that actually contain a festival, chronologically. */
export function collectMonths(festivals: Festival[]): { value: string; label: string }[] {
  const months = new Set<string>();
  for (const festival of festivals) months.add(festival.startDate.slice(0, 7));

  return [...months]
    .sort()
    .map((value) => ({
      value,
      label: new Date(`${value}-01T00:00:00Z`).toLocaleDateString('en-GB', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }),
    }));
}

function matchesQuery(festival: Festival, query: string): boolean {
  const needle = normalizeName(query);
  if (!needle) return true;

  const haystacks = [festival.name, festival.city, festival.country, festival.tagline];
  if (haystacks.some((text) => normalizeName(text).includes(needle))) return true;

  // Also search the bill, so "peggy gou" finds every festival she plays.
  return festival.days.some((day) =>
    day.slots.some((slot) => normalizeName(slot.artist).includes(needle)),
  );
}

export function filterFestivals(festivals: Festival[], filters: FestivalFilters): Festival[] {
  return festivals.filter((festival) => {
    if (filters.genre && !festival.genres.includes(filters.genre)) return false;
    if (filters.country && festival.country !== filters.country) return false;
    if (filters.month && !festival.startDate.startsWith(filters.month)) return false;
    if (filters.q && !matchesQuery(festival, filters.q)) return false;
    return true;
  });
}

/** Builds a querystring for a filter link, dropping empty values. */
export function filterHref(base: string, filters: FestivalFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

export function hasActiveFilters(filters: FestivalFilters): boolean {
  return Boolean(filters.q || filters.genre || filters.country || filters.month);
}
