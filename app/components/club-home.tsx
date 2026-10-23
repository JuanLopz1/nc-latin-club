'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useHomeMotion } from './use-home-motion';
import CultureMarquee from './culture-marquee';
import FamiliaSection from './familia-section';
import InstagramSection from './instagram-section';
import { useContent, emailHref } from './content-context';
import GalleryTeaser from './gallery/gallery-teaser';
import SpotifySection from './spotify-section';
import RootsTeaser from './explore/roots-teaser';
import NiagaraTeaser from './niagara/niagara-teaser';
import EventsSection from './events-section';
import HeroWordmark from './hero-wordmark';
import { useSiteLanguage } from './site-context';
import { waterfallPalettes } from './waterfall-palettes';
import styles from './club-home.module.css';

const initialPaletteIndex = waterfallPalettes.findIndex(({ slug }) => slug === 'mexico');

function WaterfallLights() {
  const [paletteIndex, setPaletteIndex] = useState(Math.max(0, initialPaletteIndex));
  const palette = waterfallPalettes[paletteIndex];

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || document.documentElement.dataset.motion === 'reduce') return;

    const interval = window.setInterval(() => {
      setPaletteIndex((current) => (current + 1) % waterfallPalettes.length);
    }, 4800);

    return () => window.clearInterval(interval);
  }, []);

  const paletteStyle = {
    '--falls-light-1': palette.colors[0],
    '--falls-light-2': palette.colors[1],
    '--falls-light-3': palette.colors[2],
    '--falls-light-4': palette.colors[3],
  } as CSSProperties;

  return (
    <span
      className={styles.fallsEffect}
      style={paletteStyle}
      data-light-country={palette.slug}
      aria-hidden="true"
    >
      <span className={styles.fallsLights} />
      <span className={styles.fallsMist} />
      <span className={styles.fallsMistSecondary} />
    </span>
  );
}

function Signal({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path
        d="m32 2 7 19 19-7-15 18 15 18-19-7-7 19-7-19-19 7 15-18L6 14l19 7Z"
        fill="currentColor"
      />
      <circle cx="32" cy="32" r="6" fill="var(--background)" />
    </svg>
  );
}

function Arrow({ down = false }: { down?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      style={down ? { transform: 'rotate(90deg)' } : undefined}
    >
      <path d="M4 12h15m-6-6 6 6-6 6" />
    </svg>
  );
}

function Pulse({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 240 320"
      fill="none"
      stroke="currentColor"
      strokeWidth="12"
      aria-hidden="true"
    >
      <path d="M20 135v50m40-95v140m40-200v260m40-225v190m40-150v110m40-75v40" />
    </svg>
  );
}

export default function ClubHome() {
  const root = useRef<HTMLDivElement>(null);
  useHomeMotion(root);
  const { language } = useSiteLanguage();
  const { home: homeTranslations, settings: clubLinks } = useContent();
  const joinEmailHref = emailHref(clubLinks.joinEmail);
  const translations = homeTranslations[language];
  const instagramAction = clubLinks.instagramUrl ? (
    <a
      href={clubLinks.instagramUrl}
      className={styles.textLink}
      target="_blank"
      rel="noopener noreferrer"
    >
      {translations.heroSecondary}
      <Arrow />
    </a>
  ) : (
    <span className={styles.socialPending}>
      <span>{translations.heroSecondary}</span>
      <small>{translations.instagramPending}</small>
    </span>
  );

  return (
    <div className={styles.home} ref={root}>
      <main id="main-content" tabIndex={-1}>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroContent}>
            <h1 id="hero-title">
              {translations.heroTitle[0]} <br />
              <em>
                <HeroWordmark word={translations.heroTitle[1]} language={language} />
              </em>
            </h1>
            <p className={styles.heroBody}>{translations.heroText}</p>
            <div className={styles.heroActions} data-reveal>
              <a
                href={joinEmailHref}
                className={styles.button}
                title={translations.emailHint}
              >
                {translations.heroAction}
                <Arrow />
              </a>
              {instagramAction}
            </div>
            <div className={styles.heroFoot} data-reveal>
              <Signal className={styles.smallSignal} />
              {translations.location}
            </div>
          </div>
          <div className={styles.heroArt} data-reveal data-hero-art>
            <div className={styles.artFrame} data-hero-parallax>
              <Image
                src={clubLinks.heroSrc}
                unoptimized={clubLinks.heroSrc.startsWith('/api/media/')}
                alt={clubLinks.heroAlt[language]}
                fill
                preload
                sizes="(max-width: 760px) 100vw, 55vw"
                className={styles.worldImage}
              />
              {clubLinks.heroSrc === '/images/Banner-natural.png' && (
                <>
                  <WaterfallLights />
                  <Image
                    src="/images/Banner-foreground.png"
                    alt=""
                    fill
                    sizes="(max-width: 760px) 100vw, 55vw"
                    className={styles.worldForeground}
                    aria-hidden="true"
                  />
                </>
              )}
              <div className={styles.artCaption}>
                <p className={styles.artSlogan}>
                  {translations.heroTag[0]}
                  <br />
                  <em>{translations.heroTag[1]}</em>
                </p>
                <p className={styles.artImageNote}>{translations.imageNote}</p>
              </div>
            </div>
          </div>
        </section>
        <CultureMarquee language={language} />

        <FamiliaSection language={language} />

        <EventsSection language={language} />

        <RootsTeaser language={language} />

        <NiagaraTeaser language={language} />

        <section id="join" className={styles.join} aria-labelledby="join-title">
          <Pulse className={styles.joinPulseLeft} />
          <Pulse className={styles.joinPulseRight} />
          <Signal className={styles.joinSignal} />
          <p className={styles.eyebrow}>{translations.joinLabel}</p>
          <h2 id="join-title">
            {translations.joinTitle[0]}
            <br />
            <em>{translations.joinTitle[1]}</em>
          </h2>
          <p className={styles.joinBody}>{translations.joinBody}</p>
          <div className={styles.joinActions}>
            <a
              href={joinEmailHref}
              className={styles.button}
              title={translations.emailHint}
            >
              {translations.joinAction}
              <Arrow />
            </a>
            {instagramAction}
          </div>
          <p className={styles.joinNote}>{translations.joinNote}</p>
        </section>
        <InstagramSection language={language} />
        <GalleryTeaser />
        <SpotifySection language={language} />
      </main>
    </div>
  );
}
