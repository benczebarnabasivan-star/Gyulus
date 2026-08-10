import Link from 'next/link';
import { CalendarDays, Clock, MapPin, Users } from 'lucide-react';

import { SourceNote } from '@/components/event/SourceNote';
import { Badge } from '@/components/ui/Badge';
import { FestivalArt } from '@/components/visual/FestivalArt';
import { ScoreRing } from '@/components/visual/ScoreRing';
import type { EventMatch } from '@/lib/events/match';
import { billFor, hasSetTimes, type MusicEvent } from '@/lib/events/types';
import { cn, countdownLabel, formatRange } from '@/lib/utils';

type Props = {
  event: MusicEvent;
  match?: EventMatch;
  featured?: boolean;
  className?: string;
};

export function EventCard({ event, match, featured = false, className }: Props) {
  const yours = match?.acts.slice(0, featured ? 6 : 3).map((a) => a.artist.name) ?? [];
  const extra = (match?.acts.length ?? 0) - yours.length;
  const billSize = billFor(event).length;
  const single = event.kind === 'venue' && event.startDate === event.endDate;

  return (
    <Link
      href={`/events/${event.slug}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-4xl border border-white/10 transition duration-300',
        'hover:-translate-y-1 hover:border-white/25 hover:shadow-[0_28px_70px_-30px_rgba(0,0,0,0.9)]',
        featured ? 'min-h-[26rem]' : 'min-h-[21rem]',
        className,
      )}
    >
      <FestivalArt
        festival={{ slug: event.slug, palette: event.venue.palette, name: event.name }}
        detailed={featured}
        className="transition-transform duration-700 group-hover:scale-105"
      />

      <div className="relative flex h-full flex-col justify-between p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{countdownLabel(event.startDate)}</Badge>
            {match && match.acts.length > 0 && (
              <Badge tone="spot">{match.acts.length} of your artists</Badge>
            )}
            {!hasSetTimes(event) && <Badge tone="neutral">no set times yet</Badge>}
          </div>
          {match && <ScoreRing score={match.score} size={featured ? 68 : 56} />}
        </div>

        <div className="mt-8">
          <h3
            className={cn(
              'display uppercase leading-[0.92] text-white',
              featured ? 'text-4xl sm:text-5xl' : 'text-2xl sm:text-3xl',
            )}
          >
            {event.name}
          </h3>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-white/70">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {event.venue.name}, {event.venue.city}
            </span>
            <span className="inline-flex items-center gap-1.5">
              {single ? (
                <Clock className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <CalendarDays className="h-3.5 w-3.5" aria-hidden />
              )}
              {formatRange(event.startDate, event.endDate)}
            </span>
          </div>

          {yours.length > 0 ? (
            <p className="mt-4 flex flex-wrap items-center gap-1.5 text-sm">
              <Users className="mr-0.5 h-3.5 w-3.5 text-spot" aria-hidden />
              {yours.map((name) => (
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
            event.tagline && (
              <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-white/55">
                {event.tagline}
              </p>
            )
          )}

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-white/45">
            <SourceNote source={event.source} compact />
            <span className="shrink-0 font-medium text-white/70 transition group-hover:text-spot">
              {billSize > 1 ? `${billSize} acts →` : 'Details →'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
