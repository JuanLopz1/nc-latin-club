import researchedEvents from './researched-events.json';
import culturalEntries from './cultural-entries.json';
import reviewedRegionalEvents from './reviewed-regional-events.json';
import type { AgendaEntry } from './event-types';
import { validateAgenda } from './agenda-validation';

// Founder confirmations and reviewed official listings; no live synchronization.
export const agendaEntries: readonly AgendaEntry[] = [
  {
    id: 'latin-fiesta-2026',
    slug: 'latin-fiesta-2026',
    kind: 'event',
    category: 'at-nc',
    status: 'scheduled',
    source: {
      url: 'https://www.ncengage.ca/intl/rsvp_boot?id=382827',
      reviewedOn: '2026-10-10',
      provenance: 'user-capture',
    },
    title: { en: 'Latin Fiesta!', es: 'Latin Fiesta!' },
    description: {
      en: 'A night of salsa, merengue and reggaeton with a DJ, dancing and light snacks. Celebrate Latin culture and make new connections.',
      es: 'Una noche de salsa, merengue y reguetón con DJ, baile y snacks ligeros. Celebra la cultura latina y conoce gente nueva.',
    },
    startsAt: '2026-10-23T20:00:00-04:00',
    endsAt: '2026-10-24T00:00:00-04:00',
    venue: { en: 'The Core', es: 'The Core' },
    organizer: { en: 'International', es: 'International' },
    admission: {
      en: '$15 for Niagara College students · $20 per guest. Maximum 2 guests per student; guests must be 17 or older.',
      es: '$15 para estudiantes de Niagara College · $20 por invitado. Máximo 2 invitados por estudiante; los invitados deben tener 17 años o más.',
    },
    registrationUrl: 'https://www.ncengage.ca/intl/rsvp_boot?id=382827',
  },
  {
    id: 'karaoke-latino-2026',
    slug: 'karaoke-latino-2026',
    kind: 'event',
    category: 'at-nc',
    status: 'scheduled',
    source: {
      url: 'https://www.instagram.com/nclat1nclub/',
      reviewedOn: '2026-10-18',
      provenance: 'user-capture',
    },
    title: { en: 'Karaoke Latino', es: 'Karaoke Latino' },
    description: {
      en: 'Sing and share a meal with NC Latin Club at the Welland Campus. A free club gathering with food provided.',
      es: 'Ven a cantar y compartir con NC Latin Club en el campus de Welland. Un encuentro gratuito del club con comida.',
    },
    dateSpan: { start: '2026-10-22', end: '2026-10-22' },
    sessions: [{ startsAt: '2026-10-22T18:30:00-04:00' }],
    venue: {
      en: 'Wellness Lounge — Niagara College, Welland Campus',
      es: 'Wellness Lounge — Niagara College, campus de Welland',
    },
    city: { en: 'Welland, ON', es: 'Welland, Ontario' },
    organizer: { en: 'NC Latin Club', es: 'NC Latin Club' },
    admission: { en: 'Free admission; food provided.', es: 'Gratis; habrá comida.' },
    note: {
      en: 'Confirmed directly by NC Latin Club leadership. Registration link and event photo are not available yet. Finishing time has not been announced.',
      es: 'Confirmado directamente por la dirección de NC Latin Club. Aún no hay enlace de inscripción ni foto del evento. La hora de cierre no se ha anunciado.',
    },
  },
  ...(researchedEvents as AgendaEntry[]),
  ...(reviewedRegionalEvents as AgendaEntry[]),
  ...(culturalEntries as AgendaEntry[]),
];

validateAgenda(agendaEntries);
