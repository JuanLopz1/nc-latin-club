import type { Language } from '../../translations/language';
import type { EventEntry } from './event-types';
const utc = (value: string) =>
  new Date(value)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
const escapeText = (value: string) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\n|\r/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
function foldLine(line: string): string {
  const encoder = new TextEncoder();
  let folded = '';
  let size = 0;
  for (const char of line) {
    const bytes = encoder.encode(char).length;
    if (size + bytes > 75) {
      folded += '\r\n ';
      size = 1;
    }
    folded += char;
    size += bytes;
  }
  return folded;
}
/** The reviewed date provides a stable stamp during server rendering and hydration. */
export function eventCalendarFile(entry: EventEntry, language: Language): string | null {
  if (entry.status === 'cancelled') return null;
  const sessions = entry.startsAt
    ? [{ startsAt: entry.startsAt, endsAt: entry.endsAt }]
    : entry.sessions?.length
      ? entry.sessions
      : [null];
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NC Latin Club//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];
  sessions.forEach((session, index) => {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${entry.id}-${index}@nc-latin-club`,
      `DTSTAMP:${entry.source.reviewedOn.replace(/-/g, '')}T000000Z`,
    );
    if (session) {
      lines.push(`DTSTART:${utc(session.startsAt)}`);
      if (session.endsAt) lines.push(`DTEND:${utc(session.endsAt)}`);
    } else if (entry.dateSpan) {
      const exclusiveEnd = new Date(entry.dateSpan.end + 'T12:00:00Z');
      exclusiveEnd.setUTCDate(exclusiveEnd.getUTCDate() + 1);
      lines.push(
        `DTSTART;VALUE=DATE:${entry.dateSpan.start.replace(/-/g, '')}`,
        `DTEND;VALUE=DATE:${exclusiveEnd.toISOString().slice(0, 10).replace(/-/g, '')}`,
      );
    }
    lines.push(
      `SUMMARY:${escapeText(session?.title?.[language] ?? entry.title[language])}`,
      `DESCRIPTION:${escapeText(entry.description[language])}`,
      `LOCATION:${escapeText([entry.venue[language], entry.city?.[language], entry.address].filter(Boolean).join(', '))}`,
      `URL:${entry.source.url}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
    );
  });
  lines.push('END:VCALENDAR');
  return lines.map(foldLine).join('\r\n') + '\r\n';
}
