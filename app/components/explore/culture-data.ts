import raw from './data/culture-pages.json';
import type { LocalizedText } from '../events/event-types';
export type CultureTrack = {
  trackId: string;
  title: string;
  artist: string;
  context: LocalizedText;
  verification: 'spotify-title-and-artist';
};
export type CulturePage = {
  slug: string;
  title: LocalizedText;
  introduction: LocalizedText;
  sections: { id: string; title: LocalizedText; text: LocalizedText; sourceIds: string[] }[];
  sources: { id: string; title: LocalizedText; url: string }[];
  music: CultureTrack[];
  review: { basis: 'documentary-source-review'; date: string };
};
// Published summaries are separate from the founder's Spanish working drafts.
// See docs/EXPLORE_ROOTS_LOTE07_REVIEW.md for evidence and remaining fields.
export const culturePages: CulturePage[] = raw as CulturePage[];
export function getCulturePage(slug: string) { return culturePages.find(page => page.slug === slug); }
