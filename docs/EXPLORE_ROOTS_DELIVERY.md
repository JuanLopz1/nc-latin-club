# Explore Our Roots — delivery record

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
