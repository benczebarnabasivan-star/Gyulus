import type { MusicEvent, Performance } from './types';

/** Escapes the characters iCalendar treats as structural. */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * RFC 5545 folds content lines at 75 octets, continued with a leading space.
 * Folding runs over UTF-8 bytes, so Hungarian names like "Dzsúdló" or
 * "Kispál és a Borz" cannot be split mid-codepoint.
 */
function foldLine(line: string): string {
  const bytes = Buffer.from(line, 'utf8');
  if (bytes.length <= 75) return line;

  const chunks: string[] = [];
  let start = 0;
  let limit = 75;

  while (start < bytes.length) {
    let end = Math.min(start + limit, bytes.length);
    while (end > start && end < bytes.length && (bytes[end] & 0b1100_0000) === 0b1000_0000) {
      end -= 1;
    }
    chunks.push(bytes.subarray(start, end).toString('utf8'));
    start = end;
    limit = 74;
  }

  return chunks.join('\r\n ');
}

function compactDate(date: string): string {
  return date.replace(/-/g, '');
}

/** The day after `date`, for the exclusive DTEND of an all-day event. */
function nextDay(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return compactDate(d.toISOString().slice(0, 10));
}

function stamp(date: string, time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const base = new Date(`${date}T00:00:00Z`);
  // Anything before 06:00 belongs to the following calendar day.
  if (hours < 6) base.setUTCDate(base.getUTCDate() + 1);
  return `${compactDate(base.toISOString().slice(0, 10))}T${String(hours).padStart(2, '0')}${String(
    minutes,
  ).padStart(2, '0')}00`;
}

function utcStamp(date: Date): string {
  return `${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
}

/**
 * Builds a VCALENDAR of the listener's acts at one event.
 *
 * Where no start time has been published the entry is written as an all-day
 * event rather than being given an invented hour — the calendar then shows the
 * right day without asserting a time nobody announced.
 */
export function buildCalendar(
  event: MusicEvent,
  performances: Performance[],
  productName: string,
): string {
  const now = utcStamp(new Date());
  const officialUrl = event.ticketUrl ?? event.venue.website;

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${escapeText(productName)}//Gig planner//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(`${event.name} — your acts`)}`,
  ];

  for (const performance of performances) {
    const timed = Boolean(performance.start);

    lines.push(
      'BEGIN:VEVENT',
      `UID:${performance.id}@${event.slug}.resonance`,
      `DTSTAMP:${now}`,
    );

    if (timed && performance.start) {
      lines.push(`DTSTART:${stamp(performance.date, performance.start)}`);
      lines.push(
        `DTEND:${
          performance.end
            ? stamp(performance.date, performance.end)
            : stamp(performance.date, performance.start)
        }`,
      );
    } else {
      // All-day: DTEND is exclusive, so it points at the next date.
      lines.push(`DTSTART;VALUE=DATE:${compactDate(performance.date)}`);
      lines.push(`DTEND;VALUE=DATE:${nextDay(performance.date)}`);
    }

    const where = [performance.stage, event.venue.name, event.venue.city]
      .filter(Boolean)
      .join(', ');

    lines.push(
      `SUMMARY:${escapeText(`${performance.artist} — ${event.name}`)}`,
      `LOCATION:${escapeText(where)}`,
      `URL:${officialUrl}`,
      `DESCRIPTION:${escapeText(
        `${performance.artist} at ${event.venue.name}, ${event.venue.city}.\n\n` +
          (timed
            ? ''
            : 'No set time has been published for this act yet, so this is an all-day entry. ') +
          `Listing source: ${event.source.label}. Confirm on ${officialUrl} before travelling.`,
      )}`,
      'END:VEVENT',
    );
  }

  lines.push('END:VCALENDAR');
  return lines.map(foldLine).join('\r\n') + '\r\n';
}
