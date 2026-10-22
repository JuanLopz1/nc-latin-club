'use client';
import UiIcon from './ui-icon';
import type { Language } from './home-copy';
import { useContent } from './content-context';
import s from './club-home.module.css';

export default function FamiliaSection({ language, standalone = false }: { language: Language; standalone?: boolean }) {
  const {home:copy}=useContent(), t = copy[language], Heading = standalone ? 'h1' : 'h2';
  return <section id="familia" className={`${s.section} ${s.familia}`} aria-labelledby="familia-title">
    <div className={s.familiaCopy}><p className={s.eyebrow}>{t.familiaLabel}</p><Heading id="familia-title">{t.familiaTitle[0]}<br /><em>{t.familiaTitle[1]}</em></Heading><p className={s.lead}>{t.familiaBody}</p><p className={s.bodyCopy}>{t.familiaSecond}</p><div className={s.values} data-reveal>{t.values.map((value, index) => <span key={value}><span aria-hidden="true"><UiIcon name={index === 0 ? 'sparkle' : index === 1 ? 'music' : 'heart'} /></span>{value}</span>)}</div></div>
    <div className={s.familiaArt} data-reveal><svg className={s.familiaPulse} viewBox="0 0 240 320" fill="none" stroke="currentColor" strokeWidth="12" aria-hidden="true"><path d="M20 135v50m40-95v140m40-200v260m40-225v190m40-150v110m40-75v40" /></svg><span className={s.familiaArtLabel}>BIENVENIDOS</span><svg className={s.familiaSignal} viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="m32 2 7 19 19-7-15 18 15 18-19-7-7 19-7-19-19 7 15-18L6 14l19 7Z" fill="currentColor" /><circle cx="32" cy="32" r="6" fill="var(--background)" /></svg><p>{t.familiaQuote[0]}<br /><em>{t.familiaQuote[1]}</em></p><span className={s.familiaArtFoot}>{t.familiaNote}</span><span className={s.familiaPosterLines} aria-hidden="true" /></div>
  </section>;
}
