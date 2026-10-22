# NC Latin Club

Public website for **NC Latin Club**, an independent cultural community in Niagara, Ontario. The current homepage prototype follows the founder’s chosen direction: an urban night festival with lights and energy, bold typography and a midnight/yellow/coral/cyan palette. It scrolls through Our Familia, Events, cultural exploration, Latin Niagara, and a welcome section.

The English/Spanish switch, shared mobile menu, interactive globe with 55 destinations, and Niagara directory work locally. `/events` provides At NC, Out of NC and Latin dates, upcoming/past lists, an animated monthly calendar and individual details with optional image galleries. Language and agenda selections persist in the browser. All 55 destinations have bilingual cultural pages. The authenticated `/admin` panel now manages existing site content, with private drafts, publication, image uploads and history. It requires a Supabase Free project: follow [ADMIN_SETUP.md](docs/ADMIN_SETUP.md). Until configured, the public site uses reviewed repository defaults and the panel shows setup instructions. Visitor photo submissions remain future work. The original hero illustration in `public/images/latin-night-festival.png` depicts an imaginary street festival and fictional people; it is not a photograph or an announcement of a real club event. The earlier artwork remains available in `public/images/` and Git history.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4

## Local development

Requirements: Node.js 20.9 or newer; this delivery was checked on Node.js 24.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run lint` | Run ESLint |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |

## Project layout

```text
app/           Routes, layout, and global styles
app/components/ Shared shell, homepage, events, bilingual copy, and scoped styles
public/images/ Static images used by the site
```

`app/page.tsx` renders `app/components/club-home.tsx`. Edit homepage translations in `app/translations/home-translations.ts` and visual styles in `club-home.module.css`. The language switch changes the page content and document language; localized URLs and translated metadata have not yet been implemented. The development server reloads as you save.

Motion respects the visitor’s motion settings. Public repository defaults require no credentials. Online administration requires the three server environment variables in `.env.example`; secrets must stay outside Git. The existing sharp package is declared directly to sanitize uploaded images. Build-time Google Font downloads require access to `fonts.googleapis.com` and `fonts.gstatic.com`.

## Events and images

The homepage, `/events` and `/events/[slug]` share the collection in `app/components/events/agenda-data.ts`. It contains Latin Fiesta (founder-provided NC Engage screenshots), 11 researched external events and 225 cultural occurrences for 2026/2027 from the founder’s package. `researched-events.json` and `cultural-entries.json` are curated public projections; original research files remain outside the checkout.

At NC holds college events. Out of NC contains Niagara events and selected Burlington/Toronto festivals, with explicit city and organizer. Latin dates contains country-specific cultural references, distinct from local events and Ontario statutory holidays. Supplied research is identified as user-provided evidence, rather than a new live lookup. See [research evidence](docs/EVENTS_RESEARCH.md).

Entries require bilingual title/description, unique slug, HTTPS source and review date. Timed events use offset ISO `startsAt`/optional `endsAt`. Festivals may use `dateSpan: { start, end }` with inclusive dates and optional `sessions` for actual published start/end times and per-session tickets. Unknown hours remain date-only. Cultural dates use `date` and optional inclusive `endDate`. A whole-month observance explicitly sets `calendarDisplay: "month"`; validation requires the first and last day of one month. It appears once in the calendar’s “This month” block with a story link, without daily badges or daily result cards. Short cultural ranges remain on each actual day. Cancelled/rescheduled events require a notice; cancelled events have no registration actions. `links` and `note` preserve additional sources and documented discrepancies.

Images are optional. Put authorized files in `public/images/events/` and add them in display order to the entry's `images` array:

```ts
images: [
  {
    src: '/images/events/approved-poster.webp',
    width: 1200,
    height: 800,
    alt: { en: 'Describe the approved poster', es: 'Describe el cartel aprobado' },
    caption: { en: 'Optional caption', es: 'Pie opcional' },
  },
  // Add more authorized images here with their own dimensions and translations.
],
```

The first image becomes the agenda card cover. The detail has swipe, keyboard controls and thumbnails for multiple images; one image has no carousel controls; no images uses a graphic date poster. Failed images show a readable fallback. The example path must refer to an actual file before publishing. Current Latin Fiesta has no supplied poster or photos. The site's imagined festival hero is not used as event photography.

The homepage highlights up to three upcoming events: At NC first, then Ontario Niagara, then outings outside the region; each group is chronological. Cancelled and expired events are omitted from this selection, while agenda/details retain cancellation notices. New events fill the available slots automatically using the shared runtime clock and temporal rules. Dates display in `America/Toronto`. The calendar uses six Monday-start weeks and the visitor's runtime clock for Niagara's today. An event ending exactly at midnight occupies only its preceding day; its detail still displays the complete end date. A cultural range stays upcoming through its inclusive last Niagara day. Date-only events with unknown hours also stay upcoming through their inclusive last day; daily timed schedules archive after their last documented endpoint; an unpublished final end keeps the festival upcoming through its inclusive last day. The agenda starts with all three categories selected. Category buttons independently toggle inclusion; All selects every category and Deselect all clears the selection. Multiple categories form a union without duplicate entries; none gives a helpful empty state. Calendar view uses the selected categories, with whole-month observances in their separate block; list view selects upcoming or past. The details return action preserves the selected categories, view, month and selected day; a fresh direct detail entry returns with all categories selected.

Validation runs when the collection loads. `proxy.ts` checks the same collection before streaming an unknown detail, preserving HTTP 404 with Next.js Cache Components. With Supabase configured, the routing guard reads the same published collections as the public pages.

The authenticated panel can upload, order, replace and remove images once Supabase is connected. Private uploads are served only to editors until published. Filters are held in browser state, not shareable query parameters. English is the default; a chosen language persists after reload; localized metadata and `/es` routes remain future work. [QA evidence](docs/EVENTS_QA.md) records browser and fixture checks.

The homepage title is **NC LATIN CLUB** in both languages. “Join us” opens the visitor's email application with the club contact and requested introduction filled in; the website does not send email. Public contact and social destinations are centralized in `app/components/club-links.ts`. “Stay in the loop” opens the official Instagram profile, [@nclat1nclub](https://www.instagram.com/nclat1nclub/), in a new tab. The sponsor text identifies NCSAC, as requested by club leadership.

## Retro photo library

`/fototeca` presents published photographs as an 80s album with filters, keyboard-accessible lightbox and an original synth mix started by the visitor. Visitors can submit 1–8 JPEG/PNG/WebP images, each up to 3 MiB, with caption, album, optional credit and permission confirmation. Each image uses a separate request within Vercel’s body limit. Pending images stay private. Assigned editors review submissions into a private gallery draft; an admin reviews EN/ES captions and publishes. Admin image fields show thumbnails and replacement controls instead of exposing media paths.

Existing Supabase installations require the additive [gallery upgrade](docs/PHOTOTECA_SETUP.md). [Delivery evidence and limits](docs/PHOTOTECA_DELIVERY.md) distinguish local verification from activation on the actual project. Spotify and Instagram frames appear directly, with external links as fallbacks; audio still requires visitor interaction. Spotify frames stop when hidden or when leaving their route. Niagara’s homepage carousel resumes after pointer interaction; the globe owns vertical touch gestures inside its canvas.

## Requested next stages

See [the roadmap](docs/ROADMAP.md) for priorities, milestone acceptance criteria, dependencies, and remaining decisions. It reflects the founder’s latest preferences and distinguishes implemented behavior from planned capabilities.

These are future requirements, not implemented capabilities:

- Staff/team profiles using approved names, roles, and photography.
- News and a richer Instagram experience using the official account and permitted integrations.
- A future minigames page.
- Admin management of future staff/news sections. The existing portal manages the logo, homepage copy, contact/social/Spotify links, events, cultural dates, Niagara businesses, country pages and moderated gallery.

The homepage should keep a simple, inviting scroll experience with purposeful movement. Discover Latin Niagara remains part of the approved direction.

## Preview delivery

Approved milestones are committed and pushed to `origin/work`; `main` stays unchanged. The existing Vercel Git integration normally creates a preview for each push without a manual redeploy. Once that deployment is Ready, reload the branch preview and open `/events`. Deployment status was not independently accessible from this cloud environment.

## Latin Niagara directory

`/niagara` contains 21 selected businesses and 16 public destinations at 15 points. cocobar uses the founder-confirmed 155 St Paul Crescent address. La Paisana grocery store and restaurant remain separate with unit-specific Maps destinations and a shared-pin selector. Search covers names, cities, descriptions and documented offerings without accents; city/category/mode filters allow multiple checked options and start with all options selected. Options combine within each filter; filters intersect with each other and search. Emptying any filter gives zero results; Clear filters restores all options. Selecting a card or pin expands that original card, with one title, description and set of actions. Selecting another spot collapses the previous one; toggling or Escape closes it. Commercial action URLs are deduplicated. Businesses without a public destination retain their cards and documented online channels, without pins or directions.

Curated public data: `app/components/niagara/places.json`. Do not publish raw private editorial records, production/home addresses or inferred owner nationalities. Resolve a public address and reviewed coordinates together before enabling navigation. Pending commercial channels are labelled transparently. [Candidate review](docs/NIAGARA_RESEARCH.md) preserves the ten individual research outcomes and closure concerns.

Leaflet 1.9.4 loads only on the Niagara client. OSM attribution stays visible; wheel zoom is disabled to preserve page scrolling. Tile/import failures retain the entire directory and Maps actions. This environment blocked public business sources and OSM tiles with CONNECT403, so live provider availability remains unverified. Additional domains were saved to the environment configuration draft; this does not apply or publish that draft automatically.


### Administration of Niagara

With Supabase connected, `/admin` can create, edit, duplicate and remove business records, upload approved images and maintain searchable offerings. Draft removal changes the directory only after publication. Repository data remains the fallback before first publication. A dedicated hashtag model and public submissions remain future work.



## Code organization

- `app/translations/`: English and Spanish interface catalogs. `language.ts` defines the shared language type.
- `app/components/`: React sections and their CSS modules. Components select a catalog with `[language]`; published club content still comes from `useContent()`.
- `app/cms/`: published content, validation, authentication and media services.
- `app/admin/`: content editors and administration screens.
- `app/api/`: server endpoints.

Run `npm run format` to expand JSX, separate declarations and maintain consistent indentation. This command only formats files; it does not run tests or build the application.
