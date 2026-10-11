'use client';
import type { Language } from '../home-copy';
import type { EventEntry } from './event-types';
import { useAgendaClock } from './agenda-clock';
import { eventCountdownState } from './event-countdown-state';
import s from './event-tools.module.css';
export default function EventCountdown({ entry, language }: { entry: EventEntry; language: Language }) {
  const now = useAgendaClock();
  if (entry.id !== 'latin-fiesta-2026' || entry.status === 'cancelled') return null;
  if (!now) return <p className={s.countdown} role="status">{language === 'en' ? 'Loading the countdown…' : 'Cargando la cuenta regresiva…'}</p>;
  const countdown = eventCountdownState(entry, now);
  if (!countdown) return null;
  if (countdown.phase !== 'upcoming') return <p className={s.countdown} role="status">{countdown.phase === 'ended' ? language === 'en' ? 'This event has ended.' : 'Este evento ha terminado.' : language === 'en' ? 'The fiesta has started!' : '¡La fiesta ha comenzado!'}</p>;
  const seconds = countdown.remainingSeconds, days = Math.floor(seconds / 86400), hours = Math.floor(seconds % 86400 / 3600), minutes = Math.floor(seconds % 3600 / 60);
  return <p className={s.countdown} role="timer" aria-live="off"><span>{language === 'en' ? 'The fiesta starts in' : 'La fiesta comienza en'}</span><strong>{days} {language === 'en' ? 'days' : 'días'} · {hours} h · {minutes} min · {seconds % 60} s</strong></p>;
}
