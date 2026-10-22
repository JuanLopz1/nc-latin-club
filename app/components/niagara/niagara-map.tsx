'use client';
import { niagaraMapMessages } from '../../translations/interface-translations';
import { getReducedMotion } from '../motion-preference';
import { useEffect, useRef, useState } from 'react';
import type * as Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Language } from '../../translations/language';
import type { Place } from './place-types';
import { hasPin, markerGroups } from './place-utils';
import { niagaraTranslations } from '../../translations/niagara-translations';
import styles from './niagara.module.css';
type Props = {
  places: readonly Place[];
  selectedId: string | null;
  onSelect(id: string): void;
  language: Language;
  reset: number;
};
export default function NiagaraMap({
  places,
  selectedId,
  onSelect,
  language,
  reset,
}: Props) {
  const container = useRef<HTMLDivElement>(null);
  const engine = useRef<typeof Leaflet | null>(null);
  const map = useRef<Leaflet.Map | null>(null);
  const markers = useRef<Leaflet.LayerGroup | null>(null);
  const select = useRef(onSelect);
  useEffect(() => {
    select.current = onSelect;
  }, [onSelect]);
  const currentPlaces = useRef(places);
  useEffect(() => {
    currentPlaces.current = places;
  }, [places]);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [tileError, setTileError] = useState(false);
  const lastSelection = useRef<string | null>(null);
  const translations = niagaraTranslations[language];
  useEffect(() => {
    let disposed = false;
    let resize: ResizeObserver | undefined;
    import('leaflet')
      .then((L) => {
        if (disposed || !container.current) return;
        engine.current = L;
        const instance = L.map(container.current, {
          scrollWheelZoom: false,
          zoomControl: true,
        }).setView([43.13, -79.23], 10);
        map.current = instance;
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
        })
          .on('tileerror', () => {
            if (!disposed) setTileError(true);
          })
          .addTo(instance);
        markers.current = L.layerGroup().addTo(instance);
        const points = markerGroups(currentPlaces.current).map(
          (g) => [g.lat, g.lng] as Leaflet.LatLngTuple,
        );
        if (points.length)
          instance.fitBounds(L.latLngBounds(points), {
            padding: [35, 35],
            maxZoom: 12,
            animate: false,
          });
        resize = new ResizeObserver(() => instance.invalidateSize());
        resize.observe(container.current);
        setReady(true);
      })
      .catch(() => {
        if (!disposed) setFailed(true);
      });
    return () => {
      disposed = true;
      resize?.disconnect();
      map.current?.remove();
      map.current = null;
      markers.current = null;
    };
  }, []);
  useEffect(() => {
    if (!ready || !engine.current || !markers.current) return;
    const L = engine.current;
    const layer = markers.current;
    layer.clearLayers();
    for (const group of markerGroups(places)) {
      const selected = group.places.some((p) => p.id === selectedId);
      const numbers = group.numbers
        .map((number) => String(number).padStart(2, '0'))
        .join('·');
      const width = group.places.length > 1 ? 62 : 38;
      const icon = L.divIcon({
        className: styles.pinRoot,
        html: `<span class="${styles.pin} ${group.places.length > 1 ? styles.pinGroup : ''} ${selected ? styles.pinSelected : ''}"><span>${numbers}</span></span>`,
        iconSize: [width, 44],
        iconAnchor: [width / 2, 40],
      });
      const label = group.places
        .map((p, index) => `${group.numbers[index]}. ${p.name}`)
        .join(' / ');
      const marker = L.marker([group.lat, group.lng], {
        icon,
        title: label,
        alt: label,
        keyboard: true,
      }).addTo(layer);
      if (group.places.length === 1)
        marker.on('click', () => select.current(group.places[0].id));
      else {
        const panel = document.createElement('div');
        const heading = document.createElement('p');
        heading.textContent = niagaraTranslations[language].group;
        panel.append(heading);
        for (const [index, p] of group.places.entries()) {
          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = `${String(group.numbers[index]).padStart(2, '0')} · ${p.name}`;
          button.className = styles.popupButton;
          button.addEventListener('click', () => {
            select.current(p.id);
            marker.closePopup();
          });
          panel.append(button);
        }
        marker.bindPopup(panel);
      }
    }
  }, [places, selectedId, language, ready]);
  useEffect(() => {
    if (!ready || !map.current || !engine.current) return;
    const points = markerGroups(currentPlaces.current).map(
      (g) => [g.lat, g.lng] as Leaflet.LatLngTuple,
    );
    if (points.length)
      map.current.fitBounds(engine.current.latLngBounds(points), {
        padding: [35, 35],
        maxZoom: 12,
        animate: false,
      });
  }, [reset, ready]);
  useEffect(() => {
    if (!ready || !map.current || selectedId === lastSelection.current) return;
    lastSelection.current = selectedId;
    const p = currentPlaces.current.find((p) => p.id === selectedId);
    if (p && hasPin(p))
      map.current.setView(
        [p.coordinates!.lat, p.coordinates!.lng],
        Math.max(map.current.getZoom(), 13),
        { animate: !getReducedMotion() },
      );
  }, [selectedId, ready]);
  return (
    <div className={styles.mapWrap}>
      <div
        ref={container}
        className={styles.map}
        role="region"
        aria-label={niagaraMapMessages[language].niagaraBusinessMap}
      />
      {!ready && (
        <p className={styles.mapMessage} role="status">
          {failed ? translations.unavailable : translations.loading}
        </p>
      )}
      {tileError && (
        <p className={styles.tileMessage} role="status">
          {translations.unavailable}
        </p>
      )}
    </div>
  );
}
