'use client';
import Image from 'next/image';
import UiIcon from './ui-icon';
import type { Language } from '../translations/language';
import { useContent } from './content-context';
import styles from './club-home.module.css';

export default function FamiliaSection({
  language,
  standalone = false,
}: {
  language: Language;
  standalone?: boolean;
}) {
  const { home: homeTranslations, gallery, settings } = useContent();
  const translations = homeTranslations[language];
  const photo = gallery.photos[0];
  const photoSrc = settings.familiaPhotoSrc || photo?.image.src || settings.heroSrc;
  const photoAlt = settings.familiaPhotoSrc
    ? settings.familiaPhotoAlt?.[language] || ''
    : photo?.image.alt[language] || settings.heroAlt[language];
  const Heading = standalone ? 'h1' : 'h2';
  return (
    <section
      id="familia"
      className={`${styles.section} ${styles.familia}`}
      aria-labelledby="familia-title"
    >
      <div className={styles.familiaContent}>
        <p className={styles.eyebrow}>{translations.familiaLabel}</p>
        <Heading id="familia-title">
          {translations.familiaTitle[0]}
          <br />
          <em>{translations.familiaTitle[1]}</em>
        </Heading>
        <p className={styles.lead}>{translations.familiaBody}</p>
        <p className={styles.bodyText}>{translations.familiaSecond}</p>
        <div className={styles.values} data-reveal>
          {translations.values.map((value, index) => (
            <span key={value}>
              <span aria-hidden="true">
                <UiIcon
                  name={index === 0 ? 'sparkle' : index === 1 ? 'music' : 'heart'}
                />
              </span>
              {value}
            </span>
          ))}
        </div>
      </div>
      <figure className={styles.familiaPolaroid} data-reveal>
        <div className={styles.familiaPhoto}>
          <Image
            src={photoSrc}
            alt={photoAlt}
            fill
            unoptimized={Boolean(settings.familiaPhotoSrc || photo)}
            sizes="(max-width: 760px) 85vw, (max-width: 1100px) 40vw, 440px"
            className={styles.familiaPhotoImage}
          />
        </div>
        <figcaption className={styles.familiaPhotoCaption}>
          <p className={styles.familiaPhotoQuote}>
            {translations.familiaQuote[0]}
            <br />
            <em>{translations.familiaQuote[1]}</em>
          </p>
          <span className={styles.familiaPhotoNote}>{translations.familiaNote}</span>
        </figcaption>
      </figure>
    </section>
  );
}
