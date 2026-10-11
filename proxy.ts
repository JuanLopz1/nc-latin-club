import { NextResponse, type NextRequest } from 'next/server';
import { agendaEntries } from './app/components/events/agenda-data';
import { getCulturePage } from './app/components/explore/culture-data';
// Reject unknown slugs before the partially prerendered shell commits a 200.
// Uses the same editorial collection as the pages, not a second route list.
export function proxy(request: NextRequest) {
  if(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY) return import('./app/cms/public-content').then(async ({readPublishedContent})=>{
    const content=await readPublishedContent();
    return checkRoute(request,request.nextUrl.pathname.startsWith('/explore/')?content.pages:[...content.events,...content.culture]);
  });
  return checkRoute(request);
}
function checkRoute(request:NextRequest, entries?:readonly {slug:string}[]) {
  const culture = request.nextUrl.pathname.startsWith('/explore/');
  const prefix = culture ? '/explore/' : '/events/';
  let slug: string;
  try { slug = decodeURIComponent(request.nextUrl.pathname.slice(prefix.length)); } catch { slug = ''; }
  const known = entries ? entries.some(entry=>entry.slug===slug) : culture ? getCulturePage(slug) : agendaEntries.some(entry => entry.slug === slug);
  if (known) return NextResponse.next();
  return NextResponse.rewrite(new URL('/_not-found', request.url), { status: 404 });
}
export const config = { matcher: ['/events/:slug', '/explore/:slug'] };
