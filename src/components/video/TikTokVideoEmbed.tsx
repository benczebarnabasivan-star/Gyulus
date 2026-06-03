/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

interface TikTokVideoEmbedProps {
  videoId: string;
  caption: string;
  /** Real oEmbed thumbnail (may be a signed/expiring URL). Optional. */
  thumbnailUrl?: string | null;
}

/**
 * Single TikTok video, shown via TikTok's official embed iframe.
 *
 * Lite-embed pattern: we show a thumbnail facade first and only mount the
 * (heavy) TikTok iframe on click. The thumbnail comes from TikTok's official
 * oEmbed; if it has expired we gracefully fall back to a gradient placeholder.
 */
export function TikTokVideoEmbed({
  videoId,
  caption,
  thumbnailUrl,
}: TikTokVideoEmbedProps) {
  const [active, setActive] = useState(false);
  const [imgOk, setImgOk] = useState(true);

  return (
    <div className="relative mx-auto aspect-[9/16] w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-black">
      {active ? (
        <iframe
          src={`https://www.tiktok.com/embed/v2/${videoId}`}
          title={caption}
          className="h-full w-full"
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <button
          onClick={() => setActive(true)}
          className="group absolute inset-0"
          aria-label="Videó lejátszása"
        >
          {thumbnailUrl && imgOk ? (
            <img
              src={thumbnailUrl}
              alt={caption}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
              loading="lazy"
              onError={() => setImgOk(false)}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-brand-pink/30 via-brand-card to-brand-cyan/30" />
          )}
          <div className="absolute inset-0 bg-black/30 transition group-hover:bg-black/20" />
          <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand-pink shadow-glow transition group-hover:scale-110">
            <Play className="h-7 w-7 translate-x-0.5 fill-white text-white" />
          </span>
          <span className="absolute bottom-3 left-0 right-0 text-center text-xs font-medium text-white/90">
            Hivatalos TikTok lejátszó
          </span>
        </button>
      )}
    </div>
  );
}
