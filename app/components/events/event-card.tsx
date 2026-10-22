'use client';
import UiIcon from '../ui-icon';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Language } from '../../translations/language';
import type { AgendaEntry } from './event-types';
import {
  entryDate,
  eventDateTime,
  formatCalendarDate,
  formatEntryWhen,
} from './agenda-dates';
import { eventsTranslations } from '../../translations/events-translations';
import styles from './event-card.module.css';
export default function EventCard({
  entry,
  language,
}: {
  entry: AgendaEntry;
  language: Language;
}) {
  const [failed, setFailed] = useState(false);
  const translations = eventsTranslations[language];
  const date = entryDate(entry);
  const image = entry.images?.[0];
  return (
    <article
      className={styles.card}
      data-entry={entry.slug}
      aria-labelledby={`card-${entry.slug}`}
    >
      <div className={styles.poster}>
        {image && !failed ? (
          <Image
            src={image.src}
            unoptimized={image.src.startsWith('/api/media/')}
            width={image.width}
            height={image.height}
            alt={image.alt[language]}
            sizes="(max-width: 760px) 100vw, 35vw"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className={styles.dateArt} aria-hidden="true">
            <span>{formatCalendarDate(date, language, { month: 'short' })}</span>
            <strong>
              {entry.kind === 'cultural-date' && entry.calendarDisplay === 'month' ? (
                <UiIcon name="sparkle" />
              ) : (
                date.slice(-2)
              )}
            </strong>
            <span>{translations.categories[entry.category]}</span>
            <svg viewBox="0 0 100 100" fill="none">
              <path
                d="m50 4 11 30 32-11-23 27 23 27-32-11-11 30-11-30L7 77l23-27L7 23l32 11Z"
                fill="currentColor"
              />
            </svg>
          </div>
        )}
        {failed && (
          <span className={styles.imageError}>{translations.imageUnavailable}</span>
        )}
      </div>
      <div className={styles.content}>
        <p className={styles.eyebrow}>{translations.categories[entry.category]}</p>
        {entry.kind === 'event' && entry.status !== 'scheduled' && (
          <p className={styles.status}>{translations[entry.status]}</p>
        )}
        <h3 id={`card-${entry.slug}`}>
          <Link href={`/events/${entry.slug}`}>{entry.title[language]}</Link>
        </h3>
        <p className={styles.description}>{entry.description[language]}</p>
        <div className={styles.meta}>
          <p>
            <time dateTime={entry.kind === 'event' ? eventDateTime(entry) : entry.date}>
              {formatEntryWhen(entry, language)}
            </time>
          </p>
          <p>
            {entry.kind === 'event'
              ? [entry.venue[language], entry.city?.[language]]
                  .filter(Boolean)
                  .join(' · ')
              : `${entry.scope[language]} · ${entry.calendarDisplay === 'month' ? translations.wholeMonth : translations.fullDay}`}
          </p>
          {entry.kind === 'event' && (
            <p>
              {translations.organizer}: {entry.organizer[language]}
            </p>
          )}
        </div>
        <Link className={styles.action} href={`/events/${entry.slug}`}>
          {translations.explore}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M4 12h15m-6-6 6 6-6 6" />
          </svg>
        </Link>
        {entry.kind === 'event' &&
          entry.registrationUrl &&
          entry.status !== 'cancelled' && (
            <a
              className={styles.action}
              href={entry.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${translations.register}: ${entry.title[language]} (${translations.external})`}
            >
              {translations.register}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M5 19 19 5M9 5h10v10" />
              </svg>
            </a>
          )}
      </div>
    </article>
  );
}
