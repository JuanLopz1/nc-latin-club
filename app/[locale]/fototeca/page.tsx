import { pageMetadataTranslations } from '../../translations/page-metadata-translations';
import type { Language } from '../../translations/language';
import PhotoLibrary from '../../components/gallery/photo-library';
import { pageMetadata } from '../../components/site-metadata';
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Language }>;
}) {
  const { locale } = await params;
  const metadata = pageMetadataTranslations[locale].fototeca;
  return pageMetadata(
    metadata.title,
    metadata.description,
    '/fototeca',
    undefined,
    locale,
  );
}
export default function Page() {
  return <PhotoLibrary />;
}
