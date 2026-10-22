import { pageMetadataTranslations } from '../../translations/page-metadata-translations';
import type { Language } from '../../translations/language';
import NiagaraDirectory from '../../components/niagara/niagara-directory';
import { Suspense } from 'react';
import { getPublishedContent } from '../../cms/public-content';
import { pageMetadata } from '../../components/site-metadata';
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Language }>;
}) {
  const { locale } = await params;
  const metadata = pageMetadataTranslations[locale].niagara;
  return pageMetadata(
    metadata.title,
    metadata.description,
    '/niagara',
    undefined,
    locale,
  );
}
export default function NiagaraPage() {
  return (
    <Suspense fallback={<p>NC LATIN CLUB</p>}>
      <PublishedDirectory />
    </Suspense>
  );
}
async function PublishedDirectory() {
  const { places } = await getPublishedContent();
  return <NiagaraDirectory places={places} />;
}
