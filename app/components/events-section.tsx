import { copy, type Language } from "./home-copy";
import { clubEvents } from "./club-events";
import { joinEmailHref } from "./club-links";
import s from "./events-section.module.css";

function ActionArrow() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 19 19 5M9 5h10v10" /></svg>;
}

export default function EventsSection({ language }: { language: Language }) {
  const t = copy[language].events;
  const dateFormat = new Intl.DateTimeFormat(language === "en" ? "en-CA" : "es", {
    dateStyle: "long", timeStyle: "short", timeZone: "America/Toronto",
  });

  return (
    <section id="events" className={s.events} aria-labelledby="events-title">
      <div className={s.intro}>
        <div>
          <p className={s.eyebrow}>{t.label}</p>
          <h2 id="events-title">{t.title[0]}<br /><em>{t.title[1]}</em></h2>
        </div>
        <p className={s.introBody}>{t.body}</p>
      </div>

      {clubEvents.length === 0 ? (
        <div className={s.empty}>
          <svg className={s.sun} viewBox="0 0 180 180" fill="none" aria-hidden="true">
            <circle cx="90" cy="90" r="77" stroke="currentColor" strokeDasharray="2 7" />
            {Array.from({ length: 12 }, (_, i) => <ellipse key={i} cx="90" cy="56" rx="9" ry="22" stroke="currentColor" transform={`rotate(${i * 30} 90 90)`} />)}
            <circle cx="90" cy="90" r="17" fill="currentColor" />
            <path d="m22 20 3 8 8 3-8 3-3 8-3-8-8-3 8-3Zm135 113 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="currentColor" />
          </svg>
          <div className={s.emptyCopy}>
            <p className={s.eyebrow}>{t.emptyLabel}</p>
            <h3>{t.emptyTitle}</h3>
            <p className={s.body}>{t.emptyBody}</p>
          </div>
          <div className={s.emptyActions}>
            <span className={s.soon}>{t.soon}</span>
            <a className={s.joinLink} href={joinEmailHref} title={copy[language].emailHint}>{t.action}<ActionArrow /></a>
          </div>
        </div>
      ) : (
        <div className={s.cards}>
          {clubEvents.map(event => (
            <article className={s.card} key={event.id} aria-labelledby={`event-${event.id}-title`}>
              <p className={s.eyebrow}>NC LATIN CLUB</p>
              <h3 id={`event-${event.id}-title`}>{event.title[language]}</h3>
              <p className={s.body}>{event.description[language]}</p>
              <dl className={s.details}>
                <div><dt>{t.date}</dt><dd><time dateTime={event.startsAt}>{dateFormat.format(new Date(event.startsAt))}</time></dd></div>
                <div><dt>{t.venue}</dt><dd>{event.venue[language]}</dd></div>
              </dl>
              {event.registrationUrl && <a className={s.joinLink} href={event.registrationUrl} target="_blank" rel="noopener noreferrer" aria-label={`${t.registration}: ${event.title[language]}`}>{t.registration}<ActionArrow /></a>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
