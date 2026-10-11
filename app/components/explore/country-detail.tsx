'use client';
import Link from 'next/link';
import { useSiteLanguage } from '../site-context';
import type { Country } from './explore-types';
import type { CulturePage } from './culture-data';
import CultureMusic from './culture-music';
import { exploreCopy } from './explore-copy';
import s from './explore.module.css';
export default function CountryDetail({ country, page }: { country: Country; page: CulturePage }) {
  const { language } = useSiteLanguage(), t = exploreCopy[language];
  const labels = language === 'en' ? { story:'Explore the culture', sources:'Keep discovering', reference:'Sources', contents:'In this journey', music:'Listen', reviewed:'Based on documentary sources. Each section links to its references.' } : { story:'Explora la cultura', sources:'Sigue descubriendo', reference:'Fuentes', contents:'En este recorrido', music:'Escuchar', reviewed:'Basado en fuentes documentales. Cada sección enlaza sus referencias.' };
  return <main id="main-content" className={s.detail} tabIndex={-1} data-culture-page={country.slug}>
    <Link href="/explore" className={s.back}>← {t.back}</Link>
    <p className={s.eyebrow}>{country.name[language]} / {t.regions[country.region]}</p>
    <header className={s.cultureHero}><div><h1>{country.name[language]}</h1><p>{page.introduction[language]}</p>{country.politicalStatus && <p className={s.politicalNote}>{country.politicalStatus[language]}</p>}</div><div className={s.cultureArt} aria-hidden="true" style={{ backgroundImage: `url(/images/roots/${country.slug}.svg)` }} /></header>
    <div className={s.spotlightHeading}><p className={s.eyebrow}>{labels.story}</p><h2>{page.title[language]}</h2></div>
    <nav className={s.cultureNav} aria-label={labels.contents}>{page.sections.map(section => <a key={section.id} href={`#culture-${section.id}`}>{section.title[language]}</a>)}{!!page.music.length && <a href="#culture-music">♪ {labels.music}</a>}</nav>
    <div className={s.cultureSections}>{page.sections.map(section => <section className={s.cultureSection} key={section.id} aria-labelledby={`culture-${section.id}`}><h2 id={`culture-${section.id}`}>{section.title[language]}</h2><p>{section.text[language]}</p><div className={s.sectionReferences} aria-label={labels.reference}>{section.sourceIds.map(id => { const source = page.sources.find(source => source.id === id)!; return <a key={id} href={source.url} target="_blank" rel="noopener noreferrer">{source.title[language]} ↗</a>; })}</div></section>)}</div>
    {!!page.music.length && <CultureMusic tracks={page.music} />}
    <section className={s.credits} aria-labelledby="culture-sources-title"><h2 id="culture-sources-title">{labels.sources}</h2><ul>{page.sources.map(source => <li key={source.id}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title[language]} ↗</a></li>)}</ul><p>{labels.reviewed}</p><a href={country.sources[0].url} target="_blank" rel="noopener noreferrer">{t.source} ↗</a><Link className={s.back} href="/explore">← {t.back}</Link></section>
  </main>;
}
