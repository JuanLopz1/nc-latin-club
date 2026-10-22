'use client';
import { niagaraDirectoryMessages } from '../../translations/interface-translations';
import UiIcon from '../ui-icon';
import { getReducedMotion } from '../motion-preference';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from '../localized-link';
import { useSiteLanguage } from '../site-context';
import type { Place, PlaceFilters } from './place-types';
import {
  filterPlaces,
  hasPin,
  initialPlaceFilters,
  markerGroups,
  placeOptions,
} from './place-utils';
import {
  niagaraTranslations,
  categoryLabels,
  modeLabels,
} from '../../translations/niagara-translations';
import PlaceCard from './place-card';
import PlaceFilter from './place-filter';
import NiagaraMap from './niagara-map';
import styles from './niagara.module.css';
export default function NiagaraDirectory({ places }: { places: readonly Place[] }) {
  const { language } = useSiteLanguage();
  const translations = niagaraTranslations[language];
  const [filters, setFilters] = useState(() => initialPlaceFilters(places));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reset, setReset] = useState(0);
  const cards = useMemo(() => filterPlaces(places, filters), [places, filters]);
  const pinnedCount = cards.filter(hasPin).length;
  const markerCount = markerGroups(cards).length;
  const selected = cards.find((p) => p.id === selectedId);
  const cardButtons = useRef(new Map<string, HTMLButtonElement>());
  useEffect(() => {
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedId) {
        setSelectedId(null);
        cardButtons.current.get(selectedId)?.focus();
      }
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [selectedId]);
  const update = <K extends keyof PlaceFilters>(key: K, value: PlaceFilters[K]) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    if (!filterPlaces(places, next).some((p) => p.id === selectedId)) setSelectedId(null);
  };
  const reveal = (id: string, fromMap = false) => {
    if (!fromMap && selectedId === id) {
      setSelectedId(null);
      return;
    }
    setSelectedId(id);
    requestAnimationFrame(() => {
      const panel = document.getElementById(id);
      panel?.scrollIntoView({
        block: 'start',
        behavior: getReducedMotion() ? 'instant' : 'smooth',
      });
      if (fromMap)
        document.getElementById(`place-title-${id}`)?.focus({ preventScroll: true });
    });
  };
  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <div className={styles.intro}>
        <Link href="/" className={styles.back}>
          <UiIcon name="left" /> NC LATIN CLUB
        </Link>
        <p className={styles.eyebrow}>NIAGARA / LOCAL CONNECTIONS</p>
        <h1>
          {translations.title}
          <span aria-hidden="true">
            <UiIcon name="sparkle" />
          </span>
        </h1>
        <p>{translations.intro}</p>
      </div>
      <div className={styles.filters}>
        <label className={styles.search}>
          <span>{translations.search}</span>
          <input
            type="search"
            value={filters.query}
            onChange={(e) => update('query', e.target.value)}
            placeholder={niagaraDirectoryMessages[language].tryPupusasBakeryWelland}
          />
        </label>
        {(['city', 'category', 'mode'] as const).map((key) => (
          <PlaceFilter
            key={key}
            name={key}
            label={translations[key]}
            options={placeOptions(places, key)}
            selected={filters[key]}
            language={language}
            onChange={(values) => update(key, values)}
            optionLabel={(v) =>
              key === 'category'
                ? (categoryLabels[v]?.[language] ?? v)
                : key === 'mode'
                  ? (modeLabels[v]?.[language] ?? v)
                  : v
            }
          />
        ))}
        <button
          className={styles.clear}
          onClick={() => {
            setFilters(initialPlaceFilters(places));
            setSelectedId(null);
          }}
        >
          {translations.clear}
        </button>
      </div>
      <p className={styles.filterHint}>{translations.filterHint}</p>
      <p className={styles.count} role="status">
        {cards.length} {translations.results}
        <span aria-hidden="true"> / </span>
        {pinnedCount} {translations.pins}
        <span aria-hidden="true"> / </span>
        {markerCount} {translations.markers}
        {cards.length > pinnedCount && (
          <>
            <span aria-hidden="true"> / </span>
            {cards.length - pinnedCount} {translations.noPinCount}
          </>
        )}
        {selected && ` · ${translations.selected}: ${selected.name}`}
      </p>
      <p className={styles.mapKey}>{translations.mapKey}</p>
      <div className={styles.layout}>
        <section
          className={styles.mapColumn}
          aria-label={niagaraDirectoryMessages[language].exploreTheMap}
        >
          <div className={styles.mapHeading}>
            <strong>NIAGARA, ON</strong>
            <button onClick={() => setReset((v) => v + 1)}>
              {translations.reset} <UiIcon name="external" />
            </button>
          </div>
          <NiagaraMap
            places={cards}
            selectedId={selected?.id ?? null}
            language={language}
            onSelect={(id) => reveal(id, true)}
            reset={reset}
          />
          <p className={styles.mapHint}>{translations.hint}</p>
          <p className={styles.based}>{translations.based}</p>
        </section>
        <section
          className={styles.directory}
          aria-label={niagaraDirectoryMessages[language].businessDirectory}
        >
          {!cards.length && <p className={styles.empty}>{translations.noResults}</p>}
          <div className={styles.cards}>
            {cards.map((p, i) => (
              <PlaceCard
                key={p.id}
                place={p}
                index={i}
                language={language}
                expanded={selected?.id === p.id}
                onToggle={() => reveal(p.id)}
                registerButton={(node) => {
                  if (node) cardButtons.current.set(p.id, node);
                  else cardButtons.current.delete(p.id);
                }}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
