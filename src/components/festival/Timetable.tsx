import { AlertTriangle } from 'lucide-react';

import type { FestivalDay, SetSlot } from '@/lib/festivals/types';
import { slotMinutes } from '@/lib/festivals/types';
import { cn } from '@/lib/utils';

type Props = {
  day: FestivalDay;
  stages: string[];
  /** Slot ids played by one of the listener's top artists. */
  matched: Set<string>;
  /** Slot ids that collide with another of the listener's sets. */
  clashing: Set<string>;
};

const PX_PER_MINUTE = 1.5;
const ROW_MIN_HEIGHT = 44;

function label(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  return `${String(h).padStart(2, '0')}:00`;
}

/**
 * Clashfinder-style grid: time runs down, stages run across, and every set the
 * listener cares about is lit up in green. Sets that start after midnight are
 * placed at the end of the night rather than wrapping to the top.
 */
export function Timetable({ day, stages, matched, clashing }: Props) {
  const starts = day.slots.map((s) => slotMinutes(s.start));
  const ends = day.slots.map((s) => slotMinutes(s.end));
  const first = Math.floor(Math.min(...starts) / 60) * 60;
  const last = Math.ceil(Math.max(...ends) / 60) * 60;
  const span = Math.max(60, last - first);
  const height = span * PX_PER_MINUTE;

  const hourMarks = Array.from({ length: Math.floor(span / 60) + 1 }, (_, i) => first + i * 60);
  const activeStages = stages.filter((stage) => day.slots.some((s) => s.stage === stage));

  const slotsByStage = new Map<string, SetSlot[]>();
  for (const stage of activeStages) {
    slotsByStage.set(
      stage,
      day.slots
        .filter((s) => s.stage === stage)
        .sort((a, b) => slotMinutes(a.start) - slotMinutes(b.start)),
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-[640px] gap-px">
        {/* Time gutter */}
        <div className="sticky left-0 z-10 w-14 shrink-0 bg-ink-950">
          <div className="h-11" />
          <div className="relative" style={{ height }}>
            {hourMarks.map((mark) => (
              <div
                key={mark}
                className="absolute -translate-y-1/2 text-[11px] tabular-nums text-white/35"
                style={{ top: (mark - first) * PX_PER_MINUTE }}
              >
                {label(mark)}
              </div>
            ))}
          </div>
        </div>

        {/* Stage columns */}
        {activeStages.map((stage) => (
          <div key={stage} className="min-w-[168px] flex-1">
            <div className="flex h-11 items-center justify-center rounded-t-xl border-b border-white/10 bg-white/[0.04] px-2">
              <span className="truncate text-xs font-semibold uppercase tracking-[0.14em] text-white/65">
                {stage}
              </span>
            </div>

            <div className="relative bg-white/[0.015]" style={{ height }}>
              {/* Hour rules */}
              {hourMarks.map((mark) => (
                <div
                  key={mark}
                  className="absolute inset-x-0 border-t border-white/[0.06]"
                  style={{ top: (mark - first) * PX_PER_MINUTE }}
                />
              ))}

              {(slotsByStage.get(stage) ?? []).map((slot) => {
                const top = (slotMinutes(slot.start) - first) * PX_PER_MINUTE;
                const raw = (slotMinutes(slot.end) - slotMinutes(slot.start)) * PX_PER_MINUTE;
                const isMine = matched.has(slot.id);
                const isClash = clashing.has(slot.id);

                return (
                  <div
                    key={slot.id}
                    className={cn(
                      'absolute inset-x-1 overflow-hidden rounded-lg border p-2 transition',
                      isMine
                        ? 'border-spot/50 bg-spot/[0.14] shadow-[0_0_24px_-8px_rgba(30,215,96,0.8)]'
                        : 'border-white/10 bg-white/[0.05] hover:bg-white/[0.09]',
                      // A clash is a qualifier on one of your sets, not a
                      // replacement for the "yours" highlight.
                      isMine && isClash && 'border-amber/70',
                    )}
                    style={{ top, height: Math.max(ROW_MIN_HEIGHT, raw) }}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span
                        className={cn(
                          'line-clamp-2 text-[13px] font-semibold leading-tight',
                          isMine ? 'text-spot' : 'text-white/85',
                          slot.billing === 'headliner' && !isMine && 'text-white',
                        )}
                      >
                        {slot.artist}
                      </span>
                      {isClash && (
                        <AlertTriangle
                          className="mt-0.5 h-3 w-3 shrink-0 text-amber"
                          aria-label="Clashes with another of your sets"
                        />
                      )}
                    </div>
                    <div
                      className={cn(
                        'mt-1 text-[11px] tabular-nums',
                        isMine ? 'text-spot/75' : 'text-white/40',
                      )}
                    >
                      {slot.start}–{slot.end}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
