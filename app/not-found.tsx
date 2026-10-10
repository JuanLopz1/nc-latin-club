'use client';
import Link from 'next/link';
import { useSiteLanguage } from './components/site-context';
import s from './components/events/event-detail.module.css';
export default function NotFound() {
  const { language } = useSiteLanguage();
  return <main id="main-content" tabIndex={-1} className={s.detail}><div className={s.heading}><p className={s.eyebrow}>404</p><h1>{language === 'en' ? 'A different path.' : 'Otro camino.'}</h1><p className={s.description}>{language === 'en' ? 'We couldn’t find that page. Come back to the agenda and discover what’s happening.' : 'No encontramos esa página. Vuelve a la agenda y descubre qué está pasando.'}</p><Link className={s.back} href="/events">{language === 'en' ? 'Explore the agenda' : 'Explora la agenda'} →</Link></div></main>;
}
