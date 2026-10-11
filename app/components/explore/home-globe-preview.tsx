'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { Language } from '../home-copy';
import { useReducedMotion } from '../motion-preference';
import raw from './countries.json';
import type { Camera, Country, GlobeHandle } from './explore-types';
import s from './explore.module.css';

const GlobeScene = dynamic(() => import('./globe-scene'), { ssr: false });
const destinations = ['colombia', 'mexico', 'el-salvador'].map(slug => (raw as Country[]).find(c => c.slug === slug)!);
export default function HomeGlobePreview({ language }: { language: Language }) {
  const root = useRef<HTMLDivElement>(null), handle = useRef<GlobeHandle>(null);
  const [camera, setCamera] = useState<Camera>({ ...destinations[0].center, altitude: 1.65 });
  const [selected, setSelected] = useState('colombia'), [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false), [loaded, setLoaded] = useState(false), [ready, setReady] = useState(false), [failed, setFailed] = useState(false);
  const reduced = useReducedMotion();
  const country = destinations.find(c => c.slug === selected)!;
  const playing = visible && ready && !paused && !reduced;
  const interacted = useCallback(() => setPaused(true), []);
  const changedCamera = useCallback((value: Camera) => { setCamera(value); }, []);
  const error = useCallback(() => setFailed(true), []);
  const select = useCallback((slug: string) => { setSelected(slug); setPaused(true); }, []);
  useEffect(() => {
    const element = root.current;
    if (!element || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      const inView = entries[0].isIntersecting;
      setVisible(inView); if (inView) setLoaded(true);
    }, { threshold: .15 });
    observer.observe(element); return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => { if (!document.hidden) setSelected(current => destinations[(destinations.findIndex(c => c.slug === current) + 1) % destinations.length].slug); }, 8000);
    return () => clearInterval(timer);
  }, [playing]);
  return <div ref={root} className={s.teaserPreview} data-home-globe data-preview-country={selected} data-preview-playing={playing}>
    {loaded && !failed && <GlobeScene ref={handle} countries={destinations} selectedSlug={selected} camera={camera} rotating={playing} active={visible} presentation language={language} onSelect={select} onCamera={changedCamera} onReady={setReady} onInteraction={interacted} onError={error} />}
    {!ready && <div className={s.teaserPreviewFallback} style={{ backgroundImage: `url(/images/roots/${selected}.svg)` }} aria-hidden="true" />}
    <button className={s.previewMotion} type="button" data-preview-motion disabled={reduced || failed} aria-pressed={!paused && !reduced} aria-label={language === 'en' ? paused ? 'Play globe preview' : 'Pause globe preview' : paused ? 'Animar vista del globo' : 'Pausar vista del globo'} onClick={() => setPaused(!paused)}>
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{paused || reduced ? <path d="m8 5 11 7-11 7Z" /> : <path d="M6 5h4v14H6zm8 0h4v14h-4z" />}</svg>
    </button>
    <div className={s.previewCaption}><span>{country.name[language]}</span><Link href={`/explore/${selected}`}>{language === 'en' ? 'Discover' : 'Descubrir'}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg></Link></div>
  </div>;
}
