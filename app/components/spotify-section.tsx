'use client';
import UiIcon from './ui-icon';
import type { Language } from './home-copy';
import { useContent } from './content-context';
import SpotifyEmbed from './spotify-embed';
import s from './club-home.module.css';
export default function SpotifySection({language}:{language:Language}) {
  const {settings}=useContent();
  const t=language==='en'?{label:'LATIN CLUB / ON REPEAT',title:'A little rhythm for your day.',visit:'Open in Spotify'}:{label:'LATIN CLUB / EN REPEAT',title:'Un poco de ritmo para tu día.',visit:'Abrir en Spotify'};
  const path=new URL(settings.spotifyUrl).pathname;
  return <section className={s.instagram} id="spotify" aria-labelledby="spotify-title" data-spotify-section>
    <div><p className={s.eyebrow}>{t.label}</p><h2 id="spotify-title">{t.title}</h2><p className={s.bodyCopy}>{settings.spotifyDescription[language]}</p><a className={s.textLink} href={settings.spotifyUrl} target="_blank" rel="noopener noreferrer">{t.visit} <UiIcon name="external" /></a></div>
    <div className={s.spotifyPanel}><p className={s.eyebrow}>{settings.spotifyTitle[language]}</p><div id="home-spotify-player" className={s.spotifyFrame}><SpotifyEmbed src={`https://open.spotify.com/embed${path}?theme=0`} title={settings.spotifyTitle[language]}/></div></div>
  </section>;
}
