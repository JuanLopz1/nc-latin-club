'use client';
import {useEffect,useRef,useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {useContent} from '../content-context';
import {useSiteLanguage} from '../site-context';
import {galleryCopy} from './gallery-copy';
import {Cassette} from './room-music';
import RoomMusic from './room-music';
import PhotoSubmission from './photo-submission';
import Arrow from './arrow';
import s from './gallery.module.css';
export default function PhotoLibrary(){
 const {gallery}=useContent(),{language}=useSiteLanguage(),t=galleryCopy[language],[album,setAlbum]=useState(''),[selected,setSelected]=useState<string|null>(null),dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement|null>(null);
 const albums=[...new Set(gallery.photos.map(photo=>photo.album))],photos=gallery.photos.filter(photo=>!album||photo.album===album),index=photos.findIndex(photo=>photo.id===selected),photo=photos[index];
 useEffect(()=>{if(selected)dialog.current?.showModal();else dialog.current?.close();},[selected]);
 const close=()=>{dialog.current?.close();setSelected(null);trigger.current?.focus({preventScroll:true});};
 const move=(offset:number)=>{if(photos.length)setSelected(photos[(index+offset+photos.length)%photos.length].id);};
 return <main id="main-content" tabIndex={-1} className={s.page} data-phototeca><header className={s.hero}><div className={s.gridFloor} aria-hidden="true"/><div className={s.heroCopy}><p className={s.label}>{t.label}</p><h1>{gallery.title[language]}</h1><p>{gallery.description[language]}</p><a className={s.primary} href="#leave-a-memory">{t.share}<Arrow/></a><span className={s.rewind}><i/>REC / {t.tag}</span></div><div className={s.heroArt} aria-hidden="true"><div className={s.sun}/><div className={s.retroWord}>LA<br/><em>FAMILIA</em></div><div className={s.tapeCorner}><Cassette/></div><span className={s.star}>✦</span><span className={s.artNote}>NC / NIAGARA<br/>EST. 2026</span></div></header>
 <section className={s.albumSection} aria-label={t.album}><div className={s.albumBar}><div role="group" aria-label={t.album}><button onClick={()=>setAlbum('')} aria-pressed={!album}>{t.all}</button>{albums.map(name=><button key={name} onClick={()=>setAlbum(name)} aria-pressed={album===name}>{name}</button>)}</div><p>{photos.length.toString().padStart(2,'0')} / {t.count}</p></div>{!gallery.photos.length?<div className={s.empty}><div className={s.emptyFrame} aria-hidden="true"><svg viewBox="0 0 120 90" fill="none" stroke="currentColor" strokeWidth="3"><path d="M10 24h25l7-12h36l7 12h25v56H10z"/><circle cx="60" cy="52" r="20"/><circle cx="60" cy="52" r="12"/><path d="M91 34h10M18 74h18"/></svg><span>FAMILIA / VOL. 01</span></div><div><p className={s.label}>ROLL 001 / SIDE A</p><h2>{t.empty}</h2><p>{t.emptyText}</p><a href="#leave-a-memory">{t.share} ↗</a></div></div>:<div className={s.photos}>{photos.map((photo,i)=><button key={photo.id} className={s.photo} onClick={event=>{trigger.current=event.currentTarget;setSelected(photo.id);}} aria-label={`${t.open}: ${photo.caption[language]}`} data-gallery-photo={photo.id}><div className={s.photoImage}><Image src={photo.image.src} alt={photo.image.alt[language]} fill unoptimized={photo.image.src.startsWith('/api/media/')} sizes="(max-width: 600px) 90vw, (max-width: 900px) 45vw, 30vw"/></div><div className={s.photoCaption}><span>{photo.caption[language]}</span><small>{photo.album} / {String(i+1).padStart(2,'0')}</small></div></button>)}</div>}</section>
 <RoomMusic language={language} spotifyUrl={gallery.musicUrl}/><PhotoSubmission language={language}/><Link className={s.back} href="/">← {t.back}</Link>
 <dialog ref={dialog} className={s.lightbox} aria-label={photo?.caption[language]??t.open} onCancel={close} onClick={event=>{if(event.target===event.currentTarget)close();}} onKeyDown={event=>{if(event.key==='ArrowRight'){event.preventDefault();move(1);}if(event.key==='ArrowLeft'){event.preventDefault();move(-1);}}}><div className={s.lightboxTop}><span>{index+1} / {photos.length}</span><button aria-label={t.close} onClick={close}>×</button></div>{photo&&<><div className={s.lightboxImage}><Image src={photo.image.src} alt={photo.image.alt[language]} fill unoptimized sizes="90vw"/></div><div className={s.lightboxFoot}><div><p>{photo.caption[language]}</p><small>{photo.album}{photo.credit?` · ${t.credit} ${photo.credit}`:''}</small></div><div><button aria-label={t.previous} onClick={()=>move(-1)} disabled={photos.length<2}>←</button><button aria-label={t.next} onClick={()=>move(1)} disabled={photos.length<2}>→</button></div></div></>}</dialog>
 </main>;
}
