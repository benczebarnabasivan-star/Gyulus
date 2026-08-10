import { cn } from '@/lib/utils';

type Props = {
  playing?: boolean;
  className?: string;
  bars?: number;
};

/** Tiny animated level meter shown next to the currently-playing track. */
export function Equalizer({ playing = true, className, bars = 4 }: Props) {
  const delays = ['0ms', '160ms', '320ms', '90ms', '240ms'];
  return (
    <span
      aria-hidden
      className={cn('inline-flex h-4 items-end gap-[2px]', className)}
    >
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'w-[3px] origin-bottom rounded-full bg-spot',
            playing ? 'animate-eq' : 'h-1 opacity-50',
          )}
          style={playing ? { height: '100%', animationDelay: delays[i % delays.length] } : undefined}
        />
      ))}
    </span>
  );
}
