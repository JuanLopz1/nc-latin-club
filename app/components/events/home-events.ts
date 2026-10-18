import { isPast } from './agenda-dates';
import type { AgendaEntry, EventEntry } from './event-types';

const niagaraCities = new Set([
  'niagara falls', 'st catharines', 'welland', 'thorold', 'niagara-on-the-lake',
  'fort erie', 'port colborne', 'grimsby', 'lincoln', 'pelham', 'west lincoln', 'wainfleet',
]);

export function isNiagaraOntario(event: EventEntry): boolean {
  const location = `${event.city?.en ?? ''} ${event.address ?? ''}`;
  if (/\b(?:NY|New York|USA|United States)\b/i.test(location)) return false;
  const city = (event.city?.en ?? '').split(',')[0].trim().toLowerCase().replace(/\./g, '');
  return niagaraCities.has(city);
}

/** Founder-approved order: college events, Ontario Niagara, then excursions. */
export function homeEvents(entries: readonly AgendaEntry[], now: Date): EventEntry[] {
  const priority = (event: EventEntry) => event.category === 'at-nc' ? 0 : isNiagaraOntario(event) ? 1 : 2;
  const time = (event: EventEntry) => Date.parse(event.startsAt ?? event.sessions?.[0]?.startsAt ?? event.dateSpan?.start ?? '');
  return entries.filter((entry): entry is EventEntry => entry.kind === 'event' && entry.status !== 'cancelled' && !isPast(entry, now))
    .sort((a, b) => priority(a) - priority(b) || time(a) - time(b) || a.id.localeCompare(b.id))
    .slice(0, 3);
}
