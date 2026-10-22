'use client';

import { useEffect, useRef, useState } from 'react';
import type { Language } from './home-copy';
import s from './hero-wordmark.module.css';

export default function HeroWordmark({ word, language }: { word: string; language: Language }) {
  const root = useRef<HTMLSpanElement>(null);
  const [running, setRunning] = useState(false);
  const words = language === 'es' ? [word, 'FAMILIA', 'CULTURA', 'RITMO'] : [word, 'FAMILIA', 'CULTURE', 'RHYTHM'];

  useEffect(() => {
    const element = root.current;
    if (!element || !('IntersectionObserver' in window)) return;
    let visible = false;
    const sync = () => setRunning(visible && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(element);
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  return <span className={s.wordmark} ref={root} data-running={running}>
    <span className={s.accessible}>{word}</span>
    <span className={s.words} aria-hidden="true">
      {words.map((text, index) => <span key={index} className={s.word}>{text}</span>)}
    </span>
  </span>;
}
