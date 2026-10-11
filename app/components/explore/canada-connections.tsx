import Link from 'next/link';
import type { Language } from '../home-copy';
import s from './explore.module.css';

const copy = {
  en: {
    eyebrow: 'LATIN ROOTS IN CANADA',
    title: 'Roots that travel with us.',
    intro: 'Meet the three largest country-of-origin communities among immigrants identifying as Latin American in Canada.',
    explore: 'Discover',
    note: '2021 Census · Country of birth, not ancestry or current nationality.',
    source: 'Statistics Canada',
  },
  es: {
    eyebrow: 'RAÍCES LATINAS EN CANADÁ',
    title: 'Raíces que viajan con nosotros.',
    intro: 'Conoce las tres mayores comunidades por país de origen entre los inmigrantes que se identifican como latinoamericanos en Canadá.',
    explore: 'Descubrir',
    note: 'Censo 2021 · País de nacimiento, no ascendencia ni nacionalidad actual.',
    source: 'Statistics Canada',
  },
};

const destinations = [
  { slug: 'colombia', name: { en: 'Colombia', es: 'Colombia' },
    invitation: { en: 'Caribbean rhythms. Pacific voices. Andean tables.', es: 'Ritmos caribeños. Voces del Pacífico. Mesas andinas.' } },
  { slug: 'mexico', name: { en: 'Mexico', es: 'México' },
    invitation: { en: 'Maize, mariachi and a world of living traditions.', es: 'Maíz, mariachi y un mundo de tradiciones vivas.' } },
  { slug: 'el-salvador', name: { en: 'El Salvador', es: 'El Salvador' },
    invitation: { en: 'Pupusas, volcanic landscapes and the sound of xuc.', es: 'Pupusas, paisajes volcánicos y el sonido del xuc.' } },
];

export default function CanadaConnections({ language }: { language: Language }) {
  const t = copy[language];
  return <div className={s.connections} data-canada-connections>
    <div className={s.connectionsHeading}>
      <div><p className={s.eyebrow}>{t.eyebrow}</p><h3>{t.title}</h3></div>
      <p>{t.intro}</p>
    </div>
    <div className={s.connectionCards}>
      {destinations.map((destination, index) => <Link
        key={destination.slug} href={`/explore/${destination.slug}`}
        className={s.connectionCard} data-featured-country={destination.slug}
      >
        <span className={s.connectionArt} data-reveal aria-hidden="true" style={{ backgroundImage: `url(/images/roots/${destination.slug}.svg)` }} />
        <span className={s.connectionNumber} aria-hidden="true">0{index + 1} / ✦</span>
        <h4>{destination.name[language]}</h4>
        <p>{destination.invitation[language]}</p>
        <span className={s.connectionLink} data-reveal>{t.explore} {destination.name[language]}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg></span>
      </Link>)}
    </div>
    <p className={s.connectionsSource}>{t.note} <a href="https://www150.statcan.gc.ca/n1/pub/11-627-m/11-627-m2024042-eng.htm" target="_blank" rel="noopener noreferrer">{t.source}</a></p>
  </div>;
}
