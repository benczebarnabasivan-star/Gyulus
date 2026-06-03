'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ExternalLink, Play } from 'lucide-react';
import type { Video } from '@/types';

/**
 * Video player using TikTok's official embed.
 *
 * We render a lightweight thumbnail "facade" first and only mount the TikTok
 * <iframe> once the user clicks play. This avoids loading TikTok's heavy embed
 * script on page load (big performance + privacy win) — a common "lite embed"
 * pattern. Falls back to a direct TikTok link.
 */
export function VideoPlayer({ video }: { video: Video }) {
  const [active, setActive] = useState(false);
  const embedUrl = `https://www.tiktok.com/embed/v2/${video.tiktokId}`;

  return (
    <div className="relative mx-auto aspect-[9/16] w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-black">
      {active ? (
        <iframe
          src={embedUrl}
          title={video.caption}
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
          <Image
            src={video.thumbnailUrl}
            alt={video.caption}
            fill
            sizes="(max-width: 640px) 100vw, 384px"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/30 transition group-hover:bg-black/20" />
          <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand-pink shadow-glow transition group-hover:scale-110">
            <Play className="h-7 w-7 translate-x-0.5 fill-white text-white" />
          </span>
          <span className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1 text-xs font-medium text-white/90">
            <ExternalLink className="h-3.5 w-3.5" /> TikTok lejátszó betöltése
          </span>
        </button>
      )}
    </div>
  );
}
