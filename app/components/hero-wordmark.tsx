'use client';

import { useEffect, useRef, useState } from 'react';
import type { Language } from './home-copy';
import { useReducedMotion } from './motion-preference';
import s from './hero-wordmark.module.css';

export default function HeroWordmark({ word, language }: { word: string; language: Language }) {
  const root = useRef<HTMLSpanElement>(null);
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const reduced = useReducedMotion();
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

  useEffect(() => {
    if (!running || reduced) return;
    const timer = window.setInterval(() => setStep(value => value + 1), 5000);
    return () => window.clearInterval(timer);
  }, [running, reduced]);
  const current = reduced ? 0 : step % words.length;

  return <span className={s.wordmark} ref={root} data-running={running}>
    <span className={s.accessible}>{word}</span>
    <span className={s.words} aria-hidden="true">
      {words.map((text, index) => <span key={index} className={s.spacer}>{text}</span>)}
      {!reduced && step > 0 && <span key={`out-${step}`} className={s.outgoing}>{words[(step - 1) % words.length]}</span>}
      <span key={`in-${reduced ? 0 : step}`} className={s.current} data-changed={!reduced && step > 0} data-tone={current}>{words[current]}</span>
    </span>
  </span>;
}
