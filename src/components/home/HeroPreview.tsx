import { Clock, MapPin } from 'lucide-react';

import { ScoreRing } from '@/components/visual/ScoreRing';
import { cn, formatDayShort } from '@/lib/utils';

type PreviewSet = {
  artist: string;
  festival: string;
  stage: string;
  date: string;
  time: string;
};

type Props = {
  sets: PreviewSet[];
  score: number;
  className?: string;
};

/**
 * The payoff, shown rather than described: a small stack of "your artist, this
 * day, this stage, this time" cards floating beside the headline.
 */
export function HeroPreview({ sets, score, className }: Props) {
  return (
    <div className={cn('relative', className)}>
      {/* Glow behind the stack. */}
      <div
        aria-hidden
        className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-spot/25 via-violet/15 to-magenta/20 blur-3xl"
      />

      {/* Bottom padding reserves room for the floating badge below the stack. */}
      <div className="relative animate-floaty space-y-3 pb-16">
        {sets.map((set, i) => (
          <div
            key={`${set.artist}-${set.time}`}
            className={cn(
              'glass-strong rounded-2xl p-4 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.9)]',
              // Slight fan so the stack reads as depth, not a plain list.
              i === 0 && 'rotate-[-1.6deg]',
              i === 1 && 'translate-x-4 rotate-[1.1deg]',
              i === 2 && 'translate-x-1 rotate-[-0.6deg]',
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="truncate font-semibold tracking-tight text-spot">{set.artist}</span>
              <span className="shrink-0 rounded-full bg-spot/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-spot">
                yours
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/55">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3 w-3" aria-hidden />
                {set.festival} · {set.stage}
              </span>
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <Clock className="h-3 w-3" aria-hidden />
                {formatDayShort(set.date)}, {set.time}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Floating match badge. */}
      <div className="glass-strong absolute -left-8 bottom-0 flex items-center gap-3 rounded-2xl p-3 pr-4 shadow-2xl">
        <ScoreRing score={score} size={52} />
        <div className="leading-tight">
          <div className="text-xs font-semibold">Your fit</div>
          <div className="text-[11px] text-white/45">for this lineup</div>
        </div>
      </div>
    </div>
  );
}
