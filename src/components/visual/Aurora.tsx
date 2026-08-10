import { cn } from '@/lib/utils';

type AuroraProps = {
  /** Three colour stops driving the blobs. */
  palette?: [string, string, string];
  className?: string;
  intensity?: 'soft' | 'normal' | 'loud';
};

const INTENSITY = {
  soft: 'opacity-40 blur-[110px]',
  normal: 'opacity-60 blur-[100px]',
  loud: 'opacity-80 blur-[90px]',
} as const;

/**
 * The animated mesh-gradient ground the whole app sits on. Pure CSS so it can
 * render on the server and cost nothing on the client beyond compositing.
 */
export function Aurora({
  palette = ['#1ed760', '#8b5cf6', '#ff2d95'],
  className,
  intensity = 'normal',
}: AuroraProps) {
  const [a, b, c] = palette;
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 overflow-hidden grain', className)}
    >
      <div
        className={cn('absolute -left-[18%] -top-[24%] h-[62vw] w-[62vw] rounded-full animate-drift', INTENSITY[intensity])}
        style={{ background: `radial-gradient(circle at 30% 30%, ${a}, transparent 62%)` }}
      />
      <div
        className={cn(
          'absolute -right-[14%] top-[4%] h-[54vw] w-[54vw] rounded-full animate-drift-slow',
          INTENSITY[intensity],
        )}
        style={{ background: `radial-gradient(circle at 60% 40%, ${b}, transparent 64%)` }}
      />
      <div
        className={cn(
          'absolute bottom-[-26%] left-[22%] h-[58vw] w-[58vw] rounded-full animate-drift',
          INTENSITY[intensity],
        )}
        style={{
          background: `radial-gradient(circle at 45% 55%, ${c}, transparent 62%)`,
          animationDelay: '-8s',
        }}
      />
      {/* Vignette keeps text contrast predictable over the moving colour. */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,transparent_20%,rgba(5,4,10,0.72)_78%,rgb(5,4,10)_100%)]" />
    </div>
  );
}
