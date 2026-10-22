'use client';
import UiIcon from '../ui-icon';
import type { Language } from '../home-copy';
import type { Place } from './place-types';
import { directionsUrl, hasPin } from './place-utils';
import { categoryLabels, niagaraCopy } from './niagara-copy';
import s from './niagara.module.css';
import EventGallery from '../events/event-gallery';
export default function PlaceCard({ place: p, index, language, expanded, onToggle, registerButton }: { place: Place; index: number; language: Language; expanded: boolean; onToggle(): void; registerButton(node: HTMLButtonElement | null): void }) {
  const t = niagaraCopy[language], destination = directionsUrl(p), pinned = hasPin(p);
  const channels = p.channels.filter((channel, i, all) => all.findIndex(c => c.url === channel.url) === i);
  return <article id={p.id} className={`${s.card} ${expanded ? s.cardSelected : ''}`} data-place={p.id} data-place-number={index + 1} data-selected={expanded ? p.id : undefined} aria-labelledby={`place-title-${p.id}`}>
    <div className={s.cardTop}><span>{String(index + 1).padStart(2, '0')}</span><span>{p.city}</span><span aria-hidden="true"><UiIcon name="sparkle" /></span></div>
    <p className={s.tag}>{p.categories.map(c => categoryLabels[c]?.[language] ?? c).join(' / ')}</p>
    <h2 id={`place-title-${p.id}`} tabIndex={-1}><button ref={registerButton} onClick={onToggle} aria-controls={`detail-${p.id}`} aria-expanded={expanded}>{p.name}</button></h2>
    <p>{p.description[language]}</p>
    {p.address && <p className={s.address}>{p.address}</p>}
    <p className={`${s.mapStatus} ${!pinned ? s.note : ''}`}>{pinned ? t.onMap : `${t.offMap} · ${p.mode === 'order_only' ? t.noLocal : t.pending}`}</p>
    {!p.channels.length && <p className={s.note}>{t.channelPending}</p>}
    <div className={s.actions}>
      {destination && <a href={destination} target="_blank" rel="noopener noreferrer" aria-label={`${t.directions}: ${p.name} (${t.external})`}>{t.directions} <UiIcon name="external" /></a>}
      {channels.map((channel, i) => <a key={channel.url} href={channel.url} target="_blank" rel="noopener noreferrer" aria-label={`${channel.label}: ${p.name} (${t.external})`}>{i === 0 ? t.contact : channel.label} <UiIcon name="external" /></a>)}
    </div>
    <button className={s.more} onClick={onToggle} aria-controls={`detail-${p.id}`} aria-expanded={expanded}>{expanded ? t.close : t.details}<span aria-hidden="true">{expanded ? <UiIcon name="up" /> : <UiIcon name="right" />}</span></button>
    <section id={`detail-${p.id}`} className={s.expanded} hidden={!expanded} aria-label={`${t.details}: ${p.name}`}>
      {expanded && !!p.images?.length && <EventGallery images={p.images} language={language} entryId={p.id}/>}
      {p.mode === 'mobile' && <p className={s.note}>{t.mobile}</p>}
      <div className={s.sources}><p>{t.reviewed}: {p.reviewedOn}</p>{p.sources.map((source, i) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" aria-label={`${t.source} ${i + 1}: ${p.name} (${t.external})`}>{t.source} {i + 1} <UiIcon name="external" /></a>)}</div>
    </section>
  </article>;
}
