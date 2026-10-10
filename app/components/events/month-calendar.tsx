'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import type { Language } from '../home-copy';
import type { AgendaEntry, CalendarDate, CalendarMonth } from './event-types';
import { dailyEntriesOnDate, monthObservances, formatCalendarDate, monthCells, shiftMonth } from './agenda-dates';
import { eventsCopy } from './events-copy';
import s from './month-calendar.module.css';
export default function MonthCalendar({ entries, month, selectedDate, today, language, onMonthChange, onSelectDate }: { entries: readonly AgendaEntry[]; month: CalendarMonth; selectedDate: CalendarDate; today: CalendarDate; language: Language; onMonthChange(month: CalendarMonth): void; onSelectDate(date: CalendarDate): void }) {
  const t = eventsCopy[language];
  const grid = useRef<HTMLDivElement>(null), previous = useRef(month);
  useEffect(() => {
    const element = grid.current;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const stop = () => { if (media.matches) element?.getAnimations().forEach(a => a.cancel()); };
    element?.getAnimations().forEach(a => a.cancel());
    if (previous.current !== month && !media.matches) {
      const direction = month > previous.current ? 1 : -1;
      element?.animate([{ opacity: .5, transform: `translateX(${direction * 14}px)` }, { opacity: 1, transform: 'translateX(0)' }], { duration: 220, easing: 'ease-out' });
    }
    previous.current = month;
    media.addEventListener('change', stop);
    return () => { media.removeEventListener('change', stop); element?.getAnimations().forEach(a => a.cancel()); };
  }, [month]);
  const days = monthCells(month);
  return <section className={s.calendar} aria-label={t.calendar}>
    <div className={s.header}>
      <h2 id="calendar-month" aria-live="polite" aria-atomic="true">{formatCalendarDate(month + '-01', language, { month: 'long', year: 'numeric' })}</h2>
      <div className={s.controls}><button type="button" aria-label={t.previousMonth} onClick={() => onMonthChange(shiftMonth(month, -1))}>←</button><button type="button" onClick={() => onSelectDate(today)}>{t.today}</button><button type="button" aria-label={t.nextMonth} onClick={() => onMonthChange(shiftMonth(month, 1))}>→</button></div>
    </div>
    <div className={s.weekdays} aria-hidden="true">{days.slice(0, 7).map(date => <span key={date}>{formatCalendarDate(date, language, { weekday: 'short' })}</span>)}</div>
    <div className={s.grid} ref={grid}>
      {days.map(date => {
        const count = dailyEntriesOnDate(entries, date).length;
        return <button className={s.day} type="button" key={date} data-date={date} data-outside={date.slice(0, 7) !== month} aria-current={date === today ? 'date' : undefined} aria-pressed={date === selectedDate} aria-label={`${formatCalendarDate(date, language, { dateStyle: 'full' })}: ${count} ${count === 1 ? t.activity : t.activities}${date === today ? ` · ${t.today}` : ''}`} onClick={() => onSelectDate(date)}><span>{Number(date.slice(-2))}</span>{count > 0 && <span className={s.count} aria-hidden="true">{count}</span>}</button>;
      })}
    </div>
    {monthObservances(entries, month).length > 0 && <section className={s.observances} aria-labelledby="month-observances">
      <h3 id="month-observances">✦ {t.monthObservances}</h3>
      <div>{monthObservances(entries, month).map(entry => <Link key={entry.id} href={`/events/${entry.slug}`} data-month-observance={entry.id}><span>{t.wholeMonth} · {entry.kind === 'cultural-date' ? entry.scope[language] : ''}</span><strong>{entry.title[language]}</strong><span>{t.explore} ↗</span></Link>)}</div>
    </section>}
    <p className={s.hint}>{t.dayHint}</p>
  </section>;
}
