import Link from 'next/link';
import { CalendarDays, MapPin, Users } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { FestivalArt } from '@/components/visual/FestivalArt';
import { ScoreRing } from '@/components/visual/ScoreRing';
import type { FestivalMatch } from '@/lib/festivals/match';
import type { Festival } from '@/lib/festivals/types';
import { CURRENCY_SYMBOL } from '@/lib/festivals/types';
import { cn, countdownLabel, formatRange } from '@/lib/utils';

type Props = {
  festival: Festival;
  match?: FestivalMatch;
  /** Larger treatment for the top recommendation. */
  featured?: boolean;
  className?: string;
};

export function FestivalCard({ festival, match, featured = false, className }: Props) {
  const topNames = match?.artists.slice(0, featured ? 6 : 3).map((a) => a.artist.name) ?? [];
  const extra = (match?.artists.length ?? 0) - topNames.length;

  return (
    <Link
      href={`/festivals/${festival.slug}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-4xl border border-white/10 transition duration-300',
        'hover:-translate-y-1 hover:border-white/25 hover:shadow-[0_28px_70px_-30px_rgba(0,0,0,0.9)]',
        featured ? 'min-h-[26rem]' : 'min-h-[21rem]',
        className,
      )}
    >
      <FestivalArt
        festival={festival}
        detailed={featured}
        className="transition-transform duration-700 group-hover:scale-105"
      />

      <div className="relative flex h-full flex-col justify-between p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{countdownLabel(festival.startDate)}</Badge>
            {match && match.artists.length > 0 && (
              <Badge tone="spot">
                {match.artists.length} of your artists
              </Badge>
            )}
            {match && match.clashPairs > 0 && (
              <Badge tone="amber">{match.clashPairs} clashes</Badge>
            )}
          </div>
          {match && <ScoreRing score={match.score} size={featured ? 68 : 56} />}
        </div>

        <div className="mt-8">
          <h3
            className={cn(
              'display uppercase leading-[0.92] text-white',
              featured ? 'text-5xl sm:text-6xl' : 'text-3xl sm:text-4xl',
            )}
          >
            {festival.name}
          </h3>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-white/70">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {festival.city}, {festival.country}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden />
              {formatRange(festival.startDate, festival.endDate)}
            </span>
          </div>

          {topNames.length > 0 ? (
            <p className="mt-4 flex flex-wrap items-center gap-1.5 text-sm">
              <Users className="mr-0.5 h-3.5 w-3.5 text-spot" aria-hidden />
              {topNames.map((name) => (
                <span
                  key={name}
                  className="rounded-full border border-spot/30 bg-spot/10 px-2.5 py-1 text-xs font-medium text-spot"
                >
                  {name}
                </span>
              ))}
              {extra > 0 && <span className="text-xs text-white/50">+{extra} more</span>}
            </p>
          ) : (
            <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-white/55">
              {festival.tagline}
            </p>
          )}

          <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/45">
            <span>
              From {CURRENCY_SYMBOL[festival.currency]}
              {festival.priceFrom}
            </span>
            <span className="font-medium text-white/70 transition group-hover:text-spot">
              See set times →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
