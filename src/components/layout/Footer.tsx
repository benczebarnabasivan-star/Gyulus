import Link from 'next/link';

import { siteConfig } from '@/config/site';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 border-t border-white/[0.07] bg-ink-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="display text-2xl tracking-tightest">{siteConfig.name}</div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/50">
            Connect Spotify, and the festival calendar rearranges itself around what you already
            listen to — down to the stage and the set time.
          </p>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-white/35">Explore</div>
          <ul className="mt-4 space-y-2.5 text-sm text-white/60">
            <li>
              <Link href="/events" className="transition hover:text-white">
                All gigs
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

      {/* Oversized wordmark, clipped by the footer edge. */}
      <div aria-hidden className="pointer-events-none select-none overflow-hidden px-5 sm:px-8">
        <div className="display -mb-4 text-center text-[clamp(3.5rem,17vw,13rem)] uppercase leading-[0.8] tracking-tightest text-white/[0.045] sm:-mb-8">
          {siteConfig.name}
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] px-5 py-6 text-xs text-white/30 sm:flex-row sm:px-8">
        <span>
          Built by{' '}
          <a
            href={siteConfig.creator.url}
            target="_blank"
            rel="noreferrer noopener"
            className="text-white/55 transition hover:text-white"
          >
            {siteConfig.creator.name}
          </a>{' '}
          · {year}
        </span>
        <span>Not affiliated with Spotify AB or any festival organiser.</span>
      </div>
    </footer>
  );
}
