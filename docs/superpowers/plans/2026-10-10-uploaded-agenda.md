# Uploaded Agenda Content Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task by task; the founder explicitly authorized continuous native execution.

**Goal:** Load real regional events and LATAM cultural dates, with past archive and accurate ranges.

**Architecture:** Extend the existing agenda contract with date-only event spans, daily sessions and inclusive cultural end dates. Curate supplied JSON into public normalized entries; shared date helpers drive calendar and archive.

**Tech Stack:** Next 16, React 19, TypeScript, native Node tests

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

## Task 1 — Scheduling contract
Files: event-types.ts, agenda-dates.ts, agenda-validation.ts, event-card.tsx, event-detail.tsx; tests/uploaded-agenda.test.cjs.
Interfaces: optional date-only event span with hours unknown; daily sessions for timed festivals; cultural endDate inclusive; extra links/address/editorial note. Existing timestamp Latin Fiesta preserved.
- [x] Write failing range/date-only/session tests including inclusive last day and overnight gaps; run (Expected: current date-only/range unsupported).
- [x] Extend helpers, validation and rendering with clear unknown-hours copy and daily schedule (Expected: tests pass, existing 15 pass).

## Task 2 — Import and delivery
Files: researched-events.json, cultural-entries.json, agenda-data.ts, events-copy.ts; docs/EVENTS_RESEARCH.md, README.md, QA docs.
- [x] Test all eleven supplied regional festivals, actual LATAFF sessions and all 225 cultural occurrences; preserve source URLs, unknown hours, Muertos discrepancy and no unauthorized images (Expected: absent content fails).
- [x] Normalize supplied data with bilingual details, country-specific scopes and review date; load collections.
- [x] Run all tests, lint, build, real HTTP details/archive/calendar and mobile browser checks (Expected: green, real dates display).
- [x] Commit/push milestone and verify SHA.

## Final review
- [x] One fresh whole-delivery code review as required by executing-plans; fix important findings with red/green tests and full verification.
- [x] Save tested environment startup instructions, delivery evidence and push final documentation.
