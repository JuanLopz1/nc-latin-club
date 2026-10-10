"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { copy, countries } from "./home-copy";
import { clubLinks, joinEmailHref } from "./club-links";
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

function RootsMap() {
  return <svg viewBox="0 0 400 440" fill="none" className={s.mapDrawing} aria-hidden="true">
    <g stroke="#76dbe3" strokeWidth="1.5" strokeLinejoin="round">
      <path d="m69 52 29 7 36-11 19 9-8 28 25 16 11 23 22 8 4 21-21 5-21-16-18-6-18-26-29-11-14-18Z" fill="#273858" />
      <path d="m201 149 15 3 8 17 15 4 7 16-11 4-14-12-8-15-12-2Z" fill="#273858" />
      <path d="m230 183 30-5 28 17 40 10 24 34-2 31-25 24-14 37-27 30-16 46-17 17-13-10-8-53-21-38-18-43-15-26 7-29 20-21Z" fill="#273858" />
      <path d="m222 216 13 27-3 29 14 28 4 45 16 37M265 203l-4 37 33 11 29 1M97 76l22 12 21 21" opacity=".4" />
      <path d="M58 160C-15 250 58 385 185 383M308 100c58 17 80 50 71 94" strokeDasharray="4 8" opacity=".5" />
    </g>
    <g fill="#ffe06a"><path d="m325 97 3 9 9 3-9 3-3 9-3-9-9-3 9-3ZM58 301l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" /><circle cx="340" cy="151" r="3" /><circle cx="92" cy="342" r="3" /></g>
  </svg>;
}

export default function ClubHome() {
  const { language } = useSiteLanguage();
  const [countryId, setCountryId] = useState<string>(countries[0].id);
  const countryDialog = useRef<HTMLDialogElement>(null);
  const t = copy[language];
  const country = countries.find(item => item.id === countryId) ?? countries[0];

  const openCountry = (id: string) => {
    setCountryId(id);
    countryDialog.current?.showModal();
  };
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

      <section id="roots" className={s.roots} aria-labelledby="roots-title">
        <div className={s.rootsInner}>
          <div className={s.rootsIntro}><p className={s.eyebrow}>{t.rootsLabel}</p><h2 id="roots-title">{t.rootsTitle[0]}<br /><em>{t.rootsTitle[1]}</em></h2><p>{t.rootsBody}</p><Signal /></div>
          <div className={s.discovery}>
            <div className={s.map}><RootsMap />{countries.map(item => <button key={item.id} className={`${s.mapPin} ${countryId === item.id ? s.mapPinActive : ""}`} style={{ left: `${item.x}%`, top: `${item.y}%` }} aria-label={item.name[language]} aria-pressed={countryId === item.id} aria-haspopup="dialog" onClick={() => openCountry(item.id)}><span /></button>)}<span className={s.mapNote}>{t.rootsNote}</span></div>
            <div className={s.countryPanel}><p className={s.countryChoose}>{t.choose}</p><div className={s.countryButtons}>{countries.map(item => <button key={item.id} aria-pressed={countryId === item.id} aria-haspopup="dialog" onClick={() => openCountry(item.id)}>{item.name[language]}</button>)}</div><div className={s.countryContent} aria-live="polite" aria-atomic="true"><p className={s.countryKicker}>{t.countryKicker}</p><h3 style={{ color: country.color }}>{country.display}<span aria-hidden="true">✧</span></h3><p>{t.countryBody}</p><ul>{t.countryTopics.map((topic, index) => <li key={topic}><span aria-hidden="true">{["◒", "♫", "✺"][index]}</span>{topic}</li>)}</ul></div><p className={s.countryFoot}>{t.countryFoot}</p></div>
          </div>
        </div>
      </section>

      <dialog ref={countryDialog} className={s.countryDialog} aria-labelledby="country-dialog-title" aria-describedby="country-dialog-description">
        <button type="button" className={s.dialogClose} onClick={() => countryDialog.current?.close()} aria-label={language === "en" ? "Close country details" : "Cerrar información del país"}>×</button>
        <Signal className={s.dialogSignal} />
        <p className={s.eyebrow}>{t.rootsLabel}</p>
        <h2 id="country-dialog-title">{country.display}</h2>
        <p id="country-dialog-description">{t.countryBody}</p>
        <ul>{t.countryTopics.map(topic => <li key={topic}>{topic}</li>)}</ul>
        <p className={s.dialogNote}>{t.countryFoot}</p>
      </dialog>

      <NiagaraTeaser language={language} />

      <section id="join" className={s.join} aria-labelledby="join-title"><Pulse className={s.joinPulseLeft} /><Pulse className={s.joinPulseRight} /><Signal className={s.joinSignal} /><p className={s.eyebrow}>{t.joinLabel}</p><h2 id="join-title">{t.joinTitle[0]}<br /><em>{t.joinTitle[1]}</em></h2><p className={s.joinBody}>{t.joinBody}</p><div className={s.joinActions}><a href={joinEmailHref} className={s.button} title={t.emailHint}>{t.joinAction}<Arrow /></a>{instagramAction}</div><p className={s.joinNote}>{t.joinNote}</p></section>
    </main>


  </div>;
}
