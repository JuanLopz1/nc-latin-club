import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { agendaEntries } from '../../components/events/agenda-data';
import { pageMetadata } from '../../components/site-metadata';
import EventDetail, { EventDetailLoading } from '../../components/events/event-detail';
import { getPublishedContent } from '../../cms/public-content';
export function generateStaticParams() {
  return agendaEntries.map((entry) => ({ slug: entry.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { events, culture } = await getPublishedContent();
  const entry = [...events, ...culture].find((item) => item.slug === slug);
  if (!entry) notFound();
  return pageMetadata(
    `${entry.title.en} | NC LATIN CLUB`,
    entry.description.en,
    `/events/${entry.slug}`,
    entry.id === 'latin-fiesta-2026' ? '/images/latin-night-festival.png' : undefined,
  );
}
export default function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<EventDetailLoading />}>
      <ResolvedEvent params={params} />
    </Suspense>
  );
}
async function ResolvedEvent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { events, culture } = await getPublishedContent();
  const entry = [...events, ...culture].find((item) => item.slug === slug);
  if (!entry) notFound();
  return <EventDetail entry={entry} />;
}
