'use client';
import { useMemo, useSyncExternalStore } from 'react';
const subscribe = (callback: () => void) => { const timer = setInterval(callback, 1000); return () => clearInterval(timer); };
const snapshot = () => Math.floor(Date.now() / 60000) * 60000;
const serverSnapshot = () => null;
export function useAgendaClock(): Date | null {
  const value = useSyncExternalStore<number | null>(subscribe, snapshot, serverSnapshot);
  return useMemo(() => value === null ? null : new Date(value), [value]);
}
