'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, Heart, MessageCircle, Play } from 'lucide-react';
import type { Video } from '@/types';
import { formatCount, formatDuration, timeAgoHu } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface VideoCardProps {
  video: Video;
  priority?: boolean;
  index?: number;
}

/** Large, TikTok-style vertical video card with hover animation. */
export function VideoCard({ video, priority = false, index = 0 }: VideoCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
      className="group surface surface-hover overflow-hidden"
    >
      <Link href={`/video/${video.id}`} className="block">
        <div className="relative aspect-[9/16] overflow-hidden bg-black/40">
          <Image
            src={video.thumbnailUrl}
            alt={video.caption}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            loading={priority ? undefined : 'lazy'}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

          {/* Play button */}
          <div className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-pink/90 shadow-glow backdrop-blur">
              <Play className="h-6 w-6 translate-x-0.5 fill-white text-white" />
            </span>
          </div>

          {/* Top badges */}
          <div className="absolute left-2 top-2 flex flex-wrap gap-1">
            {video.funny && <Badge variant="pink">😂 Vicces</Badge>}
            {video.featured && <Badge variant="cyan">⭐ Kiemelt</Badge>}
          </div>

          {/* Duration */}
          <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
            {formatDuration(video.durationSec)}
          </span>

          {/* Bottom stats */}
          <div className="absolute bottom-2 left-2 flex items-center gap-3 text-xs font-medium text-white">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {formatCount(video.stats.views)}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5 text-brand-pink" />
              {formatCount(video.stats.likes)}
            </span>
          </div>
        </div>

        <div className="p-3">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white">
            {video.caption}
          </h3>
          <div className="mt-2 flex items-center justify-between text-xs text-brand-muted">
            <span>{timeAgoHu(video.uploadedAt)}</span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {formatCount(video.stats.comments)}
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
