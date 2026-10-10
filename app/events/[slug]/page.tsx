import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { agendaEntries } from '../../components/events/agenda-data';
import EventDetail, { EventDetailLoading } from '../../components/events/event-detail';
export function generateStaticParams() { return agendaEntries.map(entry => ({ slug: entry.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = agendaEntries.find(item => item.slug === slug);
  if (!entry) notFound();
  return { title: `${entry.title.en} | NC LATIN CLUB`, description: entry.description.en };
}
export default function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  return <Suspense fallback={<EventDetailLoading />}><ResolvedEvent params={params} /></Suspense>;
}
async function ResolvedEvent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = agendaEntries.find(item => item.slug === slug);
  if (!entry) notFound();
  return <EventDetail entry={entry} />;
}
