import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { countries } from '../../components/explore/country-data';
import { culturePages, getCulturePage } from '../../components/explore/culture-data';
import CountryDetail from '../../components/explore/country-detail';
export function generateStaticParams() { return culturePages.map(page => ({ slug: page.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params, page = getCulturePage(slug);
  if (!page) notFound();
  return { title: `${countries.find(c => c.slug === slug)?.name.en} · Explore Our Roots | NC LATIN CLUB`, description: countries.find(c => c.slug === slug)?.intro.en };
}
export default function CultureRoute({ params }: { params: Promise<{ slug: string }> }) { return <Suspense fallback={null}><ResolvedCulture params={params} /></Suspense>; }
async function ResolvedCulture({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params, page = getCulturePage(slug), country = countries.find(c => c.slug === slug);
  if (!page || !country) notFound();
  return <CountryDetail page={page} country={country} />;
}
