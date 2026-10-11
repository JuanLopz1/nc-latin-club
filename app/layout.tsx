import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteProvider } from "./components/site-context";
import SiteShell from "./components/site-shell";
import { pageMetadata, siteOrigin } from './components/site-metadata';

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
      <body className="min-h-full flex flex-col"><SiteProvider><SiteShell>{children}</SiteShell></SiteProvider></body>
    </html>
  );
}
