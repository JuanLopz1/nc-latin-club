'use client';

import { useSyncExternalStore } from 'react';

const motionQuery = '(prefers-reduced-motion: reduce)';

export function getReducedMotion(): boolean {
  return window.matchMedia(motionQuery).matches;
}

export function subscribeMotion(callback: () => void) {
  const mediaQuery = window.matchMedia(motionQuery);
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
}

export function useReducedMotion() {
  return useSyncExternalStore(subscribeMotion, getReducedMotion, () => false);
}
