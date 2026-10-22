'use client';
import UiIcon from '../ui-icon';
import Link from '../localized-link';
import { useEffect, useRef } from 'react';
import type { Language } from '../../translations/language';
import type { AgendaEntry, CalendarDate, CalendarMonth } from './event-types';
import {
  dailyEntriesOnDate,
  monthObservances,
  formatCalendarDate,
  monthCells,
  shiftMonth,
} from './agenda-dates';
import { eventsTranslations } from '../../translations/events-translations';
import styles from './month-calendar.module.css';
import { useReducedMotion } from '../motion-preference';
export default function MonthCalendar({
  entries,
  month,
  selectedDate,
  today,
  language,
  onMonthChange,
  onSelectDate,
  countKind,
}: {
  entries: readonly AgendaEntry[];
  month: CalendarMonth;
  selectedDate: CalendarDate;
  today: CalendarDate;
  language: Language;
  countKind?: 'events' | 'culture';
  onMonthChange(month: CalendarMonth): void;
  onSelectDate(date: CalendarDate): void;
}) {
  const translations = eventsTranslations[language];
  const reduced = useReducedMotion();
  const grid = useRef<HTMLDivElement>(null);
  const previous = useRef(month);
  useEffect(() => {
    const element = grid.current;
    element?.getAnimations().forEach((a) => a.cancel());
    if (previous.current !== month && !reduced) {
      const direction = month > previous.current ? 1 : -1;
      element?.animate(
        [
          { opacity: 0.5, transform: `translateX(${direction * 14}px)` },
          { opacity: 1, transform: 'translateX(0)' },
        ],
        { duration: 220, easing: 'ease-out' },
      );
    }
    previous.current = month;
    return () => {
      element?.getAnimations().forEach((a) => a.cancel());
    };
  }, [month, reduced]);
  const days = monthCells(month);
  const countLabel = (count: number) =>
    countKind === 'culture'
      ? count === 1
        ? translations.culturalDate
        : translations.culturalDates
      : countKind === 'events'
        ? count === 1
          ? translations.event
          : translations.events
        : count === 1
          ? translations.activity
          : translations.activities;
  return (
    <section className={styles.calendar} aria-label={translations.calendar}>
      <div className={styles.header}>
        <h2 id="calendar-month" aria-live="polite" aria-atomic="true">
          {formatCalendarDate(month + '-01', language, {
            month: 'long',
            year: 'numeric',
          })}
        </h2>
        <div className={styles.controls}>
          <button
            type="button"
            aria-label={translations.previousMonth}
            onClick={() => onMonthChange(shiftMonth(month, -1))}
          >
            <UiIcon name="left" />
          </button>
          <button type="button" onClick={() => onSelectDate(today)}>
            {translations.today}
          </button>
          <button
            type="button"
            aria-label={translations.nextMonth}
            onClick={() => onMonthChange(shiftMonth(month, 1))}
          >
            <UiIcon name="right" />
          </button>
        </div>
      </div>
      <div className={styles.weekdays} aria-hidden="true">
        {days.slice(0, 7).map((date) => (
          <span key={date}>
            {formatCalendarDate(date, language, { weekday: 'short' })}
          </span>
        ))}
      </div>
      <div className={styles.grid} ref={grid}>
        {days.map((date) => {
          const count = dailyEntriesOnDate(entries, date).length;
          return (
            <button
              className={styles.day}
              type="button"
              key={date}
              data-date={date}
              data-outside={date.slice(0, 7) !== month}
              aria-current={date === today ? 'date' : undefined}
              aria-pressed={date === selectedDate}
              aria-label={`${formatCalendarDate(date, language, { dateStyle: 'full' })}: ${count} ${countLabel(count)}${date === today ? ` · ${translations.today}` : ''}`}
              onClick={() => onSelectDate(date)}
            >
              <span>{Number(date.slice(-2))}</span>
              {count > 0 && (
                <span className={styles.count} aria-hidden="true">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {monthObservances(entries, month).length > 0 && (
        <section className={styles.observances} aria-labelledby="month-observances">
          <h3 id="month-observances">
            <UiIcon name="sparkle" /> {translations.monthObservances}
          </h3>
          <div>
            {monthObservances(entries, month).map((entry) => (
              <Link
                key={entry.id}
                href={`/events/${entry.slug}`}
                data-month-observance={entry.id}
              >
                <span>
                  {translations.wholeMonth} ·{' '}
                  {entry.kind === 'cultural-date' ? entry.scope[language] : ''}
                </span>
                <strong>{entry.title[language]}</strong>
                <span>
                  {translations.explore} <UiIcon name="external" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
      <p className={styles.hint}>{translations.dayHint}</p>
    </section>
  );
}
