import type { Festival, SetSlot } from './types';

export type CalendarEntry = {
  slot: SetSlot;
  /** ISO date of the festival day the set belongs to. */
  date: string;
};

/** Escapes the characters iCalendar treats as structural. */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * RFC 5545 requires content lines to be folded at 75 octets, continued with a
 * leading space. Folding is done over UTF-8 bytes, not characters, so accented
 * artist names cannot be split mid-codepoint.
 */
function foldLine(line: string): string {
  const bytes = Buffer.from(line, 'utf8');
  if (bytes.length <= 75) return line;

  const chunks: string[] = [];
  let start = 0;
  let limit = 75;

  while (start < bytes.length) {
    let end = Math.min(start + limit, bytes.length);
    // Back off until `end` sits on a UTF-8 codepoint boundary.
    while (end > start && end < bytes.length && (bytes[end] & 0b1100_0000) === 0b1000_0000) {
      end -= 1;
    }
    chunks.push(bytes.subarray(start, end).toString('utf8'));
    start = end;
    limit = 74; // Continuation lines carry a leading space.
  }

  return chunks.join('\r\n ');
}

/**
 * Local date-time stamp for a set. Times before 06:00 belong to the following
 * calendar day — the same convention the timetable uses for after-midnight sets.
 */
function stamp(date: string, time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const base = new Date(`${date}T00:00:00Z`);
  if (hours < 6) base.setUTCDate(base.getUTCDate() + 1);

  const y = base.getUTCFullYear();
  const m = String(base.getUTCMonth() + 1).padStart(2, '0');
  const d = String(base.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}T${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}00`;
}

function utcStamp(date: Date): string {
  return `${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
}

/**
 * Builds a VCALENDAR of the listener's own sets at one festival.
 *
 * Times are written as floating local values (no timezone, no trailing Z), so
 * they read as the festival's wall-clock time in any calendar app — which is
 * what a printed running order means.
 */
export function buildCalendar(
  festival: Festival,
  entries: CalendarEntry[],
  productName: string,
): string {
  const now = utcStamp(new Date());

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${escapeText(productName)}//Festival running order//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(`${festival.name} — your sets`)}`,
  ];

  for (const { slot, date } of entries) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${slot.id}@${festival.slug}.resonance`,
      `DTSTAMP:${now}`,
      `DTSTART:${stamp(date, slot.start)}`,
      `DTEND:${stamp(date, slot.end)}`,
      `SUMMARY:${escapeText(`${slot.artist} — ${festival.name}`)}`,
      `LOCATION:${escapeText(`${slot.stage}, ${festival.city}, ${festival.country}`)}`,
      `DESCRIPTION:${escapeText(
        `${slot.artist} plays ${slot.stage} at ${festival.name}.\n\n` +
          'Sample schedule for demonstration — not an announced set time. ' +
          `Check ${festival.website} before making plans.`,
      )}`,
      'END:VEVENT',
    );
  }

  lines.push('END:VCALENDAR');

  // iCalendar mandates CRLF line endings.
  return lines.map(foldLine).join('\r\n') + '\r\n';
}
