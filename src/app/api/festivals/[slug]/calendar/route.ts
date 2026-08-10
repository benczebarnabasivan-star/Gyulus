import { NextResponse } from 'next/server';

import { siteConfig } from '@/config/site';
import { getFestivalBySlug } from '@/lib/festivals';
import { buildCalendar, type CalendarEntry } from '@/lib/festivals/ics';
import { matchFestival } from '@/lib/festivals/match';
import { slotMinutes } from '@/lib/festivals/types';
import { getTasteProfile } from '@/lib/spotify/session';

export const dynamic = 'force-dynamic';

/**
 * Downloads the listener's own running order for one festival as an .ics file.
 * With `?day=YYYY-MM-DD` it exports a single day; without, the whole festival.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const festival = getFestivalBySlug(slug);
  if (!festival) {
    return NextResponse.json({ error: 'Festival not found' }, { status: 404 });
  }

  const taste = await getTasteProfile();
  if (!taste) {
    return NextResponse.json(
      { error: 'Connect Spotify to export your running order.' },
      { status: 401 },
    );
  }

  const day = new URL(request.url).searchParams.get('day');
  const match = matchFestival(festival, taste);

  const entries: CalendarEntry[] = match.artists
    .flatMap((artist) => artist.sets)
    .filter((set) => !day || set.date === day)
    .map((set) => ({ slot: set.slot, date: set.date }))
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) || slotMinutes(a.slot.start) - slotMinutes(b.slot.start),
    );

  if (!entries.length) {
    return NextResponse.json(
      { error: 'None of your top artists are on this lineup.' },
      { status: 404 },
    );
  }

  const body = buildCalendar(festival, entries, siteConfig.name);
  const filename = day ? `${festival.slug}-${day}.ics` : `${festival.slug}.ics`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
