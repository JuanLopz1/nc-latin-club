import { NextResponse, type NextRequest } from 'next/server';
import { agendaEntries } from './app/components/events/agenda-data';
import { getCulturePage } from './app/components/explore/culture-data';
import {
  browserLanguage,
  isLanguage,
  languageCookie,
  localizedPath,
  pathLanguage,
  withoutLanguage,
} from './app/translations/routing';
// Reject unknown slugs before the partially prerendered shell commits a 200.
// Uses the same editorial collection as the pages, not a second route list.
export function proxy(request: NextRequest) {
  const locale = pathLanguage(request.nextUrl.pathname);
  if (!locale) {
    const saved = request.cookies.get(languageCookie)?.value;
    const language = isLanguage(saved)
      ? saved
      : browserLanguage(request.headers.get('accept-language'));
    const destination = request.nextUrl.clone();
    destination.pathname = localizedPath(request.nextUrl.pathname, language);
    const response = NextResponse.redirect(destination);
    response.cookies.set(languageCookie, language, {
      path: '/',
      maxAge: 31536000,
      sameSite: 'lax',
      secure: request.nextUrl.protocol === 'https:',
    });
    response.headers.set('Cache-Control', 'private, no-store');
    response.headers.set('Vary', 'Accept-Language, Cookie');
    return response;
  }
  const pathname = withoutLanguage(request.nextUrl.pathname);
  if (!/^\/(events|explore)\/[^/]+\/?$/.test(pathname)) return NextResponse.next();
  if (
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
    return import('./app/cms/public-content').then(async ({ readPublishedContent }) => {
      const content = await readPublishedContent();
      return checkRoute(
        request,
        pathname.startsWith('/explore/')
          ? content.pages
          : [...content.events, ...content.culture],
      );
    });
  return checkRoute(request);
}
function checkRoute(request: NextRequest, entries?: readonly { slug: string }[]) {
  const pathname = withoutLanguage(request.nextUrl.pathname);
  const culture = pathname.startsWith('/explore/');
  const prefix = culture ? '/explore/' : '/events/';
  let slug: string;
  try {
    slug = decodeURIComponent(pathname.slice(prefix.length).replace(/\/$/, ''));
  } catch {
    slug = '';
  }
  const known = entries
    ? entries.some((entry) => entry.slug === slug)
    : culture
      ? getCulturePage(slug)
      : agendaEntries.some((entry) => entry.slug === slug);
  if (known) return NextResponse.next();
  return NextResponse.rewrite(
    new URL(`/${pathLanguage(request.nextUrl.pathname)}/_not-found`, request.url),
    { status: 404 },
  );
}
export const config = {
  matcher: [
    '/((?!api(?:/|$)|_next(?:/|$)|_vercel(?:/|$)|images(?:/|$)|audio(?:/|$)|data(?:/|$)|downloads(?:/|$)|icon(?:/|$)|apple-icon(?:/|$)|opengraph-image(?:/|$)|twitter-image(?:/|$)|.*\\..*).*)',
  ],
};
