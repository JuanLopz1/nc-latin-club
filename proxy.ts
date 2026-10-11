import { NextResponse, type NextRequest } from 'next/server';
import { agendaEntries } from './app/components/events/agenda-data';
import { getCulturePage } from './app/components/explore/culture-data';
// Reject unknown slugs before the partially prerendered shell commits a 200.
// Uses the same editorial collection as the pages, not a second route list.
export function proxy(request: NextRequest) {
  const culture = request.nextUrl.pathname.startsWith('/explore/');
  const prefix = culture ? '/explore/' : '/events/';
  let slug: string;
  try { slug = decodeURIComponent(request.nextUrl.pathname.slice(prefix.length)); } catch { slug = ''; }
  const known = culture ? getCulturePage(slug) : agendaEntries.some(entry => entry.slug === slug);
  if (known) return NextResponse.next();
  return NextResponse.rewrite(new URL('/_not-found', request.url), { status: 404 });
}
export const config = { matcher: ['/events/:slug', '/explore/:slug'] };
