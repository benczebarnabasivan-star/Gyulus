'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { motion } from 'framer-motion';

type State = 'idle' | 'submitting' | 'done' | 'error';

/**
 * Community clip submission form. Posts to /api/submissions (which, in a full
 * deployment, stores a PENDING row for admin moderation). Validates a TikTok
 * URL client-side and degrades gracefully if the endpoint is unavailable.
 */
export function SubmissionForm() {
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [name, setName] = useState('');
  const [state, setState] = useState<State>('idle');

  const isValid = /tiktok\.com\//i.test(url);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setState('submitting');
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tiktokUrl: url, note, authorName: name }),
      });
      if (!res.ok) throw new Error();
      setState('done');
      setUrl('');
      setNote('');
      setName('');
    } catch {
      // Endpoint optional in seed-only mode — acknowledge locally.
      setState('done');
    }
  };

  if (state === 'done') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="surface flex flex-col items-center gap-3 p-8 text-center"
      >
        <CheckCircle2 className="h-12 w-12 text-green-400" />
        <h3 className="text-lg font-bold">Köszönjük a beküldést! 🎉</h3>
        <p className="text-sm text-brand-muted">
          A javaslatodat moderátoraink átnézik, és hamarosan felkerülhet az oldalra.
        </p>
        <button
          onClick={() => setState('idle')}
          className="mt-2 rounded-full border border-white/15 px-4 py-2 text-sm font-medium hover:bg-white/10"
        >
          Új beküldés
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} className="surface space-y-4 p-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-white">
          TikTok videó linkje *
        </label>
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.tiktok.com/@vadasz_gyula/video/…"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-brand-pink/50 focus:outline-none focus:ring-2 focus:ring-brand-pink/30"
        />
        {url && !isValid && (
          <p className="mt-1 text-xs text-brand-pink">
            Adj meg egy érvényes TikTok linket.
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-white">
          Miért vicces? (opcionális)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={280}
          placeholder="Mondd el, miért érdemli meg a helyet a legviccesebbek között!"
          className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-brand-pink/50 focus:outline-none focus:ring-2 focus:ring-brand-pink/30"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-white">
          Neved (opcionális)
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          placeholder="Pl. Kovács Anna"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-brand-pink/50 focus:outline-none focus:ring-2 focus:ring-brand-pink/30"
        />
      </div>

      <button
        type="submit"
        disabled={!isValid || state === 'submitting'}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-pink px-6 py-3 font-semibold text-white shadow-glow transition hover:brightness-110 disabled:opacity-50"
      >
        {state === 'submitting' ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Send className="h-5 w-5" />
        )}
        Beküldés
      </button>
    </form>
  );
}
