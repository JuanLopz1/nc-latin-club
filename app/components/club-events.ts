import type { Language } from "./home-copy";

type TranslatedText = Record<Language, string>;

export type ClubEvent = {
  id: string;
  title: TranslatedText;
  description: TranslatedText;
  // Confirmed ISO 8601 timestamp with UTC offset. Displayed in Niagara time.
  startsAt: string;
  endsAt?: string;
  venue: TranslatedText;
  organizer?: TranslatedText;
  admission?: TranslatedText;
  registrationUrl?: string;
};

// Source: NC Engage URL and event screenshots supplied by the user on 2026-10-10.
// International is the listed organizer; this is not advertised as a club-run event.
export const clubEvents: readonly ClubEvent[] = [
  {
    id: "latin-fiesta-2026",
    title: { en: "Latin Fiesta!", es: "Latin Fiesta!" },
    description: {
      en: "A night of salsa, merengue and reggaeton with a DJ, dancing and light snacks. Celebrate Latin culture and make new connections.",
      es: "Una noche de salsa, merengue y reguetón con DJ, baile y snacks ligeros. Celebra la cultura latina y conoce gente nueva.",
    },
    startsAt: "2026-10-23T20:00:00-04:00",
    endsAt: "2026-10-24T00:00:00-04:00",
    venue: { en: "The Core", es: "The Core" },
    organizer: { en: "International", es: "International" },
    admission: {
      en: "$15 for Niagara College students · $20 per guest. Maximum 2 guests per student; guests must be 17 or older.",
      es: "$15 para estudiantes de Niagara College · $20 por invitado. Máximo 2 invitados por estudiante; los invitados deben tener 17 años o más.",
    },
    registrationUrl: "https://www.ncengage.ca/intl/rsvp_boot?id=382827",
  },
];
