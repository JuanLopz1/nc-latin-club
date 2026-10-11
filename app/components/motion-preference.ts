'use client';
import { useSyncExternalStore } from 'react';
const query = '(prefers-reduced-motion: reduce)';
const subscribe = (callback: () => void) => { const media = matchMedia(query); media.addEventListener('change', callback); return () => media.removeEventListener('change', callback); };
const snapshot = () => matchMedia(query).matches;
const serverSnapshot = () => false;
export function useReducedMotion() { return useSyncExternalStore(subscribe, snapshot, serverSnapshot); }
