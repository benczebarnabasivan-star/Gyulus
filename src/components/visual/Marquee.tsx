import { cn } from '@/lib/utils';

type Props = {
  items: string[];
  className?: string;
  /** Seconds for one full pass. */
  duration?: number;
  reverse?: boolean;
};

/**
 * Infinite horizontal ticker. The list is rendered twice and translated by
 * -50%, so the loop is seamless without measuring anything.
 */
export function Marquee({ items, className, duration = 38, reverse = false }: Props) {
  const doubled = [...items, ...items];

  return (
    <div className={cn('relative flex overflow-hidden mask-fade-x', className)}>
      <div
        className="flex w-max shrink-0 animate-marquee items-center gap-8 pr-8"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        {doubled.map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center gap-8 whitespace-nowrap">
            <span className="display text-2xl uppercase tracking-tight text-white/35 sm:text-3xl">
              {item}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-spot/60" />
          </span>
        ))}
      </div>
    </div>
  );
}
