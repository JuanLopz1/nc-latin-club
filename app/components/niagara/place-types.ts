import type { LocalizedText } from '../events/event-types';
export type Place = { id: string; name: string; city: string; categories: string[]; mode: string; description: LocalizedText; offerings: string[]; address?: string; coordinates?: { lat: number; lng: number; accuracy: string }; channels: { label: string; url: string }[]; sources: { url: string; title: string }[]; reviewedOn: string };
export type PlaceFilters = { query: string; city: string[]; category: string[]; mode: string[] };
