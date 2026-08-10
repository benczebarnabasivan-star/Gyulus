import Link from 'next/link';

import { ArtistAvatar } from '@/components/visual/ArtistAvatar';
import { SpotifyButton } from '@/components/ui/SpotifyButton';
import { isSpotifyConfigured } from '@/lib/spotify/auth';
import { getTasteProfile } from '@/lib/spotify/session';

const LINKS = [
  { href: '/festivals', label: 'Festivals' },
  { href: '/dashboard', label: 'For you' },
];

export async function Navbar() {
  const taste = await getTasteProfile();

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-ink-950/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative flex h-8 w-8 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-spot via-cyan to-magenta opacity-90 transition group-hover:opacity-100" />
            <span className="absolute inset-[3px] rounded-full bg-ink-950" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-white" />
          </span>
          <span className="display text-lg tracking-tightest">Resonance</span>
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm text-white/65 transition hover:bg-white/[0.06] hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {taste ? (
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.05] py-1 pl-1 pr-3.5 transition hover:bg-white/[0.09]"
            >
              <ArtistAvatar name={taste.profile.displayName} image={taste.profile.image} size={28} />
              <span className="max-w-[9rem] truncate text-sm text-white/80">
                {taste.profile.displayName}
              </span>
            </Link>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="rounded-full px-3 py-2 text-sm text-white/45 transition hover:text-white"
              >
                Sign out
              </button>
            </form>
          </div>
        ) : isSpotifyConfigured() ? (
          <SpotifyButton size="md" />
        ) : (
          // No Spotify credentials on this deployment — offer the demo instead
          // of a button that can only fail.
          <a
            href="/api/auth/demo"
            className="rounded-full border border-white/15 bg-white/[0.05] px-5 py-2.5 text-sm font-medium text-white/85 transition hover:border-white/30 hover:bg-white/10"
          >
            Try the demo
          </a>
        )}
      </nav>
    </header>
  );
}
