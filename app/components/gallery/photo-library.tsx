'use client';
import UiIcon from '../ui-icon';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useContent } from '../content-context';
import { useSiteLanguage } from '../site-context';
import { galleryTranslations } from '../../translations/gallery-translations';
import { Cassette } from './room-music';
import RoomMusic from './room-music';
import PhotoSubmission from './photo-submission';
import Arrow from './arrow';
import styles from './gallery.module.css';
export default function PhotoLibrary() {
  const { gallery } = useContent();
  const { language } = useSiteLanguage();
  const translations = galleryTranslations[language];
  const [album, setAlbum] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const albums = [...new Set(gallery.photos.map((photo) => photo.album))];
  const photos = gallery.photos.filter((photo) => !album || photo.album === album);
  const index = photos.findIndex((photo) => photo.id === selected);
  const photo = photos[index];
  useEffect(() => {
    if (selected) dialog.current?.showModal();
    else dialog.current?.close();
  }, [selected]);
  const close = () => {
    dialog.current?.close();
    setSelected(null);
    trigger.current?.focus({ preventScroll: true });
  };
  const move = (offset: number) => {
    if (photos.length)
      setSelected(photos[(index + offset + photos.length) % photos.length].id);
  };
  return (
    <main id="main-content" tabIndex={-1} className={styles.page} data-phototeca>
      <header className={styles.hero}>
        <div className={styles.gridFloor} aria-hidden="true" />
        <div className={styles.heroContent}>
          <p className={styles.label}>{translations.label}</p>
          <h1>{gallery.title[language]}</h1>
          <p>{gallery.description[language]}</p>
          <a className={styles.primary} href="#leave-a-memory">
            {translations.share}
            <Arrow />
          </a>
          <span className={styles.rewind}>
            <i />
            REC / {translations.tag}
          </span>
        </div>
        <div className={styles.heroArt} aria-hidden="true">
          <div className={styles.sun} />
          <div className={styles.retroWord}>
            LA
            <br />
            <em>FAMILIA</em>
          </div>
          <div className={styles.tapeCorner}>
            <Cassette />
          </div>
          <span className={styles.star}>
            <UiIcon name="sparkle" />
          </span>
          <span className={styles.artNote}>
            NC / NIAGARA
            <br />
            EST. 2026
          </span>
        </div>
      </header>
      <section className={styles.albumSection} aria-label={translations.album}>
        <div className={styles.albumBar}>
          <div role="group" aria-label={translations.album}>
            <button onClick={() => setAlbum('')} aria-pressed={!album}>
              {translations.all}
            </button>
            {albums.map((name) => (
              <button
                key={name}
                onClick={() => setAlbum(name)}
                aria-pressed={album === name}
              >
                {name}
              </button>
            ))}
          </div>
          <p>
            {photos.length.toString().padStart(2, '0')} / {translations.count}
          </p>
        </div>
        {!gallery.photos.length ? (
          <div className={styles.empty}>
            <div className={styles.emptyFrame} aria-hidden="true">
              <svg viewBox="0 0 120 90" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M10 24h25l7-12h36l7 12h25v56H10z" />
                <circle cx="60" cy="52" r="20" />
                <circle cx="60" cy="52" r="12" />
                <path d="M91 34h10M18 74h18" />
              </svg>
              <span>FAMILIA / VOL. 01</span>
            </div>
            <div>
              <p className={styles.label}>ROLL 001 / SIDE A</p>
              <h2>{translations.empty}</h2>
              <p>{translations.emptyText}</p>
              <a href="#leave-a-memory">
                {translations.share} <UiIcon name="external" />
              </a>
            </div>
          </div>
        ) : (
          <div className={styles.photos}>
            {photos.map((photo, i) => (
              <button
                key={photo.id}
                className={styles.photo}
                onClick={(event) => {
                  trigger.current = event.currentTarget;
                  setSelected(photo.id);
                }}
                aria-label={`${translations.open}: ${photo.caption[language]}`}
                data-gallery-photo={photo.id}
              >
                <div className={styles.photoImage}>
                  <Image
                    src={photo.image.src}
                    alt={photo.image.alt[language]}
                    fill
                    unoptimized={photo.image.src.startsWith('/api/media/')}
                    sizes="(max-width: 600px) 90vw, (max-width: 900px) 45vw, 30vw"
                  />
                </div>
                <div className={styles.photoCaption}>
                  <span>{photo.caption[language]}</span>
                  <small>
                    {photo.album} / {String(i + 1).padStart(2, '0')}
                  </small>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
      <RoomMusic language={language} spotifyUrl={gallery.musicUrl} />
      <PhotoSubmission language={language} />
      <Link className={styles.back} href="/">
        <UiIcon name="left" /> {translations.back}
      </Link>
      <dialog
        ref={dialog}
        className={styles.lightbox}
        aria-label={photo?.caption[language] ?? translations.open}
        onCancel={close}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') {
            event.preventDefault();
            move(1);
          }
          if (event.key === 'ArrowLeft') {
            event.preventDefault();
            move(-1);
          }
        }}
      >
        <div className={styles.lightboxTop}>
          <span>
            {index + 1} / {photos.length}
          </span>
          <button aria-label={translations.close} onClick={close}>
            ×
          </button>
        </div>
        {photo && (
          <>
            <div className={styles.lightboxImage}>
              <Image
                src={photo.image.src}
                alt={photo.image.alt[language]}
                fill
                unoptimized
                sizes="90vw"
              />
            </div>
            <div className={styles.lightboxFoot}>
              <div>
                <p>{photo.caption[language]}</p>
                <small>
                  {photo.album}
                  {photo.credit ? ` · ${translations.credit} ${photo.credit}` : ''}
                </small>
              </div>
              <div>
                <button
                  aria-label={translations.previous}
                  onClick={() => move(-1)}
                  disabled={photos.length < 2}
                >
                  <UiIcon name="left" />
                </button>
                <button
                  aria-label={translations.next}
                  onClick={() => move(1)}
                  disabled={photos.length < 2}
                >
                  <UiIcon name="right" />
                </button>
              </div>
            </div>
          </>
        )}
      </dialog>
    </main>
  );
}
