import type { copy } from '../components/home-copy';
import type { AgendaEntry, LocalizedText } from '../components/events/event-types';
import type { Place } from '../components/niagara/place-types';
import type { GalleryContent } from '../components/gallery/gallery-types';
import type { CulturePage } from '../components/explore/culture-data';
type Mutable<T> = T extends string ? string : T extends readonly (infer V)[] ? Mutable<V>[] : T extends object ? { -readonly [K in keyof T]: Mutable<T[K]> } : T;
export type SiteSettings = {
  joinEmail: string; instagramUrl: string; logoSrc: string; heroSrc: string;
  heroAlt: LocalizedText; spotifyUrl: string; spotifyTitle: LocalizedText; spotifyDescription: LocalizedText;
  roots:{label:LocalizedText;title:LocalizedText[];text:LocalizedText;action:LocalizedText};
  niagara:{label:LocalizedText;title:LocalizedText;text:LocalizedText;action:LocalizedText};
};
export type SiteContent = { settings: SiteSettings; home: Mutable<typeof copy>; events: AgendaEntry[]; culture: AgendaEntry[]; places: Place[]; pages: CulturePage[]; gallery: GalleryContent };
export const contentKeys = ['settings', 'home', 'events', 'culture', 'places', 'pages', 'gallery'] as const;
export type ContentKey = typeof contentKeys[number];
export type EditorRole = 'admin' | 'editor';
export type ContentDocument = { key: ContentKey; draft: SiteContent[ContentKey]; published: SiteContent[ContentKey] | null; version: number; published_version: number; updated_at: string | null };
export type HistoryItem = { id: number; key: ContentKey; content: SiteContent[ContentKey]; action: 'save' | 'publish'; version: number; created_at: string };
