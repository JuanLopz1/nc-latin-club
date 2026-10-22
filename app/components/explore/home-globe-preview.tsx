'use client';
import { homeGlobePreviewMessages } from '../../translations/interface-translations';
import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { Language } from '../../translations/language';
import {
  getReducedMotion,
  subscribeMotion,
  useReducedMotion,
} from '../motion-preference';
import raw from './countries.json';
import type { Camera, Country, GlobeHandle } from './explore-types';
import styles from './explore.module.css';

const GlobeScene = dynamic(() => import('./globe-scene'), { ssr: false });
const destinations = ['colombia', 'mexico', 'el-salvador'].map((slug) =>
  (raw as Country[]).find((c) => c.slug === slug)!,
);
export default function HomeGlobePreview({ language }: { language: Language }) {
  const root = useRef<HTMLDivElement>(null);
  const handle = useRef<GlobeHandle>(null);
  const [camera, setCamera] = useState<Camera>({
    ...destinations[0].center,
    altitude: 1.65,
  });
  const [selected, setSelected] = useState('colombia');
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const reduced = useReducedMotion();
  const country = destinations.find((c) => c.slug === selected)!;
  const playing = visible && ready && !paused && !reduced;
  const interacted = useCallback(() => {
    if (!getReducedMotion()) setPaused(true);
  }, []);
  const changedCamera = useCallback((value: Camera) => {
    setCamera(value);
  }, []);
  const error = useCallback(() => setFailed(true), []);
  const select = useCallback((slug: string) => {
    setSelected(slug);
    setPaused(true);
  }, []);
  useEffect(
    () =>
      subscribeMotion(() => {
        if (!getReducedMotion()) setPaused(false);
      }),
    [],
  );
  useEffect(() => {
    const element = root.current;
    if (!element || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const inView = entries[0].isIntersecting;
        setVisible(inView);
        if (inView) setLoaded(true);
      },
      { threshold: 0.15 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      if (!document.hidden)
        setSelected(
          (current) =>
            destinations[
              (destinations.findIndex((c) => c.slug === current) + 1) %
                destinations.length
            ].slug,
        );
    }, 8000);
    return () => clearInterval(timer);
  }, [playing]);
  return (
    <div
      ref={root}
      className={styles.teaserPreview}
      data-home-globe
      data-preview-country={selected}
      data-preview-playing={playing}
    >
      {loaded && !failed && (
        <GlobeScene
          ref={handle}
          countries={destinations}
          selectedSlug={selected}
          camera={camera}
          rotating={playing}
          active={visible}
          presentation
          language={language}
          onSelect={select}
          onCamera={changedCamera}
          onReady={setReady}
          onInteraction={interacted}
          onError={error}
        />
      )}
      {!ready && (
        <div
          className={styles.teaserPreviewFallback}
          style={{ backgroundImage: `url(/images/roots/${selected}.svg)` }}
          aria-hidden="true"
        />
      )}
      <p className={styles.previewHint}>
        {homeGlobePreviewMessages[language].dragTheGlobeMakeItYours}
      </p>
      <div className={styles.previewCaption}>
        <span>{country.name[language]}</span>
        <Link href={`/explore/${selected}`}>
          {homeGlobePreviewMessages[language].discover}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M5 19 19 5M5 5h14v14" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
