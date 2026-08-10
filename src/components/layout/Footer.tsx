import Link from 'next/link';

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/[0.07] bg-ink-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="display text-2xl tracking-tightest">Resonance</div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/50">
            Connect Spotify, and the festival calendar rearranges itself around what you already
            listen to — down to the stage and the set time.
          </p>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-white/35">Explore</div>
          <ul className="mt-4 space-y-2.5 text-sm text-white/60">
            <li>
              <Link href="/festivals" className="transition hover:text-white">
                All festivals
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="transition hover:text-white">
                Your matches
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-white/35">About the data</div>
          <p className="mt-4 text-sm leading-relaxed text-white/50">
            Listening data comes from the Spotify Web API and stays in your session. Festival
            lineups and set times shown here are{' '}
            <span className="text-amber/90">sample data</span> for demonstration — not announced
            schedules.
          </p>
        </div>
      </div>

      <div className="border-t border-white/[0.06] px-5 py-6 text-center text-xs text-white/30 sm:px-8">
        Not affiliated with Spotify AB or any festival organiser.
      </div>
    </footer>
  );
}
