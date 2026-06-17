'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PlayCircle, Sparkles } from 'lucide-react';
import type { Creator } from '@/types';
import { Badge } from '@/components/ui/Badge';

/** Hero banner with animated gradient background + profile card. */
export function Hero({ creator }: { creator: Creator }) {
  return (
    <section className="relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(254,44,85,0.22),transparent),radial-gradient(40%_50%_at_85%_30%,rgba(37,244,238,0.18),transparent)]" />
        <motion.div
          aria-hidden
          className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-pink/20 blur-3xl"
          animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden
          className="absolute -right-24 top-32 h-72 w-72 rounded-full bg-brand-cyan/20 blur-3xl"
          animate={{ y: [0, -30, 0], x: [0, -20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24 lg:px-8">
        {/* Text column */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="pink" className="mb-4">
            <Sparkles className="h-3.5 w-3.5" /> Nem hivatalos rajongói oldal
          </Badge>
          <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Vadász <span className="text-gradient">Gyula</span>
          </h1>
          <p className="mt-4 max-w-lg text-lg text-brand-muted">{creator.bio}</p>

          <p className="mt-4 text-sm text-brand-muted">
            🎬 A videók közvetlenül a TikTokról, a hivatalos lejátszón keresztül.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/latest"
              className="inline-flex items-center gap-2 rounded-full bg-brand-pink px-6 py-3 font-semibold text-white shadow-glow transition hover:brightness-110"
            >
              <PlayCircle className="h-5 w-5" /> Élő TikTok feed
            </Link>
            <Link
              href="/funny"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              😂 Válogatott klipek
            </Link>
          </div>
        </motion.div>

        {/* Profile card column */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative mx-auto w-full max-w-xs"
        >
          <div className="surface relative overflow-hidden p-6 text-center shadow-glow">
            <div className="relative mx-auto h-32 w-32">
              <div className="absolute inset-0 animate-float rounded-full bg-gradient-to-br from-brand-pink to-brand-cyan blur-md" />
              <Image
                src={creator.avatarUrl}
                alt={`${creator.displayName} profilkép`}
                width={128}
                height={128}
                className="relative h-32 w-32 rounded-full border-4 border-brand-card object-cover"
              />
            </div>
            <h2 className="mt-4 text-xl font-bold">{creator.displayName}</h2>
            <p className="text-sm text-brand-cyan">@{creator.handle}</p>
            <p className="mt-1 text-xs text-brand-muted">📍 {creator.location}</p>
            <a
              href={creator.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block w-full rounded-full bg-white/10 py-2.5 font-semibold text-white transition hover:bg-white/20"
            >
              Követés TikTokon
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
