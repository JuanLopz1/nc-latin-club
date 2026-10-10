'use client';
import Link from 'next/link';
import { useSiteLanguage } from '../site-context';
import type { Country } from './explore-types';
import type { CulturePage } from './culture-data';
import { exploreCopy } from './explore-copy';
import s from './explore.module.css';
export default function CountryDetail({ country, page }: { country: Country; page: CulturePage }) {
  const { language } = useSiteLanguage(), t = exploreCopy[language];
  const labels = language === 'en' ? { story:'A cultural starting point', source:'In UNESCO’s words', sources:'Read further', quote:'Translated excerpt', reviewed:'Content reviewed from the source excerpts supplied to NC Latin Club.' } : { story:'Un punto de partida cultural', source:'En palabras de UNESCO', sources:'Para seguir descubriendo', quote:'Fragmento traducido', reviewed:'Contenido revisado a partir de los fragmentos de las fuentes aportados a NC Latin Club.' };
  return <main id="main-content" className={s.detail} tabIndex={-1} data-culture-page={country.slug}>
    <Link href="/explore" className={s.back}>← {t.back}</Link>
    <p className={s.eyebrow}>{country.name[language]} / {t.regions[country.region]}</p>
    <header className={s.cultureHero}><div><h1>{page.title[language]}</h1><p>{page.introduction[language]}</p></div><div className={s.cultureArt} aria-hidden="true" style={{ backgroundImage: `url(/images/roots/${country.slug}.svg)` }} /></header>
    <p className={s.storyLabel}>{labels.story}</p>
    <div className={s.cultureSections}>{page.sections.map(section => <section className={s.cultureSection} key={section.id} aria-labelledby={`culture-${section.id}`}><h2 id={`culture-${section.id}`}>{section.title[language]}</h2>{section.expression && <p className={s.expression}>{section.expression}</p>}<p>{section.text[language]}</p></section>)}</div>
    <section className={s.quotePanel} aria-labelledby="source-quote-title"><h2 id="source-quote-title">{labels.source}</h2>{page.sources.map(source => <div key={source.url}><blockquote><p>{source.excerptTranslation[language]}</p></blockquote><p className={s.quoteCaption}>{labels.quote} · <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title[language]} ↗</a></p></div>)}</section>
    <section className={s.credits} aria-labelledby="culture-sources-title"><h2 id="culture-sources-title">{labels.sources}</h2><ul>{page.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title[language]} ↗</a></li>)}</ul><p>{labels.reviewed}</p><a href={country.sources[0].url} target="_blank" rel="noopener noreferrer">{t.source} ↗</a><Link className={s.back} href="/explore">← {t.back}</Link></section>
  </main>;
}
