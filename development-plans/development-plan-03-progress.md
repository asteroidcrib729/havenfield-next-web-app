# Plan 03 execution record

Started 2026-10-17 (Asia/Karachi). Plan 02 remains delivered. Plan 03 is **in progress**, with the first content and visitor-feature iteration implemented; property authoring and media workflow improvements remain separate work.

## Delivered in this iteration

- 28 independently generated architectural/editorial source images, including four consistent views for each of four fictional homes. The [manifest](plan-03-assets.json) contains source/output hashes, dimensions, subject-specific alt text, focal points, intended routes, prompt briefs and available exact prompts. The [contact sheet](assets/plan03-contact-sheet.webp) shows every accepted source once.
- Four property identity pilots preceded the reference-based gallery batches. Images were inspected as generated and together on the contact sheet. Page-layout review follows integration; the planned pre-batch layout gate was not performed before all gallery generation.
- Built-in session image generation only. No Higgsfield/Magnific/API calls, credit purchases, subscriptions, payment or card authorization. The tool exposes neither model identity, remaining quota nor a monetary quote; these fields remain unknown, not asserted as verified balances. The earlier Higgsfield film is retained.
- Source PNGs are privately retained under ignored `.data/plan03/sources/`; optimized WebP masters and 480/768 px derivatives are published under `public/media/plan03/`. All 28 wide masters meet the provisional 350 KiB ceiling; combined masters are 7,383,802 bytes. Format conversions and screenshots are not new source images.
- Home approach/conversation imagery, four coherent property galleries, About material/workshop stories, Amenities garden/retreat/mobility scenes, Journal masthead/distinct current covers, Contact threshold and small legal/login/error motifs. Fixed aspect ratios and Next.js image sizing preserve layout; utility visuals are small decorative crops.
- Six original editorial sections per property: arrival, light, room use, materials, outdoor space and invented locality. Existing IDs, prices, areas, bedrooms and inquiry associations are preserved.
- Six original journal drafts with covers, categories, tags and SEO descriptions. Draft state, null publication date and noindex are deliberate. They are not automatically published.
- Explicit property/story relationships; only currently published stories appear on property pages. A journal outage leaves the static collection readable. Related homes on articles use existing collection cards.
- Saved homes and up-to-three comparison, independent clearing, removals, browser-local versioned IDs, cross-tab synchronization and a temporary in-tab fallback when storage writes are blocked. Privacy/cookie pages explain persistence before it is enabled.
- Accessible active-filter chips preserve other filters and sorting in shareable URLs. Existing sorting/search/pagination remain. Three public stories and six drafts do not justify new PostgreSQL indexes, full-text search or caching.
- Property cards now have appropriate headings. Browser checks identified and corrected a 320 px masthead overflow. No extra runtime dependency was added.

## Content import

`npm.cmd run content:plan03 -- --environment=preview` performs a dry run against the active private profile. Add `--apply` to create missing drafts and replace only unchanged legacy seed covers. Production requires an explicitly matching Production profile and `--environment=production`; never point the local Preview profile at Production.

The importer preserves existing slugs and owner edits, skips existing drafts and custom covers, uses optimistic article updates, and records revisions/actions. It is not part of build/startup and cannot silently republish drafts. Image assets must be deployed before applying hosted cover changes.

## Validation and release

66 service tests passed, including source/output integrity, coherent gallery assignments, draft privacy, malformed/oversized saved state, the three-home limit and idempotent content imports that retain edited copy/custom covers. TypeScript, lint and the production build passed. All 11 browser journeys passed, including the expanded 320/375/768/1440 px route checks. The property-only loading treatment preserves the existing HTTP article redirects. The [three-run mobile lab evidence](plan03-performance-evidence.json) records median performance 92/93/98 for home/collection/article, median LCP 3.21/3.10/2.47 seconds and median CLS zero. A [focused follow-up](plan03-accessibility-evidence.json) after valid filter grouping/native wordmark naming scores collection accessibility/SEO 100/100; its single-run CLS is 0.073. These are local simulated measurements, not hosted or field results; the home median remains above the 2.5-second LCP target. Public visual captures are stored in screenshots/plan03-*.webp. Hosted results follow after deployment verification.

The browser suite covers saving/reload/cross-tab clearing, comparison/removal/limit, 320 px containment and automated accessibility, filter-chip URL preservation, blocked-storage navigation/reload, keyboard galleries and existing inquiry/editorial workflows. It also checks public route reflow at 320, 375, 768 and 1440 px. Human screen-reader, native zoom and field INP are not claimed.

## Remaining Plan 03 work

1. Publisher-managed property schema and editor: migration preserving IDs/inquiries, draft/public states, gallery ordering and alt editing, optimistic versions, action records, recovery and authorization acceptance.
2. Publisher media collections, focal/crop preview and stronger usage presentation. Static source-controlled images remain outside upload deletion.
3. Deliberate review/publication of the six drafts through the existing studio. Published-only recommendations already honor their current visibility.
4. Final hosted/performance evidence and screenshot refresh for this iteration, followed by those checks for later feature slices.

These are Plan 03 scope, not reopened Plan 02 gates.
