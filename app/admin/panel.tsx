'use client';
import { panelMessages } from '../translations/interface-translations';
import UiIcon from '../components/ui-icon';
import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSiteLanguage } from '../components/site-context';
import {
  contentKeys,
  type ContentDocument,
  type ContentKey,
  type EditorRole,
  type HistoryItem,
} from '../cms/types';
import GalleryEditor from './gallery-editor';
import PhotoInbox from './photo-inbox';
import type { GalleryContent } from '../components/gallery/gallery-types';
import { countries } from '../components/explore/country-data';
import EditorFields, { adminRequest, uploadImage, type JsonValue } from './editor-fields';
import { newRecord, optionalDetails, recordName } from './record-helpers';
import { adminTranslations, fieldLabels } from '../translations/admin-translations';
import styles from './admin.module.css';
const DraftPreview = dynamic(() => import('./preview'), { ssr: false });
function LinkMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M3 13 13 3M3 3h10v10" />
    </svg>
  );
}
type Session = {
  configured: boolean;
  user: { email: string; id: string } | null;
  role?: EditorRole;
};
export default function AdminPanel() {
  const router = useRouter();
  const { language } = useSiteLanguage();
  const translations = adminTranslations[language];
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<ContentKey>('settings');
  const [document, setDocument] = useState<ContentDocument | null>(null);
  const [dirty, setDirty] = useState(false);
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<HistoryItem[] | null>(null);
  const [preview, setPreview] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const fail = useCallback(
    (error: unknown) => setError(error instanceof Error ? error.message : String(error)),
    [],
  );
  useEffect(() => {
    let active = true;
    adminRequest('/api/admin/session')
      .then((value) => {
        if (active) setSession(value);
      })
      .catch(fail);
    return () => {
      active = false;
    };
  }, [fail]);
  const userId = session?.user?.id;
  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    adminRequest(`/api/admin/documents/${selected}`, { signal: controller.signal })
      .then((value) => {
        if (!controller.signal.aborted) {
          setDocument(value);
          setIndex(0);
          setQuery('');
          setHistory(null);
          setError('');
          setNotice('');
          setDirty(false);
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) fail(error);
      });
    return () => controller.abort();
  }, [selected, userId, fail]);
  useEffect(() => {
    const leave = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', leave);
    return () => window.removeEventListener('beforeunload', leave);
  }, [dirty]);
  useEffect(() => {
    if (preview) dialog.current?.showModal();
    else dialog.current?.close();
  }, [preview]);
  const draft = document?.draft as unknown as JsonValue;
  const records = Array.isArray(draft) ? draft : null;
  const record = records ? records[index] : draft;
  const changed = (value: JsonValue) => {
    if (document) {
      setDocument({ ...document, draft: value as unknown as ContentDocument['draft'] });
      setDirty(true);
      setNotice('');
      setError('');
    }
  };
  const changedRecord = (value: JsonValue) =>
    changed(records ? records.map((v, i) => (i === index ? value : v)) : value);
  const choose = (key: ContentKey) => {
    if (busy) return;
    if (dirty && !window.confirm(translations.discard)) return;
    setDocument(null);
    setDirty(false);
    setSelected(key);
  };
  const login = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setBusy(true);
    setError('');
    try {
      const result = await adminRequest('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.get('email'),
          password: values.get('password'),
        }),
      });
      form.reset();
      setSession(result);
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
    }
  };
  const logout = async () => {
    if (dirty && !window.confirm(translations.discard)) return;
    setBusy(true);
    try {
      await adminRequest('/api/admin/session', { method: 'DELETE' });
      setSession({ configured: true, user: null });
      setDocument(null);
      setDirty(false);
      setError('');
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
    }
  };
  const save = async (action: 'save' | 'publish') => {
    if (!document) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await adminRequest(`/api/admin/documents/${selected}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          version: document.version,
          content: document.draft,
        }),
      });
      setDocument(result);
      setDirty(false);
      setNotice(action === 'save' ? translations.saved : translations.published);
      setHistory(null);
      if (action === 'publish') router.refresh();
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
    }
  };
  const reload = async () => {
    if (dirty && !window.confirm(translations.discard)) return;
    setBusy(true);
    try {
      setDocument(await adminRequest(`/api/admin/documents/${selected}`));
      setDirty(false);
      setError('');
      setNotice('');
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
    }
  };
  const historyLoad = async () => {
    setBusy(true);
    try {
      setHistory(await adminRequest(`/api/admin/history/${selected}`));
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
    }
  };
  const backup = () => {
    if (!document) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(document, null, 2)], { type: 'application/json' }),
    );
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `nc-latin-club-${selected}-v${document.version}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const add = () => {
    if (!records) return;
    const missing = countries.find(
      (c) =>
        !records.some(
          (r) => r && typeof r === 'object' && !Array.isArray(r) && r.slug === c.slug,
        ),
    );
    if (selected === 'pages' && !missing) return;
    changed([...records, newRecord(selected, missing?.slug)]);
    setQuery('');
    setIndex(records.length);
  };
  const duplicate = () => {
    if (!records || !record || selected === 'pages') return;
    const duplicatedRecord = structuredClone(record) as Record<string, JsonValue>;
    const suffix = `-copy-${crypto.randomUUID().slice(0, 6)}`;
    if (duplicatedRecord.id) duplicatedRecord.id = String(duplicatedRecord.id) + suffix;
    if (duplicatedRecord.slug)
      duplicatedRecord.slug = String(duplicatedRecord.slug) + suffix;
    changed([...records, duplicatedRecord]);
    setQuery('');
    setIndex(records.length);
  };
  const remove = () => {
    if (!records || !window.confirm(translations.removeConfirm)) return;
    changed(records.filter((_, i) => i !== index));
    setIndex(Math.max(0, index - 1));
  };
  const uploadSingle = async (
    file: File,
    apply: (src: string, dimensions?: { width: number; height: number }) => void,
  ) => {
    setBusy(true);
    setError('');
    setNotice(translations.uploading);
    try {
      const image = await uploadImage(file);
      apply(image.src, image);
      setNotice(translations.uploadDone);
    } catch (error) {
      fail(error);
      setNotice('');
    } finally {
      setBusy(false);
    }
  };
  const uploadMany = async (files: FileList | null) => {
    if (!files?.length || !record || typeof record !== 'object' || Array.isArray(record))
      return;
    setBusy(true);
    setNotice(translations.uploading);
    setError('');
    const current = record as Record<string, JsonValue>;
    const existing = Array.isArray(current.images) ? current.images : [];
    const images = [...existing];
    try {
      for (const file of Array.from(files)) {
        if (images.length >= 30) throw new Error('Use at most 30 images per record.');
        const image = await uploadImage(file);
        images.push({ ...image, alt: { en: '', es: '' } });
      }
      if (images.length !== existing.length) changedRecord({ ...current, images });
      setNotice(translations.uploadDone);
    } catch (error) {
      if (images.length !== existing.length) changedRecord({ ...current, images });
      fail(error);
      setNotice('');
    } finally {
      setBusy(false);
    }
  };
  const details =
    record && typeof record === 'object' && !Array.isArray(record)
      ? optionalDetails(selected)
      : {};
  const appendDetail = (key: string) => {
    if (!record || typeof record !== 'object' || Array.isArray(record)) return;
    const next = { ...record, [key]: structuredClone(details[key]) };
    if (key === 'startsAt') {
      delete next.dateSpan;
    }
    if (key === 'dateSpan') {
      delete next.startsAt;
      delete next.endsAt;
    }
    changedRecord(next);
  };
  return (
    <main id="main-content" tabIndex={-1} className={styles.page} data-admin-panel>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>{translations.eyebrow}</p>
        <h1>{translations.title}</h1>
        <p>{translations.intro}</p>
        {session?.user && (
          <div className={styles.identity}>
            <span>
              {session.user.email} · {translations.role}: {session.role}
            </span>
            <button onClick={logout} disabled={busy}>
              {translations.logout} <LinkMark />
            </button>
          </div>
        )}
      </header>
      {error && (
        <p className={styles.error} role="alert">
          {translations.error} {error}
        </p>
      )}
      {notice && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}
      {!session ? (
        <p role="status">{translations.loading}</p>
      ) : !session.configured ? (
        <section className={styles.login} data-admin-setup>
          <span className={styles.star}>
            <UiIcon name="sparkle" />
          </span>
          <h2>{translations.setup}</h2>
          <p>{translations.setupBody}</p>
          <a
            href="https://github.com/JuanLopz1/nc-latin-club/blob/work/docs/ADMIN_SETUP.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            {translations.guide} <LinkMark />
          </a>
        </section>
      ) : !session.user ? (
        <form className={styles.login} onSubmit={login} data-admin-login>
          <label className={styles.field}>
            {translations.email}
            <input type="email" name="email" required autoComplete="username" />
          </label>
          <label className={styles.field}>
            {translations.password}
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
            />
          </label>
          <button className={styles.primary} disabled={busy}>
            {translations.login} <UiIcon name="right" />
          </button>
        </form>
      ) : (
        <div className={styles.workspace}>
          <nav
            className={styles.collections}
            aria-label={panelMessages[language].contentCollections}
          >
            {contentKeys.map((key) => (
              <button
                key={key}
                data-collection={key}
                aria-pressed={selected === key}
                disabled={busy}
                onClick={() => choose(key)}
              >
                {translations.collections[key]} <LinkMark />
              </button>
            ))}
          </nav>
          <section
            className={styles.editor}
            aria-label={translations.collections[selected]}
          >
            <div className={styles.editorHeading}>
              <h2>{translations.collections[selected]}</h2>
              {document && (
                <p>
                  {translations.version} {document.version} · {translations.publicVersion}{' '}
                  {document.published_version}{' '}
                  {dirty && <strong>· {translations.unsaved}</strong>}
                </p>
              )}
            </div>
            <ol
              className={styles.workflow}
              aria-label={panelMessages[language].publishingSteps}
            >
              <li>
                <b>01</b>
                {panelMessages[language].editContentPhotos}
              </li>
              <li>
                <b>02</b>
                {panelMessages[language].savePreviewPrivately}
              </li>
              <li>
                <b>03</b>
                {panelMessages[language].publishToTheWebsite}
              </li>
            </ol>
            {!document ? (
              <p role="status">{translations.loading}</p>
            ) : (
              <>
                {records && (
                  <div className={styles.recordToolbar}>
                    <label className={styles.field}>
                      {translations.search}
                      <input
                        type="search"
                        data-admin-search
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={add}
                      disabled={
                        busy ||
                        (selected === 'pages' && records.length >= countries.length)
                      }
                      data-add-record
                    >
                      {translations.new} +
                    </button>
                    <div className={styles.recordList}>
                      {records
                        .map((r, i) => ({ r, i }))
                        .filter(({ r }) =>
                          JSON.stringify(r)
                            .toLocaleLowerCase()
                            .includes(query.toLocaleLowerCase()),
                        )
                        .map(({ r, i }) => (
                          <button
                            key={i}
                            data-record-index={i}
                            aria-pressed={index === i}
                            disabled={busy}
                            onClick={() => setIndex(i)}
                          >
                            {String(i + 1).padStart(2, '0')} / {recordName(r, language)}
                          </button>
                        ))}
                      {!!records.length &&
                        !records.some((r) =>
                          JSON.stringify(r)
                            .toLocaleLowerCase()
                            .includes(query.toLocaleLowerCase()),
                        ) && <p>{translations.noResults}</p>}
                    </div>
                  </div>
                )}
                {record === undefined ? (
                  <p>{translations.empty}</p>
                ) : (
                  <fieldset className={styles.form} disabled={busy}>
                    {records && (
                      <div className={styles.recordActions}>
                        <h3>{recordName(record, language)}</h3>
                        {selected !== 'pages' && (
                          <button type="button" onClick={duplicate}>
                            {translations.duplicate}
                          </button>
                        )}
                        <button type="button" onClick={remove}>
                          {translations.remove} ×
                        </button>
                      </div>
                    )}
                    {selected === 'gallery' ? (
                      <GalleryEditor
                        value={record as unknown as GalleryContent}
                        language={language}
                        onChange={changed}
                        onError={fail}
                        onUpload={uploadSingle}
                        setBusy={setBusy}
                      />
                    ) : (
                      <EditorFields
                        value={record}
                        path={records ? `${selected}.${index}` : selected}
                        language={language}
                        onChange={changedRecord}
                        onError={fail}
                        onUpload={uploadSingle}
                        optionalKeys={Object.keys(details)}
                      />
                    )}
                    {!!Object.keys(details).filter(
                      (key) =>
                        record &&
                        typeof record === 'object' &&
                        !Array.isArray(record) &&
                        !(key in record),
                    ).length && (
                      <label className={styles.field}>
                        {translations.addDetail}
                        <select value="" onChange={(e) => appendDetail(e.target.value)}>
                          <option value="">{translations.choose}</option>
                          {Object.keys(details)
                            .filter(
                              (key) =>
                                record &&
                                typeof record === 'object' &&
                                !Array.isArray(record) &&
                                !(key in record),
                            )
                            .map((key) => (
                              <option key={key} value={key}>
                                {fieldLabels[key]?.[language === 'en' ? 0 : 1] ?? key}
                              </option>
                            ))}
                        </select>
                      </label>
                    )}
                    {records && (
                      <label className={styles.upload}>
                        <strong>{translations.upload}</strong>
                        <span>{translations.uploadNote}</span>
                        <input
                          type="file"
                          multiple
                          accept="image/png,image/jpeg,image/webp"
                          data-upload-images
                          onChange={(e) => {
                            void uploadMany(e.target.files);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    )}
                  </fieldset>
                )}
                {selected === 'gallery' && (
                  <PhotoInbox
                    language={language}
                    version={document.version}
                    locked={busy || dirty}
                    onError={fail}
                    setBusy={setBusy}
                    onModerated={(value) => {
                      setDocument(value);
                      setDirty(false);
                      setNotice(
                        panelMessages[language]
                          .submissionReviewedAcceptedPhotosAreSavedInThePrivate,
                      );
                    }}
                  />
                )}
                <p className={styles.hint}>{translations.required}</p>
                <div className={styles.actions}>
                  <span className={styles.publishState} role="status">
                    {language === 'en'
                      ? dirty
                        ? 'Unsaved changes'
                        : document.published_version === document.version &&
                            document.version > 0
                          ? 'This version is live'
                          : 'Private draft · publish to make it live'
                      : dirty
                        ? 'Cambios sin guardar'
                        : document.published_version === document.version &&
                            document.version > 0
                          ? 'Esta versión está publicada'
                          : 'Borrador privado · publica para mostrarlo'}
                  </span>
                  <button
                    className={styles.primary}
                    data-save-draft
                    disabled={busy}
                    onClick={() => save('save')}
                  >
                    {translations.save}
                  </button>
                  <button
                    data-publish
                    disabled={busy || session.role !== 'admin'}
                    onClick={() => save('publish')}
                  >
                    {translations.publish} <LinkMark />
                  </button>
                  <button disabled={busy} onClick={() => setPreview(true)}>
                    {translations.preview}
                  </button>
                  <button disabled={busy} onClick={historyLoad}>
                    {translations.history}
                  </button>
                  <button disabled={busy} onClick={backup}>
                    {translations.backup}
                  </button>
                  <button disabled={busy} onClick={reload}>
                    {translations.reload}
                  </button>
                </div>
                {history && (
                  <section className={styles.history}>
                    <h3>{translations.history}</h3>
                    {!history.length ? (
                      <p>{translations.historyEmpty}</p>
                    ) : (
                      history.map((item) => (
                        <article key={item.id}>
                          <p>
                            {translations.version} {item.version} ·{' '}
                            {item.action === 'publish'
                              ? translations.publish
                              : translations.draft}
                            <small>
                              {new Date(item.created_at).toLocaleString(
                                language === 'en' ? 'en-CA' : 'es-CO',
                                { timeZone: 'America/Toronto' },
                              )}{' '}
                              · Toronto
                            </small>
                          </p>
                          <button
                            disabled={busy}
                            data-restore-version={item.version}
                            onClick={() => {
                              changed(item.content as unknown as JsonValue);
                              setIndex(0);
                              setNotice(translations.recovered);
                            }}
                          >
                            {translations.restore} <UiIcon name="undo" />
                          </button>
                        </article>
                      ))
                    )}
                  </section>
                )}
              </>
            )}
          </section>
        </div>
      )}
      <p className={styles.return}>
        <Link href="/" prefetch={false}>
          <UiIcon name="left" /> NC LATIN CLUB
        </Link>
      </p>
      <dialog
        ref={dialog}
        className={styles.previewDialog}
        aria-label={translations.privatePreview}
        onCancel={() => setPreview(false)}
      >
        <div className={styles.previewBar}>
          <strong>{translations.privatePreview}</strong>
          <button onClick={() => setPreview(false)}>{translations.close} ×</button>
        </div>
        {preview && draft !== undefined && (
          <DraftPreview contentKey={selected} value={draft} index={index} />
        )}
      </dialog>
    </main>
  );
}
