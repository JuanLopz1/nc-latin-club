'use client';
import UiIcon from './ui-icon';
import type { Language } from '../translations/language';
import { useContent } from './content-context';
import styles from './club-home.module.css';

export default function FamiliaSection({
  language,
  standalone = false,
}: {
  language: Language;
  standalone?: boolean;
}) {
  const { home: homeTranslations } = useContent();
  const translations = homeTranslations[language];
  const Heading = standalone ? 'h1' : 'h2';
  return (
    <section
      id="familia"
      className={`${styles.section} ${styles.familia}`}
      aria-labelledby="familia-title"
    >
      <div className={styles.familiaContent}>
        <p className={styles.eyebrow}>{translations.familiaLabel}</p>
        <Heading id="familia-title">
          {translations.familiaTitle[0]}
          <br />
          <em>{translations.familiaTitle[1]}</em>
        </Heading>
        <p className={styles.lead}>{translations.familiaBody}</p>
        <p className={styles.bodyText}>{translations.familiaSecond}</p>
        <div className={styles.values} data-reveal>
          {translations.values.map((value, index) => (
            <span key={value}>
              <span aria-hidden="true">
                <UiIcon
                  name={index === 0 ? 'sparkle' : index === 1 ? 'music' : 'heart'}
                />
              </span>
              {value}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.familiaArt} data-reveal>
        <svg
          className={styles.familiaPulse}
          viewBox="0 0 240 320"
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          aria-hidden="true"
        >
          <path d="M20 135v50m40-95v140m40-200v260m40-225v190m40-150v110m40-75v40" />
        </svg>
        <span className={styles.familiaArtLabel}>BIENVENIDOS</span>
        <svg
          className={styles.familiaSignal}
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="m32 2 7 19 19-7-15 18 15 18-19-7-7 19-7-19-19 7 15-18L6 14l19 7Z"
            fill="currentColor"
          />
          <circle cx="32" cy="32" r="6" fill="var(--background)" />
        </svg>
        <p>
          {translations.familiaQuote[0]}
          <br />
          <em>{translations.familiaQuote[1]}</em>
        </p>
        <span className={styles.familiaArtFoot}>{translations.familiaNote}</span>
        <span className={styles.familiaPosterLines} aria-hidden="true" />
      </div>
    </section>
  );
}
