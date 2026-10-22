'use client';
import { eventCountdownMessages } from '../../translations/interface-translations';
import type { Language } from '../../translations/language';
import type { EventEntry } from './event-types';
import { useAgendaClock } from './agenda-clock';
import { eventCountdownState } from './event-countdown-state';
import styles from './event-tools.module.css';
export default function EventCountdown({
  entry,
  language,
}: {
  entry: EventEntry;
  language: Language;
}) {
  const now = useAgendaClock();
  if (entry.id !== 'latin-fiesta-2026' || entry.status === 'cancelled') return null;
  if (!now)
    return (
      <p className={styles.countdown} role="status">
        {eventCountdownMessages[language].loadingTheCountdown}
      </p>
    );
  const countdown = eventCountdownState(entry, now);
  if (!countdown) return null;
  if (countdown.phase !== 'upcoming')
    return (
      <p className={styles.countdown} role="status">
        {countdown.phase === 'ended'
          ? eventCountdownMessages[language].thisEventHasEnded
          : eventCountdownMessages[language].theFiestaHasStarted}
      </p>
    );
  const seconds = countdown.remainingSeconds;
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return (
    <p className={styles.countdown} role="timer" aria-live="off">
      <span>{eventCountdownMessages[language].theFiestaStartsIn}</span>
      <strong>
        {days} {eventCountdownMessages[language].days} · {hours} h · {minutes} min ·{' '}
        {seconds % 60} s
      </strong>
    </p>
  );
}
