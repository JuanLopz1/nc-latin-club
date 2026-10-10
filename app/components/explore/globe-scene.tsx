'use client';
import { useEffect, useImperativeHandle, useRef, type Ref } from 'react';
import type { GlobeInstance } from 'globe.gl';
import type { Feature, FeatureCollection, Polygon, MultiPolygon } from 'geojson';
import type { Language } from '../home-copy';
import type { Camera, Country, GlobeHandle } from './explore-types';
import { clampAltitude, initialCamera, nearbyCountries } from './explore-utils';
import s from './explore.module.css';
type WorldFeature = Feature<Polygon | MultiPolygon, { iso2: string; name: string; americas: boolean; slug?: string }>;
type Props = { ref: Ref<GlobeHandle>; countries: readonly Country[]; selectedSlug: string | null; camera: Camera; rotating: boolean; language: Language; onSelect(slug: string, nearby?: string[]): void; onCamera(camera: Camera): void; onReady(ready: boolean): void; onInteraction(): void; onError(): void };
export default function GlobeScene({ ref: handleRef, ...props }: Props) {
  const container = useRef<HTMLDivElement>(null), globe = useRef<GlobeInstance | null>(null), live = useRef(props);
  const lastSelection = useRef(props.selectedSlug);
  const { countries, selectedSlug, rotating, onCamera } = props;
  useEffect(() => { live.current = props; }, [props]);
  useImperativeHandle(handleRef, () => ({
    zoom(direction) { const g = globe.current; if (!g) return; const current = g.pointOfView(); const camera = { ...current, altitude: clampAltitude(current.altitude * (direction > 0 ? .8 : 1.25)) }; live.current.onInteraction(); live.current.onCamera(camera); g.pointOfView(camera, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220); },
    reset() { live.current.onInteraction(); live.current.onCamera({ ...initialCamera }); globe.current?.pointOfView(initialCamera, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 350); }
  }), []);
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    let disposed = false, resize: ResizeObserver | undefined;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) live.current.onInteraction();
    const fail = () => { live.current.onReady(false); live.current.onError(); };
    const saveCamera = () => { if (globe.current) live.current.onCamera(globe.current.pointOfView()); };
    const interaction = () => { if (globe.current) globe.current.controls().autoRotate = false; live.current.onInteraction(); };
    element.addEventListener('pointerdown', interaction, { passive: true });
    const preference = () => { const controls = globe.current?.controls(); if (controls) { if (media.matches) live.current.onInteraction(); controls.autoRotate = live.current.rotating && !media.matches; controls.enableDamping = !controls.autoRotate && !media.matches; controls.update(); } };
    const visibility = () => { if (!globe.current) return; if (document.hidden) { saveCamera(); globe.current.pauseAnimation(); } else globe.current.resumeAnimation(); };
    const contextLost = (event: Event) => { event.preventDefault(); fail(); };
    Promise.all([import('globe.gl'), import('three'), fetch('/data/roots-world.geojson').then(r => { if (!r.ok) throw Error('World geometry unavailable'); return r.json() as Promise<FeatureCollection>; })]).then(([{ default: Globe }, { MeshPhongMaterial }, world]) => {
      if (disposed) return;
      const eligible = () => new Map(live.current.countries.map(c => [c.iso2, c]));
      const match = (obj: object) => { const f = obj as WorldFeature; return f.properties.slug ? live.current.countries.find(c => c.slug === f.properties.slug) : eligible().get(f.properties.iso2); };
      const tooltip = (c: Country | undefined) => { const label = document.createElement('span'); label.textContent = c?.name[live.current.language] ?? ''; return label; };
      const g = new Globe(element, { animateIn: false, rendererConfig: { antialias: true, alpha: true, powerPreference: 'low-power' } });
      globe.current = g;
      g.width(element.clientWidth).height(element.clientHeight).backgroundColor('rgba(0,0,0,0)').showAtmosphere(false)
        .globeMaterial(new MeshPhongMaterial({ color: '#101c2b', shininess: 12 }))
        .polygonsData(world.features)
        .polygonAltitude(.01).polygonCapColor(o => match(o)?.slug === live.current.selectedSlug ? '#517982' : (o as WorldFeature).properties.americas ? '#293d4e' : '#192638')
        .polygonSideColor(() => '#182b3a').polygonStrokeColor(o => match(o)?.slug === live.current.selectedSlug ? '#ffe06a' : match(o) ? '#76b3bd' : '#3a4b5a')
        .polygonLabel(o => tooltip(match(o))).polygonsTransitionDuration(0)
        .onPolygonClick(o => { const c = match(o); if (c) { interaction(); live.current.onSelect(c.slug); } })
        .pointsData([...live.current.countries]).pointLat(o => (o as Country).center.lat).pointLng(o => (o as Country).center.lng).pointAltitude(.015).pointRadius(.38)
        .pointColor(o => (o as Country).slug === live.current.selectedSlug ? '#ffe06a' : '#76dbe3').pointLabel(o => { const label = document.createElement('span'); label.textContent = nearbyCountries(live.current.countries, o as Country).map(c => c.name[live.current.language]).join(' / '); return label; })
        .onPointClick(o => { interaction(); live.current.onSelect((o as Country).slug, nearbyCountries(live.current.countries, o as Country).map(c => c.slug)); })
        .onPolygonHover(o => { const c = o ? match(o) : undefined; g.polygonStrokeColor(f => match(f)?.slug === c?.slug && c ? '#ffe06a' : match(f)?.slug === live.current.selectedSlug ? '#ffe06a' : match(f) ? '#76b3bd' : '#3a4b5a'); });
      g.renderer().setPixelRatio(Math.min(devicePixelRatio, 1.5));
      const controls = g.controls(); controls.enablePan = false; controls.minDistance = 165; controls.maxDistance = 400; controls.autoRotate = live.current.rotating && !media.matches; controls.autoRotateSpeed = .8; controls.enableDamping = !controls.autoRotate && !media.matches; controls.dampingFactor = .12;
      controls.addEventListener('start', interaction); controls.addEventListener('end', saveCamera);
      g.onZoom(camera => { element.dataset.camera = JSON.stringify(camera); });
      const pendingSelection = live.current.countries.find(c => c.slug === live.current.selectedSlug);
      const view = pendingSelection && lastSelection.current !== live.current.selectedSlug ? { ...pendingSelection.center, altitude: 1.65 } : live.current.camera;
      lastSelection.current = live.current.selectedSlug;
      g.pointOfView(view, 0);
      live.current.onCamera(view);
      g.renderer().domElement.style.touchAction = 'pan-y';
      g.renderer().domElement.addEventListener('webglcontextlost', contextLost);
      resize = new ResizeObserver(() => { if (!disposed) g.width(element.clientWidth).height(element.clientHeight); }); resize.observe(element);
      media.addEventListener('change', preference); document.addEventListener('visibilitychange', visibility);
      element.dataset.camera = JSON.stringify(g.pointOfView()); element.dataset.ready = 'true'; live.current.onReady(true);
    }).catch(() => { if (!disposed) fail(); });
    return () => {
      disposed = true; element.removeEventListener('pointerdown', interaction); resize?.disconnect(); media.removeEventListener('change', preference); document.removeEventListener('visibilitychange', visibility);
      const g = globe.current;
      if (g) { saveCamera(); g.controls().removeEventListener('start', interaction); g.controls().removeEventListener('end', saveCamera); g.renderer().domElement.removeEventListener('webglcontextlost', contextLost); g._destructor(); g.renderer().dispose(); g.renderer().forceContextLoss(); }
      globe.current = null; element.replaceChildren(); delete element.dataset.ready; delete element.dataset.camera; live.current.onReady(false);
    };
  }, []);
  useEffect(() => {
    const g = globe.current; if (!g) return;
    g.pointsData([...countries]);
    const byIso = new Map(countries.map(c => [c.iso2, c]));
    const match = (o: object) => { const f = o as WorldFeature; return f.properties.slug ? countries.find(c => c.slug === f.properties.slug) : byIso.get(f.properties.iso2); };
    g.polygonCapColor(o => match(o)?.slug === selectedSlug ? '#517982' : (o as WorldFeature).properties.americas ? '#293d4e' : '#192638')
      .polygonStrokeColor(o => match(o)?.slug === selectedSlug ? '#ffe06a' : match(o) ? '#76b3bd' : '#3a4b5a')
      .pointColor(o => (o as Country).slug === selectedSlug ? '#ffe06a' : '#76dbe3');
    const controls = g.controls(), reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    controls.autoRotate = rotating && !reduceMotion; controls.enableDamping = !controls.autoRotate && !reduceMotion;
    if (lastSelection.current !== selectedSlug) {
      lastSelection.current = selectedSlug;
      const c = countries.find(c => c.slug === selectedSlug);
      if (c) { const camera = { ...c.center, altitude: 1.65 }; onCamera(camera); g.pointOfView(camera, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 500); }
    }
  }, [countries, selectedSlug, rotating, onCamera]);
  return <div ref={container} className={s.scene} aria-hidden="true" data-globe-scene />;
}
