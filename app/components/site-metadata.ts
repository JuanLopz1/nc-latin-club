import type { Metadata } from 'next';

export const siteOrigin = 'https://nc-latin-club.vercel.app';
export function pageMetadata(title: string, description: string, path: string, image = '/images/latin-night-festival.png'): Metadata {
  const assetOrigin = process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : siteOrigin;
  const imageUrl = new URL(image, assetOrigin).href;
  const images = [{ url: imageUrl, alt: 'NC Latin Club — Latin night festival illustration' }];
  return {
    title, description,
    alternates: { canonical: path },
    openGraph: { type: 'website', siteName: 'NC LATIN CLUB', title, description, url: path, locale: 'en_CA', alternateLocale: ['es_ES'], images },
    twitter: { card: 'summary_large_image', title, description, images: [imageUrl] },
  };
}
