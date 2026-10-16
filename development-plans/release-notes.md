# Havenfield 1.0 product implementation

## Section 01 — Publisher and visitor behavior

Publishers can recover interrupted draft writing, reuse and describe uploaded images, inspect media references and perform reviewed cleanup. Shared images and historical revisions survive deletion of another article. Failed storage operations remain reviewable instead of becoming untracked objects. Inquiry records have a searchable protected inbox, explicit lifecycle/deletion and expiry tooling. Duplicate visitor retries return one durable receipt.

Visitors can share collection filters and return from a detail page without losing them. Galleries have per-image descriptions and keyboard controls, and explicitly explain the concept moodboard. Longer Markdown stories offer contents links. Mobile visitors see the hero poster first and choose playback, while desktop autoplay and reduced-motion/data-saving behavior remain supported. Social previews and raster app icons use the independent Havenfield identity.

## Section 02 — Operations and compatibility

Migration 002 introduces media, action records, recovery drafts and inquiry lifecycle tables/columns. Apply ordered migrations and bind independent hosted databases before deployment. Backups now export format 2; the restore service accepts historical format-1 exports, verifies checksums and refuses nonempty targets. Complete recovery bundles also verify image bytes and preserve references. Environment bindings stay with the target, rather than copying a Production binding into another environment.

Nonce CSP requires dynamic page rendering. Metadata is resolved before streaming to preserve HTTP slug redirects. PostgreSQL stays behind TypeScript services and Next.js Route Handlers; no Express service/process is required on Vercel. Production and Preview now have separate PostgreSQL databases, media stores and private credentials. Daily maintenance authentication is configured and manually verified; its first scheduled execution remains to be observed. Independent backups and real hosted recovery remain acceptance work.

## Section 03 — Validation

The deployment completed on 2026-10-15 at [havenfield-portfolio.vercel.app](https://havenfield-portfolio.vercel.app). See [the deployment record](deployment.md) and [execution evidence](development-plan-02-progress.md) for exact identifiers, source provenance, 24 hosted check groups, 55 local tests and remaining limits. The configuration checker now supports Node ESM, and browser validation avoids dynamic compilation blocked by CSP. Human screen-reader acceptance, hosted recovery and field performance remain open.

## Section 04 — GitHub publication and automatic deployment

Published the independent source and assets to the public `havenfield-next-web-app` repository after snapshot/index/history secret scans and manual review. Commits group the migration foundation, public brand/site, publishing backend and development evidence. Private configuration and identifiers remain outside Git; commits use a GitHub no-reply identity. Pinned GitHub Actions run complete-history credential scanning and clean-checkout application/PostgreSQL/Chromium checks. Both initial runs pass. The existing Vercel project is connected to GitHub with `main` as Production, and a pushed Git revision automatically reached READY on the live portfolio domain with all three seed articles retained. See [Git delivery](github-publication.md).

## Section 05 — Domain, screenshot, admin guide and planning refresh (2026-10-16)

Production moved to `havenfieldre.vercel.app`; the owner removed the old aliases. Corrected canonical and mutation-origin settings, rebuilt both environments and passed 49 domain/admin/screenshot checks. README now shows a fresh full-page live landing screenshot and links a full mobile capture. Deleted the obsolete Prisma rollback project after a fresh private export and active-resource verification. Existing publisher credentials remain intact, with [retrieval/setup/rotation guidance](admin-access.md). [Plan 02 audit](development-plan-02-audit.md) confirms 53/64 checked items and 11 outstanding composite requirements. [Plan 03](development-plan-03.md) specifies 28 new source images and further content/features; those assets and features are planned, not generated or implemented by this review.

The first documentation delivery's browser run caught a transient upload-button contrast failure while disabled opacity faded back to its enabled value. Restricted the shared editorial button transition to colors so opacity changes immediately. The existing populated publisher accessibility journey remains the regression check; no accessibility rule was disabled or delayed to hide the transition.

## Section 06 — Repository-wide formatting (2026-10-16)

Added pinned Prettier and SQL formatting tooling, root-recursive `format`/`format:check` scripts, shared configuration and cross-platform LF checkout rules. Applied the initial formatting pass to applicable source, tests, scripts, configuration, documentation, SVG assets and the mutable SQL schema. The standard `check` command and existing CI now enforce formatting. Applied migration files 001/002 retain their original bytes and ledger checksums; generated/private/runtime files remain excluded. See [formatting coverage and migration rules](formatting.md).
