'use client';

import { motion } from 'framer-motion';
import type { Milestone } from '@/types';
import { formatDateHu } from '@/lib/utils';

/** Vertical animated timeline of the creator's milestones. */
export function Timeline({ milestones }: { milestones: Milestone[] }) {
  return (
    <ol className="relative mx-auto max-w-3xl">
      {/* Vertical line */}
      <span className="absolute bottom-0 left-5 top-0 w-px bg-gradient-to-b from-brand-pink/60 via-white/20 to-transparent sm:left-1/2" />

      {milestones.map((m, i) => {
        const left = i % 2 === 0;
        return (
          <motion.li
            key={m.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.45 }}
            className={`relative mb-10 pl-14 sm:w-1/2 sm:pl-0 ${
              left ? 'sm:pr-12 sm:text-right' : 'sm:ml-auto sm:pl-12'
            }`}
          >
            {/* Dot */}
            <span
              className={`absolute top-1.5 grid h-10 w-10 place-items-center rounded-full bg-brand-card text-lg shadow-glow ring-2 ring-brand-pink/50 left-0 sm:left-auto ${
                left ? 'sm:-right-5' : 'sm:-left-5'
              }`}
            >
              {m.emoji}
            </span>
            <div className="surface p-5">
              <time className="text-xs font-semibold uppercase tracking-wide text-brand-cyan">
                {formatDateHu(m.date)}
              </time>
              <h3 className="mt-1 text-lg font-bold text-white">{m.title}</h3>
              <p className="mt-1 text-sm text-brand-muted">{m.description}</p>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
