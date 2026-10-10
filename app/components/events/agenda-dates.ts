import type { Language } from '../home-copy';
import type { AgendaCategory, AgendaEntry, AgendaState, CalendarDate, CalendarMonth, EventEntry, EventSession } from './event-types';
export const agendaCategories = ['at-nc', 'out-of-nc', 'latin-dates'] as const;
export const NIAGARA_ZONE = 'America/Toronto';
const localDate = new Intl.DateTimeFormat('en-CA', { timeZone: NIAGARA_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' });
export function validDate(value: string): boolean {
  if (!/^[1-9]\d{3}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T12:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function niagaraDate(value: Date | string): CalendarDate {
  const parts = localDate.formatToParts(typeof value === 'string' ? new Date(value) : value);
  const part = (type: string) => parts.find(p => p.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
export function shiftMonth(month: CalendarMonth, delta: number): CalendarMonth {
  const date = new Date(month + '-01T12:00:00Z');
  date.setUTCMonth(date.getUTCMonth() + delta);
  return date.toISOString().slice(0, 7);
}
export function monthCells(month: CalendarMonth): CalendarDate[] {
  const first = new Date(month + '-01T12:00:00Z');
  first.setUTCDate(first.getUTCDate() - (first.getUTCDay() + 6) % 7);
  return Array.from({ length: 42 }, (_, i) => new Date(first.getTime() + i * 86400000).toISOString().slice(0, 10));
}
export function entriesOnDate(entries: readonly AgendaEntry[], date: CalendarDate): AgendaEntry[] {
  return entries.filter(entry => {
    if (entry.kind === 'cultural-date') return date >= entry.date && date <= (entry.endDate ?? entry.date);
    if (entry.dateSpan) return date >= entry.dateSpan.start && date <= entry.dateSpan.end;
    const start = niagaraDate(entry.startsAt);
    const end = entry.endsAt ? niagaraDate(new Date(Date.parse(entry.endsAt) - 1)) : start;
    return date >= start && date <= end;
  });
}
export function dailyEntriesOnDate(entries: readonly AgendaEntry[], date: CalendarDate): AgendaEntry[] {
  return entriesOnDate(entries.filter(entry => entry.kind !== 'cultural-date' || entry.calendarDisplay !== 'month'), date);
}
export function monthObservances(entries: readonly AgendaEntry[], month: CalendarMonth): AgendaEntry[] {
  return entries.filter(entry => entry.kind === 'cultural-date' && entry.calendarDisplay === 'month' && entry.date.slice(0, 7) === month);
}
export function isPast(entry: AgendaEntry, now: Date): boolean {
  if (entry.kind === 'cultural-date') return (entry.endDate ?? entry.date) < niagaraDate(now);
  if (entry.dateSpan) {
    const last = entry.sessions?.reduce<EventSession | undefined>((latest, session) => !latest || Date.parse(session.startsAt) > Date.parse(latest.startsAt) ? session : latest, undefined);
    if (!last?.endsAt) return entry.dateSpan.end < niagaraDate(now);
    const finalEnd = Math.max(...(entry.sessions ?? []).flatMap(session => session.endsAt ? [Date.parse(session.endsAt)] : []));
    return finalEnd <= now.getTime();
  }
  return Date.parse(entry.endsAt ?? entry.startsAt) <= now.getTime();
}
export function listEntries(entries: readonly AgendaEntry[], category: AgendaCategory | readonly AgendaCategory[], period: 'upcoming' | 'past', now: Date): AgendaEntry[] {
  const time = (entry: AgendaEntry) => Date.parse(entry.kind === 'cultural-date' ? entry.date : entry.dateSpan ? entry.dateSpan.start : entry.startsAt);
  const categories = typeof category === 'string' ? [category] : category;
  return entries.filter(entry => categories.includes(entry.category) && isPast(entry, now) === (period === 'past'))
    .sort((a, b) => (time(a) - time(b)) * (period === 'past' ? -1 : 1));
}
export function initialAgendaState(now: Date): AgendaState {
  const today = niagaraDate(now);
  return { categories: [...agendaCategories], view: 'list', period: 'upcoming', month: today.slice(0, 7), selectedDate: today };
}
export function formatCalendarDate(date: CalendarDate, language: Language, options: Intl.DateTimeFormatOptions = { dateStyle: 'long' }): string {
  return new Intl.DateTimeFormat(language === 'en' ? 'en-CA' : 'es', { ...options, timeZone: 'UTC' }).format(new Date(date + 'T12:00:00Z'));
}
export function formatEventTime(value: string, language: Language, options: Intl.DateTimeFormatOptions = { dateStyle: 'long', timeStyle: 'short' }): string {
  return new Intl.DateTimeFormat(language === 'en' ? 'en-CA' : 'es', { ...options, timeZone: NIAGARA_ZONE }).format(new Date(value));
}
export function entryDate(entry: AgendaEntry): CalendarDate {
  return entry.kind === 'cultural-date' ? entry.date : entry.dateSpan ? entry.dateSpan.start : niagaraDate(entry.startsAt);
}

export function formatEntryWhen(entry: AgendaEntry, language: Language): string {
  if (entry.kind === 'event' && entry.startsAt) return formatEventTime(entry.startsAt, language);
  if (entry.kind === 'event' && entry.dateSpan && entry.sessions?.length === 1 && entry.dateSpan.start === entry.dateSpan.end) return formatEventTime(entry.sessions[0].startsAt, language);
  const start = entryDate(entry), end = entry.kind === 'cultural-date' ? entry.endDate : entry.dateSpan?.end;
  return formatCalendarDate(start, language) + (end && end !== start ? ` – ${formatCalendarDate(end, language)}` : '');
}
export function eventDateTime(entry: EventEntry): string { return entry.startsAt ?? entry.dateSpan.start; }
