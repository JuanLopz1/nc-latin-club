'use client';
import { useSyncExternalStore } from 'react';
const query = '(prefers-reduced-motion: reduce)';
export type MotionPreference = 'system' | 'full' | 'reduce';
export const motionStorageKey = 'nc-latin-club-motion';
const changeEvent = 'nc-latin-club-motion-change';
let fallback: MotionPreference = 'system';
let sessionOnly = false;
export function readMotionPreference(): MotionPreference {
  if (sessionOnly) return fallback;
  try {
    const value = localStorage.getItem(motionStorageKey);
    return value === 'full' || value === 'reduce' ? value : 'system';
  } catch { return fallback; }
}
export function getReducedMotion(): boolean {
  const preference = readMotionPreference();
  return preference === 'reduce' || preference === 'system' && typeof matchMedia !== 'undefined' && matchMedia(query).matches;
}
export function syncMotionDocument() {
  document.documentElement.dataset.motion = readMotionPreference();
}
export function persistMotionPreference(preference: MotionPreference) {
  fallback = preference;
  try { localStorage.setItem(motionStorageKey, preference); sessionOnly = false; }
  catch { sessionOnly = true; /* Session preference when storage is unavailable. */ }
  syncMotionDocument();
  window.dispatchEvent(new Event(changeEvent));
}
export function subscribeMotion(callback: () => void) {
  const media = matchMedia(query);
  const changed = () => { syncMotionDocument(); callback(); };
  const storage = (event: StorageEvent) => { if (event.key === motionStorageKey || event.key === null) changed(); };
  media.addEventListener('change', changed); window.addEventListener(changeEvent, changed); window.addEventListener('storage', storage);
  return () => { media.removeEventListener('change', changed); window.removeEventListener(changeEvent, changed); window.removeEventListener('storage', storage); };
}
const serverSnapshot = () => false;
const serverPreference = (): MotionPreference => 'system';
export function useReducedMotion() { return useSyncExternalStore(subscribeMotion, getReducedMotion, serverSnapshot); }
export function useMotionPreference() { return useSyncExternalStore(subscribeMotion, readMotionPreference, serverPreference); }
