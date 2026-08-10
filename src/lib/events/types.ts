/**
 * Where a listing came from. Every event carries one, and the UI renders it, so
 * a reader can always tell verified data from illustrative filler.
 */
export type SourceRef = {
  /** Human-readable origin, e.g. "Time Out Hungary" or "Songkick". */
  label: string;
  url?: string;
  /** ISO date the data was read. */
  retrievedAt?: string;
  /** false means illustrative sample data that must be labelled as such. */
  verified: boolean;
};

export type VenueKind = 'festival' | 'venue';

export type Venue = {
  slug: string;
  name: string;
  city: string;
  /** Broader area, e.g. "Lake Balaton". */
  region?: string;
  country: string;
  countryCode: string;
  kind: VenueKind;
  website: string;
  /** Three hex stops driving the generated artwork. */
  palette: [string, string, string];
};

/**
 * One artist on one date. `start` is present only when a running order has
 * actually been published — it is never guessed.
 */
export type Performance = {
  id: string;
  artist: string;
  /** ISO date, e.g. "2026-08-14". */
  date: string;
  stage?: string;
  start?: string;
  end?: string;
};

export type MusicEvent = {
  slug: string;
  /** Festival name, or the headline artist for a single gig. */
  name: string;
  kind: VenueKind;
  venue: Venue;
  startDate: string;
  endDate: string;
  tagline?: string;
  genres: string[];
  /**
   * Announced acts with no scheduled date yet. Acts that do have a date live
   * in `performances` instead — the two together are the full bill.
   */
  unscheduled: string[];
  performances: Performance[];
  source: SourceRef;
  ticketUrl?: string;
  priceFrom?: number;
  currency?: 'EUR' | 'HUF';
};

export const CURRENCY_SYMBOL: Record<NonNullable<MusicEvent['currency']>, string> = {
  EUR: '€',
  HUF: 'Ft',
};

/** Every artist on the bill, scheduled or not. */
export function billFor(event: MusicEvent): string[] {
  return [...new Set([...event.performances.map((p) => p.artist), ...event.unscheduled])];
}

/** True when at least one act has a published start time. */
export function hasSetTimes(event: MusicEvent): boolean {
  return event.performances.some((p) => Boolean(p.start));
}

/** True when acts are at least assigned to specific days. */
export function hasDayByDay(event: MusicEvent): boolean {
  return event.performances.length > 0;
}

/**
 * Minutes from the start of the festival day, where anything before 06:00 is
 * treated as belonging to the previous night.
 */
export function slotMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  const raw = h * 60 + m;
  return h < 6 ? raw + 24 * 60 : raw;
}

/** Distinct dates covered by an event's scheduled performances. */
export function eventDates(event: MusicEvent): string[] {
  return [...new Set(event.performances.map((p) => p.date))].sort();
}
