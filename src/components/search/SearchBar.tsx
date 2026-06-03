'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  autoFocus?: boolean;
  /** Called after a successful navigation (e.g. to close a drawer). */
  onSubmitNavigate?: () => void;
  placeholder?: string;
}

/**
 * Search input. Submits to /latest?q=… which renders matching videos
 * (captions, keywords and categories are all searched server-side).
 */
export function SearchBar({
  autoFocus,
  onSubmitNavigate,
  placeholder = 'Keress videók, feliratok, kulcsszavak között…',
}: SearchBarProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get('q') ?? '');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/latest?q=${encodeURIComponent(q)}` : '/latest');
    onSubmitNavigate?.();
  };

  return (
    <form onSubmit={submit} role="search" className="relative w-full">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
      <input
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Keresés"
        className="w-full rounded-full border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-brand-muted focus:border-brand-pink/50 focus:outline-none focus:ring-2 focus:ring-brand-pink/30"
      />
    </form>
  );
}
