import { pageMetadataTranslations } from '../../translations/page-metadata-translations';
import type { Language } from '../../translations/language';
import EventsAgenda from '../../components/events/events-agenda';
import { pageMetadata } from '../../components/site-metadata';
import { Suspense } from 'react';
import { getPublishedContent } from '../../cms/public-content';
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Language }>;
}) {
  const { locale } = await params;
  const metadata = pageMetadataTranslations[locale].events;
  return pageMetadata(metadata.title, metadata.description, '/events', undefined, locale);
}
export default function EventsPage() {
  return (
    <Suspense fallback={<p>NC LATIN CLUB</p>}>
      <PublishedAgenda />
    </Suspense>
  );
}
async function PublishedAgenda() {
  const { events, culture } = await getPublishedContent();
  return <EventsAgenda entries={[...events, ...culture]} />;
}
