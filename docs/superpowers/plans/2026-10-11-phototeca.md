# Phototeca Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement inline. No delegation needed.

**Goal:** Deliver the requested interaction fixes and a moderated retro photo library.
**Architecture:** Reuse the existing Next/React CMS, private media storage and SQL role/revision checks; add a gallery collection and separate submission inbox. No new dependencies.
**Tech Stack:** Next 16.4, React 19.3, Supabase Free/Postgres, sharp, Web Audio, native CDP.
**Spec:** `docs/superpowers/specs/2026-10-11-phototeca-design.md`

## Global constraints

- EN default, ES alternative, respect global motion choice.
- Private pending media; explicit visitor sound activation; no invented event photos.
- Push tested milestones to work; preserve main and existing data.

## Review focus

- Touch vertical drag moves the globe without scrolling the document.
- Pointer focus does not permanently stop Niagara; keyboard focus still protects navigation.
- Oversized/corrupt uploads fail before storage; unconfigured migration does not claim submission success.
- Concurrent moderation/publication and duplicate clicks cannot duplicate photos or overwrite drafts.
- Mobile dialogs, forms and sticky actions fit 320px; external embed failure retains usable links.

### 1. Existing interaction fixes
- [x] Add/run failing SSR embed tests and CDP gesture/idle regressions.
- [x] Update spotify-section, instagram-section, use-niagara-carousel, globe-scene and preview.
- [x] Run unit/lint/build and desktop/mobile browser checks; commit/push milestone.

### 2. Gallery schema and private submission service
- [x] Add/run failing gallery validation and SQL privacy/quota/concurrency tests.
- [x] Define `GalleryContent`, `GalleryPhoto` and collection defaults/validation.
- [x] Add additive SQL, service-only submission reserve/finish, editorial moderation RPCs.
- [x] Add status/challenge, bounded upload POST and authenticated inbox/moderation endpoints; reuse private image delivery.
- [x] Verify real Postgres and production HTTP contract, including permission/rate/retry cases.

### 3. Retro UI and admin flow
- [x] Add/run failing route/rendering and browser flow checks.
- [x] Add gallery client, submission form, lightbox, Web Audio cassette and CSS.
- [x] Add homepage/navigation invitation, gallery editor/inbox and clearer sticky publishing guidance.
- [x] Verify empty/default/public/draft/moderated content, multilingual copy, music cleanup and small screens.
- [x] Run full tests/lint/build, inspect screenshots and diff, document deployment upgrade, commit/push and report implemented/tested/external activation separately.
