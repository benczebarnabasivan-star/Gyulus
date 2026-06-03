'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import type { SortKey } from '@/types';
import { cn } from '@/lib/utils';

const LABELS: Record<SortKey, string> = {
  recent: 'Legújabb',
  views: 'Legnézettebb',
  likes: 'Legkedveltebb',
  favorites: 'Közönség kedvence',
};

/** URL-driven sort selector. Updates `?sort=` without a full navigation. */
export function SortTabs({ options }: { options: SortKey[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = (params.get('sort') as SortKey) ?? options[0];

  const select = (key: SortKey) => {
    const next = new URLSearchParams(params.toString());
    next.set('sort', key);
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((key) => {
        const active = current === key;
        return (
          <button
            key={key}
            onClick={() => select(key)}
            className={cn(
              'relative rounded-full px-4 py-2 text-sm font-medium transition',
              active ? 'text-white' : 'text-brand-muted hover:text-white',
            )}
          >
            {active && (
              <motion.span
                layoutId="sort-pill"
                className="absolute inset-0 -z-10 rounded-full bg-brand-pink/20 ring-1 ring-brand-pink/40"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            {LABELS[key]}
          </button>
        );
      })}
    </div>
  );
}
