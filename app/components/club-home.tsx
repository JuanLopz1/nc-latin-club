"use client";

import Image from "next/image";
import { copy } from "./home-copy";
import { clubLinks, joinEmailHref } from "./club-links";
import RootsTeaser from "./explore/roots-teaser";
import NiagaraTeaser from "./niagara/niagara-teaser";
import EventsSection from "./events-section";
import { useSiteLanguage } from "./site-context";
import s from "./club-home.module.css";

function Signal({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <path d="m32 2 7 19 19-7-15 18 15 18-19-7-7 19-7-19-19 7 15-18L6 14l19 7Z" fill="currentColor" />
    <circle cx="32" cy="32" r="6" fill="var(--background)" />
  </svg>;
}

function Arrow({ down = false }: { down?: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" style={down ? { transform: "rotate(90deg)" } : undefined}><path d="M4 12h15m-6-6 6 6-6 6" /></svg>;
}

function Pulse({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 240 320" fill="none" stroke="currentColor" strokeWidth="12" aria-hidden="true"><path d="M20 135v50m40-95v140m40-200v260m40-225v190m40-150v110m40-75v40" /></svg>;
}

export default function ClubHome() {
  const { language } = useSiteLanguage();
  const t = copy[language];
  const instagramAction = clubLinks.instagramUrl
    ? <a href={clubLinks.instagramUrl} className={s.textLink} target="_blank" rel="noopener noreferrer">{t.heroSecondary}<Arrow /></a>
    : <span className={s.socialPending}><span>{t.heroSecondary}</span><small>{t.instagramPending}</small></span>;

  return <div className={s.home}>
    <main id="main-content" tabIndex={-1}>
      <section className={s.hero} aria-labelledby="hero-title">
        <div className={s.heroCopy}>
          <p className={s.eyebrow}><span className={s.eyebrowDot} />{t.heroLabel}</p>
          <h1 id="hero-title">{t.heroTitle[0]}{" "}<br /><em>{t.heroTitle[1]}</em><Signal className={s.titleSignal} /></h1>
          <p className={s.heroBody}>{t.heroText}</p>
          <div className={s.heroActions}><a href={joinEmailHref} className={s.button} title={t.emailHint}>{t.heroAction}<Arrow /></a>{instagramAction}</div>
          <div className={s.heroFoot}><Signal className={s.smallSignal} />{t.location}</div>
        </div>
        <div className={s.heroArt}>
          <div className={s.artFrame}><Image src="/images/latin-night-festival.png" alt={language === "en" ? "Original illustration of an imagined Latin American street festival at night, with music, murals, colourful lights and glowing hummingbirds" : "Ilustración original de un festival callejero latinoamericano imaginado de noche, con música, murales, luces de colores y colibríes luminosos"} fill preload sizes="(max-width: 760px) 100vw, 55vw" className={s.worldImage} /></div>
          <div className={s.worldStamp}><Signal /><span>{t.heroTag[0]}<br /><i>{t.heroTag[1]}</i></span></div>
          <span className={s.artCaption}>{t.imageNote}<Arrow /></span>
          <svg className={s.heroSparkle} viewBox="0 0 60 60" fill="none" aria-hidden="true"><path d="M30 0c0 21 9 30 30 30-21 0-30 9-30 30 0-21-9-30-30-30C21 30 30 21 30 0Z" fill="currentColor" /></svg>
        </div>
      </section>
      <a href="#familia" className={s.scrollLink}>{t.scroll}<Arrow down /></a>
      <div className={s.ribbon} aria-hidden="true">{t.ribbon.map(word => <span key={word}>{word}<Signal /></span>)}</div>

      <section id="familia" className={`${s.section} ${s.familia}`} aria-labelledby="familia-title">
        <div className={s.familiaCopy}><p className={s.eyebrow}>{t.familiaLabel}</p><h2 id="familia-title">{t.familiaTitle[0]}<br /><em>{t.familiaTitle[1]}</em></h2><p className={s.lead}>{t.familiaBody}</p><p className={s.bodyCopy}>{t.familiaSecond}</p><div className={s.values}>{t.values.map((value, index) => <span key={value}><span aria-hidden="true">{["✧", "♫", "♡"][index]}</span>{value}</span>)}</div></div>
        <div className={s.familiaArt}><Pulse className={s.familiaPulse} /><span className={s.familiaArtLabel}>BIENVENIDOS</span><Signal className={s.familiaSignal} /><p>{t.familiaQuote[0]}<br /><em>{t.familiaQuote[1]}</em></p><span className={s.familiaArtFoot}>{t.familiaNote}</span><span className={s.familiaPosterLines} aria-hidden="true" /></div>
      </section>

      <EventsSection language={language} />

      <RootsTeaser language={language} />

      <NiagaraTeaser language={language} />

      <section id="join" className={s.join} aria-labelledby="join-title"><Pulse className={s.joinPulseLeft} /><Pulse className={s.joinPulseRight} /><Signal className={s.joinSignal} /><p className={s.eyebrow}>{t.joinLabel}</p><h2 id="join-title">{t.joinTitle[0]}<br /><em>{t.joinTitle[1]}</em></h2><p className={s.joinBody}>{t.joinBody}</p><div className={s.joinActions}><a href={joinEmailHref} className={s.button} title={t.emailHint}>{t.joinAction}<Arrow /></a>{instagramAction}</div><p className={s.joinNote}>{t.joinNote}</p></section>
    </main>


  </div>;
}
