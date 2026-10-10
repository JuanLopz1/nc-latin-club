'use client';
import Link from 'next/link';
import { useAgendaState, useSiteLanguage } from '../site-context';
import { entryDate, eventDateTime, formatCalendarDate, formatEventTime, formatEntryWhen, initialAgendaState } from './agenda-dates';
import { useAgendaClock } from './agenda-clock';
import type { AgendaEntry } from './event-types';
import { eventsCopy } from './events-copy';
import EventGallery from './event-gallery';
import s from './event-detail.module.css';
export function EventDetailLoading() {
  const { language } = useSiteLanguage();
  return <main id="main-content" tabIndex={-1} className={s.detail} aria-busy="true"><p role="status">{eventsCopy[language].loading}</p></main>;
}
export default function EventDetail({ entry }: { entry: AgendaEntry }) {
  const { language } = useSiteLanguage(), { state, setState } = useAgendaState(), now = useAgendaClock();
  const t = eventsCopy[language], date = entryDate(entry);
  return <main id="main-content" tabIndex={-1} className={s.detail}>
    <Link className={s.back} href="/events" onClick={() => { if (!state) setState(initialAgendaState(now ?? new Date(), entry.category)); }}><span aria-hidden="true">←</span>{t.back}</Link>
    <div className={s.heading}><p className={s.eyebrow}>{t.categories[entry.category]}</p><h1>{entry.title[language]}</h1><p className={s.description}>{entry.description[language]}</p></div>
    <div className={s.layout}>
      <div className={s.media}>
        {entry.images?.length ? <EventGallery images={entry.images} language={language} entryId={entry.id} /> : <div className={s.poster} aria-hidden="true"><span>{formatCalendarDate(date, language, { month: 'long' })}</span><strong>{date.slice(-2)}</strong><p>{entry.title[language]}</p><svg viewBox="0 0 100 100" fill="none"><path d="m50 4 11 30 32-11-23 27 23 27-32-11-11 30-11-30L7 77l23-27L7 23l32 11Z" fill="currentColor" /></svg></div>}
        <div className={s.source}>
          {entry.source.provenance === 'user-capture' && <p>{t.sourceCapture}</p>}
          <p>{t.reviewed}: <time dateTime={entry.source.reviewedOn}>{formatCalendarDate(entry.source.reviewedOn, language)}</time></p>
          <a href={entry.source.url} target="_blank" rel="noopener noreferrer" aria-label={`${t.source}: ${entry.title[language]} (${t.external})`}>{t.source}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 19 19 5M9 5h10v10" /></svg></a>
        </div>
      </div>
      <aside className={s.facts} aria-label={language === 'en' ? 'Activity details' : 'Detalles de la actividad'}>
        {entry.kind === 'event' && entry.status !== 'scheduled' && <div className={s.notice}><strong>{t[entry.status]}</strong><p>{entry.statusNote?.[language]}</p></div>}
        <dl>
          <div><dt>{t.when}</dt><dd><time dateTime={entry.kind === 'event' ? eventDateTime(entry) : entry.date}>{formatEntryWhen(entry, language)}</time></dd></div>
          {entry.kind === 'event' ? <>
            {entry.endsAt && <div><dt>{t.until}</dt><dd><time dateTime={entry.endsAt}>{formatEventTime(entry.endsAt, language)}</time></dd></div>}
            <div><dt>{t.where}</dt><dd>{[entry.venue[language], entry.city?.[language]].filter(Boolean).join(' · ')}{entry.address && <p>{entry.address}</p>}</dd></div>
            <div><dt>{t.organizer}</dt><dd>{entry.organizer[language]}</dd></div>
            {entry.admission && <div><dt>{t.admission}</dt><dd>{entry.admission[language]}</dd></div>}
          </> : <><div><dt>{t.scope}</dt><dd>{entry.scope[language]}</dd></div><div><dt>{t.when}</dt><dd>{t.fullDay}</dd></div>{entry.endDate && entry.endDate !== entry.date && <div><dt>{t.until}</dt><dd><time dateTime={entry.endDate}>{formatCalendarDate(entry.endDate, language)}</time></dd></div>}</>}
        </dl>
        {entry.note && <div className={s.notice}><p>{entry.note[language]}</p></div>}
        {entry.kind === 'event' && entry.dateSpan && !entry.sessions?.length && <p className={s.zone}>{language === 'en' ? 'Hours not published · check with the organizer.' : 'Horario no publicado · consulta al organizador.'}</p>}
        {entry.kind === 'event' && !!entry.sessions?.length && <section className={s.schedule} aria-label={language === 'en' ? 'Published schedule' : 'Programa publicado'}><h2>{language === 'en' ? 'Published schedule' : 'Programa publicado'}</h2><ul>{entry.sessions.map((session, i) => <li key={i}>{session.title && <strong>{session.title[language]}</strong>}<p><time dateTime={session.startsAt}>{formatEventTime(session.startsAt, language)}</time>{session.endsAt && <> — <time dateTime={session.endsAt}>{formatEventTime(session.endsAt, language, { timeStyle: 'short' })}</time></>}</p>{!session.endsAt && <p>{language === 'en' ? 'End time not published.' : 'Hora de cierre no publicada.'}</p>}{session.registrationUrl && entry.status !== 'cancelled' && <a href={session.registrationUrl} target="_blank" rel="noopener noreferrer" aria-label={`${t.register}: ${session.title?.[language] ?? entry.title[language]} (${t.external})`}>{t.register} ↗</a>}</li>)}</ul></section>}
        {!!entry.links?.length && <div className={s.moreLinks}>{entry.links.map(link => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={`${link.label[language]} (${t.external})`}>{link.label[language]} ↗</a>)}</div>}
        {entry.kind === 'event' ? <>
          <p className={s.zone}>{t.zone}</p>
          {entry.registrationUrl && entry.status !== 'cancelled' && <a className={s.registration} href={entry.registrationUrl} target="_blank" rel="noopener noreferrer" aria-label={`${t.register}: ${entry.title[language]} (${t.external})`}>{t.register}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 19 19 5M9 5h10v10" /></svg></a>}
          {entry.registrationUrl && entry.status !== 'cancelled' && <p className={s.external}>{t.external}</p>}
        </> : <p className={s.zone}>{t.cultural}</p>}
      </aside>
    </div>
  </main>;
}
