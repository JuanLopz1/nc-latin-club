'use client';
import type { Language } from './home-copy';
import { persistMotionPreference, useReducedMotion } from './motion-preference';
import s from './site-shell.module.css';

export default function MotionControl({ language }: { language: Language }) {
  const reduced = useReducedMotion();
  const title = language === 'en' ? 'Animations' : 'Animaciones';
  return <button type="button" className={s.motionToggle} role="switch" aria-checked={!reduced} data-motion-toggle onClick={() => persistMotionPreference(reduced ? 'full' : 'reduce')}>
    <span>{title}</span><span className={s.motionSwitch} aria-hidden="true"><i /></span><span>{language === 'en' ? reduced ? 'Off' : 'On' : reduced ? 'Desactivadas' : 'Activadas'}</span>
  </button>;
}
