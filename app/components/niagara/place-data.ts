import data from './places.json';
import type { Place } from './place-types';
export const places: readonly Place[] = data;
for (const p of places) {
  if (!p.id || !p.description.en || !p.description.es || !p.sources.length) throw Error('Invalid public place');
  for (const channel of [...p.channels, ...p.sources]) { const url = new URL(channel.url); if (url.protocol !== 'https:' || url.username || url.password) throw Error('Invalid public channel'); }
  if (p.mode === 'order_only' && (p.address || p.coordinates)) throw Error('Order-only place cannot expose a location');
  if (p.coordinates && (p.coordinates.lat < 42 || p.coordinates.lat > 44 || p.coordinates.lng < -81 || p.coordinates.lng > -78)) throw Error('Coordinate outside Niagara');
}
