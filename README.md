# NC Latin Club

Public website for **NC Latin Club**, an independent cultural community in Niagara, Ontario. The current release is a first homepage prototype with an original illustrated landscape, an editorial scroll through Our Familia, Events, cultural exploration, Latin Niagara, and a welcome section.

The English/Spanish switch, mobile menu, country selection with accessible popups, and Niagara disclosures work locally. The map is an illustrated cultural introduction, not a precise geographic or member-location map. Country articles, verified listings, confirmed events, invitation links, member photography, and a CMS remain future work. The artwork depicts an imaginary landscape; it does not represent a verified real location.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4

## Local development

Requirements: Node.js 20 or newer.

```bash
npm install
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
app/components/ Homepage components, bilingual copy, and scoped styles
public/images/ Static images used by the site
```

`app/page.tsx` renders `app/components/club-home.tsx`. Edit homepage translations in `home-copy.ts` and visual styles in `club-home.module.css`. The language switch changes the page content and document language; localized URLs and translated metadata have not yet been implemented. The development server reloads as you save.

Motion respects `prefers-reduced-motion`. No database, new runtime dependencies, or application secrets are required for this prototype. Build-time Google Font downloads require access to `fonts.googleapis.com` and `fonts.gstatic.com`.

The bilingual Events section follows Our Familia and has a direct menu link. Its current state says “Coming soon” because no confirmed events have been provided. To publish confirmed event cards, add entries to `app/components/club-events.ts` with a unique ID, English/Spanish title, description and venue, an ISO 8601 start timestamp including its UTC offset, and an optional verified HTTPS registration URL. Dates display in Niagara’s `America/Toronto` time zone. An event without a registration URL has no registration button. The interactive calendar and admin event editing remain future work.

The homepage title is **NC LATIN CLUB** in both languages. “Join us” opens the visitor's email application with the club contact and requested introduction filled in; the website does not send email. Public contact and social destinations are centralized in `app/components/club-links.ts`. The Instagram destination is awaiting the official profile URL. The sponsor text identifies NCSAC, as requested by club leadership.

## Requested next stages

These are future requirements, not implemented capabilities:

- A fully interactive cultural map/globe restricted to the Americas from South America through the United States, including Central America and the Caribbean. Country selection should open an accessible country popup, with touch and keyboard alternatives. The current four-country illustration is only a prototype.
- Events as a core section, with a Latin calendar, event details, and confirmed registration links.
- Staff/team profiles using approved names, roles, and photography.
- A photo library with visitor submissions and admin approval before publication.
- News and a richer Instagram experience using the official account and permitted integrations.
- A future minigames page.
- An authenticated admin portal with editing for the existing official logo, all managed images, site copy and translations, events, staff, country content, news, social links, and gallery moderation. Backend and content schemas must be designed before implementation.

The homepage should keep a simple, inviting scroll experience with purposeful movement. Discover Latin Niagara remains part of the approved direction.
