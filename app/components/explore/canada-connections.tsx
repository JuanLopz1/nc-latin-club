import { canadaConnectionsTranslations } from '../../translations/canada-connections-translations';
import Image from 'next/image';
import Link from '../localized-link';
import type { Language } from '../../translations/language';
import styles from './explore.module.css';

const destinations = [
  {
    slug: 'colombia',
    name: { en: 'Colombia', es: 'Colombia' },
    imageAlt: {
      en: 'Colombian flag above the National Capitol at Bolívar Square in Bogotá',
      es: 'Bandera colombiana sobre el Capitolio Nacional en la Plaza de Bolívar de Bogotá',
    },
    invitation: {
      en: 'Caribbean rhythms. Pacific voices. Andean tables.',
      es: 'Ritmos caribeños. Voces del Pacífico. Mesas andinas.',
    },
  },
  {
    slug: 'mexico',
    name: { en: 'Mexico', es: 'México' },
    imageAlt: {
      en: 'Mexican flag in front of the Metropolitan Cathedral in Mexico City',
      es: 'Bandera mexicana frente a la Catedral Metropolitana de Ciudad de México',
    },
    invitation: {
      en: 'Maize, mariachi and a world of living traditions.',
      es: 'Maíz, mariachi y un mundo de tradiciones vivas.',
    },
  },
  {
    slug: 'el-salvador',
    name: { en: 'El Salvador', es: 'El Salvador' },
    imageAlt: {
      en: 'National Palace in San Salvador with a Salvadoran flag in the plaza',
      es: 'Palacio Nacional de San Salvador con una bandera salvadoreña en la plaza',
    },
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
        {destinations.map((destination) => (
          <Link
            key={destination.slug}
            href={`/explore/${destination.slug}`}
            className={styles.connectionCard}
            data-featured-country={destination.slug}
          >
            <Image
              className={styles.connectionArt}
              src={`/images/connections/${destination.slug}.jpg`}
              alt={destination.imageAlt[language]}
              fill
              sizes="(max-width: 760px) 100vw, 33vw"
            />
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
      <p className={styles.connectionCredits}>
        {translations.photos}:{' '}
        <a
          href="https://unsplash.com/photos/6o3KrwENlUc"
          target="_blank"
          rel="noopener noreferrer"
        >
          Brian Kyed / Unsplash
        </a>
        {' · '}
        <a
          href="https://commons.wikimedia.org/wiki/File:Cathedral_with_Flag_-_Zocalo_(Central_Plaza)_-_Mexico_City_-_Mexico_(45241069645).jpg"
          target="_blank"
          rel="noopener noreferrer"
        >
          Adam Jones
        </a>
        {' / '}
        <a
          href="https://creativecommons.org/licenses/by-sa/2.0/"
          target="_blank"
          rel="noopener noreferrer"
        >
          CC BY-SA 2.0
        </a>
        {' · '}
        <a
          href="https://unsplash.com/photos/L2v7-rEKeDI"
          target="_blank"
          rel="noopener noreferrer"
        >
          Esaú Fuentes González / Unsplash
        </a>
      </p>
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
