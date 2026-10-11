import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteProvider } from "./components/site-context";
import SiteShell from "./components/site-shell";
import { pageMetadata, siteOrigin } from './components/site-metadata';
import { Suspense, type ReactNode } from 'react';
import { getPublishedContent } from './cms/public-content';
import { ContentProvider } from './components/content-context';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  ...pageMetadata('NC LATIN CLUB', 'Latin roots. Niagara energy. A place to belong.', '/'),
  metadataBase: new URL(siteOrigin),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-motion="full"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><Suspense fallback={<p style={{padding:32}}>NC LATIN CLUB · Loading / Cargando…</p>}><PublishedSite>{children}</PublishedSite></Suspense></body>
    </html>
  );
}
async function PublishedSite({children}:{children:ReactNode}) {
  const content=await getPublishedContent();
  return <ContentProvider content={content}><SiteProvider><SiteShell>{children}</SiteShell></SiteProvider></ContentProvider>;
}
