import { pageMetadataTranslations } from '../../translations/page-metadata-translations';
import type { Language } from '../../translations/language';
import ExploreExperience from '../../components/explore/explore-experience';
import { countries } from '../../components/explore/country-data';
import { pageMetadata } from '../../components/site-metadata';
import { Suspense } from 'react';
import { getPublishedContent } from '../../cms/public-content';
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Language }>;
}) {
  const { locale } = await params;
  const metadata = pageMetadataTranslations[locale].explore;
  return pageMetadata(
    metadata.title,
    metadata.description,
    '/explore',
    undefined,
    locale,
  );
}
export default function ExplorePage() {
  return (
    <Suspense fallback={<p>NC LATIN CLUB</p>}>
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
