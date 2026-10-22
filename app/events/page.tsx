import type { Metadata } from 'next';
import EventsAgenda from '../components/events/events-agenda';
import { pageMetadata } from '../components/site-metadata';
import { Suspense } from 'react';
import { getPublishedContent } from '../cms/public-content';
export const metadata: Metadata = pageMetadata(
  'Events | NC LATIN CLUB',
  'Discover Niagara College gatherings, Latin events around Niagara and cultural dates in the NC Latin Club agenda.',
  '/events',
);
export default function EventsPage() {
  return (
    <Suspense fallback={<p>Loading / Cargando…</p>}>
      <PublishedAgenda />
    </Suspense>
  );
}
async function PublishedAgenda() {
  const { events, culture } = await getPublishedContent();
  return <EventsAgenda entries={[...events, ...culture]} />;
}
