import type { Metadata } from 'next';
import { agendaEntries } from '../components/events/agenda-data';
import EventsAgenda from '../components/events/events-agenda';
import { pageMetadata } from '../components/site-metadata';
export const metadata: Metadata = pageMetadata('Events | NC LATIN CLUB', 'Discover Niagara College gatherings, Latin events around Niagara and cultural dates in the NC Latin Club agenda.', '/events');
export default function EventsPage() { return <EventsAgenda entries={agendaEntries} />; }
