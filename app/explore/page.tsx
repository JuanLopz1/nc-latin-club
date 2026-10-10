import type { Metadata } from 'next';
import ExploreExperience from '../components/explore/explore-experience';
import { countries } from '../components/explore/country-data';
export const metadata: Metadata = { title: 'Explore Our Roots | NC LATIN CLUB', description: 'Explore the Americas through an interactive globe. Many places. One familia.' };
export default function ExplorePage() { return <ExploreExperience countries={countries} />; }
