import Link from 'next/link';

import { TIME_RANGE_LABELS, type TimeRange } from '@/lib/spotify/types';
import { cn } from '@/lib/utils';

type Props = {
  active: TimeRange;
  className?: string;
};

const ORDER: TimeRange[] = ['short_term', 'medium_term', 'long_term'];

/**
 * Switches which slice of listening history everything on the page is built
 * from. Plain links so it works without JavaScript and stays shareable.
 */
export function RangeSwitcher({ active, className }: Props) {
  return (
    <div
      className={cn(
        'inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1',
        className,
      )}
      role="group"
      aria-label="Listening time range"
    >
      {ORDER.map((range) => {
        const isActive = range === active;
        return (
          <Link
            key={range}
            href={`/dashboard?range=${range}`}
            scroll={false}
            aria-current={isActive ? 'true' : undefined}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-xs font-medium transition sm:text-[13px]',
              isActive
                ? 'bg-white/[0.12] text-white shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset]'
                : 'text-white/50 hover:text-white/85',
            )}
          >
            {TIME_RANGE_LABELS[range]}
          </Link>
        );
      })}
    </div>
  );
}
