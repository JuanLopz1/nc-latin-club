# Explore Our Roots — delivery record

## Milestone 1: functional prototype

`/explore` and the hub invitation use the existing night palette. A real 3D globe renders the whole planet, highlights the Americas, and supports six initial destinations: Colombia, Brazil, Mexico, Jamaica, Haiti and Curaçao. Search, independent region toggles and the list also select destinations. Zoom/reset remain visible at 320px; rotation is off until the visitor chooses it. Reduced motion disables rotation and camera tweens. The global English/Spanish selector translates the interface and geographic previews.

Camera, filters and destination survive internal navigation. Canvas resources are disposed when Next.js hides the route. The list remains usable when WebGL is unavailable. No audio is automatically loaded or played.

Geography comes from Natural Earth 1:50m countries, public domain. Simplification preserves ring winding, including small islands. Geographic labels are Natural Earth label coordinates, not a tourism or sovereignty claim. The 54-destination package is editorial input; unreviewed cultural drafts, quizzes and media are not published in this prototype.

Verification: 42 unit/regression tests, ESLint, production build, and Chromium/CDP behavior checks. Browser checks cover real WebGL, camera movement, stationary default, opt-in rotation, Curaçao selection, shared locale, focus restoration, independent filters, 320/375/768/1440px widths, reduced motion and disposal on navigation.

## Next batch

Expand to all 54 destinations including individual small territories, add source-supported bilingual cultural pages, and check camera restoration and WebGL fallback. Full cultural drafts and music resources require claim/resource verification. UNESCO/Wikipedia requests currently receive proxy CONNECT 403; a narrow environment network draft has been saved for review/application. Saving the draft does not grant live network access.

This feature is independent of `/niagara` and events/cultural calendar routes, which remain available and unchanged.
