import type { Language } from './language';

export const languageCookie = 'nc-latin-club-language';
export const languages: Language[] = ['en', 'es'];

export function isLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'es';
}

export function pathLanguage(pathname: string): Language | null {
  const segment = pathname.split('/')[1];
  return isLanguage(segment) ? segment : null;
}

export function withoutLanguage(pathname: string): string {
  return pathLanguage(pathname)
    ? pathname.replace(/^\/(en|es)(?=\/|$)/, '') || '/'
    : pathname;
}

export function localizedPath(path: string, language: Language): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  const unprefixed = path.replace(/^\/(en|es)(?=\/|\?|#|$)/, '');
  return `/${language}${unprefixed === '/' ? '' : unprefixed.startsWith('/#') || unprefixed.startsWith('/?') ? unprefixed.slice(1) : unprefixed}`;
}

export function browserLanguage(header: string | null): Language {
  const preferences = (header ?? '').split(',').map((entry) => {
    const [tag, ...options] = entry.trim().toLowerCase().split(';');
    const quality = options.find((option) => option.trim().startsWith('q='));
    return {
      language: tag.split('-')[0],
      quality: quality ? Number(quality.trim().slice(2)) : 1,
    };
  });
  preferences.sort((a, b) => b.quality - a.quality);
  return (
    (preferences.find(
      (entry) => isLanguage(entry.language) && entry.quality > 0 && entry.quality <= 1,
    )?.language as Language) ?? 'en'
  );
}
