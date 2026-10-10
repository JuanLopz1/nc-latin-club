'use client';
import type { Language } from '../home-copy';
import type { Place } from './place-types';
import { directionsUrl, hasPin } from './place-utils';
import { categoryLabels, niagaraCopy } from './niagara-copy';
import s from './niagara.module.css';
export default function PlaceCard({ place: p, index, language, expanded, onToggle, registerButton }: { place: Place; index: number; language: Language; expanded: boolean; onToggle(): void; registerButton(node: HTMLButtonElement | null): void }) {
  const t = niagaraCopy[language], destination = directionsUrl(p);
  const channels = p.channels.filter((channel, i, all) => all.findIndex(c => c.url === channel.url) === i);
  return <article id={p.id} className={`${s.card} ${expanded ? s.cardSelected : ''}`} data-place={p.id} data-selected={expanded ? p.id : undefined} aria-labelledby={`place-title-${p.id}`}>
    <div className={s.cardTop}><span>{String(index + 1).padStart(2, '0')}</span><span>{p.city}</span><span aria-hidden="true">✦</span></div>
    <p className={s.tag}>{p.categories.map(c => categoryLabels[c]?.[language] ?? c).join(' / ')}</p>
    <h2 id={`place-title-${p.id}`} tabIndex={-1}><button ref={registerButton} onClick={onToggle} aria-controls={`detail-${p.id}`} aria-expanded={expanded}>{p.name}</button></h2>
    <p>{p.description[language]}</p>
    <p className={s.address}>{p.address ?? (p.mode === 'order_only' ? t.noLocal : t.pending)}</p>
    {!p.channels.length && <p className={s.note}>{t.channelPending}</p>}
    <div className={s.actions}>
      {destination && <a href={destination} target="_blank" rel="noopener noreferrer" aria-label={`${t.directions}: ${p.name} (${t.external})`}>{t.directions} ↗</a>}
      {channels.map((channel, i) => <a key={channel.url} href={channel.url} target="_blank" rel="noopener noreferrer" aria-label={`${channel.label}: ${p.name} (${t.external})`}>{i === 0 ? t.contact : channel.label} ↗</a>)}
    </div>
    <button className={s.more} onClick={onToggle} aria-controls={`detail-${p.id}`} aria-expanded={expanded}>{expanded ? t.close : t.details}<span aria-hidden="true">{expanded ? '↑' : '→'}</span></button>
    <section id={`detail-${p.id}`} className={s.expanded} hidden={!expanded} aria-label={`${t.details}: ${p.name}`}>
      {p.mode === 'mobile' && <p className={s.note}>{t.mobile}</p>}
      {p.address && !hasPin(p) && <p className={s.note}>{t.pending}</p>}
      <div className={s.sources}><p>{t.reviewed}: {p.reviewedOn}</p>{p.sources.map((source, i) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" aria-label={`${t.source} ${i + 1}: ${p.name} (${t.external})`}>{t.source} {i + 1} ↗</a>)}</div>
    </section>
  </article>;
}
