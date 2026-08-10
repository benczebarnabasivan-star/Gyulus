'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5">
      <div className="max-w-md text-center">
        <div className="display text-4xl uppercase tracking-tightest">Something dropped out</div>
        <p className="mt-4 text-white/55">
          The page failed to load. This is usually a temporary Spotify API hiccup.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 rounded-full bg-spot px-7 py-3.5 font-semibold text-black transition hover:brightness-110"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
