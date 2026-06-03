import type { Milestone, Poll } from '@/types';

// ---------------------------------------------------------------------------
// Timeline of the creator's journey. Dates/labels are illustrative milestones
// curated for the fan site narrative rather than officially documented events.
// ---------------------------------------------------------------------------
export const milestones: Milestone[] = [
  {
    id: 'm-001',
    date: '2024-03-01',
    title: 'Az első videók',
    description:
      'Vadász Gyula elindítja a TikTok csatornáját Nagyrábéról — mindennapi pillanatok, őszinte humor.',
    emoji: '🎬',
  },
  {
    id: 'm-002',
    date: '2024-07-15',
    title: 'Az első virális klip',
    description:
      'Egy hétköznapi pillanatból országos kedvenc lesz — beindul a közösség.',
    emoji: '🚀',
  },
  {
    id: 'm-003',
    date: '2025-01-10',
    title: '#vadaszgyula trend',
    description:
      'A rajongók saját hashtaget indítanak; a videók megtekintései milliós nagyságrendűek lesznek.',
    emoji: '🔥',
  },
  {
    id: 'm-004',
    date: '2025-09-20',
    title: 'A közösség ereje',
    description:
      'Hűséges rajongótábor épül, akik napról napra várják az új tartalmakat.',
    emoji: '❤️',
  },
  {
    id: 'm-005',
    date: '2026-04-25',
    title: 'Sárrét Íze Fesztivál',
    description:
      'Helyszíni videósorozat a fesztiválról — több részes, nagy sikerű tartalom.',
    emoji: '🎪',
  },
];

// ---------------------------------------------------------------------------
// Community polls (seed). In production these are backed by the polls + votes
// tables; here they provide a working interactive demo.
// ---------------------------------------------------------------------------
export const polls: Poll[] = [
  {
    id: 'poll-001',
    question: 'Melyik a kedvenc tartalomtípusod?',
    options: [
      { id: 'o1', label: 'Mindennapok 🌅', votes: 142 },
      { id: 'o2', label: 'Rage pillanatok 😤', votes: 318 },
      { id: 'o3', label: 'Kutyák & állatok 🐕', votes: 274 },
      { id: 'o4', label: 'Főzés 🍲', votes: 96 },
    ],
  },
  {
    id: 'poll-002',
    question: 'Melyik fesztiválos rész tetszett jobban?',
    options: [
      { id: 'a1', label: '1. rész 🎪', votes: 187 },
      { id: 'a2', label: '2. rész 🤠', votes: 231 },
    ],
  },
];
