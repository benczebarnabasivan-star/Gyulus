/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import type { SiteVideo } from '@/types';
import { Badge } from '@/components/ui/Badge';

/**
 * Card for a real, verified video. Links to the detail page (where the
 * official TikTok player lives). Shows the real oEmbed caption/thumbnail; if
 * the signed thumbnail has expired, falls back to a gradient.
 */
export function RealVideoCard({
  video,
  index = 0,
}: {
  video: SiteVideo;
  index?: number;
}) {
  const [imgOk, setImgOk] = useState(true);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      className="group surface surface-hover overflow-hidden"
    >
      <Link href={`/video/${video.id}`} className="block">
        <div className="relative aspect-[9/16] overflow-hidden bg-black/40">
          {video.thumbnailUrl && imgOk ? (
            <img
              src={video.thumbnailUrl}
              alt={video.caption}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
              loading="lazy"
              onError={() => setImgOk(false)}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-brand-pink/30 via-brand-card to-brand-cyan/30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />

          <div className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-pink/90 shadow-glow">
              <Play className="h-6 w-6 translate-x-0.5 fill-white text-white" />
            </span>
          </div>

          <div className="absolute left-2 top-2">
            <Badge variant="cyan">{video.category}</Badge>
          </div>
        </div>

        <div className="p-3">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white">
            {video.caption}
          </h3>
          {video.note && (
            <p className="mt-1 line-clamp-2 text-xs text-brand-muted">
              {video.note}
            </p>
          )}
        </div>
      </Link>
    </motion.article>
  );
}
