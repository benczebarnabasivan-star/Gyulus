import Link from 'next/link';
import { CalendarDays, Clock, MapPin } from 'lucide-react';

import { ArtistAvatar } from '@/components/visual/ArtistAvatar';
import type { UpcomingAppearance } from '@/lib/events/match';
import { countdownLabel, formatDayShort } from '@/lib/utils';

type Props = {
  appearances: UpcomingAppearance[];
};

/** The chronological "when can I actually see them" feed. */
export function UpcomingSets({ appearances }: Props) {
  if (!appearances.length) {
    return (
      <div className="glass rounded-3xl p-8 text-center">
        <p className="text-white/55">
          None of your top artists have a dated Hungarian appearance right now. Browse what is on
          — the genre match may still find something.
        </p>
      </div>
    );
  }

  return (
    <ol className="space-y-2.5">
      {appearances.map(({ event, artist, rank, performance }) => (
        <li key={`${event.slug}-${performance.id}`}>
          <Link
            href={`/events/${event.slug}`}
            className="group flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3.5 transition hover:border-white/20 hover:bg-white/[0.06]"
          >
            <ArtistAvatar name={artist.name} image={artist.image} size={52} />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-semibold tracking-tight">{artist.name}</span>
                <span className="hidden shrink-0 rounded-full bg-white/[0.07] px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/45 sm:inline">
                  #{rank} for you
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/50">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" aria-hidden />
                  {event.venue.name}
                  {performance.stage ? ` · ${performance.stage}` : ''}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  {performance.start ? (
                    <>
                      <Clock className="h-3 w-3" aria-hidden />
                      {formatDayShort(performance.date)}, {performance.start}
                    </>
                  ) : (
                    <>
                      <CalendarDays className="h-3 w-3" aria-hidden />
                      {formatDayShort(performance.date)} · time TBA
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <div className="text-xs font-medium text-spot">
                {countdownLabel(performance.date)}
              </div>
              <div className="mt-0.5 text-[11px] text-white/35 transition group-hover:text-white/60">
                Details →
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}
