'use client';
import {useSiteLanguage} from '../site-context';
import SpotifyEmbed from '../spotify-embed';
import type {CultureTrack} from './culture-data';
import s from './explore.module.css';
export default function CultureMusic({tracks}:{tracks:CultureTrack[]}){
 const {language}=useSiteLanguage(),t=language==='en'?{title:'A listening journey',intro:'A selection from our club’s catalogue. Choose a recording, then press play in Spotify.',spotify:'Open in Spotify',player:'Spotify player for'}:{title:'Un recorrido para escuchar',intro:'Una selección del catálogo del club. Elige una grabación y después pulsa reproducir en Spotify.',spotify:'Abrir en Spotify',player:'Reproductor de Spotify de'};
 return <section className={s.musicSection} aria-labelledby="culture-music-title" id="culture-music"><p className={s.eyebrow}>♪</p><h2 id="culture-music-title">{t.title}</h2><p>{t.intro}</p><div className={s.musicGrid}>{tracks.map(track=><article className={s.musicCard} key={track.trackId}><span className={s.trackIcon} aria-hidden="true">♪</span><h3>{track.title}</h3><p className={s.artist}>{track.artist}</p><p>{track.context[language]}</p><div className={s.culturePlayer} data-music-player><SpotifyEmbed src={`https://open.spotify.com/embed/track/${track.trackId}?theme=0`} title={`${t.player} ${track.title}`} height={152}/></div><div className={s.trackActions}><a href={`https://open.spotify.com/track/${track.trackId}`} target="_blank" rel="noopener noreferrer">{t.spotify} ↗</a></div></article>)}</div></section>;
}
