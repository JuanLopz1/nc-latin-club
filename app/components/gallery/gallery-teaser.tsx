'use client';
import UiIcon from '../ui-icon';
import Link from 'next/link';
import { useSiteLanguage } from '../site-context';
import { galleryTranslations } from '../../translations/gallery-translations';
import { Cassette } from './room-music';
import Arrow from './arrow';
import styles from './gallery.module.css';
export default function GalleryTeaser() {
  const { language } = useSiteLanguage();
  const translations = galleryTranslations[language];
  return (
    <section
      className={styles.teaser}
      id="fototeca"
      aria-labelledby="phototeca-teaser-title"
    >
      <div>
        <p className={styles.label}>FOTOTECA / GOOD TIMES ON REWIND</p>
        <h2 id="phototeca-teaser-title">{translations.teaser}</h2>
        <p>{translations.invite}</p>
        <Link className={styles.primary} href="/fototeca">
          {translations.browse}
          <Arrow />
        </Link>
      </div>
      <Link
        href="/fototeca"
        className={styles.teaserArt}
        aria-label={translations.browse}
      >
        <div className={styles.gridFloor} aria-hidden="true" />
        <span className={styles.teaserWord} aria-hidden="true">
          REWIND
          <br />
          <em>THE GOOD TIMES.</em>
        </span>
        <Cassette />
        <span className={styles.teaserSticker} aria-hidden="true">
          FAMILIA
          <br />
          VOL. 01 <UiIcon name="external" />
        </span>
      </Link>
    </section>
  );
}
