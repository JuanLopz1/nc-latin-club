'use client';
import UiIcon from '../ui-icon';
import Link from 'next/link';
import { useSiteLanguage } from '../site-context';
import type { Country } from './explore-types';
import type { CulturePage } from './culture-data';
import CultureMusic from './culture-music';
import EventGallery from '../events/event-gallery';
import { exploreTranslations } from '../../translations/explore-translations';
import styles from './explore.module.css';
export default function CountryDetail({
  country,
  page,
}: {
  country: Country;
  page: CulturePage;
}) {
  const { language } = useSiteLanguage();
  const translations = exploreTranslations[language];
  const labels =
    language === 'en'
      ? {
          story: 'Explore the culture',
          sources: 'Keep discovering',
          reference: 'Sources',
          contents: 'In this journey',
          music: 'Listen',
          reviewed: 'Based on documentary sources. Each section links to its references.',
        }
      : {
          story: 'Explora la cultura',
          sources: 'Sigue descubriendo',
          reference: 'Fuentes',
          contents: 'En este recorrido',
          music: 'Escuchar',
          reviewed:
            'Basado en fuentes documentales. Cada sección enlaza sus referencias.',
        };
  return (
    <main
      id="main-content"
      className={styles.detail}
      tabIndex={-1}
      data-culture-page={country.slug}
    >
      <Link href="/explore" className={styles.back}>
        <UiIcon name="left" /> {translations.back}
      </Link>
      <p className={styles.eyebrow}>
        {country.name[language]} / {translations.regions[country.region]}
      </p>
      <header className={styles.cultureHero}>
        <div>
          <h1>{country.name[language]}</h1>
          <p>{page.introduction[language]}</p>
          {country.politicalStatus && (
            <p className={styles.politicalNote}>{country.politicalStatus[language]}</p>
          )}
        </div>
        <div
          className={styles.cultureArt}
          aria-hidden="true"
          style={{ backgroundImage: `url(/images/roots/${country.slug}.svg)` }}
        />
      </header>
      {!!page.images?.length && (
        <EventGallery images={page.images} language={language} entryId={page.slug} />
      )}
      <div className={styles.spotlightHeading}>
        <p className={styles.eyebrow}>{labels.story}</p>
        <h2>{page.title[language]}</h2>
      </div>
      <nav className={styles.cultureNav} aria-label={labels.contents}>
        {page.sections.map((section) => (
          <a key={section.id} href={`#culture-${section.id}`}>
            {section.title[language]}
          </a>
        ))}
        {!!page.music.length && (
          <a href="#culture-music">
            <UiIcon name="music" /> {labels.music}
          </a>
        )}
      </nav>
      <div className={styles.cultureSections}>
        {page.sections.map((section) => (
          <section
            className={styles.cultureSection}
            key={section.id}
            aria-labelledby={`culture-${section.id}`}
          >
            <h2 id={`culture-${section.id}`}>{section.title[language]}</h2>
            <p>{section.text[language]}</p>
            <div className={styles.sectionReferences} aria-label={labels.reference}>
              {section.sourceIds.map((id) => {
                const source = page.sources.find((source) => source.id === id)!;
                return (
                  <a key={id} href={source.url} target="_blank" rel="noopener noreferrer">
                    {source.title[language]} <UiIcon name="external" />
                  </a>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      {!!page.music.length && <CultureMusic tracks={page.music} />}
      <section className={styles.credits} aria-labelledby="culture-sources-title">
        <h2 id="culture-sources-title">{labels.sources}</h2>
        <ul>
          {page.sources.map((source) => (
            <li key={source.id}>
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.title[language]} <UiIcon name="external" />
              </a>
            </li>
          ))}
        </ul>
        <p>{labels.reviewed}</p>
        <a href={country.sources[0].url} target="_blank" rel="noopener noreferrer">
          {translations.source} <UiIcon name="external" />
        </a>
        <Link className={styles.back} href="/explore">
          <UiIcon name="left" /> {translations.back}
        </Link>
      </section>
    </main>
  );
}
