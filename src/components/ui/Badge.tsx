import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type Props = {
  children: ReactNode;
  tone?: 'neutral' | 'spot' | 'magenta' | 'cyan' | 'amber';
  className?: string;
};

const TONES = {
  neutral: 'border-white/12 bg-white/[0.06] text-white/70',
  spot: 'border-spot/35 bg-spot/12 text-spot',
  magenta: 'border-magenta/35 bg-magenta/12 text-magenta',
  cyan: 'border-cyan/35 bg-cyan/12 text-cyan',
  amber: 'border-amber/35 bg-amber/12 text-amber',
} as const;

export function Badge({ children, tone = 'neutral', className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em]',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
