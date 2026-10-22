import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { countries } from '../../components/explore/country-data';
import { culturePages } from '../../components/explore/culture-data';
import CountryDetail from '../../components/explore/country-detail';
import { pageMetadata } from '../../components/site-metadata';
import { getPublishedContent } from '../../cms/public-content';
export function generateStaticParams() {
  return culturePages.map((page) => ({ slug: page.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { pages } = await getPublishedContent();
  const page = pages.find((p) => p.slug === slug);
  if (!page) notFound();
  return pageMetadata(
    `${countries.find((c) => c.slug === slug)?.name.en} · Explore Our Roots | NC LATIN CLUB`,
    page.introduction.en,
    `/explore/${slug}`,
  );
}
export default function CultureRoute({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={null}>
      <ResolvedCulture params={params} />
    </Suspense>
  );
}
async function ResolvedCulture({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { pages } = await getPublishedContent();
  const page = pages.find((p) => p.slug === slug);
  const country = countries.find((c) => c.slug === slug);
  if (!page || !country) notFound();
  return <CountryDetail page={page} country={country} />;
}
