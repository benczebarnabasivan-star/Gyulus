import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-black text-gradient">404</p>
      <h1 className="mt-4 text-2xl font-bold">Ez a videó elszaladt 🏃‍♂️</h1>
      <p className="mt-2 text-sm text-brand-muted">
        A keresett oldal nem található. Nézz körül a legújabb videók között!
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-pink px-6 py-3 font-semibold text-white shadow-glow transition hover:brightness-110"
      >
        <Home className="h-5 w-5" /> Vissza a főoldalra
      </Link>
    </div>
  );
}
