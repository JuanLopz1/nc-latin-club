'use client';
import { photoInboxMessages } from '../translations/interface-translations';
import UiIcon from '../components/ui-icon';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Language } from '../translations/language';
import type { PhotoSubmission } from '../components/gallery/gallery-types';
import type { ContentDocument } from '../cms/types';
import { adminRequest } from './editor-fields';
import styles from './admin.module.css';
export default function PhotoInbox({
  language,
  version,
  locked,
  onModerated,
  onError,
  setBusy,
}: {
  language: Language;
  version: number;
  locked: boolean;
  onModerated(value: ContentDocument): void;
  onError(error: unknown): void;
  setBusy(value: boolean): void;
}) {
  const [submissions, setSubmissions] = useState<PhotoSubmission[] | null>(null);
  const [error, setError] = useState('');
  const en = language === 'en';
  useEffect(() => {
    const controller = new AbortController();
    adminRequest('/api/admin/photo-submissions', { signal: controller.signal })
      .then(setSubmissions)
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      });
    return () => controller.abort();
  }, []);
  const reload = async () => {
    setError('');
    try {
      setSubmissions(await adminRequest('/api/admin/photo-submissions'));
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    }
  };
  const moderate = async (id: string, action: 'approve' | 'reject') => {
    if (locked) return;
    if (
      action === 'reject' &&
      !window.confirm(
        photoInboxMessages[en ? 'en' : 'es']
          .rejectThisSubmissionItsPhotosWillRemainPrivate,
      )
    )
      return;
    setBusy(true);
    try {
      const document = await adminRequest(`/api/admin/photo-submissions/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, version }),
      });
      onModerated(document);
      setSubmissions((current) => current?.filter((item) => item.id !== id) ?? null);
    } catch (error) {
      onError(error);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className={styles.inbox} data-photo-inbox>
      <div className={styles.recordActions}>
        <h3>
          {photoInboxMessages[en ? 'en' : 'es'].photosFromTheFamilia}{' '}
          {submissions ? `(${submissions.length})` : ''}
        </h3>
        <button type="button" disabled={locked} onClick={reload}>
          {photoInboxMessages[en ? 'en' : 'es'].refreshInbox}
        </button>
      </div>
      <p className={styles.hint}>
        {photoInboxMessages[en ? 'en' : 'es'].step1ReviewPermissionAndCaptions2AddABatch}
      </p>
      {version === 0 && (
        <p className={styles.hint}>
          {
            photoInboxMessages[en ? 'en' : 'es']
              .saveYourFirstGalleryDraftToEnableAcceptance
          }
        </p>
      )}
      {locked && (
        <p className={styles.hint}>
          {
            photoInboxMessages[en ? 'en' : 'es']
              .saveUnsavedChangesBeforeReviewingASubmission
          }
        </p>
      )}
      {error && (
        <p className={styles.error} role="alert">
          {en
            ? error
            : 'Ejecuta supabase/gallery.sql en el SQL editor de tu proyecto existente de Supabase para activar los envíos de fotos.'}
          <a
            href="https://github.com/JuanLopz1/nc-latin-club/blob/work/supabase/gallery.sql"
            target="_blank"
            rel="noopener noreferrer"
          >
            {photoInboxMessages[en ? 'en' : 'es'].openUpgradeSQL}{' '}
            <UiIcon name="external" />
          </a>
        </p>
      )}
      {submissions?.length === 0 && (
        <p className={styles.hint}>
          {photoInboxMessages[en ? 'en' : 'es'].allCaughtUpNoPhotosWaitingForReview}
        </p>
      )}
      {submissions?.map((item) => (
        <article
          className={styles.submissionBatch}
          key={item.id}
          data-pending-submission={item.id}
        >
          <p>
            {new Date(item.created_at).toLocaleString(en ? 'en-CA' : 'es-CO', {
              timeZone: 'America/Toronto',
            })}{' '}
            · Toronto
          </p>
          <div>
            {item.photos.map((photo) => (
              <figure key={photo.id}>
                <Image
                  src={photo.image.src}
                  alt={photo.image.alt[language]}
                  unoptimized
                  width={180}
                  height={130}
                />
                <figcaption>
                  {photo.caption[language]}
                  <small>
                    {photo.album}
                    {photo.credit ? ` · ${photo.credit}` : ''}
                  </small>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className={styles.hint}>
            {
              photoInboxMessages[en ? 'en' : 'es']
                .theSenderConfirmedPermissionToShareAndPublishThese
            }
          </p>
          <div className={styles.recordActions}>
            <button
              className={styles.primary}
              disabled={locked || version === 0}
              data-accept-submission
              onClick={() => moderate(item.id, 'approve')}
            >
              {photoInboxMessages[en ? 'en' : 'es'].addToGalleryDraft}
            </button>
            <button
              disabled={locked}
              data-reject-submission
              onClick={() => moderate(item.id, 'reject')}
            >
              {photoInboxMessages[en ? 'en' : 'es'].reject}
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
