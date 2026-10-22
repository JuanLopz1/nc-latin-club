import type { Metadata } from 'next';
import type { Language } from '../translations/language';
import { localizedPath, withoutLanguage } from '../translations/routing';

export const siteOrigin = 'https://nc-latin-club.vercel.app';
export function pageMetadata(
  title: string,
  description: string,
  path: string,
  image = '/opengraph-image',
  language: Language = 'en',
): Metadata {
  const localizedUrl = localizedPath(path, language);
  const pagePath = withoutLanguage(path);
  const assetOrigin =
    process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : siteOrigin;
  const imageUrl = new URL(image, assetOrigin).href;
  const images = [
    {
      url: imageUrl,
      alt:
        image === '/opengraph-image'
          ? 'NC LATIN CLUB — Latin roots. Niagara energy.'
          : 'NC Latin Club — Latin night festival illustration',
    },
  ];
  return {
    title,
    description,
    alternates: {
      canonical: localizedUrl,
      languages: {
        en: localizedPath(pagePath, 'en'),
        es: localizedPath(pagePath, 'es'),
        'x-default': pagePath,
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'NC LATIN CLUB',
      title,
      description,
      url: localizedUrl,
      locale: language === 'es' ? 'es_CA' : 'en_CA',
      alternateLocale: [language === 'es' ? 'en_CA' : 'es_CA'],
      images,
    },
    twitter: { card: 'summary_large_image', title, description, images: [imageUrl] },
  };
}
