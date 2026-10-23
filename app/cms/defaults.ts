import { homeTranslations } from '../translations/home-translations';
import { agendaEntries } from '../components/events/agenda-data';
import { places } from '../components/niagara/place-data';
import { culturePages } from '../components/explore/culture-data';
import type { SiteContent } from './types';
import { exploreTranslations } from '../translations/explore-translations';
import { niagaraTranslations } from '../translations/niagara-translations';
export const defaultContent: SiteContent = {
  settings: {
    joinEmail: 'dgonzalezaceved1@ncstudents.niagaracollege.ca',
    instagramUrl: 'https://www.instagram.com/nclat1nclub/',
    logoSrc: '/images/brand/nc-latin-club.png',
    heroSrc: '/images/Banner-natural.png',
    familiaPhotoSrc: '',
    familiaPhotoAlt: { en: '', es: '' },
    heroAlt: {
      en: 'Imagined nighttime view of Niagara Falls with animated colourful illumination over the water',
      es: 'Vista nocturna imaginada de las cataratas del Niágara con iluminación de colores animada sobre el agua',
    },
    spotifyUrl: 'https://open.spotify.com/album/4kS7bSuU0Jm9LYMosFU2x5',
    spotifyTitle: {
      en: 'MAÑANA SERÁ BONITO · KAROL G',
      es: 'MAÑANA SERÁ BONITO · KAROL G',
    },
    spotifyDescription: {
      en: 'A Colombian sound for your day. Our first listening recommendation, while the club puts its own playlist together.',
      es: 'Un sonido colombiano para tu día. Nuestra primera recomendación mientras el club prepara su propia playlist.',
    },
    roots: {
      label: { en: exploreTranslations.en.eyebrow, es: exploreTranslations.es.eyebrow },
      title: [
        { en: exploreTranslations.en.title[0], es: exploreTranslations.es.title[0] },
        { en: exploreTranslations.en.title[1], es: exploreTranslations.es.title[1] },
      ],
      text: { en: exploreTranslations.en.teaser, es: exploreTranslations.es.teaser },
      action: { en: exploreTranslations.en.cta, es: exploreTranslations.es.cta },
    },
    niagara: {
      label: { en: niagaraTranslations.en.featured, es: niagaraTranslations.es.featured },
      title: { en: niagaraTranslations.en.title, es: niagaraTranslations.es.title },
      text: { en: niagaraTranslations.en.invite, es: niagaraTranslations.es.invite },
      action: { en: niagaraTranslations.en.explore, es: niagaraTranslations.es.explore },
    },
  },
  gallery: {
    title: { en: 'The nights we keep.', es: 'Las noches que guardamos.' },
    description: {
      en: 'Good people. Loud music. Unforgettable moments. A photo album made by our familia.',
      es: 'Buena gente. Música a todo volumen. Momentos inolvidables. Un álbum de fotos hecho por nuestra familia.',
    },
    musicUrl: 'https://open.spotify.com/album/4kS7bSuU0Jm9LYMosFU2x5',
    photos: [],
  },
  home: structuredClone(homeTranslations) as unknown as SiteContent['home'],
  events: agendaEntries.filter((e) => e.kind === 'event'),
  culture: agendaEntries.filter((e) => e.kind === 'cultural-date'),
  places: [...places],
  pages: culturePages,
};
