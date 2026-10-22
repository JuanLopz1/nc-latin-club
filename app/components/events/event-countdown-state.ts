import type { EventEntry } from './event-types';
export type CountdownState = {
  phase: 'upcoming' | 'started' | 'ended';
  remainingSeconds: number;
};
export function eventCountdownState(entry: EventEntry, now: Date): CountdownState | null {
  if (entry.status === 'cancelled' || !entry.startsAt) return null;
  const remaining = Date.parse(entry.startsAt) - now.getTime();
  if (remaining > 0)
    return { phase: 'upcoming', remainingSeconds: Math.ceil(remaining / 1000) };
  return {
    phase:
      entry.endsAt && Date.parse(entry.endsAt) <= now.getTime() ? 'ended' : 'started',
    remainingSeconds: 0,
  };
}
