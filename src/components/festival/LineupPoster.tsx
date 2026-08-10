import type { Festival } from '@/lib/festivals/types';
import { cn } from '@/lib/utils';

type Props = {
  festival: Festival;
  /** Artist names (as they appear on the bill) in the listener's top artists. */
  mine: Set<string>;
};

const SIZES = {
  headliner: 'text-2xl sm:text-4xl font-semibold',
  major: 'text-lg sm:text-2xl font-medium',
  support: 'text-sm sm:text-base font-normal text-white/60',
} as const;

const ORDER = { headliner: 0, major: 1, support: 2 } as const;

/**
 * Classic festival-poster typography: billing drives type size, and anything
 * the listener already plays is picked out in green.
 */
export function LineupPoster({ festival, mine }: Props) {
  const byArtist = new Map<string, (typeof ORDER)[keyof typeof ORDER]>();
  for (const day of festival.days) {
    for (const slot of day.slots) {
      const rank = ORDER[slot.billing];
      const existing = byArtist.get(slot.artist);
      if (existing === undefined || rank < existing) byArtist.set(slot.artist, rank);
    }
  }

  const artists = [...byArtist.entries()].sort(
    (a, b) => a[1] - b[1] || a[0].localeCompare(b[0]),
  );

  const tierFor = (rank: number): keyof typeof SIZES =>
    rank === 0 ? 'headliner' : rank === 1 ? 'major' : 'support';

  return (
    <div className="flex flex-wrap items-baseline justify-center gap-x-5 gap-y-2.5 text-center">
      {artists.map(([artist, rank], i) => {
        const isMine = mine.has(artist);
        return (
          <span key={artist} className="inline-flex items-baseline gap-5">
            <span
              className={cn(
                'display uppercase leading-none tracking-tight transition',
                SIZES[tierFor(rank)],
                isMine && 'text-spot',
              )}
            >
              {artist}
            </span>
            {i < artists.length - 1 && (
              <span aria-hidden className="text-white/20">
                ·
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
