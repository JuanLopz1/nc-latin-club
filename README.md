# NC Latin Club

Public website for **NC Latin Club**, an independent cultural community in Niagara, Ontario. The current homepage prototype follows the founder’s chosen direction: an urban night festival with lights and energy, bold typography and a midnight/yellow/coral/cyan palette. It scrolls through Our Familia, Events, cultural exploration, Latin Niagara, and a welcome section.

The English/Spanish switch, shared mobile menu, country selection with accessible popups, and Niagara disclosures work locally. `/events` provides At NC, Out of NC and Latin dates, upcoming/past lists, an animated monthly calendar and individual details with optional image galleries. Language and agenda selections survive internal navigation. The map is an illustrated cultural introduction, not a precise geographic or member-location map. Country articles, invitation links, member photography, and a CMS remain future work. The original hero illustration in `public/images/latin-night-festival.png` depicts an imaginary street festival and fictional people; it is not a photograph or an announcement of a real club event. The earlier artwork remains available in `public/images/` and Git history.

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
| `npm run test:events` | Check dates, validation, routing guard and gallery rendering |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |

## Project layout

```text
app/           Routes, layout, and global styles
app/components/ Shared shell, homepage, events, bilingual copy, and scoped styles
public/images/ Static images used by the site
```

`app/page.tsx` renders `app/components/club-home.tsx`. Edit homepage translations in `home-copy.ts` and visual styles in `club-home.module.css`. The language switch changes the page content and document language; localized URLs and translated metadata have not yet been implemented. The development server reloads as you save.

Motion respects `prefers-reduced-motion`. No database, new runtime dependencies, or application secrets are required for this prototype. Build-time Google Font downloads require access to `fonts.googleapis.com` and `fonts.gstatic.com`.

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

The homepage only highlights upcoming At NC entries, using the same runtime clock and temporal rules as the agenda; cancelled entries show their notice and no registration action. Dates display in `America/Toronto`. The calendar uses six Monday-start weeks and the visitor's runtime clock for Niagara's today. An event ending exactly at midnight occupies only its preceding day; its detail still displays the complete end date. A cultural range stays upcoming through its inclusive last Niagara day. Date-only events with unknown hours also stay upcoming through their inclusive last day; daily timed schedules archive after their last documented endpoint; an unpublished final end keeps the festival upcoming through its inclusive last day. The agenda starts with all three categories selected. Category buttons independently toggle inclusion; All selects every category and Deselect all clears the selection. Multiple categories form a union without duplicate entries; none gives a helpful empty state. Calendar view uses the selected categories, with whole-month observances in their separate block; list view selects upcoming or past. The details return action preserves the selected categories, view, month and selected day; a fresh direct detail entry returns with all categories selected.

Validation runs when the collection loads; `npm run test:events` also checks referenced media files. Run `npm test` (31 checks), lint and a fresh build before publishing. `proxy.ts` checks the same collection before streaming an unknown detail, preserving HTTP 404 with Next.js Cache Components. A future CMS must keep this routing guard aligned with its published collection.

This release displays media from local files. Uploading, ordering and replacing images through an admin interface still requires the future authenticated portal and storage. Filters are held in browser state, not shareable query parameters. A full reload begins in English; localized metadata and `/es` routes remain future work. [QA evidence](docs/EVENTS_QA.md) records browser and fixture checks.

The homepage title is **NC LATIN CLUB** in both languages. “Join us” opens the visitor's email application with the club contact and requested introduction filled in; the website does not send email. Public contact and social destinations are centralized in `app/components/club-links.ts`. “Stay in the loop” opens the official Instagram profile, [@nclat1nclub](https://www.instagram.com/nclat1nclub/), in a new tab. The sponsor text identifies NCSAC, as requested by club leadership.

## Requested next stages

See [the roadmap](docs/ROADMAP.md) for priorities, milestone acceptance criteria, dependencies, and remaining decisions. It reflects the founder’s latest preferences and distinguishes implemented behavior from planned capabilities.

These are future requirements, not implemented capabilities:

- A fully interactive cultural map/globe restricted to the Americas from South America through the United States, including Central America and the Caribbean. Country selection should open an accessible country popup, with touch and keyboard alternatives. The current four-country illustration is only a prototype.
- Staff/team profiles using approved names, roles, and photography.
- A photo library with visitor submissions and admin approval before publication.
- News and a richer Instagram experience using the official account and permitted integrations.
- A future minigames page.
- An authenticated admin portal with editing for the existing official logo, all managed images, site copy and translations, events, staff, country content, news, social links, and gallery moderation. Backend and content schemas must be designed before implementation.

The homepage should keep a simple, inviting scroll experience with purposeful movement. Discover Latin Niagara remains part of the approved direction.

## Preview delivery

Approved milestones are committed and pushed to `origin/work`; `main` stays unchanged. The existing Vercel Git integration normally creates a preview for each push without a manual redeploy. Once that deployment is Ready, reload the branch preview and open `/events`. Deployment status was not independently accessible from this cloud environment.

## Latin Niagara directory

`/niagara` contains 21 selected businesses and 16 public destinations at 15 points. cocobar uses the founder-confirmed 155 St Paul Crescent address. La Paisana grocery store and restaurant remain separate with unit-specific Maps destinations and a shared-pin selector. Search covers names, cities, descriptions and documented offerings without accents; city/category/mode filters allow multiple checked options and start with all options selected. Options combine within each filter; filters intersect with each other and search. Emptying any filter gives zero results; Clear filters restores all options. Selecting a card or pin expands that original card, with one title, description and set of actions. Selecting another spot collapses the previous one; toggling or Escape closes it. Commercial action URLs are deduplicated. Businesses without a public destination retain their cards and documented online channels, without pins or directions.

Curated public data: `app/components/niagara/places.json`. Do not publish raw private editorial records, production/home addresses or inferred owner nationalities. Resolve a public address and reviewed coordinates together before enabling navigation. Pending commercial channels are labelled transparently. [Candidate review](docs/NIAGARA_RESEARCH.md) preserves the ten individual research outcomes and closure concerns.

Leaflet 1.9.4 loads only on the Niagara client. OSM attribution stays visible; wheel zoom is disabled to preserve page scrolling. Tile/import failures retain the entire directory and Maps actions. This environment blocked public business sources and OSM tiles with CONNECT403, so live provider availability remains unverified. Additional domains were saved to the environment configuration draft; this does not apply or publish that draft automatically.

Browser regression: with a fresh app and Chromium CDP at port9222, run `CHECK_URL=http://localhost:<port> node tests/niagara-browser.mjs`. It checks detail visibility, focus order, Escape and selection from the map on mobile with reduced motion.

### Future administration of Niagara

The public directory still reads reviewed data from the repository. The future authenticated admin portal will add/create, edit, archive/remove businesses and manage approved images and searchable `#tags`. See [the admin scope](docs/ROADMAP.md#niagara-admin-y-etiquetas--alcance-futuro). Public create/edit/delete and hashtag search are not implemented in this milestone.

Browser regression checks (fresh `npm run build` + running production server, Chromium CDP on 9222): `CHECK_URL=http://localhost:3025 node tests/agenda-directory-browser.mjs` and `CHECK_URL=http://localhost:3025 node tests/niagara-browser.mjs`. Optional `ARTIFACT_DIR` saves screenshots outside the checkout.
