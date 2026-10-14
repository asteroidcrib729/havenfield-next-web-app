# Havenfield 1.0 product implementation

## Section 01 — Publisher and visitor behavior

Publishers can recover interrupted draft writing, reuse and describe uploaded images, inspect media references and perform reviewed cleanup. Shared images and historical revisions survive deletion of another article. Failed storage operations remain reviewable instead of becoming untracked objects. Inquiry records have a searchable protected inbox, explicit lifecycle/deletion and expiry tooling. Duplicate visitor retries return one durable receipt.

Visitors can share collection filters and return from a detail page without losing them. Galleries have per-image descriptions and keyboard controls, and explicitly explain the concept moodboard. Longer Markdown stories offer contents links. Mobile visitors see the hero poster first and choose playback, while desktop autoplay and reduced-motion/data-saving behavior remain supported. Social previews and raster app icons use the independent Havenfield identity.

## Section 02 — Operations and compatibility

Migration 002 introduces media, action records, recovery drafts and inquiry lifecycle tables/columns. Apply ordered migrations and bind independent hosted databases before deployment. Backups now export format 2; the restore service accepts historical format-1 exports, verifies checksums and refuses nonempty targets. Complete recovery bundles also verify image bytes and preserve references. Environment bindings stay with the target, rather than copying a Production binding into another environment.

Nonce CSP requires dynamic page rendering. Metadata is resolved before streaming to preserve HTTP slug redirects. PostgreSQL stays behind TypeScript services and Next.js Route Handlers; no Express service/process is required on Vercel. Production and Preview now have separate PostgreSQL databases, media stores and private credentials. Daily maintenance authentication is configured and manually verified; its first scheduled execution remains to be observed. Independent backups and real hosted recovery remain acceptance work.

## Section 03 — Validation

The deployment completed on 2026-10-15 at [havenfield-portfolio.vercel.app](https://havenfield-portfolio.vercel.app). See [the deployment record](deployment.md) and [execution evidence](development-plan-02-progress.md) for exact identifiers, source provenance, 24 hosted check groups, 55 local tests and remaining limits. The configuration checker now supports Node ESM, and browser validation avoids dynamic compilation blocked by CSP. Human screen-reader acceptance, hosted recovery, hosted CI and field performance remain open.
