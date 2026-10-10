import type { Metadata } from 'next';
import { agendaEntries } from '../components/events/agenda-data';
import EventsAgenda from '../components/events/events-agenda';
export const metadata: Metadata = { title: 'Events | NC LATIN CLUB', description: 'Discover Niagara College gatherings, Latin events around Niagara and cultural dates in the NC Latin Club agenda.' };
export default function EventsPage() { return <EventsAgenda entries={agendaEntries} />; }
