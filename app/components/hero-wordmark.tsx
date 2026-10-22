'use client';

import { useEffect, useRef, useState } from 'react';
import type { Language } from '../translations/language';
import { useReducedMotion } from './motion-preference';
import styles from './hero-wordmark.module.css';
import { heroWordmarkTranslations } from '../translations/hero-wordmark-translations';

export default function HeroWordmark({
  word,
  language,
}: {
  word: string;
  language: Language;
}) {
  const root = useRef<HTMLSpanElement>(null);
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const reduced = useReducedMotion();
  const words = [word, ...heroWordmarkTranslations[language].words];

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
    const timer = window.setInterval(() => setStep((value) => value + 1), 5000);
    return () => window.clearInterval(timer);
  }, [running, reduced]);
  const current = reduced ? 0 : step % words.length;

  return (
    <span className={styles.wordmark} ref={root} data-running={running}>
      <span className={styles.accessible}>{word}</span>
      <span className={styles.words} aria-hidden="true">
        {words.map((text, index) => (
          <span key={index} className={styles.spacer}>
            {text}
          </span>
        ))}
        {!reduced && step > 0 && (
          <span key={`out-${step}`} className={styles.outgoing}>
            {words[(step - 1) % words.length]}
          </span>
        )}
        <span
          key={`in-${reduced ? 0 : step}`}
          className={styles.current}
          data-changed={!reduced && step > 0}
          data-tone={current}
        >
          {words[current]}
        </span>
      </span>
    </span>
  );
}
