'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Language } from '../home-copy';
import type { AgendaEntry } from './event-types';
import { entryDate, formatCalendarDate, formatEventTime } from './agenda-dates';
import { eventsCopy } from './events-copy';
import s from './event-card.module.css';
export default function EventCard({ entry, language }: { entry: AgendaEntry; language: Language }) {
  const [failed, setFailed] = useState(false);
  const t = eventsCopy[language], date = entryDate(entry), image = entry.images?.[0];
  return <article className={s.card} data-entry={entry.slug} aria-labelledby={`card-${entry.slug}`}>
    <div className={s.poster}>
      {image && !failed ? <Image src={image.src} width={image.width} height={image.height} alt={image.alt[language]} sizes="(max-width: 760px) 100vw, 35vw" onError={() => setFailed(true)} /> : <div className={s.dateArt} aria-hidden="true"><span>{formatCalendarDate(date, language, { month: 'short' })}</span><strong>{date.slice(-2)}</strong><span>{t.categories[entry.category]}</span><svg viewBox="0 0 100 100" fill="none"><path d="m50 4 11 30 32-11-23 27 23 27-32-11-11 30-11-30L7 77l23-27L7 23l32 11Z" fill="currentColor" /></svg></div>}
      {failed && <span className={s.imageError}>{t.imageUnavailable}</span>}
    </div>
    <div className={s.content}>
      <p className={s.eyebrow}>{t.categories[entry.category]}</p>
      {entry.kind === 'event' && entry.status !== 'scheduled' && <p className={s.status}>{t[entry.status]}</p>}
      <h3 id={`card-${entry.slug}`}><Link href={`/events/${entry.slug}`}>{entry.title[language]}</Link></h3>
      <p className={s.description}>{entry.description[language]}</p>
      <div className={s.meta}>
        <p><time dateTime={entry.kind === 'event' ? entry.startsAt : entry.date}>{entry.kind === 'event' ? formatEventTime(entry.startsAt, language) : formatCalendarDate(entry.date, language)}</time></p>
        <p>{entry.kind === 'event' ? [entry.venue[language], entry.city?.[language]].filter(Boolean).join(' · ') : `${entry.scope[language]} · ${t.fullDay}`}</p>
        {entry.kind === 'event' && <p>{t.organizer}: {entry.organizer[language]}</p>}
      </div>
      <Link className={s.action} href={`/events/${entry.slug}`}>{t.explore}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" /></svg></Link>
      {entry.kind === 'event' && entry.registrationUrl && entry.status !== 'cancelled' && <a className={s.action} href={entry.registrationUrl} target="_blank" rel="noopener noreferrer" aria-label={`${t.register}: ${entry.title[language]} (${t.external})`}>{t.register}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 19 19 5M9 5h10v10" /></svg></a>}
    </div>
  </article>;
}
