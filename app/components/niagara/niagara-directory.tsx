'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSiteLanguage } from '../site-context';
import type { Place, PlaceFilters } from './place-types';
import { filterPlaces, hasPin, initialPlaceFilters, placeOptions } from './place-utils';
import { niagaraCopy, categoryLabels, modeLabels } from './niagara-copy';
import PlaceCard from './place-card';
import PlaceFilter from './place-filter';
import NiagaraMap from './niagara-map';
import s from './niagara.module.css';
export default function NiagaraDirectory({ places }: { places: readonly Place[] }) {
  const { language } = useSiteLanguage(), t = niagaraCopy[language];
  const [filters, setFilters] = useState(() => initialPlaceFilters(places)), [selectedId, setSelectedId] = useState<string | null>(null), [reset, setReset] = useState(0);
  const cards = useMemo(() => filterPlaces(places, filters), [places, filters]);
  const selected = cards.find(p => p.id === selectedId);
  const cardButtons = useRef(new Map<string, HTMLButtonElement>());
  useEffect(() => { const escape = (e: KeyboardEvent) => { if (e.key === 'Escape' && selectedId) { setSelectedId(null); cardButtons.current.get(selectedId)?.focus(); } }; window.addEventListener('keydown', escape); return () => window.removeEventListener('keydown', escape); }, [selectedId]);
  const update = <K extends keyof PlaceFilters>(key: K, value: PlaceFilters[K]) => { const next = { ...filters, [key]: value }; setFilters(next); if (!filterPlaces(places, next).some(p => p.id === selectedId)) setSelectedId(null); };
  const reveal = (id: string, fromMap = false) => {
    if (!fromMap && selectedId === id) { setSelectedId(null); return; }
    setSelectedId(id);
    requestAnimationFrame(() => {
      const panel = document.getElementById(fromMap ? id : `detail-${id}`);
      panel?.scrollIntoView({ block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      if (fromMap) document.getElementById(`place-title-${id}`)?.focus({ preventScroll: true });
    });
  };
  return <main id="main-content" tabIndex={-1} className={s.page}>
    <div className={s.intro}><Link href="/" className={s.back}>← NC LATIN CLUB</Link><p className={s.eyebrow}>NIAGARA / LOCAL CONNECTIONS</p><h1>{t.title}<span aria-hidden="true">✦</span></h1><p>{t.intro}</p></div>
    <div className={s.filters}>
      <label className={s.search}><span>{t.search}</span><input type="search" value={filters.query} onChange={e => update('query', e.target.value)} placeholder={language === 'en' ? 'Try pupusas, bakery, Welland…' : 'Prueba pupusas, panadería, Welland…'} /></label>
      {(['city', 'category', 'mode'] as const).map(key => <PlaceFilter key={key} name={key} label={t[key]} options={placeOptions(places, key)} selected={filters[key]} language={language} onChange={values => update(key, values)} optionLabel={v => key === 'category' ? categoryLabels[v]?.[language] ?? v : key === 'mode' ? modeLabels[v]?.[language] ?? v : v} />)}
      <button className={s.clear} onClick={() => { setFilters(initialPlaceFilters(places)); setSelectedId(null); }}>{t.clear}</button>
    </div>
    <p className={s.filterHint}>{t.filterHint}</p>
    <p className={s.count} role="status">{cards.length} {t.results}<span aria-hidden="true"> / </span>{cards.filter(hasPin).length} {t.pins}{selected && ` · ${t.selected}: ${selected.name}`}</p>
    <div className={s.layout}>
      <section className={s.mapColumn} aria-label={language === 'en' ? 'Explore the map' : 'Explora el mapa'}><div className={s.mapHeading}><strong>NIAGARA, ON</strong><button onClick={() => setReset(v => v + 1)}>{t.reset} ↗</button></div><NiagaraMap places={cards} selectedId={selected?.id ?? null} language={language} onSelect={id => reveal(id, true)} reset={reset} /><p className={s.mapHint}>{t.hint}</p><p className={s.based}>{t.based}</p></section>
      <section className={s.directory} aria-label={language === 'en' ? 'Business directory' : 'Directorio de negocios'}>
        {!cards.length && <p className={s.empty}>{t.noResults}</p>}
        <div className={s.cards}>{cards.map((p, i) => <PlaceCard key={p.id} place={p} index={i} language={language} expanded={selected?.id === p.id} onToggle={() => reveal(p.id)} registerButton={node => { if (node) cardButtons.current.set(p.id, node); else cardButtons.current.delete(p.id); }} />)}</div>
      </section>
    </div>
  </main>;
}
