'use client';
import { useEffect, useRef, useState } from 'react';
import type { Language } from './home-copy';
import { useContent } from './content-context';
import s from './club-home.module.css';
export default function SpotifySection({language}:{language:Language}) {
  const {settings}=useContent(), [loaded,setLoaded]=useState(false),frame=useRef<HTMLIFrameElement>(null);
  const t=language==='en'?{label:'LATIN CLUB / ON REPEAT',title:'A little rhythm for your day.',load:'Load Spotify player',close:'Close player',visit:'Open in Spotify',note:'Choose to load Spotify, then press play. Our club playlist is on its way.'}:{label:'LATIN CLUB / EN REPEAT',title:'Un poco de ritmo para tu día.',load:'Cargar reproductor de Spotify',close:'Cerrar reproductor',visit:'Abrir en Spotify',note:'Elige cargar Spotify y después pulsa reproducir. La playlist del club está en camino.'};
  useEffect(()=>{if(!loaded)return;const iframe=frame.current;const hide=()=>{if(document.hidden)setLoaded(false);};document.addEventListener('visibilitychange',hide);return()=>{document.removeEventListener('visibilitychange',hide);if(iframe)iframe.src='about:blank';setLoaded(false);};},[loaded]);
  const path=new URL(settings.spotifyUrl).pathname;
  return <section className={s.instagram} id="spotify" aria-labelledby="spotify-title" data-spotify-section><div><p className={s.eyebrow}>{t.label}</p><h2 id="spotify-title">{t.title}</h2><p className={s.bodyCopy}>{settings.spotifyDescription[language]}</p><a className={s.textLink} href={settings.spotifyUrl} target="_blank" rel="noopener noreferrer">{t.visit} ↗</a></div><div className={s.instagramPanel}><p className={s.eyebrow}>{settings.spotifyTitle[language]}</p><button className={s.button} type="button" data-spotify-load aria-expanded={loaded} aria-controls="home-spotify-player" onClick={()=>setLoaded(!loaded)}>{loaded?t.close:t.load}</button><div id="home-spotify-player">{loaded?<iframe ref={frame} src={`https://open.spotify.com/embed${path}?theme=0`} title={settings.spotifyTitle[language]} height="352" style={{height:352}} allow="encrypted-media; fullscreen; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin"/>:<span className={s.instagramHandle} aria-hidden="true">♪ <span>DALE PLAY</span></span>}</div><p>{t.note}</p></div></section>;
}
