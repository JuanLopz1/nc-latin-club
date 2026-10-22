import type { Metadata } from 'next';
import NiagaraDirectory from '../components/niagara/niagara-directory';
import { Suspense } from 'react';
import { getPublishedContent } from '../cms/public-content';
import { pageMetadata } from '../components/site-metadata';
export const metadata: Metadata = pageMetadata(
  'Discover Latin Niagara | NC LATIN CLUB',
  'Find Latin food, shops and small businesses in Niagara. Explore our local directory and interactive map.',
  '/niagara',
);
export default function NiagaraPage() {
  return (
    <Suspense fallback={<p>Loading / Cargando…</p>}>
      <PublishedDirectory />
    </Suspense>
  );
}
async function PublishedDirectory() {
  const { places } = await getPublishedContent();
  return <NiagaraDirectory places={places} />;
}
