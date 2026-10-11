'use client';
import { useEffect, useRef, useState } from 'react';
import type { Language } from './home-copy';
import { persistMotionPreference, useMotionPreference, useReducedMotion, type MotionPreference } from './motion-preference';
import s from './site-shell.module.css';

const copy = {
  en: { title: 'Animations', reduced: 'Animations reduced', full: 'Animations enabled', device: 'Your device requests reduced motion. You can choose to enable animations here.', following: 'Following your device preference.', notice: 'Animations are reduced to match your preference.', enable: 'Enable animations', options: { system: 'Follow my device', full: 'Enabled', reduce: 'Reduced' } },
  es: { title: 'Animaciones', reduced: 'Animaciones reducidas', full: 'Animaciones activadas', device: 'Tu dispositivo solicita movimiento reducido. Puedes elegir activar las animaciones aquí.', following: 'Siguiendo la preferencia de tu dispositivo.', notice: 'Las animaciones están reducidas según tu preferencia.', enable: 'Activar animaciones', options: { system: 'Según mi dispositivo', full: 'Activadas', reduce: 'Reducidas' } },
};
export default function MotionControl({ language }: { language: Language }) {
  const preference = useMotionPreference(), reduced = useReducedMotion(), t = copy[language];
  const [open, setOpen] = useState(false), root = useRef<HTMLDivElement>(null), trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); } };
    const outside = (event: PointerEvent) => { if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false); };
    window.addEventListener('keydown', escape); window.addEventListener('pointerdown', outside);
    return () => { window.removeEventListener('keydown', escape); window.removeEventListener('pointerdown', outside); };
  }, [open]);
  return <div ref={root} className={s.motionSettings}>
    <button ref={trigger} type="button" className={s.motionTrigger} data-motion-trigger data-reduced={reduced} aria-expanded={open} aria-controls={open ? 'motion-panel' : undefined} aria-label={`${t.title}: ${reduced ? t.reduced : t.full}`} title={`${t.title}: ${reduced ? t.reduced : t.full}`} onClick={() => setOpen(!open)}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9" />{reduced ? <path d="m10 8 6 4-6 4Z" /> : <path d="M9 8v8m6-8v8" />}</svg>
    </button>
    {open && <div id="motion-panel" className={s.motionPanel} data-motion-panel role="region" aria-labelledby="motion-title">
      <h2 id="motion-title">{t.title}</h2><p>{preference === 'system' ? reduced ? t.device : t.following : reduced ? t.reduced : t.full}</p>
      <fieldset><legend className={s.srOnly}>{t.title}</legend>{(['system', 'full', 'reduce'] as MotionPreference[]).map(option => <label key={option}><input type="radio" name="site-motion" data-motion-choice={option} checked={preference === option} onChange={() => persistMotionPreference(option)} /><span>{t.options[option]}</span></label>)}</fieldset>
    </div>}
  </div>;
}
export function HomeMotionNotice({ language }: { language: Language }) {
  const reduced = useReducedMotion(), t = copy[language];
  if (!reduced) return null;
  return <div className={s.motionNotice} role="status"><span>{t.notice}</span><button type="button" onClick={() => persistMotionPreference('full')}>{t.enable}<span aria-hidden="true"> →</span></button></div>;
}
