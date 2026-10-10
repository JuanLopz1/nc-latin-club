import Link from 'next/link';
import type { Language } from '../home-copy';
import { niagaraCopy } from './niagara-copy';
import s from './niagara.module.css';
export default function NiagaraTeaser({ language }: { language: Language }) {
  const t = niagaraCopy[language];
  const featured = [
    { id: 'coco-bar-mexican-grill', name: 'cocobar', tag: 'BAR / MEXICAN GRILL', city: 'St. Catharines', symbol: '✺' },
    { id: 'la-paisana-tienda', name: 'La Paisana', tag: language === 'en' ? 'GROCERIES / RESTAURANT' : 'TIENDA / RESTAURANTE', city: 'Niagara Falls', symbol: '◈' },
    { id: 'origen-bistro-bakery', name: 'Origen', tag: 'BISTRO / BAKERY', city: 'St. Catharines', symbol: '✦' },
  ];
  return <section id="niagara" className={s.teaser} aria-labelledby="niagara-title"><div className={s.teaserIntro}><div><p className={s.eyebrow}>{t.featured}</p><h2 id="niagara-title">{t.title}</h2><p>{t.invite}</p></div><Link className={s.explore} href="/niagara">{t.explore} <span aria-hidden="true">↗</span></Link></div><div className={s.featured}>{featured.map(p => <Link key={p.id} href={`/niagara#${p.id}`} className={s.featureCard}><div className={s.featureArt} aria-hidden="true"><span>{p.symbol}</span><i>LOCAL / NIAGARA</i></div><div className={s.featureText}><p>{p.tag}</p><h3>{p.name}<span aria-hidden="true">↗</span></h3><span>{p.city}</span></div></Link>)}</div></section>;
}
