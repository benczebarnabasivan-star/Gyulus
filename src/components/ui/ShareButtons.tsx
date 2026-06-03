'use client';

import { useState } from 'react';
import { Check, Facebook, Link2, Send, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ShareButtonsProps {
  url: string;
  title: string;
  className?: string;
}

/** Social sharing row with Web Share API support + copy-to-clipboard. */
export function ShareButtons({ url, title, className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    copy();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const enc = encodeURIComponent(url);
  const encTitle = encodeURIComponent(title);

  const btn =
    'inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/15 hover:text-white';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={share}
        aria-label="Megosztás"
        className={cn(btn, 'bg-brand-pink/20 text-brand-pink hover:bg-brand-pink/30')}
      >
        <Share2 className="h-4 w-4" />
      </motion.button>

      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${enc}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Megosztás Facebookon"
        className={btn}
      >
        <Facebook className="h-4 w-4" />
      </a>

      <a
        href={`https://t.me/share/url?url=${enc}&text=${encTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Megosztás Telegramon"
        className={btn}
      >
        <Send className="h-4 w-4" />
      </a>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={copy}
        aria-label="Link másolása"
        className={btn}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-400" />
        ) : (
          <Link2 className="h-4 w-4" />
        )}
      </motion.button>
    </div>
  );
}
