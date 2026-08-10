import { NextResponse } from 'next/server';

import { siteConfig } from '@/config/site';
import { getEventBySlug, getEventFeed } from '@/lib/events';
import { buildCalendar } from '@/lib/events/ics';
import { matchEvent } from '@/lib/events/match';
import { getTasteProfile } from '@/lib/spotify/session';

export const dynamic = 'force-dynamic';

/**
 * Downloads the listener's own acts at one event as an .ics file.
 * Acts with no published set time are exported as all-day entries.
 */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const taste = await getTasteProfile();
  if (!taste) {
    return NextResponse.json(
      { error: 'Connect Spotify to export your gigs.' },
      { status: 401 },
    );
  }

  const feed = await getEventFeed(taste.topArtists.map((a) => a.name));
  const event = getEventBySlug(slug, feed.events);
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  const day = new URL(request.url).searchParams.get('day');
  const match = matchEvent(event, taste);

  const performances = match.acts
    .flatMap((act) => act.performances)
    .filter((p) => !day || p.date === day)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.start ?? '').localeCompare(b.start ?? ''));

  if (!performances.length) {
    return NextResponse.json(
      {
        error:
          'None of your top artists have a dated appearance at this event yet. Acts still awaiting a date cannot be added to a calendar.',
      },
      { status: 404 },
    );
  }

  const body = buildCalendar(event, performances, siteConfig.name);
  const filename = day ? `${event.slug}-${day}.ics` : `${event.slug}.ics`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
