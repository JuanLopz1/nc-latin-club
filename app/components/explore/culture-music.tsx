'use client';
import UiIcon from '../ui-icon';
import { useSiteLanguage } from '../site-context';
import SpotifyEmbed from '../spotify-embed';
import type { CultureTrack } from './culture-data';
import styles from './explore.module.css';
export default function CultureMusic({ tracks }: { tracks: CultureTrack[] }) {
  const { language } = useSiteLanguage();
  const translations =
    language === 'en'
      ? {
          title: 'A listening journey',
          intro:
            'A selection from our club’s catalogue. Choose a recording, then press play in Spotify.',
          spotify: 'Open in Spotify',
          player: 'Spotify player for',
        }
      : {
          title: 'Un recorrido para escuchar',
          intro:
            'Una selección del catálogo del club. Elige una grabación y después pulsa reproducir en Spotify.',
          spotify: 'Abrir en Spotify',
          player: 'Reproductor de Spotify de',
        };
  return (
    <section
      className={styles.musicSection}
      aria-labelledby="culture-music-title"
      id="culture-music"
    >
      <p className={styles.eyebrow}>
        <UiIcon name="music" />
      </p>
      <h2 id="culture-music-title">{translations.title}</h2>
      <p>{translations.intro}</p>
      <div className={styles.musicGrid}>
        {tracks.map((track) => (
          <article className={styles.musicCard} key={track.trackId}>
            <span className={styles.trackIcon} aria-hidden="true">
              <UiIcon name="music" />
            </span>
            <h3>{track.title}</h3>
            <p className={styles.artist}>{track.artist}</p>
            <p>{track.context[language]}</p>
            <div className={styles.culturePlayer} data-music-player>
              <SpotifyEmbed
                src={`https://open.spotify.com/embed/track/${track.trackId}?theme=0`}
                title={`${translations.player} ${track.title}`}
                height={152}
              />
            </div>
            <div className={styles.trackActions}>
              <a
                href={`https://open.spotify.com/track/${track.trackId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {translations.spotify} <UiIcon name="external" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
