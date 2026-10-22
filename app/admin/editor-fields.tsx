'use client';
import UiIcon from '../components/ui-icon';
import Image from 'next/image';
import ImageFields from './image-fields';
import type { EntryImage } from '../components/events/event-types';
import type { Language } from '../translations/language';
import { adminTranslations, fieldLabels } from '../translations/admin-translations';
import { categoryLabels, modeLabels } from '../translations/niagara-translations';
import styles from './admin.module.css';
export type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
export async function adminRequest(path: string, init: RequestInit = {}) {
  const response = await fetch(path, { ...init, cache: 'no-store' });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? `Request failed (${response.status})`);
  return data;
}
export async function uploadImage(file: File) {
  if (file.size > 3 * 1024 * 1024) throw new Error('Choose an image up to 3 MiB.');
  const form = new FormData();
  form.set('image', file);
  return adminRequest('/api/admin/media', { method: 'POST', body: form }) as Promise<{
    src: string;
    width: number;
    height: number;
  }>;
}
export function blankClone(value: JsonValue): JsonValue {
  if (typeof value === 'string') return '';
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return false;
  if (Array.isArray(value)) return [];
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, v]) => [
        key,
        ['kind', 'verification', 'basis'].includes(key) ? v : blankClone(v),
      ]),
    );
  return null;
}
const choices: Record<string, string[]> = {
  kind: ['event', 'cultural-date'],
  category: ['at-nc', 'out-of-nc', 'latin-dates'],
  status: ['scheduled', 'cancelled', 'rescheduled'],
  mode: Object.keys(modeLabels),
  provenance: ['user-capture', 'official-page'],
  calendarDisplay: ['month'],
  verification: ['spotify-title-and-artist'],
  basis: ['documentary-source-review'],
};
function emptyItem(key: string, path: string): JsonValue {
  const text = { en: '', es: '' };
  if (key === 'music')
    return {
      trackId: '',
      title: '',
      artist: '',
      context: text,
      verification: 'spotify-title-and-artist',
    };
  if (key === 'sections') return { id: '', title: text, text, sourceIds: [] };
  if (key === 'sources')
    return path.startsWith('places.')
      ? { title: '', url: '' }
      : { id: '', title: text, url: '' };
  if (key === 'channels') return { label: '', url: '' };
  if (key === 'links') return { label: text, url: '' };
  if (key === 'sessions') return { startsAt: '' };
  if (key === 'categories') return 'restaurant';
  return '';
}
export default function EditorFields({
  value,
  path,
  language,
  onChange,
  onError,
  onUpload,
  depth = 0,
  optionalKeys = [],
}: {
  value: JsonValue;
  path: string;
  language: Language;
  onChange(value: JsonValue): void;
  onError(error: unknown): void;
  onUpload(
    file: File,
    apply: (src: string, dimensions?: { width: number; height: number }) => void,
  ): Promise<void>;
  depth?: number;
  optionalKeys?: string[];
}) {
  const translations = adminTranslations[language];
  const key = path.split('.').at(-1)!;
  const parent = path.split('.').at(-2);
  const label =
    fieldLabels[key]?.[language === 'en' ? 0 : 1] ??
    key.replace(/([a-z])([A-Z])/g, '$1 $2');
  if (depth > 8) return null;
  if (typeof value === 'string' || typeof value === 'number') {
    const list = parent === 'categories' ? Object.keys(categoryLabels) : choices[key];
    const readonly = ['kind', 'verification', 'basis', 'width', 'height'].includes(key);
    const image = ['src', 'logoSrc', 'heroSrc', 'familiaPhotoSrc'].includes(key);
    return (
      <label className={styles.field}>
        <span>{/^\d+$/.test(key) ? `#${Number(key) + 1}` : label}</span>
        {list ? (
          <select
            name={path}
            value={String(value)}
            disabled={readonly}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">—</option>
            {list.map((v) => (
              <option key={v} value={v}>
                {(parent === 'categories'
                  ? categoryLabels[v]?.[language]
                  : key === 'mode'
                    ? modeLabels[v]?.[language]
                    : null) ?? v}
              </option>
            ))}
          </select>
        ) : typeof value === 'number' ? (
          <input
            name={path}
            type="number"
            step="any"
            value={value}
            readOnly={readonly}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        ) : (
          <textarea
            name={path}
            value={value}
            rows={value.length > 180 ? 6 : 2}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={!/url|src|id|slug|At$/.test(key)}
            readOnly={readonly}
          />
        )}{' '}
        {image && (
          <>
            <input
              aria-label={`${translations.images}: ${label}`}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                await onUpload(file, onChange);
                e.target.value = '';
              }}
            />
            {String(value).startsWith('/') && (
              <Image
                src={String(value)}
                alt={label}
                width={200}
                height={130}
                unoptimized
                className={styles.image}
              />
            )}
          </>
        )}
      </label>
    );
  }
  if (Array.isArray(value) && key === 'images')
    return (
      <ImageFields
        images={value as unknown as EntryImage[]}
        path={path}
        language={language}
        onUpload={onUpload}
        onChange={(next) => onChange(next as unknown as JsonValue)}
      />
    );
  if (Array.isArray(value))
    return (
      <fieldset className={styles.group}>
        <legend>{label}</legend>
        {value.map((v, i) => (
          <div className={styles.arrayItem} key={i}>
            <EditorFields
              value={v}
              path={`${path}.${i}`}
              language={language}
              depth={depth + 1}
              onError={onError}
              onUpload={onUpload}
              onChange={(next) =>
                onChange(value.map((item, index) => (index === i ? next : item)))
              }
            />
            {!path.startsWith('home.') && (
              <div className={styles.itemActions}>
                <button
                  type="button"
                  aria-label={`${translations.remove} ${i + 1}`}
                  onClick={() => onChange(value.filter((_, index) => index !== i))}
                >
                  × {translations.remove}
                </button>
                <button
                  type="button"
                  disabled={i === 0}
                  aria-label={`↑ ${i + 1}`}
                  onClick={() => {
                    const next = [...value];
                    [next[i - 1], next[i]] = [next[i], next[i - 1]];
                    onChange(next);
                  }}
                >
                  <UiIcon name="up" />
                </button>
              </div>
            )}
          </div>
        ))}
        {!path.startsWith('home.') && key !== 'images' && (
          <button
            type="button"
            onClick={() =>
              onChange([
                ...value,
                value[0] === undefined ? emptyItem(key, path) : blankClone(value[0]),
              ])
            }
          >
            {translations.add} +
          </button>
        )}
      </fieldset>
    );
  if (value && typeof value === 'object') {
    const localized = typeof value.en === 'string' && typeof value.es === 'string';
    const fields = (
      <div className={localized ? styles.localized : styles.fieldGrid}>
        {Object.entries(value)
          .filter(
            ([name]) =>
              !/^home\.(en|es)$/.test(path) ||
              !/^(roots|country|niagara|choose|heroLabel$)/.test(name),
          )
          .map(([name, v]) => (
            <div key={name}>
              <EditorFields
                value={v}
                path={`${path}.${name}`}
                language={language}
                depth={depth + 1}
                onError={onError}
                onUpload={onUpload}
                onChange={(next) => onChange({ ...value, [name]: next })}
              />
              {optionalKeys.includes(name) && (
                <button
                  type="button"
                  onClick={() => {
                    const next = { ...value };
                    delete next[name];
                    onChange(next);
                  }}
                >
                  {translations.remove} ·{' '}
                  {fieldLabels[name]?.[language === 'en' ? 0 : 1] ?? name}
                </button>
              )}
            </div>
          ))}
      </div>
    );
    return localized ? (
      <fieldset className={styles.group}>
        <legend>{label}</legend>
        {fields}
      </fieldset>
    ) : depth === 0 ? (
      fields
    ) : (
      <details className={styles.details} open={depth === 1}>
        <summary>{label}</summary>
        {fields}
      </details>
    );
  }
  if (typeof value === 'boolean')
    return (
      <label className={styles.field}>
        <span>{label}</span>
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
        />
      </label>
    );
  return null;
}
