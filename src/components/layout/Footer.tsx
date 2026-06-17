import Link from 'next/link';
import { navLinks, siteConfig } from '@/config/site';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/10 bg-brand-dark">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-pink to-brand-cyan text-lg font-black text-white">
              VG
            </span>
            <span className="text-lg font-bold">Vadász Gyula</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-brand-muted">
            {siteConfig.description}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">
            Oldalak
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-brand-muted transition hover:text-white"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">
            Kövesd
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a
                href={siteConfig.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-muted transition hover:text-white"
              >
                TikTok @{siteConfig.creatorHandle}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-6 text-xs text-brand-muted sm:px-6 lg:px-8">
          <p>
            © {year} {siteConfig.name}. Nem hivatalos rajongói oldal — nem áll
            kapcsolatban a TikTokkal vagy a tartalom-készítővel. Minden videó és
            védjegy a jogtulajdonosokat illeti.
          </p>
        </div>
      </div>
    </footer>
  );
}
