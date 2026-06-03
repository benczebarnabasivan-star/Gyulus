'use client';

import { useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

/** Route-level error boundary. */
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
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl">😵</p>
      <h1 className="mt-4 text-2xl font-bold">Hoppá, valami elromlott!</h1>
      <p className="mt-2 text-sm text-brand-muted">
        Nem sikerült betölteni ezt az oldalt. Próbáld újra.
      </p>
      <button
        onClick={reset}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-pink px-6 py-3 font-semibold text-white shadow-glow transition hover:brightness-110"
      >
        <RotateCcw className="h-5 w-5" /> Újrapróbálkozás
      </button>
    </div>
  );
}
