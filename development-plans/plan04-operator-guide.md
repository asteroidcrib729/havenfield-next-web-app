# Plan 04 - demonstration and publishing guide

## Public studio

Open /studio-demo. This route uses repository-owned fictional samples. It neither fetches private administrative APIs nor reads live inquiry data. It is read-only and marked noindex. The actual publisher login and all private APIs retain their authentication requirements.

## Brochures and plans

Each published home's page links to /properties/SLUG/brochure. Choose **Print / save PDF**, select your browser's PDF destination and enable background graphics if desired. Header, footer and action controls are omitted from print. A draft or unpublished property returns 404 for its brochure too.

The four original homes have distinct concept diagrams. They are explicitly not measured plans or reconstructions of the generated images. If a publisher changes a home's name, bedroom/bathroom counts or area, its original diagram is suppressed rather than silently presenting incompatible information. Newly created homes still have brochures without an inherited plan.

## Inquiry conversations

The existing review state remains separate from conversation progress: new, contacted, viewing requested and closed. Notes are private and expire with the record. Save before filtering or leaving. Saves include the opened version; a conflicting edit returns 409 and keeps the unsaved notes visible. Reload after preserving any notes you still need.

Property filtering uses the managed catalog, including unpublished homes, instead of hardcoded seed names. Missing homes are labeled unavailable. CSV export follows the active filters, requires publisher authentication, uses no-store responses and is capped at 1,000 records. Cells are quoted and spreadsheet formula prefixes neutralized. Downloaded contact details and notes remain private operator data.

Schema migration 004 adds conversation fields without replacing existing inquiries. Database backup format 4 includes these fields; legacy formats 1-3 upgrade during restore with empty notes, stage new and version 1. Restores still refuse nonempty targets.

## Editorial selection

The selected Plan 03 drafts are **Daylight through the seasons**, **Read a floor plan in everyday routes**, and **Small spaces with room to live**. Together they add material relevant to all four homes. Existing related-home mappings connect them to public listings. Three other drafts remain private for future editorial use.

Run npm run content:plan04 -- --environment=ENVIRONMENT for a dry run against the explicitly selected private profile; add --apply to publish. Already-public articles are left alone. Changed or scheduled drafts are refused for deliberate review. The operation uses the normal versioned publishing service and records revisions/actions.

## Reference documentation

Implementation references: [Next.js image component](https://nextjs.org/docs/app/api-reference/components/image), [browser printing](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Printing), and [OWASP CSV injection](https://community.owasp.org/attacks/CSV_Injection).

## Recording the walkthrough again

The delivered silent walkthrough is about 70 seconds at 1280 x 720, H.264, roughly 1.85 MB. [Text alternative](walkthrough-transcript.md) and [media evidence](plan04-walkthrough.json) accompany it. Its captions identify the isolated, fictional demonstration.

The recording pass uses the browser runner's disposable database and a generated test publisher password; it never signs in to the hosted databases. It is skipped during ordinary CI. On Windows with Edge installed:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH='.cache/playwright'
node node_modules/@playwright/test/cli.js install ffmpeg
$env:RECORD_WALKTHROUGH='1'
npm.cmd run test:e2e -- --grep 'record isolated'
```

The runner writes its WebM path to ignored .data/plan04-recording/source.json after all scenes succeed. With the free FFmpeg CLI available, encode that recording as H.264/yuv420p, 24 fps, CRF 25 and faststart; inspect it before replacing the public MP4. Do not publish browser traces, raw test databases, authentication state or failed partial recordings.
