'use client';
import { instagramTranslations } from '../translations/instagram-translations';
import type { Language } from '../translations/language';
import { useContent } from './content-context';
import styles from './club-home.module.css';

export default function InstagramSection({ language }: { language: Language }) {
  const { settings: clubLinks } = useContent();
  const handle =
    new URL(clubLinks.instagramUrl).pathname.split('/').filter(Boolean)[0] ??
    'nclat1nclub';
  const translations = instagramTranslations[language];
  if (!clubLinks.instagramUrl) return null;
  return (
    <section
      className={styles.instagram}
      id="instagram"
      aria-labelledby="instagram-title"
    >
      <div>
        <p className={styles.eyebrow}>@{handle.toUpperCase()} / INSTAGRAM</p>
        <h2 id="instagram-title">{translations.title}</h2>
        <p className={styles.bodyText}>
          {translations.text.replaceAll('nclat1nclub', handle)}
        </p>
        <a
          className={styles.textLink}
          href={clubLinks.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {translations.visit.replaceAll('nclat1nclub', handle)}{' '}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M5 19 19 5M5 5h14v14" />
          </svg>
        </a>
      </div>
      <div className={styles.instagramPanel}>
        <div id="instagram-profile">
          <iframe
            src={`https://www.instagram.com/${handle}/embed/`}
            title={translations.frame}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
        <p>{translations.note}</p>
      </div>
    </section>
  );
}
