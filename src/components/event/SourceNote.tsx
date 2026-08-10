import { CircleCheck, TriangleAlert } from 'lucide-react';

import type { SourceRef } from '@/lib/events/types';
import { cn } from '@/lib/utils';

type Props = {
  source: SourceRef;
  className?: string;
  compact?: boolean;
};

/**
 * Renders where a listing came from. Shown on every event so verified data is
 * never confused with illustrative filler.
 */
export function SourceNote({ source, className, compact = false }: Props) {
  const Icon = source.verified ? CircleCheck : TriangleAlert;

  const label = source.url ? (
    <a
      href={source.url}
      target="_blank"
      rel="noreferrer noopener"
      className="underline decoration-white/25 underline-offset-2 transition hover:decoration-current"
    >
      {source.label}
    </a>
  ) : (
    <span>{source.label}</span>
  );

  // Compact mode renders inside a card that is itself a link, so it must not
  // emit an anchor of its own — nested <a> is invalid and breaks hydration.
  if (compact) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 text-[11px]',
          source.verified ? 'text-white/40' : 'text-amber/80',
          className,
        )}
      >
        <Icon className="h-3 w-3 shrink-0" aria-hidden />
        {source.verified ? <>Source: {source.label}</> : <>Sample data</>}
      </span>
    );
  }

  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-xs leading-relaxed',
        source.verified
          ? 'border-white/10 bg-white/[0.03] text-white/50'
          : 'border-amber/30 bg-amber/[0.08] text-amber/90',
        className,
      )}
    >
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
      <p>
        {source.verified ? (
          <>
            Listing from {label}
            {source.retrievedAt && <>, recorded {source.retrievedAt}</>}. Dates are as published;
            always confirm on the official site before travelling.
          </>
        ) : (
          <>
            This is sample data written for demonstration — not a real schedule. Do not plan
            around it.
          </>
        )}
      </p>
    </div>
  );
}
