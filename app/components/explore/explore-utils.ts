import type { Camera, Country, ExploreState, Region } from './explore-types';
export const regions: Region[] = ['sudamerica', 'centroamerica', 'caribe', 'norteamerica', 'caribe_ampliado'];
export const initialCamera: Camera = { lat: 9, lng: -79, altitude: 2.15 };
export const initialExploreState = (): ExploreState => ({ selectedSlug: null, query: '', regions: [...regions], camera: { ...initialCamera }, rotating: true });
const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export function filterCountries(countries: readonly Country[], query: string, selectedRegions: readonly Region[]): Country[] {
  const term = normalize(query);
  return countries.filter(c => selectedRegions.includes(c.region) && (!term || [c.name.en, c.name.es, ...c.aliases].some(name => normalize(name).includes(term))));
}
export function clampAltitude(altitude: number): number { return Number.isFinite(altitude) ? Math.max(.65, Math.min(3, altitude)) : initialCamera.altitude; }
// The rendered marker diameter is .76 angular degrees. Resolve its overlap
// explicitly rather than allowing the nearest cylinder to impersonate an island.
export function nearbyCountries(countries: readonly Country[], target: Country): Country[] {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const distance = (c: Country) => {
    const lat = radians(c.center.lat - target.center.lat), lng = radians(c.center.lng - target.center.lng);
    const a = Math.sin(lat / 2) ** 2 + Math.cos(radians(c.center.lat)) * Math.cos(radians(target.center.lat)) * Math.sin(lng / 2) ** 2;
    return 2 * Math.asin(Math.sqrt(Math.min(1, a))) * 180 / Math.PI;
  };
  return countries.filter(c => distance(c) <= .85).sort((a, b) => distance(a) - distance(b));
}
