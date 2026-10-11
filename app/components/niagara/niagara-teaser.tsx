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
  en: { previous: 'Previous business', next: 'Next business', hint: 'Drag or swipe to explore all 21 businesses', rail: 'Local Niagara businesses' },
  es: { previous: 'Negocio anterior', next: 'Negocio siguiente', hint: 'Arrastra o desliza para explorar los 21 negocios', rail: 'Negocios locales de Niagara' },
};

export default function NiagaraTeaser({ language }: { language: Language }) {
  const t = niagaraCopy[language];
  const labels = controls[language];
  const { railRef, playing, dragging, move, railEvents, focusEvents } = useNiagaraCarousel();
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
