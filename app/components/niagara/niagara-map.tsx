'use client';
import { useEffect, useRef, useState } from 'react';
import type * as Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Language } from '../home-copy';
import type { Place } from './place-types';
import { markerGroups } from './place-utils';
import { niagaraCopy } from './niagara-copy';
import s from './niagara.module.css';
type Props = { places: readonly Place[]; selectedId: string | null; onSelect(id: string): void; language: Language; reset: number };
export default function NiagaraMap({ places, selectedId, onSelect, language, reset }: Props) {
  const container = useRef<HTMLDivElement>(null), engine = useRef<typeof Leaflet | null>(null), map = useRef<Leaflet.Map | null>(null), markers = useRef<Leaflet.LayerGroup | null>(null);
  const select = useRef(onSelect);
  useEffect(() => { select.current = onSelect; }, [onSelect]);
  const currentPlaces = useRef(places);
  useEffect(() => { currentPlaces.current = places; }, [places]);
  const [ready, setReady] = useState(false), [failed, setFailed] = useState(false), [tileError, setTileError] = useState(false);
  const lastSelection = useRef<string | null>(null);
  const t = niagaraCopy[language];
  useEffect(() => {
    let disposed = false; let resize: ResizeObserver | undefined;
    import('leaflet').then(L => {
      if (disposed || !container.current) return;
      engine.current = L;
      const instance = L.map(container.current, { scrollWheelZoom: false, zoomControl: true }).setView([43.13, -79.23], 10); map.current = instance;
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>' }).on('tileerror', () => { if (!disposed) setTileError(true); }).addTo(instance);
      markers.current = L.layerGroup().addTo(instance);
      const points = markerGroups(currentPlaces.current).map(g => [g.lat, g.lng] as Leaflet.LatLngTuple);
      if (points.length) instance.fitBounds(L.latLngBounds(points), { padding: [35, 35], maxZoom: 12, animate: false });
      resize = new ResizeObserver(() => instance.invalidateSize()); resize.observe(container.current);
      setReady(true);
    }).catch(() => { if (!disposed) setFailed(true); });
    return () => { disposed = true; resize?.disconnect(); map.current?.remove(); map.current = null; markers.current = null; };
  }, []);
  useEffect(() => {
    if (!ready || !engine.current || !markers.current) return;
    const L = engine.current, layer = markers.current;
    layer.clearLayers();
    for (const group of markerGroups(places)) {
      const selected = group.places.some(p => p.id === selectedId);
      const icon = L.divIcon({ className: s.pinRoot, html: `<span class="${s.pin} ${selected ? s.pinSelected : ''}">${group.places.length > 1 ? group.places.length : '✦'}</span>`, iconSize: [38, 44], iconAnchor: [19, 40] });
      const marker = L.marker([group.lat, group.lng], { icon, title: group.places.map(p => p.name).join(' / '), alt: group.places.map(p => p.name).join(' / '), keyboard: true }).addTo(layer);
      if (group.places.length === 1) marker.on('click', () => select.current(group.places[0].id));
      else {
        const panel = document.createElement('div'), heading = document.createElement('p'); heading.textContent = niagaraCopy[language].group; panel.append(heading);
        for (const p of group.places) { const button = document.createElement('button'); button.type = 'button'; button.textContent = p.name; button.className = s.popupButton; button.addEventListener('click', () => { select.current(p.id); marker.closePopup(); }); panel.append(button); }
        marker.bindPopup(panel);
      }
    }
  }, [places, selectedId, language, ready]);
  useEffect(() => {
    if (!ready || !map.current || !engine.current) return;
    const points = markerGroups(currentPlaces.current).map(g => [g.lat, g.lng] as Leaflet.LatLngTuple);
    if (points.length) map.current.fitBounds(engine.current.latLngBounds(points), { padding: [35, 35], maxZoom: 12, animate: false });
  }, [reset, ready]);
  useEffect(() => {
    if (!ready || !map.current || selectedId === lastSelection.current) return;
    lastSelection.current = selectedId;
    const p = currentPlaces.current.find(p => p.id === selectedId);
    if (p?.coordinates) map.current.setView([p.coordinates.lat, p.coordinates.lng], Math.max(map.current.getZoom(), 13), { animate: !window.matchMedia('(prefers-reduced-motion: reduce)').matches });
  }, [selectedId, ready]);
  return <div className={s.mapWrap}>
    <div ref={container} className={s.map} role="region" aria-label={language === 'en' ? 'Niagara business map' : 'Mapa de negocios de Niagara'} />
    {!ready && <p className={s.mapMessage} role="status">{failed ? t.unavailable : t.loading}</p>}
    {tileError && <p className={s.tileMessage} role="status">{t.unavailable}</p>}
  </div>;
}
