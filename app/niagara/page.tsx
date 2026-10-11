import type { Metadata } from 'next';
import NiagaraDirectory from '../components/niagara/niagara-directory';
import { places } from '../components/niagara/place-data';
import { pageMetadata } from '../components/site-metadata';
export const metadata: Metadata = pageMetadata('Discover Latin Niagara | NC LATIN CLUB', 'Find Latin food, shops and small businesses in Niagara. Explore our local directory and interactive map.', '/niagara');
export default function NiagaraPage() { return <NiagaraDirectory places={places} />; }
