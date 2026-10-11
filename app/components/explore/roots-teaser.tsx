import Link from 'next/link';
import type { Language } from '../home-copy';
import { exploreCopy } from './explore-copy';
import s from './explore.module.css';
import CanadaConnections from './canada-connections';
import HomeGlobePreview from './home-globe-preview';
export default function RootsTeaser({ language }: { language: Language }) {
  const t = exploreCopy[language];
  return <section id="roots" className={s.teaser} aria-labelledby="roots-title"><div><p className={s.eyebrow}>{t.eyebrow}</p><h2 id="roots-title">{t.title[0]}<br /><em>{t.title[1]}</em></h2><p>{t.teaser}</p><Link className={s.action} href="/explore">{t.cta}<span aria-hidden="true">→</span></Link></div><HomeGlobePreview language={language} /><CanadaConnections language={language} /></section>;
}
