'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Quote as QuoteIcon } from 'lucide-react';
import type { Quote } from '@/types';
import { ShareButtons } from '@/components/ui/ShareButtons';
import { siteConfig } from '@/config/site';

export function QuoteCard({ quote, index = 0 }: { quote: Quote; index?: number }) {
  const shareUrl = quote.videoId
    ? `${siteConfig.url}/video/${quote.videoId}`
    : siteConfig.url;

  return (
    <motion.figure
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.4) }}
      className="surface surface-hover flex flex-col justify-between gap-4 p-6"
    >
      <div>
        <QuoteIcon className="h-8 w-8 text-brand-pink/60" />
        <blockquote className="mt-3 text-lg font-semibold leading-relaxed text-white">
          „{quote.text}&rdquo;
        </blockquote>
        {quote.context && (
          <figcaption className="mt-2 text-sm text-brand-muted">
            — {quote.context}
          </figcaption>
        )}
      </div>
      <div className="flex items-center justify-between">
        {quote.videoId ? (
          <Link
            href={`/video/${quote.videoId}`}
            className="text-sm font-medium text-brand-cyan hover:underline"
          >
            Videó megtekintése →
          </Link>
        ) : (
          <span />
        )}
        <ShareButtons url={shareUrl} title={quote.text} />
      </div>
    </motion.figure>
  );
}
