import type { Metadata } from 'next';
import ExploreExperience from '../components/explore/explore-experience';
import { countries } from '../components/explore/country-data';
import { pageMetadata } from '../components/site-metadata';
import { Suspense } from 'react';
import { getPublishedContent } from '../cms/public-content';
export const metadata: Metadata = pageMetadata(
  'Explore Our Roots | NC LATIN CLUB',
  'Explore the Americas through an interactive globe. Many places. One familia.',
  '/explore',
);
export default function ExplorePage() {
  return (
    <Suspense fallback={<p>Loading / Cargando…</p>}>
      <PublishedExplorer />
    </Suspense>
  );
}
async function PublishedExplorer() {
  const { pages } = await getPublishedContent();
  return (
    <ExploreExperience
      countries={countries.map((c) => ({
        ...c,
        culturalStatus: pages.some((p) => p.slug === c.slug) ? 'reviewed' : 'pending',
      }))}
    />
  );
}
