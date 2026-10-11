import type { Metadata } from 'next';
import ExploreExperience from '../components/explore/explore-experience';
import { countries } from '../components/explore/country-data';
import { pageMetadata } from '../components/site-metadata';
export const metadata: Metadata = pageMetadata('Explore Our Roots | NC LATIN CLUB', 'Explore the Americas through an interactive globe. Many places. One familia.', '/explore');
export default function ExplorePage() { return <ExploreExperience countries={countries} />; }
