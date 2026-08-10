import { cn, hashUnit } from '@/lib/utils';
import type { Festival } from '@/lib/festivals/types';

type Props = {
  festival: Pick<Festival, 'slug' | 'palette' | 'name'>;
  className?: string;
  /** Adds concentric arcs and a grid; used on larger surfaces. */
  detailed?: boolean;
};

/**
 * Deterministic generated artwork per festival — no external images, no broken
 * thumbnails, and every card gets a distinct composition from its slug.
 */
export function FestivalArt({ festival, className, detailed = false }: Props) {
  const [a, b, c] = festival.palette;
  const seed = hashUnit(festival.slug);
  const seed2 = hashUnit(`${festival.slug}-2`);

  const x1 = 18 + seed * 46;
  const y1 = 14 + seed2 * 34;
  const x2 = 58 + seed2 * 32;
  const y2 = 52 + seed * 36;
  const rotation = Math.round(seed * 90 - 45);

  return (
    <div
      aria-hidden
      className={cn('absolute inset-0 overflow-hidden grain', className)}
      style={{ backgroundColor: c }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(60% 70% at ${x1}% ${y1}%, ${a}, transparent 68%),
                       radial-gradient(58% 64% at ${x2}% ${y2}%, ${b}, transparent 66%)`,
        }}
      />

      {detailed && (
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.22]"
          viewBox="0 0 400 300"
          preserveAspectRatio="xMidYMid slice"
          style={{ transform: `rotate(${rotation}deg) scale(1.35)` }}
        >
          <defs>
            <linearGradient id={`ln-${festival.slug}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <circle
              key={i}
              cx={200}
              cy={150}
              r={26 + i * 27}
              fill="none"
              stroke={`url(#ln-${festival.slug})`}
              strokeWidth={0.9}
            />
          ))}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <line
              key={i}
              x1={i * 50}
              y1={0}
              x2={i * 50}
              y2={300}
              stroke="#ffffff"
              strokeOpacity={0.14}
              strokeWidth={0.6}
            />
          ))}
        </svg>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
    </div>
  );
}
