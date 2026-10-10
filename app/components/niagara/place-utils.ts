import type { Place, PlaceFilters } from './place-types';
const normalized = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export function placeOptions(places: readonly Place[], key: 'city' | 'category' | 'mode'): string[] {
  return [...new Set(places.flatMap(p => key === 'category' ? p.categories : [p[key]]))].sort();
}
export function initialPlaceFilters(places: readonly Place[]): PlaceFilters {
  return { query: '', city: placeOptions(places, 'city'), category: placeOptions(places, 'category'), mode: placeOptions(places, 'mode') };
}
export function filterPlaces(places: readonly Place[], filters: PlaceFilters): Place[] {
  const query = normalized(filters.query.trim());
  return places.filter(p => filters.city.includes(p.city) && filters.category.some(c => p.categories.includes(c)) && filters.mode.includes(p.mode) && (!query || normalized([p.name, p.city, p.description.en, p.description.es, ...p.offerings].join(' ')).includes(query)));
}
export function hasPin(place: Place): boolean {
  return place.mode !== 'order_only' && !!place.address && !!place.coordinates && Number.isFinite(place.coordinates.lat) && Number.isFinite(place.coordinates.lng);
}
export function directionsUrl(place: Place): string | null {
  if (!hasPin(place)) return null;
  const url = new URL('https://www.google.com/maps/dir/');
  url.searchParams.set('api', '1'); url.searchParams.set('destination', `${place.name}, ${place.address}`);
  return url.href;
}
export function markerGroups(places: readonly Place[]) {
  const groups = new Map<string, { lat: number; lng: number; places: Place[] }>();
  for (const p of places.filter(hasPin)) {
    const { lat, lng } = p.coordinates!, key = `${lat},${lng}`;
    const group = groups.get(key) ?? { lat, lng, places: [] };
    group.places.push(p); groups.set(key, group);
  }
  return [...groups.values()];
}
