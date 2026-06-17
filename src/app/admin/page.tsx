'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  Loader2,
  Lock,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import type { Submission } from '@/lib/services/submissionStore';

// The admin area is client-rendered and excluded from indexing (see robots.ts).
// Auth is a minimal shared-secret gate suitable for a demo; harden for prod.

const TOKEN_KEY = 'vg-admin-token';

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setToken(window.sessionStorage.getItem(TOKEN_KEY));
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Hiba');
      window.sessionStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bejelentkezési hiba.');
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    window.sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  if (!token) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4">
        <form onSubmit={login} className="surface space-y-4 p-8">
          <div className="flex items-center gap-2 text-brand-pink">
            <Lock className="h-6 w-6" />
            <h1 className="text-xl font-bold text-white">Admin belépés</h1>
          </div>
          <p className="text-sm text-brand-muted">
            Add meg az admin jelszót a moderációs felülethez.
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Jelszó"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-brand-pink/50 focus:outline-none focus:ring-2 focus:ring-brand-pink/30"
          />
          {error && <p className="text-sm text-brand-pink">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-pink px-6 py-3 font-semibold text-white disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Belépés'}
          </button>
        </form>
      </div>
    );
  }

  return <AdminDashboard token={token} onLogout={logout} />;
}

function AdminDashboard({
  token,
  onLogout,
}: {
  token: string;
  onLogout: () => void;
}) {
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/submissions');
      const data = await res.json();
      setItems(data.items ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const moderate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const res = await fetch('/api/submissions', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setItems((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s)),
      );
    }
  };

  const refreshCache = async () => {
    setRefreshing(true);
    setMsg(null);
    const res = await fetch('/api/admin/refresh', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    setMsg(res.ok ? 'Videó-gyorsítótár frissítve.' : 'Frissítés sikertelen.');
    setRefreshing(false);
  };

  const pending = items.filter((s) => s.status === 'PENDING');

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <ShieldCheck className="h-7 w-7 text-brand-cyan" /> Admin felület
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshCache}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-medium hover:bg-white/10 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Videók frissítése
          </button>
          <button
            onClick={onLogout}
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium hover:bg-white/10"
          >
            Kilépés
          </button>
        </div>
      </div>

      {msg && (
        <p className="mt-3 text-sm text-brand-cyan">{msg}</p>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Beküldések" value={items.length} />
        <Stat label="Függőben" value={pending.length} />
        <Stat label="Jóváhagyva" value={items.filter((s) => s.status === 'APPROVED').length} />
        <Stat label="Elutasítva" value={items.filter((s) => s.status === 'REJECTED').length} />
      </div>

      <h2 className="mt-10 text-lg font-bold">Közösségi beküldések moderálása</h2>
      {loading ? (
        <div className="mt-4 flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-brand-pink" />
        </div>
      ) : items.length === 0 ? (
        <p className="mt-4 text-sm text-brand-muted">
          Még nincs beküldés. A közösségi oldalon beküldött videók itt jelennek meg.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((s) => (
            <li key={s.id} className="surface flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <a
                  href={s.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-sm font-medium text-brand-cyan hover:underline"
                >
                  {s.tiktokUrl}
                </a>
                {s.note && <p className="mt-1 text-sm text-brand-muted">{s.note}</p>}
                <p className="mt-1 text-xs text-brand-muted">
                  {s.authorName ? `${s.authorName} · ` : ''}
                  <StatusBadge status={s.status} />
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => moderate(s.id, 'APPROVED')}
                  className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-3 py-1.5 text-sm font-medium text-green-400 hover:bg-green-500/25"
                >
                  <CheckCircle2 className="h-4 w-4" /> Jóváhagy
                </button>
                <button
                  onClick={() => moderate(s.id, 'REJECTED')}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-pink/15 px-3 py-1.5 text-sm font-medium text-brand-pink hover:bg-brand-pink/25"
                >
                  <XCircle className="h-4 w-4" /> Elutasít
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface p-4 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-brand-muted">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: 'text-yellow-400',
    APPROVED: 'text-green-400',
    REJECTED: 'text-brand-pink',
  };
  const label: Record<string, string> = {
    PENDING: 'Függőben',
    APPROVED: 'Jóváhagyva',
    REJECTED: 'Elutasítva',
  };
  return <span className={map[status]}>{label[status] ?? status}</span>;
}
