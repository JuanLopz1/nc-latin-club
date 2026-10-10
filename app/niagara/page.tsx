import type { Metadata } from 'next';
import NiagaraDirectory from '../components/niagara/niagara-directory';
import { places } from '../components/niagara/place-data';
export const metadata: Metadata = { title: 'Discover Latin Niagara | NC LATIN CLUB', description: 'Find Latin food, shops and small businesses in Niagara. Explore our local directory and interactive map.' };
export default function NiagaraPage() { return <NiagaraDirectory places={places} />; }
