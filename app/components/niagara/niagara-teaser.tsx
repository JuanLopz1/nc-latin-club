'use client';

import Link from 'next/link';
import type { Language } from '../home-copy';
import { categoryLabels, niagaraCopy } from './niagara-copy';
import { places } from './place-data';
import { useNiagaraCarousel } from './use-niagara-carousel';
import s from './niagara.module.css';
import c from './niagara-carousel.module.css';

const firstIds = ['coco-bar-mexican-grill', 'la-paisana-tienda', 'origen-bistro-bakery'];
const homePlaces = [...firstIds.flatMap(id => places.filter(place => place.id === id)), ...places.filter(place => !firstIds.includes(place.id))];
const originalNames: Record<string, string> = { 'coco-bar-mexican-grill': 'cocobar', 'la-paisana-tienda': 'La Paisana', 'origen-bistro-bakery': 'Origen' };
const symbols = ['✺', '◈', '✦'];
const controls = {
  en: { previous: 'Previous business', next: 'Next business', pause: 'Pause automatic scrolling', resume: 'Resume automatic scrolling', paused: 'Paused', playing: 'Slow scroll', reduced: 'Motion reduced', hint: 'Drag or swipe to explore all 21 businesses', rail: 'Local Niagara businesses' },
  es: { previous: 'Negocio anterior', next: 'Negocio siguiente', pause: 'Pausar desplazamiento automático', resume: 'Reanudar desplazamiento automático', paused: 'En pausa', playing: 'Desplazamiento lento', reduced: 'Movimiento reducido', hint: 'Arrastra o desliza para explorar los 21 negocios', rail: 'Negocios locales de Niagara' },
};

export default function NiagaraTeaser({ language }: { language: Language }) {
  const t = niagaraCopy[language];
  const labels = controls[language];
  const { railRef, reduced, paused, playing, dragging, move, toggle, railEvents, focusEvents } = useNiagaraCarousel();
  return <section id="niagara" className={s.teaser} aria-labelledby="niagara-title">
    <div className={s.teaserIntro}>
      <div><p className={s.eyebrow}>{t.featured}</p><h2 id="niagara-title">{t.title}</h2><p>{t.invite}</p></div>
      <Link className={s.explore} href="/niagara">{t.explore} <span aria-hidden="true">↗</span></Link>
    </div>
    <div>
      <div className={c.toolbar}>
        <p id="niagara-rail-hint">{labels.hint}</p>
        <div className={c.controls} role="group" aria-label={labels.rail}>
          <button type="button" aria-label={labels.previous} aria-controls="niagara-businesses" data-rail-previous onClick={() => move(-1)}><span aria-hidden="true">←</span></button>
          <button type="button" className={c.playback} aria-label={paused ? labels.resume : labels.pause} aria-controls="niagara-businesses" data-rail-toggle onClick={toggle} disabled={reduced}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">{paused || reduced ? <path d="m6 4 9 6-9 6Z" /> : <path d="M7 4v12m6-12v12" />}</svg> {reduced ? labels.reduced : paused ? labels.paused : labels.playing}
          </button>
          <button type="button" aria-label={labels.next} aria-controls="niagara-businesses" data-rail-next onClick={() => move(1)}><span aria-hidden="true">→</span></button>
        </div>
      </div>
      <div id="niagara-businesses" ref={railRef} className={c.rail} role="region" aria-label={labels.rail} aria-describedby="niagara-rail-hint" aria-live="off" tabIndex={0} data-niagara-rail data-rail-playing={playing} data-dragging={dragging} {...railEvents} {...focusEvents}>
        {homePlaces.map((place, index) => <Link key={place.id} href={`/niagara#${place.id}`} data-home-place={place.id} className={`${s.featureCard} ${c.card}`} draggable={false}>
          <div className={s.featureArt} aria-hidden="true"><span>{symbols[index % symbols.length]}</span><i>LOCAL / NIAGARA</i></div>
          <div className={s.featureText}><p>{place.categories.map(category => categoryLabels[category]?.[language] ?? category).join(' / ')}</p><h3>{originalNames[place.id] ?? place.name}<span aria-hidden="true">↗</span></h3><span>{place.city}</span></div>
        </Link>)}
      </div>
    </div>
  </section>;
}
