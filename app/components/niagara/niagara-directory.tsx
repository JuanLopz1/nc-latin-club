'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSiteLanguage } from '../site-context';
import type { Place, PlaceFilters } from './place-types';
import { directionsUrl, filterPlaces, hasPin } from './place-utils';
import { niagaraCopy, categoryLabels, modeLabels } from './niagara-copy';
import NiagaraMap from './niagara-map';
import s from './niagara.module.css';
const empty: PlaceFilters = { query: '', city: '', category: '', mode: '' };
export default function NiagaraDirectory({ places }: { places: readonly Place[] }) {
  const { language } = useSiteLanguage(), t = niagaraCopy[language];
  const [filters, setFilters] = useState(empty), [selectedId, setSelectedId] = useState<string | null>(null), [reset, setReset] = useState(0);
  const cards = useMemo(() => filterPlaces(places, filters), [places, filters]);
  const selected = cards.find(p => p.id === selectedId);
  const cardButtons = useRef(new Map<string, HTMLButtonElement>());
  useEffect(() => { const escape = (e: KeyboardEvent) => { if (e.key === 'Escape' && selectedId) { setSelectedId(null); cardButtons.current.get(selectedId)?.focus(); } }; window.addEventListener('keydown', escape); return () => window.removeEventListener('keydown', escape); }, [selectedId]);
  const update = (key: keyof PlaceFilters, value: string) => { const next = { ...filters, [key]: value }; setFilters(next); if (!filterPlaces(places, next).some(p => p.id === selectedId)) setSelectedId(null); };
  const options = (key: 'city' | 'category' | 'mode') => [...new Set(places.flatMap(p => key === 'category' ? p.categories : [p[key]]))].sort();
  const actions = (p: Place) => <div className={s.actions}>
    {directionsUrl(p) && <a href={directionsUrl(p)!} target="_blank" rel="noopener noreferrer" aria-label={`${t.directions}: ${p.name} (${t.external})`}>{t.directions} ↗</a>}
    {p.channels.map((channel, i) => <a key={channel.url} href={channel.url} target="_blank" rel="noopener noreferrer" aria-label={`${channel.label}: ${p.name} (${t.external})`}>{i === 0 ? t.contact : channel.label} ↗</a>)}
  </div>;
  return <main id="main-content" tabIndex={-1} className={s.page}>
    <div className={s.intro}><Link href="/" className={s.back}>← NC LATIN CLUB</Link><p className={s.eyebrow}>NIAGARA / LOCAL CONNECTIONS</p><h1>{t.title}<span aria-hidden="true">✦</span></h1><p>{t.intro}</p></div>
    <div className={s.filters}>
      <label className={s.search}><span>{t.search}</span><input type="search" value={filters.query} onChange={e => update('query', e.target.value)} placeholder={language === 'en' ? 'Try pupusas, bakery, Welland…' : 'Prueba pupusas, panadería, Welland…'} /></label>
      {(['city', 'category', 'mode'] as const).map(key => <label key={key}><span>{t[key]}</span><select value={filters[key]} onChange={e => update(key, e.target.value)}><option value="">{t.all}</option>{options(key).map(v => <option key={v} value={v}>{key === 'category' ? categoryLabels[v]?.[language] ?? v : key === 'mode' ? modeLabels[v]?.[language] ?? v : v}</option>)}</select></label>)}
      <button className={s.clear} onClick={() => { setFilters(empty); setSelectedId(null); }}>{t.clear}</button>
    </div>
    <p className={s.count} role="status">{cards.length} {t.results}<span aria-hidden="true"> / </span>{cards.filter(hasPin).length} {t.pins}</p>
    <div className={s.layout}>
      <section className={s.mapColumn} aria-label={language === 'en' ? 'Explore the map' : 'Explora el mapa'}><div className={s.mapHeading}><strong>NIAGARA, ON</strong><button onClick={() => setReset(v => v + 1)}>{t.reset} ↗</button></div><NiagaraMap places={cards} selectedId={selected?.id ?? null} language={language} onSelect={setSelectedId} reset={reset} /><p className={s.mapHint}>{t.hint}</p><p className={s.based}>{t.based}</p></section>
      <section className={s.directory} aria-label={language === 'en' ? 'Business directory' : 'Directorio de negocios'}>
        {selected && <section className={s.detail} aria-labelledby="selected-place-title" data-selected={selected.id}>
          <div className={s.detailTop}><p className={s.eyebrow}>{t.selected}</p><button onClick={() => { setSelectedId(null); cardButtons.current.get(selected.id)?.focus(); }} aria-label={t.close}>×</button></div><h2 id="selected-place-title">{selected.name}</h2><p>{selected.description[language]}</p>{selected.address && <p>{selected.address}</p>}{selected.mode === 'mobile' && <p className={s.note}>{t.mobile}</p>}{!hasPin(selected) && <p className={s.note}>{selected.mode === 'order_only' ? t.noLocal : t.pending}</p>}{!selected.channels.length && <p className={s.note}>{t.channelPending}</p>}{actions(selected)}
          <div className={s.sources}><p>{t.reviewed}: {selected.reviewedOn}</p>{selected.sources.map((source, i) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" aria-label={`${t.source} ${i + 1}: ${selected.name} (${t.external})`}>{t.source} {i + 1} ↗</a>)}</div>
        </section>}
        {!cards.length && <p className={s.empty}>{t.noResults}</p>}
        <div className={s.cards}>{cards.map((p, i) => <article key={p.id} id={p.id} className={`${s.card} ${selected?.id === p.id ? s.cardSelected : ''}`} data-place={p.id}>
          <div className={s.cardTop}><span>{String(i + 1).padStart(2, '0')}</span><span>{p.city}</span><span aria-hidden="true">✦</span></div><p className={s.tag}>{p.categories.map(c => categoryLabels[c]?.[language] ?? c).join(' / ')}</p><h2><button ref={node => { if (node) cardButtons.current.set(p.id, node); else cardButtons.current.delete(p.id); }} onClick={() => setSelectedId(p.id)} aria-expanded={selected?.id === p.id}>{p.name}</button></h2><p>{p.description[language]}</p><p className={s.address}>{p.address ?? (p.mode === 'order_only' ? t.noLocal : t.pending)}</p>{!p.channels.length && <p className={s.note}>{t.channelPending}</p>}{actions(p)}<button className={s.more} onClick={() => setSelectedId(p.id)}>{t.details} <span aria-hidden="true">→</span></button>
        </article>)}</div>
      </section>
    </div>
  </main>;
}
