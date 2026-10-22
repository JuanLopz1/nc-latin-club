'use client';
import UiIcon from '../ui-icon';
import Link from 'next/link';
import {useSiteLanguage} from '../site-context';
import {galleryCopy} from './gallery-copy';
import {Cassette} from './room-music';
import Arrow from './arrow';
import s from './gallery.module.css';
export default function GalleryTeaser(){const {language}=useSiteLanguage(),t=galleryCopy[language];return <section className={s.teaser} id="fototeca" aria-labelledby="phototeca-teaser-title"><div><p className={s.label}>FOTOTECA / GOOD TIMES ON REWIND</p><h2 id="phototeca-teaser-title">{t.teaser}</h2><p>{t.invite}</p><Link className={s.primary} href="/fototeca">{t.browse}<Arrow/></Link></div><Link href="/fototeca" className={s.teaserArt} aria-label={t.browse}><div className={s.gridFloor} aria-hidden="true"/><span className={s.teaserWord} aria-hidden="true">REWIND<br/><em>THE GOOD TIMES.</em></span><Cassette/><span className={s.teaserSticker} aria-hidden="true">FAMILIA<br/>VOL. 01 <UiIcon name="external" /></span></Link></section>;}
