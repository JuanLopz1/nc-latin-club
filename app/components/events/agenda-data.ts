import type { AgendaEntry } from "./event-types";
import { validateAgenda } from "./agenda-validation";

// User-supplied NC Engage screenshots; no live synchronization.
export const agendaEntries: readonly AgendaEntry[] = [
  {
    id: "latin-fiesta-2026",
    slug: "latin-fiesta-2026",
    kind: "event",
    category: "at-nc",
    status: "scheduled",
    source: { url: "https://www.ncengage.ca/intl/rsvp_boot?id=382827", reviewedOn: "2026-10-10", provenance: "user-capture" },
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

validateAgenda(agendaEntries);
