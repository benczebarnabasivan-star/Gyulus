import { cn } from '@/lib/utils';

type Props = {
  score: number;
  size?: number;
  className?: string;
  label?: string;
};

function scoreColor(score: number): string {
  if (score >= 75) return '#1ed760';
  if (score >= 50) return '#22e4ff';
  if (score >= 28) return '#ffb020';
  return '#8b8fa3';
}

/** Circular match-percentage indicator. */
export function ScoreRing({ score, size = 64, className, label = 'match' }: Props) {
  const stroke = size >= 60 ? 5 : 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const dash = (clamped / 100) * circumference;
  const color = scoreColor(clamped);

  return (
    <div
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${clamped} percent ${label}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="display leading-none"
          style={{ color, fontSize: size * 0.32 }}
        >
          {clamped}
        </span>
        {size >= 60 && (
          <span className="mt-0.5 text-[8px] uppercase tracking-[0.18em] text-white/45">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
