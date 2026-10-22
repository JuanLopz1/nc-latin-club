'use client';
import { motionControlMessages } from '../translations/interface-translations';
import type { Language } from '../translations/language';
import { persistMotionPreference, useReducedMotion } from './motion-preference';
import styles from './site-shell.module.css';

export default function MotionControl({ language }: { language: Language }) {
  const reduced = useReducedMotion();
  const title = motionControlMessages[language].animations;
  return (
    <button
      type="button"
      className={styles.motionToggle}
      role="switch"
      aria-checked={!reduced}
      data-motion-toggle
      onClick={() => persistMotionPreference(reduced ? 'full' : 'reduce')}
    >
      <span>{title}</span>
      <span className={styles.motionSwitch} aria-hidden="true">
        <i />
      </span>
      <span>
        {language === 'en'
          ? reduced
            ? 'Off'
            : 'On'
          : reduced
            ? 'Desactivadas'
            : 'Activadas'}
      </span>
    </button>
  );
}
