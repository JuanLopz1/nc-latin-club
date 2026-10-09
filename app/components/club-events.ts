import type { Language } from "./home-copy";

type TranslatedText = Record<Language, string>;

export type ClubEvent = {
  id: string;
  title: TranslatedText;
  description: TranslatedText;
  // Confirmed ISO 8601 timestamp with UTC offset. Displayed in Niagara time.
  startsAt: string;
  venue: TranslatedText;
  registrationUrl?: string;
};

// Publish confirmed events only. No dates or registration links supplied yet.
export const clubEvents: readonly ClubEvent[] = [];
