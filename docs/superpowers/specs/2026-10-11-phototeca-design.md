# Phototeca and interaction polish

The founder requests a usable, bilingual 1980s photo library, easier administration, automatically loaded Instagram/Spotify embeds, resumed Niagara motion after interaction, and understandable globe gestures. Existing authorization permits implementation without another proposal round. No new paid services or dependencies.

## Interaction corrections

Render Spotify and the official Instagram profile without load/close buttons; keep playback visitor controlled and an external profile link when Instagram does not embed. Give Spotify its own rounded, transparent frame instead of Instagram's white background. Niagara pauses during hover, dragging and keyboard focus; pointer focus must not latch that pause. Resume after a short idle period. The full globe owns touch gestures inside its canvas; scrolling works outside. The homepage globe supports dragging, has an explicit gesture hint and a route to all destinations.

## Phototeca

Route `/fototeca`, homepage invitation and shared navigation entry. A neon magenta/cyan, dark 1980s room with cassette and VHS details, Polaroid cards, album filters and an accessible photo dialog. Honour the global language/motion preferences. Only actual admin-published photos appear: no generated artwork represented as club memories. The empty state still provides an inviting submission flow.

Use a seventh CMS collection `gallery`: bilingual title/description, a verified Spotify URL defaulting to the existing club recommendation, and up to 600 photos. Each photo has a unique id, one image with dimensions and EN/ES alternative text, bilingual caption, album and optional photographer credit. The same drafts, history, optimistic revisions and admin publication rules apply. A cassette-style optional ambient synth instrument is generated locally with Web Audio after the visitor presses play; it requires no copyrighted audio or external URL and stops on navigation/hidden tab. No autoplay.

Visitors submit 1–8 JPEG/PNG/WebP images (3 MiB each), a caption, optional public credit and album, and confirm ownership/permission from identifiable people and permission to publish. Server verifies exact origin, payload size, content signatures, decoded pixels, strips metadata and re-encodes WebP. Staged images are private. Submission reserve/finish RPCs enforce a DB-backed hourly limit of three batches per hashed source, plus a site-wide daily limit of 60 batches and maximum 160 pending. No raw IP/email stored. Honeypot and minimum signed-form age reject trivial automated spam. The public status endpoint reports availability without sensitive data.

Admin sees pending batches, selects add to gallery draft or rejects. Acceptance atomically appends photos to the draft and resolves the submission under the gallery revision lock; it does not bypass admin publication. Retry/duplicate acceptance cannot add photos twice. Rejection retains private records briefly for review, not public assets. Service-role-only submission insertion; editor read/accept/reject behind session, same-origin checks and RPC membership. Public cannot read pending records or image bytes. Existing published content remains available during outages.

## Deployment and usability

Provide a rerunnable additive `supabase/gallery.sql` upgrade and update the complete install SQL. Existing content/members/history preserved. Until migration exists, submission UI reports temporarily unavailable, moderation explains the exact upgrade, and public gallery works with reviewed empty defaults. User executes SQL in their existing Supabase editor because this environment has no service credentials or SQL connector.

Admin adds a short save/preview/publish guide, publication controls in a sticky action area, labelled image upload/description workflow and a dedicated gallery editor plus moderation inbox. Existing editors remain functional. Verify unit, SQL, production HTTP and desktop/mobile Chromium, then push `work`; `main` unchanged.
