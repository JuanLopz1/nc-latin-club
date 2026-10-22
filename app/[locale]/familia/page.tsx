import { pageMetadataTranslations } from '../../translations/page-metadata-translations';
import type { Language } from '../../translations/language';
import FamiliaPage from '../../components/familia-page';
import { pageMetadata } from '../../components/site-metadata';
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Language }>;
}) {
  const { locale } = await params;
  const metadata = pageMetadataTranslations[locale].familia;
  return pageMetadata(
    metadata.title,
    metadata.description,
    '/familia',
    undefined,
    locale,
  );
}
export default function Page() {
  return <FamiliaPage />;
}
