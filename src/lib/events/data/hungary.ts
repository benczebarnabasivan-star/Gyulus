import type { MusicEvent, Performance, SourceRef, Venue } from '../types';

/**
 * ─────────────────────────────────────────────────────────────────────────
 * VERIFIED HUNGARIAN EVENT DATA
 *
 * Everything in this file was read from a named public source on the date
 * recorded in its `SourceRef`. Nothing here is invented.
 *
 * Two rules this file exists to enforce:
 *   1. No artist appears on a bill unless a source listed them.
 *   2. No start time is written unless a source published a running order.
 *      Hungarian festivals publish their timetables close to the event, so
 *      most acts here have a date but no time — the UI says so rather than
 *      filling the gap.
 *
 * This is a point-in-time snapshot and will go stale. Set SONGKICK_API_KEY to
 * pull live listings instead (see src/lib/events/songkick.ts).
 * ─────────────────────────────────────────────────────────────────────────
 */

const RETRIEVED = '2026-08-10';

const timeOut: SourceRef = {
  label: 'Time Out Hungary',
  url: 'https://www.timeout.com/hu/budapest/hirek/sziget-fesztival-2026-fellepok-koncertkezdesek-jegyek-datumok-es-minden-fontos-info-egy-helyen-080426',
  retrievedAt: RETRIEVED,
  verified: true,
};

const sonline: SourceRef = {
  label: 'Sonline.hu',
  url: 'https://www.sonline.hu/helyi-kozelet/2025/12/strand-fesztival-2026-zamardi',
  retrievedAt: RETRIEVED,
  verified: true,
};

const songkickVenue: SourceRef = {
  label: 'Songkick',
  url: 'https://www.songkick.com/venues/1868123-budapest-park',
  retrievedAt: RETRIEVED,
  verified: true,
};

const helloBalaton: SourceRef = {
  label: 'HelloBalaton',
  url: 'https://hellobalaton.hu/program/plazs-siofok-2026-programok-fellepok/',
  retrievedAt: RETRIEVED,
  verified: true,
};

// ── Venues ───────────────────────────────────────────────────────────────

export const VENUES: Record<string, Venue> = {
  sziget: {
    slug: 'obudai-sziget',
    name: 'Óbudai-sziget',
    city: 'Budapest',
    country: 'Hungary',
    countryCode: 'HU',
    kind: 'festival',
    website: 'https://szigetfestival.com',
    palette: ['#ff2d95', '#ffb020', '#2a0b3f'],
  },
  strand: {
    slug: 'zamardi-szabadstrand',
    name: 'Zamárdi szabadstrand',
    city: 'Zamárdi',
    region: 'Lake Balaton',
    country: 'Hungary',
    countryCode: 'HU',
    kind: 'festival',
    website: 'https://strandfesztival.com',
    palette: ['#22e4ff', '#00e0a4', '#04182b'],
  },
  budapestPark: {
    slug: 'budapest-park',
    name: 'Budapest Park',
    city: 'Budapest',
    country: 'Hungary',
    countryCode: 'HU',
    kind: 'venue',
    website: 'https://www.budapestpark.hu',
    palette: ['#8b5cf6', '#22e4ff', '#120a2e'],
  },
  plazs: {
    slug: 'plazs-siofok',
    name: 'PLÁZS Siófok',
    city: 'Siófok',
    region: 'Lake Balaton',
    country: 'Hungary',
    countryCode: 'HU',
    kind: 'venue',
    website: 'https://plazssiofok.hu',
    palette: ['#ffb020', '#ff6b4a', '#2b0a2e'],
  },
};

// ── Sziget 2026 ──────────────────────────────────────────────────────────
// Day-by-day bill as published by Time Out Hungary. Dates are real; no start
// times were published, so none are recorded.

const SZIGET_BY_DAY: [string, string[]][] = [
  [
    '2026-08-09',
    [
      'Azahriah',
      'Beton.Hofi',
      'Dzsúdló',
      'Koncz Zsuzsa',
      'Presser Gábor',
      'Lovasi András',
      'Halász Judit',
      'Hobo',
      'Carson Coma',
      'Szörényi Levente',
    ],
  ],
  ['2026-08-10', ['Goran Bregović', 'Morcheeba', 'Faithless']],
  [
    '2026-08-11',
    ['Wolf Alice', 'Zara Larsson', 'sombr', 'Underworld', 'Sara Landry', 'Indira Paganotto', 'Trym'],
  ],
  [
    '2026-08-12',
    [
      'Carson Coma',
      'Biffy Clyro',
      'Twenty One Pilots',
      'Natasha Bedingfield',
      'Chet Faker',
      'Ashnikko',
      'Tankcsapda',
      'Kispál és a Borz',
    ],
  ],
  [
    '2026-08-13',
    [
      'Loyle Carner',
      'Lewis Capaldi',
      'Florence + The Machine',
      'Parcels',
      'Dom Dolla',
      'Boys Noize',
      'Dixon',
      'Joris Voorn',
      'Richie Hawtin',
    ],
  ],
  [
    '2026-08-14',
    [
      'Sigrid',
      'Skepta',
      'Bring Me The Horizon',
      'Nia Archives',
      'Peggy Gou',
      'Anfisa Letyago',
      'Pogány Induló',
      'Beton.Hofi',
    ],
  ],
  [
    '2026-08-15',
    [
      'Sisi',
      'bbno$',
      'Jorja Smith',
      'Skrillex',
      'Soulwax',
      '2manydjs',
      'Sub Focus',
      'Dimension',
      'Zomboy',
      'Flux Pavilion',
      'Jessica Audiffred',
      'Quimby',
      'Analog Balaton',
      'Müller Péter Sziámi',
    ],
  ],
];

function performancesFrom(slug: string, byDay: [string, string[]][]): Performance[] {
  return byDay.flatMap(([date, artists]) =>
    artists.map((artist, i) => ({
      id: `${slug}-${date}-${i}`,
      artist,
      date,
    })),
  );
}

// ── Budapest Park ────────────────────────────────────────────────────────
// Individual gigs; one headline act per night.

const BUDAPEST_PARK_NIGHTS: [string, string][] = [
  ['2026-08-14', 'Quixotic'],
  ['2026-08-21', 'Bagossy Brothers Company'],
  ['2026-08-22', 'Bagossy Brothers Company'],
  ['2026-08-27', 'DÁNIELFY'],
  ['2026-08-28', 'Wellhello'],
];

const budapestParkEvents: MusicEvent[] = BUDAPEST_PARK_NIGHTS.map(([date, artist], i) => ({
  slug: `budapest-park-${date}-${i}`,
  name: artist,
  kind: 'venue' as const,
  venue: VENUES.budapestPark,
  startDate: date,
  endDate: date,
  tagline: 'Open-air concert at Budapest Park.',
  genres: ['hungarian', 'pop', 'rock'],
  unscheduled: [],
  performances: [{ id: `bp-${date}-${i}`, artist, date }],
  source: songkickVenue,
  ticketUrl: 'https://www.budapestpark.hu',
}));

// ── Assembled events ─────────────────────────────────────────────────────

export const HUNGARY_EVENTS: MusicEvent[] = [
  {
    slug: 'sziget-2026',
    name: 'Sziget Festival 2026',
    kind: 'festival',
    venue: VENUES.sziget,
    startDate: '2026-08-11',
    endDate: '2026-08-15',
    tagline:
      'The Island of Freedom — Hungary’s largest music and arts festival, in its 32nd edition. Bródy Dalok Napja opens on 9 August and Sziget Icons runs the Zero Day on 10 August.',
    genres: ['pop', 'rock', 'indie', 'electronic', 'techno', 'house', 'hip hop', 'hungarian'],
    unscheduled: [],
    performances: performancesFrom('sziget-2026', SZIGET_BY_DAY),
    source: timeOut,
    ticketUrl: 'https://szigetfestival.com',
  },
  {
    slug: 'strand-2026',
    name: 'STRAND Fesztivál 2026',
    kind: 'festival',
    venue: VENUES.strand,
    startDate: '2026-08-19',
    endDate: '2026-08-22',
    tagline:
      'Four days on the free beach at Zamárdi, with two main stages, Hungarian headliners and Balaton daytime programming.',
    genres: ['pop', 'hungarian', 'electronic', 'drum and bass', 'house'],
    // Announced acts; the day-by-day running order was not published at the
    // time this was recorded.
    unscheduled: [
      'Azahriah',
      'Halott Pénz',
      'Beton.Hofi',
      'Dzsúdló',
      'Valmar',
      'Sigma',
      'Dub FX',
      'Pendulum',
      'Purple Disco Machine',
      'Hybrid Minds',
      'Timmy Trumpet',
    ],
    performances: [],
    source: sonline,
    ticketUrl: 'https://strandfesztival.com',
  },
  {
    slug: 'plazs-siofok-2026',
    name: 'PLÁZS Siófok 2026',
    kind: 'venue',
    venue: VENUES.plazs,
    startDate: '2026-08-10',
    endDate: '2026-08-31',
    tagline:
      'The Balaton summer season on the Siófok beach — Main Stage, Finlandia Stage and the covered Arena, part of MOL Nagyon Balaton.',
    genres: ['hungarian', 'pop', 'rock'],
    unscheduled: [
      'Kökény Attila',
      'L.L.Junior',
      'Bikini',
      'Kowalsky meg a Vega',
      'Carson Coma',
      'Edda',
      'Majka',
      'Rúzsa Magdi',
    ],
    performances: [
      {
        id: 'plazs-2026-08-29-gipsy-kings',
        artist: 'Gipsy Kings by Diego Baliardo',
        date: '2026-08-29',
      },
    ],
    source: helloBalaton,
    ticketUrl: 'https://plazssiofok.hu/programok',
  },
  ...budapestParkEvents,
];
