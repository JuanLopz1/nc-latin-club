'use client';
import { galleryEditorMessages } from '../translations/interface-translations';
import UiIcon from '../components/ui-icon';
import Image from 'next/image';
import { useState } from 'react';
import type { GalleryContent, GalleryPhoto } from '../components/gallery/gallery-types';
import type { Language } from '../translations/language';
import EditorFields, { uploadImage, type JsonValue } from './editor-fields';
import styles from './admin.module.css';
export default function GalleryEditor({
  value,
  language,
  onChange,
  onError,
  onUpload,
  setBusy,
}: {
  value: GalleryContent;
  language: Language;
  onChange(value: JsonValue): void;
  onError(error: unknown): void;
  onUpload(
    file: File,
    apply: (src: string, dimensions?: { width: number; height: number }) => void,
  ): Promise<void>;
  setBusy(value: boolean): void;
}) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const photo = value.photos[index];
  const en = language === 'en';
  const change = (next: GalleryContent) => onChange(next as unknown as JsonValue);
  const update = (next: GalleryPhoto) =>
    change({ ...value, photos: value.photos.map((p, i) => (i === index ? next : p)) });
  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const photos = [...value.photos];
    try {
      for (const file of Array.from(files)) {
        if (photos.length >= 600)
          throw new Error(galleryEditorMessages[en ? 'en' : 'es'].useAtMost600Photos);
        const image = await uploadImage(file);
        photos.push({
          id: `memory-${crypto.randomUUID()}`,
          image: { ...image, alt: { en: '', es: '' } },
          caption: { en: '', es: '' },
          album: 'Familia',
        });
      }
      change({ ...value, photos });
      setIndex(value.photos.length);
      setQuery('');
    } catch (error) {
      if (photos.length > value.photos.length) change({ ...value, photos });
      onError(error);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <EditorFields
        value={{
          title: value.title,
          description: value.description,
          musicUrl: value.musicUrl,
        }}
        path="gallery"
        language={language}
        onChange={(next) =>
          change({
            ...value,
            ...(next as Pick<GalleryContent, 'title' | 'description' | 'musicUrl'>),
          })
        }
        onError={onError}
        onUpload={onUpload}
      />
      <label className={styles.upload}>
        <strong>{galleryEditorMessages[en ? 'en' : 'es'].addPhotosToTheAlbum}</strong>
        <span>
          {
            galleryEditorMessages[en ? 'en' : 'es']
              .selectOneOrMoreImagesThenFillTheEnglish
          }
        </span>
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          data-gallery-upload
          onChange={(event) => {
            void upload(event.target.files);
            event.target.value = '';
          }}
        />
      </label>
      {!!value.photos.length && (
        <>
          <label className={styles.field}>
            {galleryEditorMessages[en ? 'en' : 'es'].findAPhoto}
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className={styles.galleryRecords}>
            {value.photos
              .map((p, i) => ({ p, i }))
              .filter(({ p }) =>
                JSON.stringify(p).toLocaleLowerCase().includes(query.toLocaleLowerCase()),
              )
              .map(({ p, i }) => (
                <button
                  type="button"
                  aria-pressed={index === i}
                  key={p.id}
                  data-admin-photo={p.id}
                  onClick={() => setIndex(i)}
                >
                  <Image src={p.image.src} alt="" unoptimized width={100} height={70} />
                  <span>
                    {p.caption[language] ||
                      `${galleryEditorMessages[en ? 'en' : 'es'].photo} ${i + 1}`}
                  </span>
                </button>
              ))}
          </div>
        </>
      )}
      {photo && (
        <div className={styles.galleryPhotoEditor}>
          <div className={styles.recordActions}>
            <h3>{galleryEditorMessages[en ? 'en' : 'es'].photoDetails}</h3>
            <button
              type="button"
              onClick={() => {
                if (
                  !window.confirm(
                    galleryEditorMessages[en ? 'en' : 'es'].removeThisPhotoFromTheDraft,
                  )
                )
                  return;
                change({ ...value, photos: value.photos.filter((_, i) => i !== index) });
                setIndex(Math.max(0, index - 1));
              }}
            >
              {galleryEditorMessages[en ? 'en' : 'es'].removePhoto}
            </button>
            <button
              type="button"
              disabled={index === 0}
              onClick={() => {
                const photos = [...value.photos];
                [photos[index - 1], photos[index]] = [photos[index], photos[index - 1]];
                change({ ...value, photos });
                setIndex(index - 1);
              }}
            >
              {galleryEditorMessages[en ? 'en' : 'es'].moveEarlier} <UiIcon name="up" />
            </button>
          </div>
          <Image
            src={photo.image.src}
            alt={photo.image.alt[language]}
            unoptimized
            width={photo.image.width}
            height={photo.image.height}
            className={styles.photoPreview}
          />
          <label className={styles.field}>
            {galleryEditorMessages[en ? 'en' : 'es'].replaceThisPhoto}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (file)
                  await onUpload(file, (src, size) =>
                    update({ ...photo, image: { ...photo.image, src, ...size } }),
                  );
                event.target.value = '';
              }}
            />
          </label>
          <EditorFields
            value={{
              caption: photo.caption,
              alt: photo.image.alt,
              album: photo.album,
              credit: photo.credit ?? '',
            }}
            path={`gallery.photos.${index}`}
            language={language}
            onError={onError}
            onUpload={onUpload}
            onChange={(next) => {
              const fields = next as unknown as {
                caption: GalleryPhoto['caption'];
                alt: GalleryPhoto['image']['alt'];
                album: string;
                credit: string;
              };
              update({
                ...photo,
                caption: fields.caption,
                album: fields.album,
                credit: fields.credit,
                image: { ...photo.image, alt: fields.alt },
              });
            }}
          />
        </div>
      )}
    </>
  );
}
