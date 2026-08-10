import Image from 'next/image';

import { cn, hashUnit, initials } from '@/lib/utils';

type Props = {
  name: string;
  image?: string | null;
  size?: number;
  className?: string;
  ring?: boolean;
};

const GRADIENTS: [string, string][] = [
  ['#1ed760', '#0a7d3a'],
  ['#ff2d95', '#7a0f4a'],
  ['#22e4ff', '#125a8a'],
  ['#8b5cf6', '#3b1d7a'],
  ['#ffb020', '#8a5406'],
  ['#ff6b4a', '#8a2418'],
];

/**
 * Spotify artist image when we have one, otherwise a deterministic gradient
 * monogram so the demo listener still looks intentional rather than broken.
 */
export function ArtistAvatar({ name, image, size = 64, className, ring = false }: Props) {
  const [from, to] = GRADIENTS[Math.floor(hashUnit(name) * GRADIENTS.length) % GRADIENTS.length];

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-full',
        ring && 'ring-2 ring-white/15',
        className,
      )}
      style={{ width: size, height: size }}
    >
      {image ? (
        <Image
          src={image}
          alt=""
          width={size}
          height={size}
          className="h-full w-full object-cover"
          unoptimized={false}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center"
          style={{ background: `linear-gradient(140deg, ${from}, ${to})` }}
        >
          <span
            className="display text-white/90"
            style={{ fontSize: Math.max(10, size * 0.34) }}
          >
            {initials(name)}
          </span>
        </div>
      )}
    </div>
  );
}
