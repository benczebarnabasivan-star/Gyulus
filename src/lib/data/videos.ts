import type { Video } from '@/types';

// ---------------------------------------------------------------------------
// Curated SEED dataset.
//
// This is illustrative sample content used so the site is fully functional
// out of the box without scraping. Captions are representative of the
// creator's themes (festivals, dogs, everyday life); statistics are sample
// numbers, NOT verified live metrics. When TIKTOK_DATA_SOURCE is set to a
// live adapter, these are replaced by real fetched data.
//
// Thumbnails use the picsum.photos placeholder service (configured in
// next.config.mjs) rather than re-hosting TikTok media.
// ---------------------------------------------------------------------------

function thumb(seed: string): string {
  return `https://picsum.photos/seed/${seed}/720/1280`;
}

const RAW: Omit<Video, 'slug'>[] = [
  {
    id: 'vg-001',
    tiktokId: '7352109254586764576',
    url: 'https://www.tiktok.com/@vadasz_gyula/video/7352109254586764576',
    caption: 'Sárrét Íze Fesztivál — 2. rész 🤠 Ma is megy a móka!',
    thumbnailUrl: thumb('gyula-festival-2'),
    uploadedAt: '2026-05-21T16:57:00.000Z',
    durationSec: 48,
    stats: { views: 184200, likes: 315, comments: 42, shares: 29 },
    keywords: ['fesztivál', 'sárrét', 'móka', 'kalap'],
    categories: ['Fesztivál', 'Mindennapok'],
    funny: true,
    featured: true,
  },
  {
    id: 'vg-002',
    tiktokId: '7351008143475662111',
    url: 'https://www.tiktok.com/@vadasz_gyula/video/7351008143475662111',
    caption: 'Reggeli kávé és a kutyák — kezdődik a nap Nagyrábén ☕🐕',
    thumbnailUrl: thumb('gyula-coffee-dogs'),
    uploadedAt: '2026-05-19T07:12:00.000Z',
    durationSec: 35,
    stats: { views: 96400, likes: 271, comments: 31, shares: 12 },
    keywords: ['kávé', 'kutyák', 'reggel', 'nagyrábé'],
    categories: ['Kutyák', 'Mindennapok'],
    funny: false,
    featured: false,
  },
  {
    id: 'vg-003',
    tiktokId: '7350771009912340999',
    url: 'https://www.tiktok.com/@vadasz_gyula/video/7350771009912340999',
    caption: 'Amikor nem indul a fűnyíró... 😤 Mérgemben elmondtam a magamét!',
    thumbnailUrl: thumb('gyula-mower-rage'),
    uploadedAt: '2026-05-15T11:40:00.000Z',
    durationSec: 52,
    stats: { views: 412800, likes: 904, comments: 188, shares: 76 },
    keywords: ['fűnyíró', 'rage', 'kert', 'mérges'],
    categories: ['Rage', 'Mindennapok'],
    funny: true,
    featured: true,
  },
  {
    id: 'vg-004',
    tiktokId: '7349550021778881234',
    url: 'https://www.tiktok.com/@vadasz_gyula/video/7349550021778881234',
    caption: 'Pörkölt készül a bográcsban 🍲 A titkos hozzávaló: türelem!',
    thumbnailUrl: thumb('gyula-stew'),
    uploadedAt: '2026-05-10T15:05:00.000Z',
    durationSec: 61,
    stats: { views: 158900, likes: 488, comments: 64, shares: 40 },
    keywords: ['pörkölt', 'bogrács', 'főzés', 'recept'],
    categories: ['Főzés', 'Mindennapok'],
    funny: false,
    featured: false,
  },
  {
    id: 'vg-005',
    tiktokId: '7348221005512347777',
    url: 'https://www.tiktok.com/@vadasz_gyula/video/7348221005512347777',
    caption: 'A szomszéd macskája megint a kerítésen 😼 Na ide hallgass!',
    thumbnailUrl: thumb('gyula-cat-fence'),
    uploadedAt: '2026-05-05T18:22:00.000Z',
    durationSec: 27,
    stats: { views: 233100, likes: 712, comments: 95, shares: 58 },
    keywords: ['macska', 'szomszéd', 'kerítés', 'vicces'],
    categories: ['Állatok', 'Mindennapok'],
    funny: true,
    featured: false,
  },
  {
    id: 'vg-006',
    tiktokId: '7347110982234561000',
    url: 'https://www.tiktok.com/@vadasz_gyula/video/7347110982234561000',
    caption: 'Tavaszi nagytakarítás az udvaron 🧹 Lássuk, ki bírja tovább!',
    thumbnailUrl: thumb('gyula-cleaning'),
    uploadedAt: '2026-04-28T09:18:00.000Z',
    durationSec: 44,
    stats: { views: 74300, likes: 203, comments: 18, shares: 9 },
    keywords: ['takarítás', 'udvar', 'tavasz'],
    categories: ['Mindennapok'],
    funny: false,
    featured: false,
  },
  {
    id: 'vg-007',
    tiktokId: '7346002551122348888',
    url: 'https://www.tiktok.com/@vadasz_gyula/video/7346002551122348888',
    caption: 'Sárrét Íze Fesztivál — 1. rész 🎪 Megérkeztünk, és milyen hangulat!',
    thumbnailUrl: thumb('gyula-festival-1'),
    uploadedAt: '2026-04-25T13:30:00.000Z',
    durationSec: 39,
    stats: { views: 201500, likes: 598, comments: 73, shares: 51 },
    keywords: ['fesztivál', 'sárrét', 'hangulat'],
    categories: ['Fesztivál'],
    funny: true,
    featured: true,
  },
  {
    id: 'vg-008',
    tiktokId: '7344889120033347654',
    url: 'https://www.tiktok.com/@vadasz_gyula/video/7344889120033347654',
    caption: 'Esőben is megy a munka 🌧️ Az igazi gazdát nem állítja meg semmi!',
    thumbnailUrl: thumb('gyula-rain-work'),
    uploadedAt: '2026-04-18T08:00:00.000Z',
    durationSec: 33,
    stats: { views: 88700, likes: 256, comments: 22, shares: 14 },
    keywords: ['eső', 'munka', 'gazda', 'kitartás'],
    categories: ['Mindennapok'],
    funny: false,
    featured: false,
  },
  {
    id: 'vg-009',
    tiktokId: '7343770098712346543',
    url: 'https://www.tiktok.com/@vadasz_gyula/video/7343770098712346543',
    caption: 'Amikor a telefon megint nem akar working 📵 Modern technika, mi?',
    thumbnailUrl: thumb('gyula-phone-tech'),
    uploadedAt: '2026-04-12T19:45:00.000Z',
    durationSec: 41,
    stats: { views: 305600, likes: 1023, comments: 210, shares: 132 },
    keywords: ['telefon', 'technika', 'vicces', 'rage'],
    categories: ['Rage', 'Mindennapok'],
    funny: true,
    featured: true,
  },
  {
    id: 'vg-010',
    tiktokId: '7342661070912345432',
    url: 'https://www.tiktok.com/@vadasz_gyula/video/7342661070912345432',
    caption: 'Köszönöm a sok támogatást! ❤️ Nélkületek ez nem menne!',
    thumbnailUrl: thumb('gyula-thanks'),
    uploadedAt: '2026-04-06T20:10:00.000Z',
    durationSec: 58,
    stats: { views: 142000, likes: 821, comments: 156, shares: 47 },
    keywords: ['köszönöm', 'támogatás', 'közösség'],
    categories: ['Közösség'],
    funny: false,
    featured: false,
  },
  {
    id: 'vg-011',
    tiktokId: '7341552043312344321',
    url: 'https://www.tiktok.com/@vadasz_gyula/video/7341552043312344321',
    caption: 'Grillezés a haverokkal 🔥 Na ki kéri átsütve?',
    thumbnailUrl: thumb('gyula-grill'),
    uploadedAt: '2026-03-30T17:25:00.000Z',
    durationSec: 46,
    stats: { views: 119800, likes: 365, comments: 38, shares: 21 },
    keywords: ['grill', 'haverok', 'hús', 'főzés'],
    categories: ['Főzés', 'Közösség'],
    funny: false,
    featured: false,
  },
  {
    id: 'vg-012',
    tiktokId: '7340443016712343210',
    url: 'https://www.tiktok.com/@vadasz_gyula/video/7340443016712343210',
    caption: 'A kutyám ellopta a papucsom 🩴🐶 Most akkor ki a gazda?!',
    thumbnailUrl: thumb('gyula-slipper-dog'),
    uploadedAt: '2026-03-22T10:50:00.000Z',
    durationSec: 24,
    stats: { views: 521400, likes: 1487, comments: 264, shares: 198 },
    keywords: ['kutya', 'papucs', 'vicces', 'virális'],
    categories: ['Kutyák', 'Állatok'],
    funny: true,
    featured: true,
  },
];

/** Build a URL-safe slug from a Hungarian caption. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export const seedVideos: Video[] = RAW.map((v) => ({
  ...v,
  slug: `${slugify(v.caption)}-${v.id}`,
}));
