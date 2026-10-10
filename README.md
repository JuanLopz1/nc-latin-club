# NC Latin Club

Public website for **NC Latin Club**, an independent cultural community in Niagara, Ontario. The current homepage prototype follows the founder’s chosen direction: an urban night festival with lights and energy, bold typography and a midnight/yellow/coral/cyan palette. It scrolls through Our Familia, Events, cultural exploration, Latin Niagara, and a welcome section.

The English/Spanish switch, shared mobile menu, country selection with accessible popups, and Niagara disclosures work locally. `/events` provides At NC, Out of NC and Latin dates, upcoming/past lists, an animated monthly calendar and individual details with optional image galleries. Language and agenda selections survive internal navigation. The map is an illustrated cultural introduction, not a precise geographic or member-location map. Country articles, verified regional listings, invitation links, member photography, and a CMS remain future work. The original hero illustration in `public/images/latin-night-festival.png` depicts an imaginary street festival and fictional people; it is not a photograph or an announcement of a real club event. The earlier artwork remains available in `public/images/` and Git history.

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

The homepage, `/events` and `/events/[slug]` use one editorial collection, `app/components/events/agenda-data.ts`. Latin Fiesta! is the only public entry: October 23, 2026 at 20:00 until October 24 at 00:00, The Core, organized by International. The founder provided NC Engage screenshots and its link on October 10, 2026. Prices and availability are not synchronized with the organizer.

At NC holds college events; Out of NC is limited to Niagara and requires a confirmed city and organizer. Latin dates holds verified cultural dates, without tickets or event organizers. Regional and cultural categories currently show honest empty states because public research connections were blocked. See [research evidence](docs/EVENTS_RESEARCH.md).

To add a confirmed entry, follow `EventEntry` or `CulturalEntry` in `app/components/events/event-types.ts`. Supply bilingual text, a unique lowercase slug, HTTPS source, editorial review date and provenance. Events require an ISO timestamp with an explicit offset and an organizer; the end and registration link are optional. Cancelled/rescheduled events require a bilingual notice; cancelled events have no registration action. Cultural dates use a specific year's `YYYY-MM-DD` plus scope and source; no annual recurrence is inferred.

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

The homepage only highlights upcoming At NC entries, using the same runtime clock and temporal rules as the agenda; cancelled entries show their notice and no registration action. Dates display in `America/Toronto`. The calendar uses six Monday-start weeks and the visitor's runtime clock for Niagara's today. An event ending exactly at midnight occupies only its preceding day; its detail still displays the complete end date. A cultural date stays upcoming throughout its local day. Calendar view includes all entries in the chosen category; list view selects upcoming or past. The details return action preserves the category, view, month and selected day; a direct detail entry returns to its own category.

Validation runs when the collection loads; `npm run test:events` also checks referenced media files. Run tests, lint and a fresh build before publishing. `proxy.ts` checks the same collection before streaming an unknown detail, preserving HTTP 404 with Next.js Cache Components. A future CMS must keep this routing guard aligned with its published collection.

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
