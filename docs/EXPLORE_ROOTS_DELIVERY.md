# Explore Our Roots — delivery record

This records successive deliveries. The latest presentation adjustment below supersedes the earlier stationary default and permanently visible controls.

## Milestone 1: functional prototype

`/explore` and the hub invitation use the existing night palette. A real 3D globe renders the whole planet, highlights the Americas, and supports six initial destinations: Colombia, Brazil, Mexico, Jamaica, Haiti and Curaçao. Search, independent region toggles and the list also select destinations. Zoom/reset remain visible at 320px; rotation is off until the visitor chooses it. Reduced motion disables rotation and camera tweens. The global English/Spanish selector translates the interface and geographic previews.

Camera, filters and destination survive internal navigation. Canvas resources are disposed when Next.js hides the route. The list remains usable when WebGL is unavailable. No audio is automatically loaded or played.

Geography comes from Natural Earth 1:50m countries, public domain. Simplification preserves ring winding, including small islands. Geographic labels are Natural Earth label coordinates, not a tourism or sovereignty claim. The 54-destination package is editorial input; unreviewed cultural drafts, quizzes and media are not published in this prototype.

Verification: 42 unit/regression tests, ESLint, production build, and Chromium/CDP behavior checks. Browser checks cover real WebGL, camera movement, stationary default, opt-in rotation, Curaçao selection, shared locale, focus restoration, independent filters, 320/375/768/1440px widths, reduced motion and disposal on navigation.

## Next batch

Expand to all 54 destinations including individual small territories, add source-supported bilingual cultural pages, and check camera restoration and WebGL fallback. Full cultural drafts and music resources require claim/resource verification. UNESCO/Wikipedia requests currently receive proxy CONNECT 403; a narrow environment network draft has been saved for review/application. Saving the draft does not grant live network access.

This feature is independent of `/niagara` and events/cultural calendar routes, which remain available and unchanged.

## Milestone 2: all 54 destinations and first cultural batch

All 54 destinations are selectable through geometry/markers, bilingual search and the list. Bonaire, Saba and Sint Eustatius share ISO BQ but have separate slugs, geometries and cameras. French Guiana, Guadeloupe and Martinique use Natural Earth 1:10m map units; their duplicate France components are removed from the base layer. The rest of the planet remains visible. Territory status is distinct from cultural identity; Falkland Islands / Islas Malvinas use both names and contextual sovereignty wording.

Four source-supported introductions are published at `/explore/brasil`, `/explore/colombia`, `/explore/mexico` and `/explore/jamaica`. The source and translation review is recorded in [EXPLORE_ROOTS_CONTENT_REVIEW.md](EXPLORE_ROOTS_CONTENT_REVIEW.md). These introductions are not full profiles. Haiti, Curaçao and the other 48 destinations remain geographically accessible without empty cultural pages. Full profiles, authentic imagery and verified music resources are still pending.

### Geography rebuild

Download the public-domain `ne_50m_admin_0_countries.geojson` and `ne_10m_admin_0_map_units.geojson` from [Natural Earth](https://github.com/nvkelso/natural-earth-vector/tree/master/geojson). Run:

```sh
python3 scripts/build-roots-geography.py /path/to/ne_50m_admin_0_countries.geojson /path/to/ne_10m_admin_0_map_units.geojson
```

The script writes the optimized public globe geometry. It preserves winding when simplification would invert a small island, and takes territory boundaries from the source. Country label coordinates also come from Natural Earth; separate BQ island centers are the midpoints of the source island bounding boxes. Silhouettes are derived from the same public-domain data, not photographs.

### Browser verification

Start the production server and run the CDP check against Chromium at `127.0.0.1:9222`:

```sh
CHECK_URL=http://localhost:3000 EXPECT_DESTINATIONS=54 node tests/explore-browser.mjs
```

This supplements `npm test`, `npm run lint` and `npm run build`; screenshots can be saved with `ARTIFACT_DIR`.

Final batch verification: 46/46 native Node tests; ESLint and production build pass. Chromium/CDP passes real canvas selection, explicit choice for overlapping Saba/Sint Eustatius/Saint Martin/Sint Maarten/Saint Barthélemy marker areas, preview focus/Escape return, widths 320–1440, visitor-controlled rotation, reduced motion, locale changes on a cultural page, camera/selection restoration, canvas disposal, and search/list selection with WebGL disabled. HTTP checks confirm the hub, Niagara, events, all four introductions and local geometry respond. Physical-device performance and assistive-technology testing remain pending.

A fresh reviewer identified overlapping island targets and keyboard focus remaining in the offscreen list. Both were reproduced and fixed; the final browser checks cover the corrected flows. Source authenticity beyond the supplied excerpts remains unverified under the current network restrictions.

## Presentation adjustment — 10 October 2026

The founder chose visible rotation on arrival, stopping when the visitor touches the globe or chooses a destination. Initial rotation now runs at globe.gl/OrbitControls speed 0.8; reduced-motion users get a stationary scene. After interaction, only an explicit Rotate action restarts it. Automatic rotation uses no damping inertia, so pausing does not leave a residual spin; manual navigation retains damping when reduced motion is off. Camera and rotation preference still survive internal navigation.

A single bilingual Map options / Opciones del mapa disclosure replaces the always-visible zoom/reset/rotation and region buttons. It starts closed on desktop and mobile. Search, destination count and all 54 list entries stay accessible. The panel supports keyboard activation, Escape/focus return, outside dismissal, 44px controls and scrolling at narrow widths. Choosing a destination closes it so it does not stack over the destination preview. Subtle night lighting and an arrival fade give the globe more presence; the hub entry and geography are retained.

No cultural content or music is added in this adjustment. The four limited introductions and the remaining cultural work retain their previous status.

Verification for this adjustment: 48/48 Node tests, ESLint and production build pass. Chromium checks verify visible initial rotation, stopping on touch, keyboard disclosure/close/focus return, zoom, EN/ES, region combinations, widths 320/375/768/1440 with 44px controls, small-island selection, camera preservation, canvas disposal and WebGL fallback. Desktop and mobile screenshots were inspected.

The broad browser run had one synchronization failure: it inspected the reduced-motion controls immediately after changing the browser media preference, before React applied the change. The test now waits for that applied state. A focused browser rerun passes dynamic reduced-motion changes, a stationary real camera, first arrival with reduced motion already enabled and no runtime exceptions. The other passing cases were not repeated after this test-only correction. Physical-device/assistive-technology review and the cultural content expansion remain pending.

## Club identity, Canada and founder content kit — 10 October 2026 (Toronto)

Canada is now a 55th destination, keeping the original 54 country/territory entries. Its ISO CA polygon was already in the public-domain world geometry; its independent marker uses Natural Earth's source label coordinates (60.324287, -101.9107). It is selectable from the globe, bilingual search and North America list. Canada is not described as a Latin American country. The hub count now reflects 55 destinations.

Header/footer branding uses a transparent adaptation of the founder's second logo. Image generation preserved its general composition and decorative palette, added night-compatible navy/gold edging and removed the blue background. This is an adapted brand illustration, not geographic evidence; the globe still uses Natural Earth. The generated original remains in `/workspace/generated_images/exec-a1565941-8796-4d7d-a78c-b6132c142bc6.png`; the site asset is `/images/brand/nc-latin-club.png`. No new political/ownership claims are inferred from the logo's decorative map.

The four existing culture pages now lead with country names; the limited tradition is presented under Cultural spotlight / Una mirada cultural. Colombia is headed Colombia, with Barranquilla as its spotlight. This changes page framing; it does not complete the national profile or introduce unreviewed additional claims.

The founder chose to supply the full texts, photos and music. [The content kit](country-content/LEEME.md) has 55 Markdown forms, a CSV index and conventions for multiple images/resources. The downloadable working ZIP is `/workspace/artifacts/NC_LATIN_CLUB_PLANTILLAS_55_DESTINOS.zip`. Spanish-only submissions are welcome; English translation and claim/resource review happen before publication. Four cultural spotlights remain published, 51 destinations have no cultural page yet, and full profiles for all 55 remain pending incoming content. Empty public pages and editorial form instructions are not published. Niagara businesses and event/cultural calendars remain independent.

A fresh network check can reach English Wikipedia, although Colombia's tourism site still returns CONNECT 403. This is connectivity evidence only; no new Wikipedia claims or music resources were published in this milestone.

Verification: 50/50 Node tests, ESLint and production build pass. Focused Chromium checks pass header/footer logo loading; home and country-page widths 320/375/1440; all 55 destinations; Canada list focus and native globe click; global Canada/Canadá names; country-first Colombia framing and its EN/ES spotlight. No runtime exceptions. Mobile screenshots were inspected. The ZIP was checked for 55 distinct matching forms, 55 image folders, guide/index and archive integrity. Full browser regression was not repeated after these bounded changes; physical-device and assistive-technology review remain pending.
