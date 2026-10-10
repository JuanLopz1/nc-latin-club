import type { AgendaEntry, LocalizedText } from './event-types';
import { validDate, niagaraDate } from './agenda-dates';
function requireValue(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(`Agenda: ${message}`); }
function text(value: LocalizedText | undefined, label: string) { requireValue(value && ['en', 'es'].every(lang => typeof value[lang as keyof LocalizedText] === 'string' && value[lang as keyof LocalizedText].trim()), label); }
function https(value: string) { try { const url = new URL(value); return url.protocol === 'https:' && !!url.hostname && !url.username && !url.password; } catch { return false; } }
function timestamp(value: string) {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(Z|[+-](\d{2}):(\d{2}))$/.exec(value);
  return match && validDate(match[1]) && Number(match[2]) < 24 && Number(match[3]) < 60 && Number(match[4] ?? 0) < 60 && Number(match[6] ?? 0) <= 14 && Number(match[7] ?? 0) < 60 && (Number(match[6]) !== 14 || Number(match[7]) === 0) && Number.isFinite(Date.parse(value));
}
export function validateAgenda(entries: readonly AgendaEntry[]): void {
  const ids = new Set<string>(), slugs = new Set<string>();
  for (const entry of entries) {
    requireValue(entry.id && !ids.has(entry.id), 'missing or duplicate ID');
    requireValue(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug) && !slugs.has(entry.slug), 'invalid or duplicate slug');
    ids.add(entry.id); slugs.add(entry.slug);
    text(entry.title, 'bilingual title required'); text(entry.description, 'bilingual description required');
    requireValue(entry.source && https(entry.source.url) && validDate(entry.source.reviewedOn) && ['user-capture', 'official-page'].includes(entry.source.provenance), 'valid editorial source required');
    if (entry.note) text(entry.note, 'bilingual note required');
    for (const link of entry.links ?? []) { requireValue(https(link.url), 'link must use HTTPS'); text(link.label, 'bilingual link label required'); }
    if (entry.kind === 'event') {
      requireValue(['at-nc', 'out-of-nc'].includes(entry.category), 'invalid event category');
      text(entry.venue, 'venue required'); text(entry.organizer, 'organizer required');
      if (entry.category === 'out-of-nc') text(entry.city, 'regional city required');
      if (entry.city) text(entry.city, 'bilingual city required');
      if (entry.admission) text(entry.admission, 'bilingual admission required');
      if (entry.dateSpan) {
        requireValue(!entry.startsAt && !entry.endsAt && validDate(entry.dateSpan.start) && validDate(entry.dateSpan.end) && entry.dateSpan.end >= entry.dateSpan.start, 'invalid date-only event span');
      } else {
        requireValue(timestamp(entry.startsAt), 'start requires a valid timestamp with offset');
        if (entry.endsAt) requireValue(timestamp(entry.endsAt) && Date.parse(entry.endsAt) >= Date.parse(entry.startsAt), 'invalid end');
      }
      for (const session of entry.sessions ?? []) {
        requireValue(timestamp(session.startsAt), 'session start requires offset');
        if (session.endsAt) requireValue(timestamp(session.endsAt) && Date.parse(session.endsAt) >= Date.parse(session.startsAt), 'invalid session end');
        if (entry.dateSpan) requireValue(niagaraDate(session.startsAt) >= entry.dateSpan.start && niagaraDate(session.startsAt) <= entry.dateSpan.end && (!session.endsAt || niagaraDate(new Date(Date.parse(session.endsAt) - 1)) <= entry.dateSpan.end), 'session outside festival span');
        if (session.title) text(session.title, 'bilingual session title required');
        if (session.registrationUrl) requireValue(https(session.registrationUrl), 'session registration must use HTTPS');
      }
      requireValue(['scheduled', 'cancelled', 'rescheduled'].includes(entry.status), 'invalid event status');
      if (entry.status !== 'scheduled') text(entry.statusNote, 'status note required');
      if (entry.registrationUrl) requireValue(https(entry.registrationUrl), 'registration must use HTTPS');
    } else {
      requireValue(entry.kind === 'cultural-date' && entry.category === 'latin-dates' && validDate(entry.date), 'invalid cultural date');
      text(entry.scope, 'cultural scope required');
      if (entry.endDate) requireValue(validDate(entry.endDate) && entry.endDate >= entry.date, 'invalid cultural end date');
      if (entry.calendarDisplay !== undefined) {
        const finalDay = new Date(Date.UTC(Number(entry.date.slice(0, 4)), Number(entry.date.slice(5, 7)), 0)).toISOString().slice(0, 10);
        requireValue(entry.calendarDisplay === 'month' && entry.date.endsWith('-01') && entry.endDate === finalDay, 'monthly observance must cover one whole calendar month');
      }
    }
    requireValue(entry.images === undefined || Array.isArray(entry.images), 'images must be a collection');
    for (const image of entry.images ?? []) {
      requireValue(/^\/images\/events\/(?:[\w-]+\/)*[\w-]+\.(?:avif|webp|jpe?g|png|gif|svg)$/.test(image.src), 'invalid local image path');
      requireValue(Number.isInteger(image.width) && image.width > 0 && Number.isInteger(image.height) && image.height > 0, 'invalid image dimensions');
      text(image.alt, 'image needs bilingual alt text');
      if (image.caption) text(image.caption, 'bilingual image caption required');
    }
  }
}
