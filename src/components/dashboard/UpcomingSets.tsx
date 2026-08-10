import Link from 'next/link';
import { Clock, MapPin } from 'lucide-react';

import { ArtistAvatar } from '@/components/visual/ArtistAvatar';
import type { UpcomingSet } from '@/lib/festivals/match';
import { countdownLabel, formatDayShort } from '@/lib/utils';

type Props = {
  sets: UpcomingSet[];
};

/**
 * The chronological "when are my artists actually on" feed — the answer to the
 * question the whole app exists for.
 */
export function UpcomingSets({ sets }: Props) {
  if (!sets.length) {
    return (
      <div className="glass rounded-3xl p-8 text-center">
        <p className="text-white/55">
          None of your top artists are on the sample lineups yet. Browse the festivals to see what
          is on.
        </p>
      </div>
    );
  }

  return (
    <ol className="space-y-2.5">
      {sets.map((set) => (
        <li key={`${set.festival.slug}-${set.slot.id}`}>
          <Link
            href={`/festivals/${set.festival.slug}?day=${set.date}`}
            className="group flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3.5 transition hover:border-white/20 hover:bg-white/[0.06]"
          >
            <ArtistAvatar name={set.artist.name} image={set.artist.image} size={52} />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-semibold tracking-tight">{set.artist.name}</span>
                <span className="hidden shrink-0 rounded-full bg-white/[0.07] px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/45 sm:inline">
                  #{set.rank} for you
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/50">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" aria-hidden />
                  {set.festival.name} · {set.slot.stage}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3 w-3" aria-hidden />
                  {formatDayShort(set.date)}, {set.slot.start}–{set.slot.end}
                </span>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <div className="text-xs font-medium text-spot">{countdownLabel(set.date)}</div>
              <div className="mt-0.5 text-[11px] text-white/35 transition group-hover:text-white/60">
                View day →
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}
