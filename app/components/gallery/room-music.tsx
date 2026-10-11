'use client';
import {useEffect,useRef,useState} from 'react';
import type {Language} from '../home-copy';
import {galleryCopy} from './gallery-copy';
import {startRetroSound} from './retro-sound';
import s from './gallery.module.css';
export function Cassette({playing=false}:{playing?:boolean}){return <div className={s.cassette} data-playing={playing} aria-hidden="true"><div className={s.cassetteLabel}><span>NC LATIN CLUB</span><span>A / 80s</span></div><div className={s.tapeWindow}><i/><span>FAMILIA MIX</span><i/></div><div className={s.tapeBottom}><span>●</span><span>●</span></div></div>;}
export default function RoomMusic({language,spotifyUrl}:{language:Language;spotifyUrl:string}){
 const t=galleryCopy[language],player=useRef<ReturnType<typeof startRetroSound>|null>(null),[playing,setPlaying]=useState(false),[volume,setVolume]=useState(.4),[error,setError]=useState(false);
 useEffect(()=>{const hidden=()=>{if(document.hidden){player.current?.stop();player.current=null;setPlaying(false);}};document.addEventListener('visibilitychange',hidden);return()=>{document.removeEventListener('visibilitychange',hidden);player.current?.stop();player.current=null;setPlaying(false);};},[]);
 const toggle=async()=>{if(player.current){player.current.stop();player.current=null;setPlaying(false);return;}try{player.current=startRetroSound(volume);await player.current.resume();setPlaying(true);setError(false);}catch{player.current?.stop();player.current=null;setPlaying(false);setError(true);}};
 return <aside className={s.music} aria-labelledby="room-music-title" data-room-music data-sound-playing={playing}><Cassette playing={playing}/><div><p className={s.label}>{t.music}</p><h2 id="room-music-title">{t.soundTitle}</h2><p>{t.soundText}</p><div className={s.soundControls}><button type="button" aria-pressed={playing} onClick={toggle} data-room-play><span aria-hidden="true">{playing?'Ⅱ':'▶'}</span>{playing?t.stop:t.play}</button><label>{t.volume}<input type="range" min="0" max="1" step=".05" value={volume} onChange={e=>{const v=Number(e.target.value);setVolume(v);player.current?.volume(v);}}/></label></div>{error&&<p role="alert">{t.soundError}</p>}<a href={spotifyUrl} target="_blank" rel="noopener noreferrer">{t.spotify} ↗</a></div></aside>;
}
