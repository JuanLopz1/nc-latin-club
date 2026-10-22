import { pageMetadataTranslations } from '../translations/page-metadata-translations';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLanguage } from '../translations/routing';
import type { Language } from '../translations/language';
import { Analytics } from '@vercel/analytics/next';
import { Geist, Geist_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import '../globals.css';
import { SiteProvider } from '../components/site-context';
import SiteShell from '../components/site-shell';
import { pageMetadata, siteOrigin } from '../components/site-metadata';
import { Suspense, type ReactNode } from 'react';
import { getPublishedContent } from '../cms/public-content';
import { ContentProvider } from '../components/content-context';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const clubDisplay = localFont({
  src: '../fonts/bricolage-grotesque-latin.woff2',
  variable: '--font-club-display',
  weight: '800',
  display: 'swap',
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const language = isLanguage(locale) ? locale : 'en';
  const metadata = pageMetadataTranslations[language].home;
  return {
    ...pageMetadata(metadata.title, metadata.description, '/', undefined, language),
    metadataBase: new URL(siteOrigin),
  };
}

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }];
}

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLanguage(locale)) notFound();
  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${clubDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={<p style={{ padding: 32 }}>NC LATIN CLUB</p>}>
          <PublishedSite language={locale}>{children}</PublishedSite>
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
async function PublishedSite({
  children,
  language,
}: {
  children: ReactNode;
  language: Language;
}) {
  const content = await getPublishedContent();
  return (
    <ContentProvider content={content}>
      <SiteProvider language={language}>
        <SiteShell>{children}</SiteShell>
      </SiteProvider>
    </ContentProvider>
  );
}
