import { canadaConnectionsTranslations } from '../../translations/canada-connections-translations';
import UiIcon from '../ui-icon';
import Link from 'next/link';
import type { Language } from '../../translations/language';
import styles from './explore.module.css';

const destinations = [
  {
    slug: 'colombia',
    name: { en: 'Colombia', es: 'Colombia' },
    invitation: {
      en: 'Caribbean rhythms. Pacific voices. Andean tables.',
      es: 'Ritmos caribeños. Voces del Pacífico. Mesas andinas.',
    },
  },
  {
    slug: 'mexico',
    name: { en: 'Mexico', es: 'México' },
    invitation: {
      en: 'Maize, mariachi and a world of living traditions.',
      es: 'Maíz, mariachi y un mundo de tradiciones vivas.',
    },
  },
  {
    slug: 'el-salvador',
    name: { en: 'El Salvador', es: 'El Salvador' },
    invitation: {
      en: 'Pupusas, volcanic landscapes and the sound of xuc.',
      es: 'Pupusas, paisajes volcánicos y el sonido del xuc.',
    },
  },
];

export default function CanadaConnections({ language }: { language: Language }) {
  const translations = canadaConnectionsTranslations[language];
  return (
    <div className={styles.connections} data-canada-connections>
      <div className={styles.connectionsHeading}>
        <div>
          <p className={styles.eyebrow}>{translations.eyebrow}</p>
          <h3>{translations.title}</h3>
        </div>
        <p>{translations.intro}</p>
      </div>
      <div className={styles.connectionCards}>
        {destinations.map((destination, index) => (
          <Link
            key={destination.slug}
            href={`/explore/${destination.slug}`}
            className={styles.connectionCard}
            data-featured-country={destination.slug}
          >
            <span
              className={styles.connectionArt}
              data-reveal
              aria-hidden="true"
              style={{ backgroundImage: `url(/images/roots/${destination.slug}.svg)` }}
            />
            <span className={styles.connectionNumber} aria-hidden="true">
              0{index + 1} / <UiIcon name="sparkle" />
            </span>
            <h4>{destination.name[language]}</h4>
            <p>{destination.invitation[language]}</p>
            <span className={styles.connectionLink} data-reveal>
              {translations.explore} {destination.name[language]}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M5 19 19 5M5 5h14v14" />
              </svg>
            </span>
          </Link>
        ))}
      </div>
      <p className={styles.connectionsSource}>
        {translations.note}{' '}
        <a
          href="https://www150.statcan.gc.ca/n1/pub/11-627-m/11-627-m2024042-eng.htm"
          target="_blank"
          rel="noopener noreferrer"
        >
          {translations.source}
        </a>
      </p>
    </div>
  );
}
