import Link from 'next/link';

import { Aurora } from '@/components/visual/Aurora';

export default function NotFound() {
  return (
    <div className="relative isolate flex min-h-[70vh] items-center justify-center overflow-hidden px-5">
      <Aurora palette={['#ff2d95', '#8b5cf6', '#22e4ff']} className="-z-10" />
      <div className="text-center">
        <div className="display text-[clamp(4rem,18vw,12rem)] uppercase leading-none text-gradient">
          404
        </div>
        <p className="mt-4 text-lg text-white/60">That stage is not on the map.</p>
        <Link
          href="/events"
          className="mt-8 inline-flex rounded-full bg-spot px-7 py-3.5 font-semibold text-black transition hover:brightness-110"
        >
          Browse gigs
        </Link>
      </div>
    </div>
  );
}
