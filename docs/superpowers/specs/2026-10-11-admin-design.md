# NC Latin Club administration

The founder requested a working admin panel and a replaceable Colombian Spotify recommendation, authorizing the Supabase Free plan. No paid service is authorized. The image-processing package already installed through Next.js (`sharp` 0.35.5) is declared directly so uploads can be decoded and sanitized reliably. The existing cloud checkout on `work` is used; `main` stays unchanged.

## Delivery

`/admin` provides email/password login, server-checked Admin/Editor access, bilingual forms, image uploads, draft saving, publication, history recovery and JSON backup. It edits settings (logo, hero, contact, Instagram, Spotify), existing EN/ES homepage copy, real events, cultural dates, Niagara businesses and cultural country pages. Geography and layout remain in code. Public routes use published records; absence of configuration preserves existing reviewed content. Staff/news/visitor submissions remain their separate future features.

Use Supabase Auth, Postgres and a private image bucket via server-side REST calls. Credentials live in deployment environment settings. Tokens use HttpOnly, SameSite cookies; every mutation checks origin, authenticated identity and database membership. No public registration, browser-stored password or shared password. Editors may save drafts; only Admin may publish. Role assignment initially happens in the supplied SQL, not a public endpoint.

Store one document per collection, with independent draft and published values, optimistic revision numbers and an audit history. SQL RPCs enforce permissions and prevent overwriting newer changes. Public projection contains only published content. Private image delivery checks whether a published collection references the image, or verifies editorial access. Validate all published data with the existing calendar rules plus link, image, place and country checks. Uploads accept JPEG, PNG and WebP up to 3 MiB, using verified signatures and dimensions.

Forms use collection search and one record at a time; nested fields and EN/ES text remain editable without writing JSON. Add, duplicate and remove records; save does not publish. A preview is explicitly private/local to the editor until publication. Recover a previous revision as a draft. Publishing updates public requests without a Git push.

Spotify starts with MAÑANA SERÁ BONITO by KAROL G as a temporary recommendation, verified from the official Spotify page title and Open Graph metadata. It is not presented as an official club playlist or a specific current number-one album. Playback requires a visitor action. The admin can replace its URL, title and description.

## Verification and external prerequisite

Run validation/security tests, existing suites, lint/build and production-browser checks. Exercise authentication, denied actions, drafts versus publication, conflict handling, uploads, restore, mobile forms and public rendering using a local REST contract fixture. This does not prove Supabase SQL/RLS execution: actual project setup, SQL application, user creation and deployment bindings require the founder's project. Document and report that activation separately; never claim the online panel is fully connected before live verification.
