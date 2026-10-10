import type { LocalizedText } from '../events/event-types';
export type Region = 'sudamerica' | 'centroamerica' | 'caribe' | 'norteamerica' | 'caribe_ampliado';
export type Camera = { lat: number; lng: number; altitude: number };
export type Country = { slug: string; iso2: string; name: LocalizedText; aliases: string[]; region: Region; center: { lat: number; lng: number }; intro: LocalizedText; sources: { title: string; url: string }[]; culturalStatus: 'pending' | 'reviewed'; politicalStatus?: LocalizedText };
export type ExploreState = { selectedSlug: string | null; query: string; regions: Region[]; camera: Camera; rotating: boolean };
export type GlobeHandle = { zoom(direction: number): void; reset(): void };
