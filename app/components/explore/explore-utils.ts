import type { Camera, Country, ExploreState, Region } from './explore-types';
export const regions: Region[] = ['sudamerica', 'centroamerica', 'caribe', 'norteamerica', 'caribe_ampliado'];
export const initialCamera: Camera = { lat: 9, lng: -79, altitude: 2.15 };
export const initialExploreState = (): ExploreState => ({ selectedSlug: null, query: '', regions: [...regions], camera: { ...initialCamera }, rotating: false });
const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export function filterCountries(countries: readonly Country[], query: string, selectedRegions: readonly Region[]): Country[] {
  const term = normalize(query);
  return countries.filter(c => selectedRegions.includes(c.region) && (!term || [c.name.en, c.name.es, ...c.aliases].some(name => normalize(name).includes(term))));
}
export function clampAltitude(altitude: number): number { return Number.isFinite(altitude) ? Math.max(.65, Math.min(3, altitude)) : initialCamera.altitude; }
