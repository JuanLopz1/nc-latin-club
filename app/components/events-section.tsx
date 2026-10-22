'use client';
import Link from './localized-link';
import EventCountdown from './events/event-countdown';
import AddToCalendar from './events/add-to-calendar';
import { eventsTranslations } from '../translations/events-translations';
import { eventDateTime, formatEntryWhen } from './events/agenda-dates';
import { homeEvents } from './events/home-events';
import { useAgendaClock } from './events/agenda-clock';
import type { Language } from '../translations/language';
import { useContent, emailHref } from './content-context';
import styles from './events-section.module.css';

function ActionArrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M5 19 19 5M9 5h10v10" />
    </svg>
  );
}

export default function EventsSection({ language }: { language: Language }) {
  const { home: homeTranslations, events: clubEvents, settings } = useContent();
  const joinEmailHref = emailHref(settings.joinEmail);
  const translations = homeTranslations[language].events;
  const eventLabels = eventsTranslations[language];
  const now = useAgendaClock();
  const upcoming = now ? homeEvents(clubEvents, now) : [];

  return (
    <section id="events" className={styles.events} aria-labelledby="events-title">
      <div className={styles.intro}>
        <div>
          <p className={styles.eyebrow}>{translations.label}</p>
          <h2 id="events-title">
            {translations.title[0]}
            <br />
            <em>{translations.title[1]}</em>
          </h2>
        </div>
        <p className={styles.introBody}>{translations.body}</p>
      </div>

      {!now ? (
        <p className={styles.body} role="status">
          {eventLabels.loading}
        </p>
      ) : upcoming.length === 0 ? (
        <div className={styles.empty}>
          <svg
            className={styles.energy}
            viewBox="0 0 180 180"
            fill="none"
            aria-hidden="true"
          >
            <path d="M112 15 45 98h42l-15 67 68-85H98Z" fill="currentColor" />
            <path
              d="m22 39 16 8m104 83 16 8M25 130l14-9m102-70 14-9"
              stroke="#76dbe3"
              strokeWidth="3"
            />
          </svg>
          <div className={styles.emptyContent}>
            <p className={styles.eyebrow}>{translations.emptyLabel}</p>
            <h3>{translations.emptyTitle}</h3>
            <p className={styles.body}>{translations.emptyBody}</p>
          </div>
          <div className={styles.emptyActions}>
            <span className={styles.soon}>{translations.soon}</span>
            <a
              className={styles.joinLink}
              href={joinEmailHref}
              title={homeTranslations[language].emailHint}
            >
              {translations.action}
              <ActionArrow />
            </a>
          </div>
        </div>
      ) : (
        <div className={styles.cards}>
          {upcoming.map((event) => (
            <article
              className={styles.card}
              key={event.id}
              data-home-event={event.slug}
              aria-labelledby={`event-${event.id}-title`}
            >
              <p className={styles.eyebrow}>
                {event.category === 'at-nc'
                  ? translations.campus
                  : eventLabels.categories[event.category]}
                {event.city && ` · ${event.city[language]}`}
              </p>
              {event.status !== 'scheduled' && (
                <div className={styles.notice}>
                  <strong>{eventLabels[event.status]}</strong>
                  <p>{event.statusNote?.[language]}</p>
                </div>
              )}
              <h3 id={`event-${event.id}-title`}>
                <Link href={`/events/${event.slug}`}>{event.title[language]}</Link>
              </h3>
              <p className={styles.body}>{event.description[language]}</p>
              <EventCountdown entry={event} language={language} />
              <dl className={styles.details}>
                <div>
                  <dt>{translations.date}</dt>
                  <dd>
                    <time dateTime={eventDateTime(event)}>
                      {formatEntryWhen(event, language)}
                    </time>
                  </dd>
                </div>
                {event.endsAt && (
                  <div>
                    <dt>{translations.until}</dt>
                    <dd>
                      <time dateTime={event.endsAt}>
                        {formatEntryWhen(
                          { ...event, startsAt: event.endsAt, dateSpan: undefined },
                          language,
                        )}
                      </time>
                    </dd>
                  </div>
                )}
                <div>
                  <dt>{translations.venue}</dt>
                  <dd>{event.venue[language]}</dd>
                </div>
                {event.organizer && (
                  <div>
                    <dt>{translations.organizer}</dt>
                    <dd>{event.organizer[language]}</dd>
                  </div>
                )}
                {event.admission && (
                  <div>
                    <dt>{translations.admission}</dt>
                    <dd>{event.admission[language]}</dd>
                  </div>
                )}
              </dl>
              <div className={styles.cardActions}>
                {event.registrationUrl && event.status !== 'cancelled' && (
                  <a
                    className={styles.joinLink}
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${translations.registration}: ${event.title[language]} (${eventLabels.external})`}
                  >
                    {translations.registration}
                    <ActionArrow />
                  </a>
                )}
                <AddToCalendar entry={event} language={language} />
              </div>
            </article>
          ))}
        </div>
      )}
      <Link href="/events" className={styles.agendaLink}>
        {eventsTranslations[language].viewAgenda}
        <ActionArrow />
      </Link>
    </section>
  );
}
