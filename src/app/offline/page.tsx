import type { Metadata } from 'next';
import Link from 'next/link';
import { WifiOff } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Nincs internet',
  robots: { index: false },
};

/** Shown by the service worker when a navigation fails offline. */
export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <WifiOff className="h-14 w-14 text-brand-pink" />
      <h1 className="mt-4 text-2xl font-bold">Nincs internetkapcsolat</h1>
      <p className="mt-2 text-sm text-brand-muted">
        Úgy tűnik, megszakadt a kapcsolat. A korábban megtekintett oldalak
        elérhetők maradnak — amint újra online vagy, minden frissül.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-brand-pink px-6 py-3 font-semibold text-white shadow-glow"
      >
        Újratöltés
      </Link>
    </div>
  );
}
