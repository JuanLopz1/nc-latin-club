import UiIcon from '../ui-icon';
import Link from 'next/link';
import type { Language } from '../home-copy';
import { useContent } from '../content-context';
import s from './explore.module.css';
import CanadaConnections from './canada-connections';
import HomeGlobePreview from './home-globe-preview';
export default function RootsTeaser({ language }: { language: Language }) {
  const {settings:{roots:t}}=useContent();
  return <section id="roots" className={s.teaser} aria-labelledby="roots-title"><div><p className={s.eyebrow}>{t.label[language]}</p><h2 id="roots-title">{t.title[0][language]}<br /><em>{t.title[1][language]}</em></h2><p>{t.text[language]}</p><Link className={s.action} href="/explore">{t.action[language]}<span aria-hidden="true"><UiIcon name="right" /></span></Link></div><HomeGlobePreview language={language} /><CanadaConnections language={language} /></section>;
}
