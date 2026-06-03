'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    tiktokEmbed?: { lib?: { render?: (nodes?: Element[]) => void } };
  }
}

/**
 * Official TikTok "creator" embed widget.
 *
 * Renders the creator's latest public videos LIVE, inside TikTok's own iframe
 * (served and kept up to date by TikTok). This is the compliant way to show a
 * third-party creator's feed without an API key or scraping.
 *
 * We inject TikTok's official embed.js once and let it hydrate the blockquote.
 */
export function TikTokCreatorEmbed({ handle }: { handle: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const SCRIPT_ID = 'tiktok-embed-script';
    const render = () => {
      window.tiktokEmbed?.lib?.render?.();
      // Mark loaded once TikTok injects its iframe.
      const check = setInterval(() => {
        if (ref.current?.querySelector('iframe')) {
          setLoaded(true);
          clearInterval(check);
        }
      }, 400);
      setTimeout(() => clearInterval(check), 8000);
    };

    if (document.getElementById(SCRIPT_ID)) {
      render();
      return;
    }
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = 'https://www.tiktok.com/embed.js';
    script.async = true;
    script.onload = render;
    document.body.appendChild(script);
  }, [handle]);

  return (
    <div className="relative mx-auto w-full max-w-3xl">
      {!loaded && (
        <div className="flex flex-col items-center gap-3 py-16 text-brand-muted">
          <Loader2 className="h-6 w-6 animate-spin text-brand-pink" />
          <p className="text-sm">Élő TikTok feed betöltése…</p>
          <a
            href={`https://www.tiktok.com/@${handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-brand-cyan hover:underline"
          >
            Nem töltődik be? Nézd meg közvetlenül a TikTokon →
          </a>
        </div>
      )}
      <div ref={ref} className={loaded ? '' : 'h-0 overflow-hidden'}>
        <blockquote
          className="tiktok-embed"
          cite={`https://www.tiktok.com/@${handle}`}
          data-unique-id={handle}
          data-embed-type="creator"
          style={{ maxWidth: 780, minWidth: 288 }}
        >
          <section>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`https://www.tiktok.com/@${handle}?refer=creator_embed`}
            >
              @{handle}
            </a>
          </section>
        </blockquote>
      </div>
    </div>
  );
}
