'use client';
import { eventDetailMessages } from '../../translations/interface-translations';
import UiIcon from '../ui-icon';
import Link from '../localized-link';
import { useAgendaState, useSiteLanguage } from '../site-context';
import {
  entryDate,
  eventDateTime,
  formatCalendarDate,
  formatEventTime,
  formatEntryWhen,
  initialAgendaState,
} from './agenda-dates';
import { useAgendaClock } from './agenda-clock';
import type { AgendaEntry } from './event-types';
import { eventsTranslations } from '../../translations/events-translations';
import EventGallery from './event-gallery';
import EventCountdown from './event-countdown';
import AddToCalendar from './add-to-calendar';
import styles from './event-detail.module.css';
export function EventDetailLoading() {
  const { language } = useSiteLanguage();
  return (
    <main id="main-content" tabIndex={-1} className={styles.detail} aria-busy="true">
      <p role="status">{eventsTranslations[language].loading}</p>
    </main>
  );
}
export default function EventDetail({ entry }: { entry: AgendaEntry }) {
  const { language } = useSiteLanguage();
  const { state, setState } = useAgendaState();
  const now = useAgendaClock();
  const translations = eventsTranslations[language];
  const date = entryDate(entry);
  return (
    <main id="main-content" tabIndex={-1} className={styles.detail}>
      <Link
        className={styles.back}
        href="/events"
        onClick={() => {
          if (!state) setState(initialAgendaState(now ?? new Date()));
        }}
      >
        <span aria-hidden="true">
          <UiIcon name="left" />
        </span>
        {translations.back}
      </Link>
      <div className={styles.heading}>
        <p className={styles.eyebrow}>{translations.categories[entry.category]}</p>
        <h1>{entry.title[language]}</h1>
        <p className={styles.description}>{entry.description[language]}</p>
      </div>
      <div className={styles.layout}>
        <div className={styles.media}>
          {entry.images?.length ? (
            <EventGallery images={entry.images} language={language} entryId={entry.id} />
          ) : (
            <div className={styles.poster} aria-hidden="true">
              <span>{formatCalendarDate(date, language, { month: 'long' })}</span>
              <strong>{date.slice(-2)}</strong>
              <p>{entry.title[language]}</p>
              <svg viewBox="0 0 100 100" fill="none">
                <path
                  d="m50 4 11 30 32-11-23 27 23 27-32-11-11 30-11-30L7 77l23-27L7 23l32 11Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          )}
          <div className={styles.source}>
            {entry.source.provenance === 'user-capture' && (
              <p>{translations.sourceCapture}</p>
            )}
            <p>
              {translations.reviewed}:{' '}
              <time dateTime={entry.source.reviewedOn}>
                {formatCalendarDate(entry.source.reviewedOn, language)}
              </time>
            </p>
            <a
              href={entry.source.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${translations.source}: ${entry.title[language]} (${translations.external})`}
            >
              {translations.source}
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
          </div>
        </div>
        <aside
          className={styles.facts}
          aria-label={eventDetailMessages[language].activityDetails}
        >
          {entry.kind === 'event' && entry.status !== 'scheduled' && (
            <div className={styles.notice}>
              <strong>{translations[entry.status]}</strong>
              <p>{entry.statusNote?.[language]}</p>
            </div>
          )}
          {entry.kind === 'event' && <EventCountdown entry={entry} language={language} />}
          <dl>
            <div>
              <dt>{translations.when}</dt>
              <dd>
                <time
                  dateTime={entry.kind === 'event' ? eventDateTime(entry) : entry.date}
                >
                  {formatEntryWhen(entry, language)}
                </time>
              </dd>
            </div>
            {entry.kind === 'event' ? (
              <>
                {entry.endsAt && (
                  <div>
                    <dt>{translations.until}</dt>
                    <dd>
                      <time dateTime={entry.endsAt}>
                        {formatEventTime(entry.endsAt, language)}
                      </time>
                    </dd>
                  </div>
                )}
                <div>
                  <dt>{translations.where}</dt>
                  <dd>
                    {[entry.venue[language], entry.city?.[language]]
                      .filter(Boolean)
                      .join(' · ')}
                    {entry.address && <p>{entry.address}</p>}
                  </dd>
                </div>
                <div>
                  <dt>{translations.organizer}</dt>
                  <dd>{entry.organizer[language]}</dd>
                </div>
                {entry.admission && (
                  <div>
                    <dt>{translations.admission}</dt>
                    <dd>{entry.admission[language]}</dd>
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <dt>{translations.scope}</dt>
                  <dd>{entry.scope[language]}</dd>
                </div>
                <div>
                  <dt>{translations.when}</dt>
                  <dd>
                    {entry.calendarDisplay === 'month'
                      ? translations.wholeMonth
                      : translations.fullDay}
                  </dd>
                </div>
                {entry.endDate && entry.endDate !== entry.date && (
                  <div>
                    <dt>{translations.until}</dt>
                    <dd>
                      <time dateTime={entry.endDate}>
                        {formatCalendarDate(entry.endDate, language)}
                      </time>
                    </dd>
                  </div>
                )}
              </>
            )}
          </dl>
          {entry.note && (
            <div className={styles.notice}>
              <p>{entry.note[language]}</p>
            </div>
          )}
          {entry.kind === 'event' && entry.dateSpan && !entry.sessions?.length && (
            <p className={styles.zone}>
              {eventDetailMessages[language].hoursNotPublishedCheckWithTheOrganizer}
            </p>
          )}
          {entry.kind === 'event' && !!entry.sessions?.length && (
            <section
              className={styles.schedule}
              aria-label={eventDetailMessages[language].publishedSchedule}
            >
              <h2>{eventDetailMessages[language].publishedSchedule}</h2>
              <ul>
                {entry.sessions.map((session, i) => (
                  <li key={i}>
                    {session.title && <strong>{session.title[language]}</strong>}
                    <p>
                      <time dateTime={session.startsAt}>
                        {formatEventTime(session.startsAt, language)}
                      </time>
                      {session.endsAt && (
                        <>
                          {' '}
                          —{' '}
                          <time dateTime={session.endsAt}>
                            {formatEventTime(session.endsAt, language, {
                              timeStyle: 'short',
                            })}
                          </time>
                        </>
                      )}
                    </p>
                    {!session.endsAt && (
                      <p>{eventDetailMessages[language].endTimeNotPublished}</p>
                    )}
                    {session.registrationUrl && entry.status !== 'cancelled' && (
                      <a
                        href={session.registrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${translations.register}: ${session.title?.[language] ?? entry.title[language]} (${translations.external})`}
                      >
                        {translations.register} <UiIcon name="external" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {!!entry.links?.length && (
            <div className={styles.moreLinks}>
              {entry.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${link.label[language]} (${translations.external})`}
                >
                  {link.label[language]} <UiIcon name="external" />
                </a>
              ))}
            </div>
          )}
          {entry.kind === 'event' ? (
            <>
              <p className={styles.zone}>{translations.zone}</p>
              <AddToCalendar entry={entry} language={language} />
              {entry.registrationUrl && entry.status !== 'cancelled' && (
                <a
                  className={styles.registration}
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
              {entry.registrationUrl && entry.status !== 'cancelled' && (
                <p className={styles.external}>{translations.external}</p>
              )}
            </>
          ) : (
            <p className={styles.zone}>{translations.cultural}</p>
          )}
        </aside>
      </div>
    </main>
  );
}
