import { copy } from '../components/home-copy';
import { agendaEntries } from '../components/events/agenda-data';
import { places } from '../components/niagara/place-data';
import { culturePages } from '../components/explore/culture-data';
import type { SiteContent } from './types';
import { exploreCopy } from '../components/explore/explore-copy';
import { niagaraCopy } from '../components/niagara/niagara-copy';
export const defaultContent: SiteContent = {
  settings: {
    joinEmail: 'dgonzalezaceved1@ncstudents.niagaracollege.ca', instagramUrl: 'https://www.instagram.com/nclat1nclub/',
    logoSrc: '/images/brand/nc-latin-club.png', heroSrc: '/images/latin-night-festival.png',
    heroAlt: { en: 'Original illustration of an imagined Latin American street festival at night, with music, murals, colourful lights and glowing hummingbirds', es: 'Ilustración original de un festival callejero latinoamericano imaginado de noche, con música, murales, luces de colores y colibríes luminosos' },
    spotifyUrl: 'https://open.spotify.com/album/4kS7bSuU0Jm9LYMosFU2x5',
    spotifyTitle: { en: 'MAÑANA SERÁ BONITO · KAROL G', es: 'MAÑANA SERÁ BONITO · KAROL G' },
    spotifyDescription: { en: 'A Colombian sound for your day. Our first listening recommendation, while the club puts its own playlist together.', es: 'Un sonido colombiano para tu día. Nuestra primera recomendación mientras el club prepara su propia playlist.' },
    roots: {label:{en:exploreCopy.en.eyebrow,es:exploreCopy.es.eyebrow},title:[{en:exploreCopy.en.title[0],es:exploreCopy.es.title[0]},{en:exploreCopy.en.title[1],es:exploreCopy.es.title[1]}],text:{en:exploreCopy.en.teaser,es:exploreCopy.es.teaser},action:{en:exploreCopy.en.cta,es:exploreCopy.es.cta}},
    niagara: {label:{en:niagaraCopy.en.featured,es:niagaraCopy.es.featured},title:{en:niagaraCopy.en.title,es:niagaraCopy.es.title},text:{en:niagaraCopy.en.invite,es:niagaraCopy.es.invite},action:{en:niagaraCopy.en.explore,es:niagaraCopy.es.explore}},
  },
  gallery: {title:{en:'The nights we keep.',es:'Las noches que guardamos.'},description:{en:'Good people. Loud music. Unforgettable moments. A photo album made by our familia.',es:'Buena gente. Música a todo volumen. Momentos inolvidables. Un álbum de fotos hecho por nuestra familia.'},musicUrl:'https://open.spotify.com/album/4kS7bSuU0Jm9LYMosFU2x5',photos:[]},
  home: structuredClone(copy) as unknown as SiteContent['home'], events: agendaEntries.filter(e => e.kind === 'event'),
  culture: agendaEntries.filter(e => e.kind === 'cultural-date'), places: [...places], pages: culturePages,
};
