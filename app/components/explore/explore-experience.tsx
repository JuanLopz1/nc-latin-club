'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useExploreState, useSiteLanguage } from '../site-context';
import type { Camera, Country, GlobeHandle } from './explore-types';
import { filterCountries, regions } from './explore-utils';
import { exploreCopy } from './explore-copy';
import GlobeScene from './globe-scene';
import s from './explore.module.css';
export default function ExploreExperience({ countries }: { countries: readonly Country[] }) {
  const { language } = useSiteLanguage(), { state, setState } = useExploreState(), t = exploreCopy[language];
  const [ready, setReady] = useState(false), [failed, setFailed] = useState(false);
  const scene = useRef<GlobeHandle>(null), triggers = useRef(new Map<string, HTMLButtonElement>()), previewTitle = useRef<HTMLHeadingElement>(null);
  const matches = useMemo(() => filterCountries(countries, state.query, state.regions), [countries, state.query, state.regions]), selected = countries.find(c => c.slug === state.selectedSlug);
  const onCamera = useCallback((camera: Camera) => setState(s => ({ ...s, camera })), [setState]);
  const stop = useCallback(() => setState(s => s.rotating ? { ...s, rotating: false } : s), [setState]);
  const choose = (slug: string, fromMap = false) => { setState(s => ({ ...s, selectedSlug: slug, rotating: false })); if (fromMap) requestAnimationFrame(() => previewTitle.current?.focus({ preventScroll: true })); };
  const close = useCallback(() => { setState(s => ({ ...s, selectedSlug: null })); if (state.selectedSlug) triggers.current.get(state.selectedSlug)?.focus({ preventScroll: true }); }, [state.selectedSlug, setState]);
  useEffect(() => { const escape = (e: KeyboardEvent) => { if (e.key === 'Escape' && state.selectedSlug) close(); }; window.addEventListener('keydown', escape); return () => window.removeEventListener('keydown', escape); }, [state.selectedSlug, close]);
  return <main id="main-content" tabIndex={-1} className={s.page}>
    <header className={s.intro}><p className={s.eyebrow}>{t.eyebrow}</p><h1>{t.title[0]}<br /><em>{t.title[1]}</em></h1><p>{t.intro}</p><span aria-hidden="true">✦</span></header>
    <section className={s.explorer} aria-label={t.eyebrow}>
      <div className={s.toolbar}><label><span>{t.search}</span><input type="search" value={state.query} placeholder={t.placeholder} onChange={e => setState(s => ({ ...s, query: e.target.value }))} /></label><p role="status">{matches.length} {t.results}</p></div>
      <div className={s.regions} role="group" aria-label={t.region}><button data-region="all" aria-pressed={state.regions.length === regions.length} onClick={() => setState(s => ({ ...s, regions: [...regions] }))}>{t.all}</button><button data-region="none" onClick={() => setState(s => ({ ...s, regions: [] }))}>{t.none}</button>{regions.map(region => <button key={region} data-region={region} aria-pressed={state.regions.includes(region)} onClick={() => setState(s => ({ ...s, regions: regions.filter(r => r === region ? !s.regions.includes(r) : s.regions.includes(r)) }))}>{t.regions[region]}</button>)}</div>
      <div className={s.globeFrame}>
        <div className={s.controls} role="group" aria-label={language === 'en' ? 'Globe controls' : 'Controles del globo'}><button data-zoom="in" onClick={() => scene.current?.zoom(1)} disabled={!ready} aria-label={t.zoomIn}>+</button><button data-zoom="out" onClick={() => scene.current?.zoom(-1)} disabled={!ready} aria-label={t.zoomOut}>−</button><button data-reset onClick={() => { setState(s => ({ ...s, selectedSlug: null, rotating: false })); scene.current?.reset(); }}>{t.reset}</button><button data-rotate disabled={!ready} aria-pressed={state.rotating} onClick={() => setState(s => ({ ...s, rotating: !s.rotating }))}>{state.rotating ? t.stop : t.rotate}</button></div>
        <GlobeScene ref={scene} countries={matches} selectedSlug={state.selectedSlug} camera={state.camera} rotating={state.rotating} language={language} onSelect={slug => choose(slug, true)} onCamera={onCamera} onReady={setReady} onInteraction={stop} onError={() => setFailed(true)} />
        {!ready && <p className={s.loading} role="status">{failed ? t.fallback : t.loading}</p>}
        <p className={s.hint}>{t.hint}</p>
        {selected && <aside className={s.preview} data-selected-country={selected.slug} aria-labelledby="selected-country-title"><div className={s.previewTop}><span className={s.eyebrow}>{t.preview}</span><button onClick={close} aria-label={t.close}>×</button></div><p className={s.regionLabel}>{t.regions[selected.region]}</p><h2 ref={previewTitle} tabIndex={-1} id="selected-country-title">{selected.name[language]}</h2><p>{selected.intro[language]}</p>{selected.politicalStatus && <p>{selected.politicalStatus[language]}</p>}{selected.culturalStatus === 'reviewed' && <Link className={s.action} href={`/explore/${selected.slug}`}>{t.explore} {selected.name[language]} <span aria-hidden="true">→</span></Link>}<a className={s.sourceLink} href={selected.sources[0].url} target="_blank" rel="noopener noreferrer">{t.sources}</a></aside>}
      </div>
      <p className={s.attribution}><a href="https://github.com/nvkelso/natural-earth-vector/blob/master/LICENSE.md" target="_blank" rel="noopener noreferrer">{t.source}</a></p>
    </section>
    <section className={s.destinationList} aria-labelledby="destination-list-title"><div className={s.listHeading}><h2 id="destination-list-title">{t.list}</h2><span>{matches.length.toString().padStart(2, '0')} / {countries.length}</span></div>{!matches.length && <p className={s.noResults}>{t.noResults}</p>}<div className={s.destinations}>{matches.map(c => <button key={c.slug} data-country={c.slug} ref={node => { if (node) triggers.current.set(c.slug, node); else triggers.current.delete(c.slug); }} aria-pressed={selected?.slug === c.slug} aria-controls={selected?.slug === c.slug ? 'selected-country-title' : undefined} onClick={() => choose(c.slug)}><span>{c.iso2}</span><strong>{c.name[language]}</strong><small>{t.regions[c.region]}</small><i aria-hidden="true">↗</i></button>)}</div></section>
  </main>;
}
