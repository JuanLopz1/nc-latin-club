'use client';
import UiIcon from '../ui-icon';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useExploreState, useSiteLanguage } from '../site-context';
import type { Camera, Country, GlobeHandle } from './explore-types';
import { filterCountries, regions } from './explore-utils';
import { exploreTranslations } from '../../translations/explore-translations';
import GlobeScene from './globe-scene';
import styles from './explore.module.css';
import { getReducedMotion, useReducedMotion } from '../motion-preference';
export default function ExploreExperience({
  countries,
}: {
  countries: readonly Country[];
}) {
  const { language } = useSiteLanguage();
  const { state, setState } = useExploreState();
  const translations = exploreTranslations[language];
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [nearby, setNearby] = useState<string[]>([]);
  const [toolsOpen, setToolsOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const tools = useRef<HTMLDivElement>(null);
  const toolsTrigger = useRef<HTMLButtonElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const selectionSource = useRef<'list' | 'map'>('list');
  const scene = useRef<GlobeHandle>(null);
  const triggers = useRef(new Map<string, HTMLButtonElement>());
  const previewTitle = useRef<HTMLHeadingElement>(null);
  const matches = useMemo(
    () => filterCountries(countries, state.query, state.regions),
    [countries, state.query, state.regions],
  );
  const selected = countries.find((c) => c.slug === state.selectedSlug);
  const onCamera = useCallback(
    (camera: Camera) => setState((styles) => ({ ...styles, camera })),
    [setState],
  );
  const stop = useCallback(
    () =>
      setState((styles) => (styles.rotating ? { ...styles, rotating: false } : styles)),
    [setState],
  );
  const choose = (slug: string, fromMap = false) => {
    setToolsOpen(false);
    setNearby([]);
    selectionSource.current = fromMap ? 'map' : 'list';
    setState((styles) => ({ ...styles, selectedSlug: slug, rotating: false }));
    requestAnimationFrame(() => previewTitle.current?.focus({ preventScroll: true }));
    if (!fromMap)
      frame.current?.scrollIntoView({
        block: 'start',
        behavior: getReducedMotion() ? 'instant' : 'smooth',
      });
  };
  const close = useCallback(() => {
    setNearby([]);
    setState((styles) => ({ ...styles, selectedSlug: null }));
    if (selectionSource.current === 'list' && state.selectedSlug)
      triggers.current.get(state.selectedSlug)?.focus();
    else toolsTrigger.current?.focus({ preventScroll: true });
  }, [state.selectedSlug, setState]);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (toolsOpen) {
        setToolsOpen(false);
        toolsTrigger.current?.focus({ preventScroll: true });
      } else if (state.selectedSlug || nearby.length) close();
    };
    const dismiss = (event: PointerEvent) => {
      if (
        toolsOpen &&
        event.target instanceof Node &&
        !tools.current?.contains(event.target)
      )
        setToolsOpen(false);
    };
    window.addEventListener('keydown', escape);
    window.addEventListener('pointerdown', dismiss);
    return () => {
      window.removeEventListener('keydown', escape);
      window.removeEventListener('pointerdown', dismiss);
    };
  }, [toolsOpen, state.selectedSlug, nearby.length, close]);
  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>{translations.eyebrow}</p>
        <h1>
          {translations.title[0]}
          <br />
          <em>{translations.title[1]}</em>
        </h1>
        <p>{translations.intro}</p>
        <span aria-hidden="true">
          <UiIcon name="sparkle" />
        </span>
      </header>
      <section className={styles.explorer} aria-label={translations.eyebrow}>
        <div className={styles.toolbar}>
          <label>
            <span>{translations.search}</span>
            <input
              type="search"
              value={state.query}
              placeholder={translations.placeholder}
              onChange={(e) => {
                stop();
                setState((styles) => ({ ...styles, query: e.target.value }));
              }}
            />
          </label>
          <p role="status">
            {matches.length} {translations.results}
          </p>
        </div>
        <div ref={frame} className={styles.globeFrame}>
          <div ref={tools} className={styles.tools}>
            <button
              ref={toolsTrigger}
              className={styles.toolsTrigger}
              data-tools-trigger
              aria-expanded={toolsOpen}
              aria-controls={toolsOpen ? 'map-tools-panel' : undefined}
              onClick={() => {
                if (!toolsOpen) stop();
                setToolsOpen((open) => !open);
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 7h16M4 17h16M9 4v6M15 14v6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              <span>{translations.tools}</span>
              <span aria-hidden="true">{toolsOpen ? '−' : '+'}</span>
            </button>
            {toolsOpen && (
              <div
                className={styles.toolsPanel}
                id="map-tools-panel"
                data-tools-panel
                role="region"
                aria-labelledby="map-tools-title"
              >
                <div className={styles.toolsHeading}>
                  <h2 id="map-tools-title">{translations.tools}</h2>
                  <button
                    aria-label={translations.closeTools}
                    onClick={() => {
                      setToolsOpen(false);
                      toolsTrigger.current?.focus({ preventScroll: true });
                    }}
                  >
                    ×
                  </button>
                </div>
                <h3>{translations.view}</h3>
                <div
                  className={styles.controls}
                  role="group"
                  aria-label={translations.view}
                >
                  <button
                    data-zoom="in"
                    onClick={() => scene.current?.zoom(1)}
                    disabled={!ready}
                    aria-label={translations.zoomIn}
                  >
                    +
                  </button>
                  <button
                    data-zoom="out"
                    onClick={() => scene.current?.zoom(-1)}
                    disabled={!ready}
                    aria-label={translations.zoomOut}
                  >
                    −
                  </button>
                  <button
                    data-reset
                    onClick={() => {
                      setNearby([]);
                      setState((styles) => ({
                        ...styles,
                        selectedSlug: null,
                        rotating: false,
                      }));
                      scene.current?.reset();
                    }}
                  >
                    {translations.reset}
                  </button>
                  <button
                    data-rotate
                    disabled={!ready || reducedMotion}
                    aria-pressed={state.rotating && !reducedMotion}
                    onClick={() =>
                      setState((styles) => ({ ...styles, rotating: !styles.rotating }))
                    }
                  >
                    {state.rotating && !reducedMotion
                      ? translations.stop
                      : translations.rotate}
                  </button>
                </div>
                <h3>{translations.region}</h3>
                <div
                  className={styles.regions}
                  role="group"
                  aria-label={translations.region}
                >
                  <button
                    data-region="all"
                    aria-pressed={state.regions.length === regions.length}
                    onClick={() =>
                      setState((styles) => ({ ...styles, regions: [...regions] }))
                    }
                  >
                    {translations.all}
                  </button>
                  <button
                    data-region="none"
                    onClick={() => setState((styles) => ({ ...styles, regions: [] }))}
                  >
                    {translations.none}
                  </button>
                  {regions.map((region) => (
                    <button
                      key={region}
                      data-region={region}
                      aria-pressed={state.regions.includes(region)}
                      onClick={() =>
                        setState((styles) => ({
                          ...styles,
                          regions: regions.filter((r) =>
                            r === region
                              ? !styles.regions.includes(r)
                              : styles.regions.includes(r),
                          ),
                        }))
                      }
                    >
                      {translations.regions[region]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <GlobeScene
            ref={scene}
            countries={matches}
            selectedSlug={state.selectedSlug}
            camera={state.camera}
            rotating={state.rotating && !reducedMotion}
            language={language}
            onSelect={(slug, group) => {
              setToolsOpen(false);
              if (group && group.length > 1) {
                selectionSource.current = 'map';
                setState((styles) => ({
                  ...styles,
                  selectedSlug: null,
                  rotating: false,
                }));
                setNearby(group);
                requestAnimationFrame(() =>
                  previewTitle.current?.focus({ preventScroll: true }),
                );
              } else choose(slug, true);
            }}
            onCamera={onCamera}
            onReady={setReady}
            onInteraction={stop}
            onError={() => setFailed(true)}
          />
          {!ready && (
            <p className={styles.loading} role="status">
              {failed ? translations.fallback : translations.loading}
            </p>
          )}
          <p className={styles.hint}>{translations.hint}</p>
          {!!nearby.length && !toolsOpen && (
            <aside
              className={styles.preview}
              data-nearby-destinations
              aria-labelledby="nearby-title"
            >
              <div className={styles.previewTop}>
                <span className={styles.eyebrow}>{translations.preview}</span>
                <button onClick={close} aria-label={translations.close}>
                  ×
                </button>
              </div>
              <h2 id="nearby-title" ref={previewTitle} tabIndex={-1}>
                {translations.nearby}
              </h2>
              <p>{translations.nearbyHint}</p>
              <div className={styles.nearbyChoices}>
                {nearby
                  .map((slug) => countries.find((c) => c.slug === slug))
                  .filter((c): c is Country => !!c)
                  .map((c) => (
                    <button
                      key={c.slug}
                      data-nearby-country={c.slug}
                      onClick={() => choose(c.slug, true)}
                    >
                      {c.name[language]}{' '}
                      <span aria-hidden="true">
                        <UiIcon name="right" />
                      </span>
                    </button>
                  ))}
              </div>
            </aside>
          )}
          {selected && !toolsOpen && (
            <aside
              className={styles.preview}
              data-selected-country={selected.slug}
              aria-labelledby="selected-country-title"
            >
              <div className={styles.previewTop}>
                <span className={styles.eyebrow}>{translations.preview}</span>
                <button onClick={close} aria-label={translations.close}>
                  ×
                </button>
              </div>
              <p className={styles.regionLabel}>
                {translations.regions[selected.region]}
              </p>
              <h2 ref={previewTitle} tabIndex={-1} id="selected-country-title">
                {selected.name[language]}
              </h2>
              <p>{selected.intro[language]}</p>
              {selected.politicalStatus && <p>{selected.politicalStatus[language]}</p>}
              {selected.culturalStatus === 'reviewed' && (
                <Link className={styles.action} href={`/explore/${selected.slug}`}>
                  {translations.explore} {selected.name[language]}{' '}
                  <span aria-hidden="true">
                    <UiIcon name="right" />
                  </span>
                </Link>
              )}
              <a
                className={styles.sourceLink}
                href={selected.sources[0].url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {translations.sources}
              </a>
            </aside>
          )}
        </div>
        <p className={styles.attribution}>
          <a
            href="https://github.com/nvkelso/natural-earth-vector/blob/master/LICENSE.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            {translations.source}
          </a>
        </p>
      </section>
      <section
        className={styles.destinationList}
        aria-labelledby="destination-list-title"
      >
        <div className={styles.listHeading}>
          <h2 id="destination-list-title">{translations.list}</h2>
          <span>
            {matches.length.toString().padStart(2, '0')} / {countries.length}
          </span>
        </div>
        {!matches.length && <p className={styles.noResults}>{translations.noResults}</p>}
        <div className={styles.destinations}>
          {matches.map((c) => (
            <button
              key={c.slug}
              data-country={c.slug}
              ref={(node) => {
                if (node) triggers.current.set(c.slug, node);
                else triggers.current.delete(c.slug);
              }}
              aria-pressed={selected?.slug === c.slug}
              aria-controls={
                selected?.slug === c.slug ? 'selected-country-title' : undefined
              }
              onClick={() => choose(c.slug)}
            >
              <span>{c.iso2}</span>
              <strong>{c.name[language]}</strong>
              <small>{translations.regions[c.region]}</small>
              <i aria-hidden="true">
                <UiIcon name="external" />
              </i>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
