# Featured Latin roots in Canada

The homepage’s Explore Our Roots section features Colombia, Mexico and El Salvador, in the order reported in the 2021 census-based table of countries of origin for Latin American immigrants. Each card links to the existing bilingual cultural page. The selection is not a ranking of countries’ cultural value, club membership, ancestry, citizenship, or all present-day Latin American Canadians.

## Evidence and scope

- Statistics Canada, *Latin American immigration to Canada*, publication 11-627-M2024042 (2024): https://www150.statcan.gc.ca/n1/pub/11-627-m/11-627-m2024042-eng.htm
- Accessible secondary transcription consulted on 2026-10-11: https://en.wikipedia.org/wiki/Latin_American_Canadians#Immigration (table “Top 10 countries of origin for Latin American Canadians (2021)”, citing the publication above). It reports Colombia 71,205, Mexico 57,820 and El Salvador 47,450 for immigrants identifying as Latin American. These counts are not published on the cards.
- Direct access to the official publication returned HTTP/CONNECT 403 from this environment, including after the network permission check. The selection is supported by the secondary table, rather than a claim that the original infographic was directly inspected. Recheck the original when direct access is available; do not silently replace this measure with ethnic origin or immigration admissions.

The public note states the census year and country-of-birth measure. Invitations summarize content already present on the destination pages. Illustrations reuse the existing public-domain Natural Earth geographic art. No new documentary images, music resources, tracking, libraries or WebGL instances are introduced. English is the default; Spanish follows the global selector.

## Verification

On 2026-10-11, all 53 existing Node tests, ESLint, production build and `git diff --check` passed. A focused Chromium check against the final production build confirmed all three homepage links, English default, global Spanish translation, census scope/year, direct navigation retaining Spanish for each destination, successful SVG loading and no runtime exceptions. Widths 320, 375, 768 and 1440 have no horizontal overflow; desktop/mobile screenshots were inspected. The full globe/calendar regression was not repeated because those components were not changed. Early one-off browser-check attempts needed corrected navigation-string quoting and hydration handling; the final complete run passed.
