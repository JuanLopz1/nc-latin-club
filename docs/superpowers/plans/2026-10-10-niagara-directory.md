# Niagara Directory Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task by task; the founder explicitly authorized continuous native execution.

**Goal:** Build /niagara and a three-card hub entry from the founder-selected places.

**Architecture:** Public curated data, pure filters/directions, Leaflet loaded in a client effect; directory independent of tile availability.

**Tech Stack:** Next 16, React 19, TypeScript, Leaflet 1.9.4, CSS Modules

**Spec:** docs/superpowers/specs/2026-10-10-niagara-map-design.md

## Global Constraints
- Preserve night design, bilingual shared shell and Latin Fiesta confirmed by founder.
- Founder corrections supersede business exclusions in uploaded documents.
- No guessed addresses, commercial channels, owner nationalities or event hours.
- No publication of private editorial fields or permission-required images.
- Commit/push verified milestones to origin/work; leave main unchanged.

## Review Focus
- Overlapping La Paisana pins retain two cards and unit-specific destinations.
- Missing channels/locations do not turn into guessed actionable links.
- Map import or tile failure preserves all directory actions.
- Mobile filters and details remain usable with keyboard and reduced motion.
- Cultural ranges and date-only festivals remain visible through their inclusive last day.

## Task 1 — Public data and search contract
Files: app/components/niagara/place-types.ts, places.json, place-data.ts, place-utils.ts; tests/niagara.test.cjs; docs/NIAGARA_RESEARCH.md.
Interfaces: places: readonly Place[]; filterPlaces(places,{query,city,category,mode}); directionsUrl(place): string|null; markerGroups(places).
- [x] Write failing tests for founder inclusions, order-only/no-location navigation, accent search, overlapping pins and unit destinations; run node --test tests/niagara.test.cjs (Expected: missing exports fail).
- [x] Project supplied data into public fields, research all ten individually and record blocked candidates without discarding them. Implement utilities (Expected: tests pass).

## Task 2 — Route, map and hub
Files: app/niagara/page.tsx; niagara-directory.tsx, niagara-map.tsx, niagara.module.css, niagara-teaser.tsx; club-home.tsx; site-shell.tsx; package.json/lock.
Interfaces: directory receives places; map receives filtered places, selectedId, onSelect, reset counter, language. One selection; no invented coordinates or wheel capture.
- [x] Write SSR behavior tests for cards, missing destination and three featured hub links; run (Expected: absent components fail).
- [x] Install pinned Leaflet and types; implement bilingual night layout, filters, inline details, grouped pins, graceful tile failure and hub links.
- [x] Run all tests, lint, build, browser widths/selection/filter/Escape/reset/tile failure; diff check (Expected: green and no overflow).
- [x] Commit and push Niagara milestone; compare remote SHA (Expected: same SHA).
