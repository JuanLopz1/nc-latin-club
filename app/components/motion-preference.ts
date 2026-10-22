'use client';
import { useSyncExternalStore } from 'react';
export type MotionPreference = 'full' | 'reduce';
export const motionStorageKey = 'nc-latin-club-motion';
const changeEvent = 'nc-latin-club-motion-change';
let fallback: MotionPreference = 'full';
let sessionOnly = false;
export function readMotionPreference(): MotionPreference {
  if (sessionOnly) return fallback;
  try {
    const value = localStorage.getItem(motionStorageKey);
    return value === 'reduce' ? 'reduce' : 'full';
  } catch {
    return fallback;
  }
}
export function getReducedMotion(): boolean {
  return readMotionPreference() === 'reduce';
}
export function syncMotionDocument() {
  document.documentElement.dataset.motion = readMotionPreference();
}
export function persistMotionPreference(preference: MotionPreference) {
  fallback = preference;
  try {
    localStorage.setItem(motionStorageKey, preference);
    sessionOnly = false;
  } catch {
    sessionOnly = true; /* Session preference when storage is unavailable. */
  }
  syncMotionDocument();
  window.dispatchEvent(new Event(changeEvent));
}
export function subscribeMotion(callback: () => void) {
  const changed = () => {
    syncMotionDocument();
    callback();
  };
  const storage = (event: StorageEvent) => {
    if (event.key === motionStorageKey || event.key === null) changed();
  };
  window.addEventListener(changeEvent, changed);
  window.addEventListener('storage', storage);
  return () => {
    window.removeEventListener(changeEvent, changed);
    window.removeEventListener('storage', storage);
  };
}
const serverSnapshot = () => false;
export function useReducedMotion() {
  return useSyncExternalStore(subscribeMotion, getReducedMotion, serverSnapshot);
}
