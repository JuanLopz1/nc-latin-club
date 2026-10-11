import type { Language } from './home-copy';

export const languageStorageKey = 'nc-latin-club-language';
const languageEvent = 'nc-latin-club-language-change';
let fallback: Language = 'en';

export function readLanguage(): Language {
  try {
    const saved = localStorage.getItem(languageStorageKey);
    if (saved === 'en' || saved === 'es') return saved;
  } catch { /* A blocked storage area still permits changing this tab’s language. */ }
  return fallback;
}
export function serverLanguage(): Language { return 'en'; }
export function persistLanguage(language: Language): void {
  fallback = language;
  try { localStorage.setItem(languageStorageKey, language); } catch { /* Session fallback. */ }
  window.dispatchEvent(new Event(languageEvent));
}
export function subscribeLanguage(callback: () => void): () => void {
  const changed = (event: StorageEvent) => { if (event.key === languageStorageKey || event.key === null) callback(); };
  window.addEventListener(languageEvent, callback);
  window.addEventListener('storage', changed);
  return () => { window.removeEventListener(languageEvent, callback); window.removeEventListener('storage', changed); };
}
