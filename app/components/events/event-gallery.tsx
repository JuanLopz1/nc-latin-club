'use client';
import UiIcon from '../ui-icon';
import { getReducedMotion } from '../motion-preference';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { Language } from '../../translations/language';
import type { EntryImage } from './event-types';
import { eventsTranslations } from '../../translations/events-translations';
import styles from './event-gallery.module.css';
export default function EventGallery({
  images,
  language,
  entryId,
}: {
  images: readonly EntryImage[];
  language: Language;
  entryId: string;
}) {
  if (!images.length) return null;
  return <Gallery key={entryId} images={images} language={language} />;
}
function Gallery({
  images,
  language,
}: {
  images: readonly EntryImage[];
  language: Language;
}) {
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState<Set<number>>(() => new Set());
  const track = useRef<HTMLDivElement>(null);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const translations = eventsTranslations[language];
  useEffect(
    () => () => {
      if (settle.current) clearTimeout(settle.current);
    },
    [],
  );
  const goTo = (index: number) => {
    const next = Math.max(0, Math.min(images.length - 1, index));
    setActive(next);
    track.current?.scrollTo({
      left: next * track.current.clientWidth,
      behavior: getReducedMotion() ? 'instant' : 'smooth',
    });
  };
  const onScroll = () => {
    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      if (track.current?.clientWidth)
        setActive(
          Math.min(
            images.length - 1,
            Math.round(track.current.scrollLeft / track.current.clientWidth),
          ),
        );
    }, 140);
  };
  return (
    <section
      className={styles.gallery}
      aria-label={translations.gallery}
      tabIndex={images.length > 1 ? 0 : undefined}
      onKeyDown={(event) => {
        if (images.length > 1 && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
          event.preventDefault();
          goTo(active + (event.key === 'ArrowRight' ? 1 : -1));
        }
      }}
    >
      <div className={styles.track} ref={track} onScroll={onScroll}>
        {images.map((image, index) => (
          <figure className={styles.slide} key={`${image.src}-${index}`}>
            <div className={styles.frame}>
              {failed.has(index) ? (
                <p className={styles.error} role="status">
                  {translations.imageUnavailable}
                </p>
              ) : (
                <Image
                  src={image.src}
                  unoptimized={image.src.startsWith('/api/media/')}
                  width={image.width}
                  height={image.height}
                  alt={image.alt[language]}
                  sizes="(max-width: 760px) 100vw, 65vw"
                  loading="lazy"
                  onError={() => setFailed((previous) => new Set(previous).add(index))}
                />
              )}
            </div>
            {image.caption && <figcaption>{image.caption[language]}</figcaption>}
          </figure>
        ))}
      </div>
      {images.length > 1 && (
        <>
          <div className={styles.controls}>
            <button
              type="button"
              aria-label={translations.previousImage}
              disabled={active === 0}
              onClick={() => goTo(active - 1)}
            >
              <UiIcon name="left" />
            </button>
            <p aria-live="polite" aria-atomic="true">
              {translations.image} {active + 1} / {images.length}
            </p>
            <button
              type="button"
              aria-label={translations.nextImage}
              disabled={active === images.length - 1}
              onClick={() => goTo(active + 1)}
            >
              <UiIcon name="right" />
            </button>
          </div>
          <div className={styles.thumbnails}>
            {images.map((image, index) => (
              <button
                type="button"
                key={`${image.src}-${index}`}
                aria-label={`${translations.viewImage} ${index + 1}: ${image.alt[language]}`}
                aria-pressed={active === index}
                onClick={() => goTo(index)}
              >
                {failed.has(index) ? (
                  <span aria-hidden="true">
                    <UiIcon name="sparkle" />
                  </span>
                ) : (
                  <Image
                    src={image.src}
                    unoptimized={image.src.startsWith('/api/media/')}
                    width={72}
                    height={52}
                    alt=""
                    loading="lazy"
                  />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
