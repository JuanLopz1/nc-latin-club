import FamiliaPage from '../components/familia-page';
import { pageMetadata } from '../components/site-metadata';
export const metadata = pageMetadata(
  'Our Familia | NC LATIN CLUB',
  'Different roots. One familia. Discover the independent cultural community of NC Latin Club in Niagara.',
  '/familia',
);
export default function Page() {
  return <FamiliaPage />;
}
