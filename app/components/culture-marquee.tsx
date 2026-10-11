'use client';
import { useState } from 'react';
import type { Language } from './home-copy';
import { copy } from './home-copy';
import s from './club-home.module.css';

export default function CultureMarquee({ language }: { language: Language }) {
  const [paused, setPaused] = useState(false);
  const label = language === 'en' ? paused ? 'Play culture strip' : 'Pause culture strip' : paused ? 'Animar franja cultural' : 'Pausar franja cultural';
  return <div className={s.ribbon} data-marquee data-paused={paused}>
    <div className={s.ribbonTrack} aria-hidden="true">
      {[0, 1].map(group => <div key={group} className={s.ribbonGroup} data-marquee-group>
        {[0, 1].flatMap(repeat => copy[language].ribbon.map(word => <span key={`${repeat}-${word}`}>{word}<svg viewBox="0 0 64 64" fill="currentColor"><path d="m32 2 7 19 19-7-15 18 15 18-19-7-7 19-7-19-19 7 15-18L6 14l19 7Z" /></svg></span>))}
      </div>)}
    </div>
    <button type="button" className={s.ribbonPause} aria-label={label} title={label} aria-pressed={paused} onClick={() => setPaused(!paused)}>
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{paused ? <path d="m8 5 11 7-11 7Z" /> : <path d="M6 5h4v14H6zm8 0h4v14h-4z" />}</svg>
    </button>
  </div>;
}
