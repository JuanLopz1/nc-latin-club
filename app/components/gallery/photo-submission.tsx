'use client';
import { useEffect, useRef, useState } from 'react';
import type { Language } from '../../translations/language';
import { galleryTranslations } from '../../translations/gallery-translations';
import Arrow from './arrow';
import styles from './gallery.module.css';
type Upload = { src: string; width: number; height: number; proof: string };
type Batch = { id: string; token: string; images: Upload[]; files: File[] };
async function request(path: string, init: RequestInit = {}) {
  const response = await fetch(path, { ...init, cache: 'no-store' });
  const data = await response.json();
  if (!response.ok) throw new Error(String(response.status));
  return data;
}
export default function PhotoSubmission({ language }: { language: Language }) {
  const translations = galleryTranslations[language];
  const [ready, setReady] = useState<boolean | null>(null);
  const [challenge, setChallenge] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const batch = useRef<Batch | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const abort = useRef<AbortController | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    request('/api/gallery/submissions', { signal: controller.signal })
      .then((data) => {
        setReady(data.available);
        setChallenge(data.challenge ?? '');
      })
      .catch(() => {
        if (!controller.signal.aborted) setReady(false);
      });
    return () => {
      controller.abort();
      abort.current?.abort();
    };
  }, []);
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setError('');
    if (
      files.length < 1 ||
      files.length > 8 ||
      files.some(
        (file) =>
          file.size > 3 * 1024 * 1024 ||
          !['image/png', 'image/jpeg', 'image/webp'].includes(file.type),
      )
    ) {
      setError(translations.limits);
      return;
    }
    setBusy(true);
    const controller = new AbortController();
    abort.current = controller;
    try {
      if (!batch.current) {
        const result = await request('/api/gallery/submissions', {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            challenge,
            website: values.get('website'),
            consent: values.get('consent') === 'on',
          }),
        });
        batch.current = { ...result, images: [], files };
      }
      const current = batch.current!;
      for (let i = current.images.length; i < current.files.length; i++) {
        setProgress(i + 1);
        const data = new FormData();
        data.set('image', current.files[i]);
        const image = await request(`/api/gallery/submissions/${current.id}/images`, {
          method: 'POST',
          signal: controller.signal,
          headers: { 'x-photo-token': current.token, 'x-photo-slot': String(i) },
          body: data,
        });
        current.images.push(image);
      }
      await request(`/api/gallery/submissions/${current.id}`, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json', 'x-photo-token': current.token },
        body: JSON.stringify({
          images: current.images,
          caption: values.get('caption'),
          album: values.get('album'),
          credit: values.get('credit') ?? '',
          consent: values.get('consent') === 'on',
        }),
      });
      setSent(true);
      batch.current = null;
      form.reset();
      setFiles([]);
      setPreviews([]);
    } catch (error) {
      if (!controller.signal.aborted)
        setError(
          error instanceof Error && error.message === '429'
            ? translations.rate
            : translations.error,
        );
    } finally {
      setBusy(false);
    }
  };
  return (
    <section
      className={styles.submission}
      id="leave-a-memory"
      aria-labelledby="submission-title"
    >
      <div>
        <p className={styles.label}>SIDE B / FAMILIA</p>
        <h2 id="submission-title">{translations.share}</h2>
        <p>{translations.formText}</p>
      </div>
      {sent ? (
        <p className={styles.success} role="status" data-submission-success>
          {translations.sent}
        </p>
      ) : ready === false ? (
        <p className={styles.formNotice} role="status">
          {translations.unavailable}
        </p>
      ) : (
        <form ref={formRef} onSubmit={submit} className={styles.form} data-photo-form>
          <fieldset disabled={busy || ready !== true}>
            <label>
              {translations.files}
              <input
                type="file"
                name="images"
                accept="image/jpeg,image/png,image/webp"
                multiple
                required
                onChange={(event) => {
                  const next = Array.from(event.target.files ?? []);
                  setFiles(next);
                  setPreviews(next.map((file) => URL.createObjectURL(file)));
                  batch.current = null;
                  setError('');
                }}
              />
              <small>{translations.limits}</small>
            </label>
            {!!previews.length && (
              <div className={styles.uploadPreviews}>
                {previews.map((src, i) => (
                  <span
                    key={src}
                    style={{ backgroundImage: `url(${src})` }}
                    aria-label={`${translations.frame} ${i + 1}`}
                  />
                ))}
              </div>
            )}
            <label>
              {translations.caption}
              <textarea name="caption" maxLength={500} required rows={3} />
              <small>{translations.captionHint}</small>
            </label>
            <div className={styles.formRow}>
              <label>
                {translations.albumField}
                <input name="album" required maxLength={80} defaultValue="Familia" />
              </label>
              <label>
                {translations.creditField}
                <input name="credit" maxLength={100} />
              </label>
            </div>
            <label className={styles.honeypot} aria-hidden="true">
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
            <label className={styles.consent}>
              <input type="checkbox" name="consent" required />
              <span>{translations.consent}</span>
            </label>
            <button className={styles.primary} type="submit">
              {busy
                ? `${translations.progress} ${progress} / ${files.length}`
                : translations.send}
              <Arrow />
            </button>
          </fieldset>
          {busy && <p role="status">{translations.sending}</p>}
          {error && (
            <p className={styles.formError} role="alert">
              {error}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
