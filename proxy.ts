import { NextResponse, type NextRequest } from 'next/server';
import { agendaEntries } from './app/components/events/agenda-data';
// Reject unknown slugs before the partially prerendered shell commits a 200.
// Uses the same editorial collection as the pages, not a second route list.
export function proxy(request: NextRequest) {
  let slug: string;
  try { slug = decodeURIComponent(request.nextUrl.pathname.slice('/events/'.length)); } catch { slug = ''; }
  if (agendaEntries.some(entry => entry.slug === slug)) return NextResponse.next();
  return NextResponse.rewrite(new URL('/_not-found', request.url), { status: 404 });
}
export const config = { matcher: '/events/:slug' };
