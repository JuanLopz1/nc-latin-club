'use client';
import type { Language } from '../translations/language';
import { useContent } from './content-context';
import styles from './club-home.module.css';

export default function CultureMarquee({ language }: { language: Language }) {
  const { home: homeTranslations } = useContent();
  return (
    <div
      className={styles.ribbon}
      data-marquee
      role="img"
      aria-label={homeTranslations[language].ribbon.join(' · ')}
    >
      <div className={styles.ribbonTrack} aria-hidden="true">
        {[0, 1].map((group) => (
          <div key={group} className={styles.ribbonGroup} data-marquee-group>
            {[0, 1].flatMap((repeat) =>
              homeTranslations[language].ribbon.map((word) => (
                <span key={`${repeat}-${word}`}>
                  {word}
                  <svg viewBox="0 0 64 64" fill="currentColor">
                    <path d="m32 2 7 19 19-7-15 18 15 18-19-7-7 19-7-19-19 7 15-18L6 14l19 7Z" />
                  </svg>
                </span>
              )),
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
