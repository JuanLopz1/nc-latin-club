import { validateAgenda } from '../components/events/agenda-validation';
import { validDate } from '../components/events/agenda-dates';
import { countries } from '../components/explore/country-data';
import { homeTranslations } from '../translations/home-translations';
import { categoryLabels, modeLabels } from '../translations/niagara-translations';
import type { ContentKey, SiteContent } from './types';
export function invariant(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(message);
}
export function https(value: unknown) {
  try {
    if (typeof value !== 'string') return false;
    const url = new URL(value);
    return url.protocol === 'https:' && !!url.hostname && !url.username && !url.password;
  } catch {
    return false;
  }
}
export function imagePath(value: unknown) {
  return (
    typeof value === 'string' &&
    (/^\/images\/(?:[\w-]+\/)*[\w-]+\.(?:png|jpe?g|webp|avif|svg)$/.test(value) ||
      /^\/api\/media\/[0-9a-f-]{36}$/.test(value))
  );
}
function localized(value: unknown, label: string) {
  invariant(
    value &&
      typeof value === 'object' &&
      ['en', 'es'].every(
        (lang) =>
          typeof (value as Record<string, unknown>)[lang] === 'string' &&
          String((value as Record<string, unknown>)[lang]).trim(),
      ),
    `Both English and Spanish are required: ${label}`,
  );
}
function images(value: unknown) {
  if (value === undefined) return;
  invariant(
    Array.isArray(value) && value.length <= 30,
    'Use at most 30 images per record.',
  );
  for (const image of value) {
    invariant(
      imagePath(image.src) &&
        Number.isInteger(image.width) &&
        image.width > 0 &&
        Number.isInteger(image.height) &&
        image.height > 0,
      'Valid image path and dimensions required.',
    );
    localized(image.alt, 'image description');
    if (image.caption) localized(image.caption, 'image caption');
  }
}
function sameShape(template: unknown, value: unknown, label: string) {
  if (typeof template === 'string') {
    invariant(typeof value === 'string' && value.trim(), `Text required: ${label}`);
    return;
  }
  if (Array.isArray(template)) {
    invariant(
      Array.isArray(value) && value.length === template.length,
      `Keep ${template.length} items: ${label}`,
    );
    template.forEach((item, i) => sameShape(item, value[i], `${label}.${i}`));
    return;
  }
  invariant(
    value && typeof value === 'object' && !Array.isArray(value),
    `Invalid field: ${label}`,
  );
  const source = template as Record<string, unknown>;
  const target = { ...(value as Record<string, unknown>) };
  // Accept older homepage snapshots without restoring the retired welcome label.
  if (label === 'home.en' || label === 'home.es') delete target.heroLabel;
  invariant(
    Object.keys(target).length === Object.keys(source).length,
    `Unknown or missing fields: ${label}`,
  );
  for (const key of Object.keys(source))
    sameShape(source[key], target[key], `${label}.${key}`);
}
export function validateContent(key: ContentKey, input: unknown): void {
  invariant(
    JSON.stringify(input).length <= 1_500_000,
    'Collection exceeds the size limit.',
  );
  const value = input as SiteContent[typeof key];
  if (key === 'settings') {
    const s = value as SiteContent['settings'];
    invariant(
      /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(s.joinEmail),
      'A valid contact email is required.',
    );
    invariant(
      https(s.instagramUrl) &&
        /^(www\.)?instagram\.com$/.test(new URL(s.instagramUrl).hostname),
      'Use an Instagram HTTPS URL.',
    );
    invariant(
      imagePath(s.logoSrc) && imagePath(s.heroSrc),
      'Use a local or uploaded image.',
    );
    localized(s.heroAlt, 'hero alt text');
    localized(s.spotifyTitle, 'Spotify title');
    localized(s.spotifyDescription, 'Spotify description');
    for (const value of [
      s.roots?.label,
      s.roots?.text,
      s.roots?.action,
      s.niagara?.label,
      s.niagara?.title,
      s.niagara?.text,
      s.niagara?.action,
    ])
      localized(value, 'homepage invitation');
    invariant(
      Array.isArray(s.roots?.title) && s.roots.title.length === 2,
      'The roots title needs two lines.',
    );
    s.roots.title.forEach((value) => localized(value, 'roots title'));
    invariant(
      /^https:\/\/open\.spotify\.com\/(album|playlist|track)\/[A-Za-z0-9]{22}(?:\?[^#]*)?$/.test(
        s.spotifyUrl,
      ),
      'Use a Spotify album, playlist or track URL.',
    );
  } else if (key === 'gallery') {
    const g = value as SiteContent['gallery'];
    invariant(
      g && typeof g === 'object' && !Array.isArray(g),
      'A photo library is required.',
    );
    localized(g.title, 'gallery title');
    localized(g.description, 'gallery description');
    invariant(
      /^https:\/\/open\.spotify\.com\/(album|playlist|track)\/[A-Za-z0-9]{22}(?:\?[^#]*)?$/.test(
        g.musicUrl,
      ),
      'Use a Spotify album, playlist or track URL.',
    );
    invariant(
      Array.isArray(g.photos) && g.photos.length <= 600,
      'Use at most 600 photos.',
    );
    const ids = new Set<string>();
    for (const p of g.photos) {
      invariant(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.id) && !ids.has(p.id),
        'Unique photo identifier required.',
      );
      ids.add(p.id);
      images([p.image]);
      localized(p.caption, 'photo caption');
      invariant(
        typeof p.album === 'string' && p.album.trim() && p.album.length <= 80,
        'An album up to 80 characters is required.',
      );
      invariant(
        p.credit === undefined ||
          (typeof p.credit === 'string' && p.credit.length <= 100),
        'Photo credit is limited to 100 characters.',
      );
    }
  } else if (key === 'home') sameShape(homeTranslations, value, 'homepage');
  else {
    invariant(
      Array.isArray(value) && value.length <= 600,
      'A collection with at most 600 items is required.',
    );
    if (key === 'events' || key === 'culture') {
      const entries = value as SiteContent['events'];
      invariant(
        entries.every((e) => e.kind === (key === 'events' ? 'event' : 'cultural-date')),
        'Real events and cultural dates must remain separate.',
      );
      validateAgenda(entries);
    } else if (key === 'places') {
      const ids = new Set<string>();
      for (const p of value as SiteContent['places']) {
        images(p.images);
        invariant(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.id) && !ids.has(p.id),
          'Unique business ID required.',
        );
        ids.add(p.id);
        invariant(
          p.name?.trim() &&
            p.city?.trim() &&
            Array.isArray(p.categories) &&
            p.categories.length &&
            p.categories.every((c) => Object.hasOwn(categoryLabels, c)),
          'Business name, city and documented categories required.',
        );
        localized(p.description, p.name);
        invariant(Object.hasOwn(modeLabels, p.mode), 'Invalid business mode.');
        invariant(
          Array.isArray(p.offerings) &&
            p.offerings.every((v) => typeof v === 'string') &&
            Array.isArray(p.sources) &&
            p.sources.length &&
            Array.isArray(p.channels),
          'Business offerings, sources and channels required.',
        );
        for (const c of [...p.channels, ...p.sources])
          invariant(https(c.url), 'Business links must use HTTPS.');
        invariant(validDate(p.reviewedOn), 'A valid review date is required.');
        if (p.coordinates)
          invariant(
            p.mode !== 'order_only' &&
              p.address?.trim() &&
              Number.isFinite(p.coordinates.lat) &&
              p.coordinates.lat >= 42 &&
              p.coordinates.lat <= 44 &&
              Number.isFinite(p.coordinates.lng) &&
              p.coordinates.lng >= -81 &&
              p.coordinates.lng <= -78,
            'Reviewed Niagara address and coordinates are required for a map pin.',
          );
        invariant(
          p.mode !== 'order_only' || (!p.address && !p.coordinates),
          'Businesses without premises cannot expose an address.',
        );
      }
    } else if (key === 'pages') {
      const slugs = new Set<string>();
      for (const p of value as SiteContent['pages']) {
        images(p.images);
        invariant(
          countries.some((c) => c.slug === p.slug) && !slugs.has(p.slug),
          'Use a unique existing destination slug.',
        );
        slugs.add(p.slug);
        localized(p.title, 'country title');
        localized(p.introduction, 'country introduction');
        invariant(
          p.review?.basis === 'documentary-source-review' && validDate(p.review.date),
          'Documentary review required.',
        );
        invariant(
          Array.isArray(p.sources) &&
            p.sources.length &&
            p.sources.every((s) => s.id && https(s.url)),
          'Reviewed country sources required.',
        );
        const ids = new Set(p.sources.map((s) => s.id));
        for (const s of p.sources) localized(s.title, 'source title');
        invariant(
          Array.isArray(p.sections) &&
            p.sections.length >= 1 &&
            new Set(p.sections.map((s) => s.id)).size === p.sections.length,
          'Country sections need unique identifiers.',
        );
        for (const s of p.sections) {
          invariant(/^[a-z0-9-]+$/.test(s.id), 'Invalid section ID.');
          localized(s.title, 'section title');
          localized(s.text, 'section text');
          invariant(
            Array.isArray(s.sourceIds) &&
              s.sourceIds.length &&
              s.sourceIds.every((id) => ids.has(id)),
            'Sections must cite documented sources.',
          );
        }
        invariant(Array.isArray(p.music), 'Country music must be a collection.');
        for (const t of p.music) {
          invariant(
            /^[A-Za-z0-9]{22}$/.test(t.trackId) &&
              t.title?.trim() &&
              t.artist?.trim() &&
              t.verification === 'spotify-title-and-artist',
            'Verified Spotify recording required.',
          );
          localized(t.context, 'music context');
        }
      }
    } else throw new Error('Unknown content collection.');
  }
}
export function hasMediaReference(value: unknown, id: string): boolean {
  if (typeof value === 'string') return value === `/api/media/${id}`;
  if (Array.isArray(value)) return value.some((v) => hasMediaReference(v, id));
  return (
    !!value &&
    typeof value === 'object' &&
    Object.values(value).some((v) => hasMediaReference(v, id))
  );
}
export function validateImageBytes(
  bytes: Uint8Array,
  type: string,
): 'png' | 'jpg' | 'webp' {
  invariant(
    bytes.length > 12 && bytes.length <= 3 * 1024 * 1024,
    'Images must be at most 3 MiB.',
  );
  const match = (start: number, values: number[]) =>
    values.every((v, i) => bytes[start + i] === v);
  if (type === 'image/png' && match(0, [137, 80, 78, 71, 13, 10, 26, 10])) return 'png';
  if (type === 'image/jpeg' && match(0, [255, 216, 255])) return 'jpg';
  if (type === 'image/webp' && match(0, [82, 73, 70, 70]) && match(8, [87, 69, 66, 80]))
    return 'webp';
  throw new Error('Only valid JPEG, PNG and WebP images are accepted.');
}
