export type Billing = 'headliner' | 'major' | 'support';

export type SetSlot = {
  id: string;
  artist: string;
  stage: string;
  /** Wall-clock start, "HH:MM" on the festival day. */
  start: string;
  /** Wall-clock end, "HH:MM". May be past midnight — see `slotMinutes`. */
  end: string;
  billing: Billing;
};

export type FestivalDay = {
  /** ISO date, e.g. "2026-08-13". */
  date: string;
  slots: SetSlot[];
};

export type Festival = {
  slug: string;
  name: string;
  tagline: string;
  city: string;
  country: string;
  countryCode: string;
  startDate: string;
  endDate: string;
  /** Broad genre tags used for taste matching when no artist matches directly. */
  genres: string[];
  /** Three hex stops driving the festival's generated artwork. */
  palette: [string, string, string];
  priceFrom: number;
  currency: 'EUR' | 'GBP' | 'USD' | 'HUF';
  website: string;
  stages: string[];
  days: FestivalDay[];
};

/**
 * Minutes from the start of the festival day, where anything before 06:00 is
 * treated as belonging to the previous night. A set from 23:30 to 01:00 is
 * therefore a continuous block rather than one that wraps to the start.
 */
export function slotMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  const raw = h * 60 + m;
  return h < 6 ? raw + 24 * 60 : raw;
}

export function slotDurationMinutes(slot: SetSlot): number {
  return Math.max(15, slotMinutes(slot.end) - slotMinutes(slot.start));
}

export const CURRENCY_SYMBOL: Record<Festival['currency'], string> = {
  EUR: '€',
  GBP: '£',
  USD: '$',
  HUF: 'Ft',
};
