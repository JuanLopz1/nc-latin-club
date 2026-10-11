import PhotoLibrary from '../components/gallery/photo-library';
import {pageMetadata} from '../components/site-metadata';
export const metadata=pageMetadata('Fototeca | NC LATIN CLUB','Our nights, our people, our memories. Explore the NC Latin Club photo room and share a moment with the familia.','/fototeca');
export default function Page(){return <PhotoLibrary/>;}
