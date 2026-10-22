'use client';
import { spotifyTranslations } from '../translations/spotify-translations';
import UiIcon from './ui-icon';
import type { Language } from '../translations/language';
import { useContent } from './content-context';
import SpotifyEmbed from './spotify-embed';
import styles from './club-home.module.css';
export default function SpotifySection({ language }: { language: Language }) {
  const { settings } = useContent();
  const translations = spotifyTranslations[language];
  const path = new URL(settings.spotifyUrl).pathname;
  return (
    <section
      className={styles.instagram}
      id="spotify"
      aria-labelledby="spotify-title"
      data-spotify-section
    >
      <div>
        <p className={styles.eyebrow}>{translations.label}</p>
        <h2 id="spotify-title">{translations.title}</h2>
        <p className={styles.bodyText}>{settings.spotifyDescription[language]}</p>
        <a
          className={styles.textLink}
          href={settings.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {translations.visit} <UiIcon name="external" />
        </a>
      </div>
      <div className={styles.spotifyPanel}>
        <p className={styles.eyebrow}>{settings.spotifyTitle[language]}</p>
        <div id="home-spotify-player" className={styles.spotifyFrame}>
          <SpotifyEmbed
            src={`https://open.spotify.com/embed${path}?theme=0`}
            title={settings.spotifyTitle[language]}
          />
        </div>
      </div>
    </section>
  );
}
