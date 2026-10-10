import type { Language } from '../home-copy';
import type { AgendaCategory, AgendaEntry, AgendaState, CalendarDate, CalendarMonth } from './event-types';
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
    if (entry.kind === 'cultural-date') return entry.date === date;
    const start = niagaraDate(entry.startsAt);
    const end = entry.endsAt ? niagaraDate(new Date(Date.parse(entry.endsAt) - 1)) : start;
    return date >= start && date <= end;
  });
}
export function isPast(entry: AgendaEntry, now: Date): boolean {
  return entry.kind === 'cultural-date' ? entry.date < niagaraDate(now) : Date.parse(entry.endsAt ?? entry.startsAt) <= now.getTime();
}
export function listEntries(entries: readonly AgendaEntry[], category: AgendaCategory, period: 'upcoming' | 'past', now: Date): AgendaEntry[] {
  const time = (entry: AgendaEntry) => entry.kind === 'cultural-date' ? Date.parse(entry.date) : Date.parse(entry.startsAt);
  return entries.filter(entry => entry.category === category && isPast(entry, now) === (period === 'past'))
    .sort((a, b) => (time(a) - time(b)) * (period === 'past' ? -1 : 1));
}
export function initialAgendaState(now: Date, category: AgendaCategory = 'at-nc'): AgendaState {
  const today = niagaraDate(now);
  return { category, view: 'list', period: 'upcoming', month: today.slice(0, 7), selectedDate: today };
}
export function formatCalendarDate(date: CalendarDate, language: Language, options: Intl.DateTimeFormatOptions = { dateStyle: 'long' }): string {
  return new Intl.DateTimeFormat(language === 'en' ? 'en-CA' : 'es', { ...options, timeZone: 'UTC' }).format(new Date(date + 'T12:00:00Z'));
}
export function formatEventTime(value: string, language: Language, options: Intl.DateTimeFormatOptions = { dateStyle: 'long', timeStyle: 'short' }): string {
  return new Intl.DateTimeFormat(language === 'en' ? 'en-CA' : 'es', { ...options, timeZone: NIAGARA_ZONE }).format(new Date(value));
}
export function entryDate(entry: AgendaEntry): CalendarDate {
  return entry.kind === 'cultural-date' ? entry.date : niagaraDate(entry.startsAt);
}
