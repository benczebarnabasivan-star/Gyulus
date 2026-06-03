'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import type { Poll } from '@/types';

/**
 * Interactive poll. Votes are stored in localStorage for this demo so the
 * choice persists per-browser. In production this posts to /api/polls and is
 * backed by the community_votes table.
 */
export function PollCard({ poll }: { poll: Poll }) {
  const storageKey = `poll:${poll.id}`;
  const [voted, setVoted] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(storageKey);
  });
  const [options, setOptions] = useState(poll.options);

  const total = options.reduce((sum, o) => sum + o.votes, 0) || 1;

  const vote = (optionId: string) => {
    if (voted) return;
    setOptions((prev) =>
      prev.map((o) => (o.id === optionId ? { ...o, votes: o.votes + 1 } : o)),
    );
    setVoted(optionId);
    try {
      window.localStorage.setItem(storageKey, optionId);
    } catch {
      /* storage unavailable */
    }
  };

  return (
    <div className="surface p-6">
      <h3 className="text-lg font-bold text-white">{poll.question}</h3>
      <ul className="mt-4 space-y-3">
        {options.map((o) => {
          const pct = Math.round((o.votes / total) * 100);
          const chosen = voted === o.id;
          return (
            <li key={o.id}>
              <button
                onClick={() => vote(o.id)}
                disabled={!!voted}
                className="relative w-full overflow-hidden rounded-xl border border-white/10 px-4 py-3 text-left text-sm font-medium text-white transition enabled:hover:border-brand-pink/40 disabled:cursor-default"
              >
                {voted && (
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className={`absolute inset-y-0 left-0 -z-10 ${
                      chosen ? 'bg-brand-pink/30' : 'bg-white/10'
                    }`}
                  />
                )}
                <span className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    {chosen && <CheckCircle2 className="h-4 w-4 text-brand-pink" />}
                    {o.label}
                  </span>
                  {voted && <span className="text-brand-muted">{pct}%</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-brand-muted">
        {voted ? 'Köszönjük a szavazatod!' : 'Szavazz egy lehetőségre'} ·{' '}
        {total.toLocaleString('hu-HU')} szavazat
      </p>
    </div>
  );
}
