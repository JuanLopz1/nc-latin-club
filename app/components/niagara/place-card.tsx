'use client';
import UiIcon from '../ui-icon';
import type { Language } from '../../translations/language';
import type { Place } from './place-types';
import { directionsUrl, hasPin } from './place-utils';
import {
  categoryLabels,
  niagaraTranslations,
} from '../../translations/niagara-translations';
import styles from './niagara.module.css';
import EventGallery from '../events/event-gallery';
export default function PlaceCard({
  place: p,
  index,
  language,
  expanded,
  onToggle,
  registerButton,
}: {
  place: Place;
  index: number;
  language: Language;
  expanded: boolean;
  onToggle(): void;
  registerButton(node: HTMLButtonElement | null): void;
}) {
  const translations = niagaraTranslations[language];
  const destination = directionsUrl(p);
  const pinned = hasPin(p);
  const channels = p.channels.filter(
    (channel, i, all) => all.findIndex((c) => c.url === channel.url) === i,
  );
  return (
    <article
      id={p.id}
      className={`${styles.card} ${expanded ? styles.cardSelected : ''}`}
      data-place={p.id}
      data-place-number={index + 1}
      data-selected={expanded ? p.id : undefined}
      aria-labelledby={`place-title-${p.id}`}
    >
      <div className={styles.cardTop}>
        <span>{String(index + 1).padStart(2, '0')}</span>
        <span>{p.city}</span>
        <span aria-hidden="true">
          <UiIcon name="sparkle" />
        </span>
      </div>
      <p className={styles.tag}>
        {p.categories.map((c) => categoryLabels[c]?.[language] ?? c).join(' / ')}
      </p>
      <h2 id={`place-title-${p.id}`} tabIndex={-1}>
        <button
          ref={registerButton}
          onClick={onToggle}
          aria-controls={`detail-${p.id}`}
          aria-expanded={expanded}
        >
          {p.name}
        </button>
      </h2>
      <p>{p.description[language]}</p>
      {p.address && <p className={styles.address}>{p.address}</p>}
      <p className={`${styles.mapStatus} ${!pinned ? styles.note : ''}`}>
        {pinned
          ? translations.onMap
          : `${translations.offMap} · ${p.mode === 'order_only' ? translations.noLocal : translations.pending}`}
      </p>
      {!p.channels.length && <p className={styles.note}>{translations.channelPending}</p>}
      <div className={styles.actions}>
        {destination && (
          <a
            href={destination}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${translations.directions}: ${p.name} (${translations.external})`}
          >
            {translations.directions} <UiIcon name="external" />
          </a>
        )}
        {channels.map((channel, i) => (
          <a
            key={channel.url}
            href={channel.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${channel.label}: ${p.name} (${translations.external})`}
          >
            {i === 0 ? translations.contact : channel.label} <UiIcon name="external" />
          </a>
        ))}
      </div>
      <button
        className={styles.more}
        onClick={onToggle}
        aria-controls={`detail-${p.id}`}
        aria-expanded={expanded}
      >
        {expanded ? translations.close : translations.details}
        <span aria-hidden="true">
          {expanded ? <UiIcon name="up" /> : <UiIcon name="right" />}
        </span>
      </button>
      <section
        id={`detail-${p.id}`}
        className={styles.expanded}
        hidden={!expanded}
        aria-label={`${translations.details}: ${p.name}`}
      >
        {expanded && !!p.images?.length && (
          <EventGallery images={p.images} language={language} entryId={p.id} />
        )}
        {p.mode === 'mobile' && <p className={styles.note}>{translations.mobile}</p>}
        <div className={styles.sources}>
          <p>
            {translations.reviewed}: {p.reviewedOn}
          </p>
          {p.sources.map((source, i) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${translations.source} ${i + 1}: ${p.name} (${translations.external})`}
            >
              {translations.source} {i + 1} <UiIcon name="external" />
            </a>
          ))}
        </div>
      </section>
    </article>
  );
}
