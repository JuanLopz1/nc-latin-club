'use client';
import { imageFieldsMessages } from '../translations/interface-translations';
import UiIcon from '../components/ui-icon';
import Image from 'next/image';
import type { Language } from '../translations/language';
import type { EntryImage } from '../components/events/event-types';
import styles from './admin.module.css';
export default function ImageFields({
  images,
  path,
  language,
  onChange,
  onUpload,
}: {
  images: EntryImage[];
  path: string;
  language: Language;
  onChange(value: EntryImage[]): void;
  onUpload(
    file: File,
    apply: (src: string, dimensions?: { width: number; height: number }) => void,
  ): Promise<void>;
}) {
  const en = language === 'en';
  const change = (index: number, next: EntryImage) =>
    onChange(images.map((image, i) => (i === index ? next : image)));
  return (
    <fieldset className={styles.group}>
      <legend>
        {imageFieldsMessages[en ? 'en' : 'es'].photosDescribeReorderOrReplace}
      </legend>
      {images.map((image, i) => (
        <div className={styles.imageFields} key={i}>
          <div>
            <Image
              src={image.src}
              alt={image.alt[language]}
              width={240}
              height={160}
              unoptimized
              className={styles.photoPreview}
            />
            <label className={styles.field}>
              {imageFieldsMessages[en ? 'en' : 'es'].replaceThisPhoto}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (file)
                    await onUpload(file, (src, size) =>
                      change(i, { ...image, src, ...size }),
                    );
                  event.target.value = '';
                }}
              />
            </label>
          </div>
          <div>
            <p className={styles.hint}>
              {
                imageFieldsMessages[en ? 'en' : 'es']
                  .describeWhatIsShownForPeopleUsingScreenReaders
              }
            </p>
            <div className={styles.localized}>
              {(['en', 'es'] as const).map((lang) => (
                <label className={styles.field} key={lang}>
                  {imageFieldsMessages[lang].english}
                  <textarea
                    name={`${path}.${i}.alt.${lang}`}
                    value={image.alt[lang]}
                    rows={3}
                    onChange={(event) =>
                      change(i, {
                        ...image,
                        alt: { ...image.alt, [lang]: event.target.value },
                      })
                    }
                  />
                </label>
              ))}
            </div>
            {image.caption && (
              <div className={styles.localized}>
                {(['en', 'es'] as const).map((lang) => (
                  <label className={styles.field} key={lang}>
                    {imageFieldsMessages[en ? 'en' : 'es'].caption} ·{' '}
                    {imageFieldsMessages[lang].english}
                    <textarea
                      name={`${path}.${i}.caption.${lang}`}
                      value={image.caption![lang]}
                      rows={2}
                      onChange={(event) =>
                        change(i, {
                          ...image,
                          caption: { ...image.caption!, [lang]: event.target.value },
                        })
                      }
                    />
                  </label>
                ))}
              </div>
            )}
            <div className={styles.itemActions}>
              <button
                type="button"
                onClick={() => onChange(images.filter((_, index) => index !== i))}
              >
                {imageFieldsMessages[en ? 'en' : 'es'].remove} ×
              </button>
              <button
                type="button"
                disabled={i === 0}
                onClick={() => {
                  const next = [...images];
                  [next[i - 1], next[i]] = [next[i], next[i - 1]];
                  onChange(next);
                }}
              >
                {imageFieldsMessages[en ? 'en' : 'es'].moveEarlier} <UiIcon name="up" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </fieldset>
  );
}
