'use client';
import { useEffect, useRef, useState } from 'react';
import { useSiteLanguage } from '../site-context';
import type { CultureTrack } from './culture-data';
import s from './explore.module.css';
export default function CultureMusic({ tracks }: { tracks: CultureTrack[] }) {
  const { language } = useSiteLanguage();
  const [active, setActive] = useState<string | null>(null);
  const player = useRef<HTMLDivElement>(null);
  const triggers = useRef(new Map<string, HTMLButtonElement>());
  const t = language === 'en' ? {
    title: 'A listening journey', intro: 'A selection from our club’s catalogue. Choose a recording, then press play in Spotify.',
    load: 'Load player', close: 'Close player', spotify: 'Open in Spotify', player: 'Spotify player for', external: 'Loading connects to Spotify. Playback and availability depend on Spotify and your region.'
  } : {
    title: 'Un recorrido para escuchar', intro: 'Una selección del catálogo del club. Elige una grabación y después pulsa reproducir en Spotify.',
    load: 'Cargar reproductor', close: 'Cerrar reproductor', spotify: 'Abrir en Spotify', player: 'Reproductor de Spotify de', external: 'Al cargar se conecta con Spotify. La reproducción y disponibilidad dependen de Spotify y tu región.'
  };
  useEffect(() => {
    const container = player.current;
    // Activity detaches refs before passive cleanup; retain the actual node.
    const removePlayer = () => { container?.querySelector('iframe')?.setAttribute('src', 'about:blank'); };
    const hide = () => { if (document.hidden) { removePlayer(); setActive(null); } };
    document.addEventListener('visibilitychange', hide);
    // Next's Activity hides cached routes and runs effect cleanup. Remove the
    // media frame immediately so a hidden page cannot continue playing audio.
    return () => { document.removeEventListener('visibilitychange', hide); removePlayer(); setActive(null); };
  }, []);
  useEffect(() => {
    if (active) player.current?.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }, [active]);
  const close = (id: string) => { setActive(null); triggers.current.get(id)?.focus(); };
  return <section className={s.musicSection} aria-labelledby="culture-music-title" id="culture-music">
    <p className={s.eyebrow}>♪</p><h2 id="culture-music-title">{t.title}</h2><p>{t.intro}</p>
    <div className={s.musicGrid}>{tracks.map(track => <article className={s.musicCard} key={track.trackId}>
      <span className={s.trackIcon} aria-hidden="true">♪</span><h3>{track.title}</h3><p className={s.artist}>{track.artist}</p><p>{track.context[language]}</p>
      <div className={s.trackActions}><button data-load-track={track.trackId} ref={node => { if (node) triggers.current.set(track.trackId, node); else triggers.current.delete(track.trackId); }} aria-expanded={active === track.trackId} aria-controls={active === track.trackId ? 'culture-spotify-player' : undefined} onClick={() => { if (active === track.trackId) close(track.trackId); else setActive(track.trackId); }}>{active === track.trackId ? t.close : t.load}</button><a href={`https://open.spotify.com/track/${track.trackId}`} target="_blank" rel="noopener noreferrer">{t.spotify} ↗</a></div>
    </article>)}</div>
    <p className={s.musicNote}>{t.external}</p>
    <div ref={player} id="culture-spotify-player" data-music-player>{active && <><button className={s.playerClose} onClick={() => close(active)}>{t.close} ×</button><iframe key={active} src={`https://open.spotify.com/embed/track/${active}?theme=0`} title={`${t.player} ${tracks.find(track => track.trackId === active)?.title}`} width="100%" height="152" allow="encrypted-media; fullscreen; picture-in-picture" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" /></>}</div>
  </section>;
}
