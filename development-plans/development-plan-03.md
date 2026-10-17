# Development plan 03: content, visual depth and product improvements

Created 2026-10-16; handoff updated 2026-10-17 (Asia/Karachi). Status: **in execution; first content, imagery and visitor-feature iteration implemented**. Canonical production: [havenfieldre.vercel.app](https://havenfieldre.vercel.app). [Plan 02 closure](development-plan-02-closure.md) records verified work and explicit deferrals. The image deliverable remains **28 new, distinct generated source images**; all 28 source images are generated and technically reviewed; crops/format conversions do not count as additional images. See the [execution record](development-plan-03-progress.md) for validation and remaining work.

## Section 01 — Starting point and release priorities

Havenfield already has Next.js/React/TypeScript/Tailwind, four fictional properties, three original articles, an authenticated editorial studio, media/inquiry/recovery workflows, passing CI and Git-connected Vercel deployments. Both active databases belong to Prisma project `havenfield`, on separate `main` and `preview` branches. The former rollback project was deleted on 2026-10-16 after a private export and active-resource verification.

The principal visual gap is reuse: four architectural photographs carry the public experience, the three article cards share one interior image, and property galleries mix images from different fictional homes. Content, coherent imagery and useful product improvements are the next execution priorities.

Keep the calm editorial identity, self-hosted Playfair Display/Poppins, original mark, fictional places and clear demonstration boundaries. Continue using TypeScript services and Next.js Route Handlers. A separate Express service needs an explicit architectural reason; it is not a prerequisite for these features.

## Section 02 - Delivered baseline and optional follow-up

Plan 02 is closed: 57 verified original entries, seven explicit deferrals and no blocking carryovers. [The closure record](development-plan-02-closure.md) is authoritative. Do not reintroduce its deferred checks as prerequisites for this plan.

Already delivered: separate database/media environments, current TLS/quota policy review, deployed client-address handling, real hosted editorial/media workflows, scheduled publication, image persistence after redeploy, mobile lab measurements, private hosted restoration and a compatible Production rollback. Reuse that implementation and evidence.

Independent Drive transfer/scheduling, automated quota/backup alerts, human screen-reader sign-off, full recovered public-site image delivery and cold-invocation/scheduler-origin proof remain optional follow-up. The existing guides remain available; no new account setup, telemetry subscription, certification or recovery environment is required before content work begins. Field INP remains unmeasured until sufficient traffic exists.

Keep security/isolation and appropriate regression checks for new work. Fix actual accessibility, data-loss, broken-route or functional defects when discovered. Use `npm.cmd run smoke:public` after deployments; do not continuously poll the free database. Continue within the **free-only/no-payment/no-card** budget. Verify any included generation allowance before using it; do not purchase credits, trials or upgrades if that allowance is insufficient.

## Section 03 — Twenty-eight-image generation register

Generate a contact sheet for review, retain the selected source files privately, and publish only the approved optimized assets. IDs are stable asset identities; final filenames use lowercase descriptive names. All scenes are invented. The four sets below must show the **same corresponding fictional building**, with consistent materials, rooflines, glazing, landscape and light.

| IDs        |  Count | Subject and required shots                                                                                                                    | Primary placements                                                               |
| ---------- | -----: | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| HF03-01–04 |      4 | Courtyard House: limestone arrival/exterior, courtyard-facing living room, oak kitchen/dining, planted courtyard/pool                         | Courtyard detail hero + three gallery images; collection/home card uses exterior |
| HF03-05–08 |      4 | Saltwater Residence: coastal exterior/terrace, horizon-facing lounge, compact kitchen/dining, sheltered bedroom/balcony                       | Saltwater detail hero + gallery; collection card                                 |
| HF03-09–12 |      4 | Woodland Pavilion: dark-timber exterior, woodland-facing living room, reading/study room, covered forest deck                                 | Woodland detail hero + gallery; collection/home card                             |
| HF03-13–16 |      4 | Atelier Loft: fictional brick courtyard/street arrival, tall-window living/studio, flexible work/dining room, rooftop garden                  | Loft detail hero + gallery; collection card                                      |
| HF03-17–18 |      2 | Brand/home: sheltered arrival with landscape; intimate everyday breakfast/interior scene                                                      | Home editorial/approach and conversation sections; collection introduction       |
| HF03-19–20 |      2 | About: tactile stone/oak/plaster material study; architectural workshop table without identifiable people or text                             | About hero/story/value sections; restrained login/legal visual variants          |
| HF03-21–23 |      3 | Amenities: shared garden/seating, reflective water/quiet terrace, walkable shaded path with bicycle storage                                   | Amenities hero + three subject cards; property related-feature sections          |
| HF03-24–27 |      4 | Journal: distinctive editorial still life; viewing/light-study interior; connected floor-plan/circulation scene; flexible everyday home scene | Journal masthead plus a unique cover for each of the three existing articles     |
| HF03-28    |      1 | Contact: a welcoming imagined studio threshold and garden bench, no address or branded signage                                                | Contact hero/sidebar; restrained empty/error-state crops                         |
| **Total**  | **28** | **28 independently generated, approved source images**                                                                                        | Reuse is deliberate; responsive crops are not counted twice                      |

- [x] Create an asset manifest before generation: ID, prompt version, provider/model, quoted cost/credits, dimensions, output path, SHA-256, approval status, alt text, focal point and intended routes.
- [x] Generate a four-image identity pilot and lock each property's visual reference before continuing; page-layout review follows integration (see the execution record).
- [x] Produce and review the remaining batches; require all 28 accepted images before declaring the image milestone complete. Reject duplicates, malformed architecture and inconsistent property identities.
- [x] Use the provided built-in image tool only, without purchases or external API billing. Its model, remaining quota and cost quote are not exposed; the manifest records unknown values. No current Higgsfield balance is inferred from the historical video purchase.
- [x] Record provenance and allowed public sharing in [the asset register](brand-and-assets.md). Use the project's original identity rather than former-client references, existing developments or borrowed company imagery.

## Section 04 — Art direction and reusable prompt specification

Use warm limestone, pale plaster, natural oak, muted planting, believable daylight and restrained composition. Capture useful foreground depth and human-scale details without making rooms look unnaturally large. Avoid people, legible text, watermarks, logos, implausible geometry, excessive wide-angle distortion and unverifiable claims about real buildings. Property photographs must not imply that these are actual sale listings.

Base prompt to specialize for each register entry:

> Create an original photorealistic architectural editorial image for Havenfield, a fictional real-estate portfolio. Asset [ID], property [name], view [precise camera position and subject]. Preserve the approved reference building's roofline, openings, materials, layout relationships and landscape. [Detailed materials, furniture, planting and weather.] Natural [time-of-day] light with coherent shadows, realistic scale and straight verticals; approximately 28–50 mm architectural photography, avoiding exaggerated space. [Composition and focal subject], [negative space location] for responsive text placement. Calm ivory, stone, oak, terracotta and sage palette. No identifiable people, writing, brand marks, watermark, real addresses, famous buildings or borrowed developer imagery. Output [landscape/portrait ratio] with sufficient resolution for a 1600–2000 px web master. This scene is invented and must remain consistent with the other views of this fictional home.

- [x] Produce landscape masters for wide heroes/cards and suitable portrait compositions for vertical about/contact placements; do not stretch a crop to conceal missing composition.
- [x] Inspect full-resolution geometry, window reflections, repeated objects, shadow direction and continuity between related shots.
- [x] Write subject-specific alternative text. Decorative crops use intentional empty alt text; do not describe every image as a generic “luxury property.”
- [x] Prefer AVIF/WebP derivatives where measured browser support and size justify them; retain JPEG fallbacks if needed. Strip embedded location/device metadata, declare width/height or a fixed aspect ratio, and use correct `sizes`/focal positions.
- [x] Start with roughly 100–250 KiB card images and ≤350 KiB wide hero images as provisional asset budgets; measure perceived quality and real LCP before accepting them. Prioritize only the visible LCP image, lazy-load below-fold media, and preserve the mobile poster-first video behavior.

## Section 05 — Coverage for every page

| Page family / routes                                                           | Planned content and visual treatment                                                                                                                             | Completion evidence                                                                                        |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Home `/`                                                                       | Keep the existing film unless a separate replacement is approved; new scene 17/18, unique property cards, unique journal covers and stronger section transitions | Desktop/mobile review; no repeated article-cover strip; LCP/CLS checked                                    |
| Collection `/properties`                                                       | Four distinct property exteriors, useful search/filter intro, clear sorting/result state, saved/compare entry points                                             | Filters/back links still work; each card corresponds to its property's gallery                             |
| Four `/properties/[slug]` routes                                               | Dedicated four-view visual set per home, consistent gallery captions/alt text, original room-by-room narrative, amenities and neighborhood context               | No cross-property image substitution; keyboard/gallery tests and accurate fictional specifications         |
| About `/about`                                                                 | Material/workshop images 19/20, original studio principles and an illustrated design process                                                                     | Clear fictional-studio explanation; no invented staff testimonials or business history                     |
| Amenities `/amenities`                                                         | Garden, retreat and mobility images 21–23, grouped feature stories and links to matching homes                                                                   | No implication that every fictional home has every facility                                                |
| Journal `/journal`                                                             | Editorial masthead image 24, three distinct current covers 25–27, topic introductions and better discovery                                                       | Search/pagination preserved; readable thumbnails and unique metadata                                       |
| Current and new `/journal/[slug]` routes                                       | Unique cover, meaningful inline imagery where it supports the story, captions, related stories and property links                                                | Publication visibility, RSS, sitemap, headings and structured data remain consistent                       |
| Contact `/contact`                                                             | Studio threshold 28, a clear demo-inquiry explanation and accessible form feedback                                                                               | Form still promises a stored demo receipt, not an email or real viewing                                    |
| `/privacy`, `/terms`, `/cookies`                                               | Updated operator/domain facts and a small, restrained crop/motif from approved brand imagery; readable long-form layout                                          | Accurate storage/retention/favorites descriptions; imagery does not delay or obscure policy text           |
| Not-found/error/loading states                                                 | Lightweight brand illustration/thumbnail variants from approved assets, clear recovery links and honest availability states                                      | Useful keyboard navigation and no oversized decorative download                                            |
| `/admin/login`, editorial list/editor/preview, media, inquiries and operations | Restrained brand treatment at login; real property/article thumbnails where useful; administrative tables/forms retain a clear functional layout                 | Accessible populated screens, draft privacy and session recovery; no private content in public screenshots |
| API, robots, RSS and sitemap endpoints                                         | Remain machine-readable; images belong in valid article/social metadata, not injected decorative markup                                                          | Content types, publication visibility and canonical URLs validated                                         |

## Section 06 — New content and features

- [x] Expand each property with original editorial sections on arrival, light, room use, materials, outdoor living and the invented locality. Keep names, areas, prices and amenities consistent with the typed content records.
- [x] Write six additional original journal drafts: daylight through the seasons, flexible work spaces, low-maintenance planting, reading a floor plan, thoughtful compact living and preparing a useful viewing checklist. Review factual claims; keep local legal/financial advice outside scope.
- [x] Add related-story/property recommendations using explicit typed relationships rather than an external recommendation service; give empty states useful fallback content.
- [x] Add visitor saved homes and a comparison view for up to three properties, with keyboard/mobile support, removable items and clear browser-local persistence. Update privacy/cookie guidance before enabling persistence.
- [x] Add collection sorting and accessible active-filter chips, retaining shareable URLs and back-navigation state. Validate query parameters and show meaningful zero-result states.
- [x] Improve journal discovery with bounded PostgreSQL search/taxonomy queries only if the expanded content justifies it; compare query plans and provider operations before adding indexes or caching.
- [ ] Add a publisher-managed property workflow as a separately reviewed feature slice: schema migration, preserved seed IDs/inquiry associations, draft/public states, property gallery ordering/alt text, optimistic edits and action records. Keep current static-property behavior until the migration has acceptance coverage.
- [ ] Improve media authoring with asset collections, focal-point/crop previews and reliable usage information. Distinguish repository-owned static imagery from publisher uploads so deleting an upload cannot damage a source-controlled gallery.
- [ ] Add concise UI feedback and restrained motion where it improves state changes; retain reduced motion. Evaluate Motion Primitives patterns individually, Haikei for original lightweight vector decoration, and Realtime Colors for contrast/token checks without adding unnecessary runtime services.

## Section 07 — Admin and domain operations

- [x] Keep production at `https://havenfieldre.vercel.app`; verify canonical/Open Graph/JSON-LD/RSS/sitemap and mutation origins after every domain change. Preview stays noindex and uses its own exact request origin.
- [x] Use the existing single-publisher account or deliberately rotate its credentials using [the admin access guide](admin-access.md). Keep production/preview passwords and session secrets separate; do not add public signup or expose a password hash in the browser.
- [ ] Review old immutable Preview deployment dependencies after rollback deletion; use the currently verified Preview for editorial work. Document only current account resources and dated historical evidence.

## Section 08 — Execution order and acceptance

| Iteration | Deliverable                                                                                          | Gate                                                                             |
| --------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 03A       | Confirm the free image allowance, prepare page briefs/manifest and review a four-image pilot         | Plan 02 is closed; approved style and no new paid services                       |
| 03B       | Generate/approve all 28 images, build derivatives/manifest and integrate property-specific galleries | Original consistent scenes, distinct covers, all page families assigned visuals  |
| 03C       | Expand property copy and publish reviewed journal drafts through the existing editor                 | Independent content, correct visibility/SEO and retained revisions               |
| 03D       | Saved/compare and collection/discovery improvements                                                  | Responsive, accessible, URL/persistence behavior documented and tested           |
| 03E       | Reviewed property-authoring/media improvements                                                       | Migration/recovery and authorization evidence before moving live inventory       |
| 03F       | Run hosted regression/performance checks, refresh full-page screenshots, README and release evidence | Passing CI and hosted flows; report optional human/field observations accurately |

- [x] Count 28 approved **new source images**, including sixteen property-specific views and three distinct existing-article covers; no recycled crop is counted as a new generation.
- [ ] Confirm every page family in Section 05 has its assigned content/visual treatment; remove unused generated outputs from the publishable tree.
- [x] Run appropriate TypeScript/lint/service/PostgreSQL/browser checks for the code actually changed. Test saved/compare, filters, publication visibility and property/media migrations with meaningful scenarios.
- [x] Check populated public/editorial screens at 320-1440 px, reduced motion, keyboard access and automated accessibility/reflow checks. Record human screen-reader/native zoom findings if available; do not claim an unperformed review passed.
- [ ] Record hosted measurements and correct regressions caused by the larger image library; do not substitute one desktop screenshot for performance acceptance.
- [x] Update the first-person README screenshot, asset register, operator guidance and release records; keep authored root Markdown limited to README.
- [x] Scan staged files and complete Git history for secrets before committing/pushing; verify CI and the exact Git revision deployed by Vercel.

The first execution iteration now contains the 28 new images and visitor/content changes recorded above. Plan 03 remains open for the separately reviewed property-authoring/media slice and release checks recorded in the execution record. Drafts remain private until deliberately published.

Design-tool references: [Motion Primitives](https://motion-primitives.com/), [Haikei](https://haikei.app/) and [Realtime Colors](https://www.realtimecolors.com/). Recheck the chosen component's current API/license during execution; these are optional production aids rather than added runtime dependencies.

## First iteration status (2026-10-17)

03A/03B: the 28 original sources and page integrations are delivered, with the documented pilot-layout sequencing exception. 03C: property narratives and six private drafts are delivered; publication remains a deliberate editorial action. 03D: saved/compare and filter-chip improvements are live. 03E: property authoring and publisher media improvements remain pending as a separate migration slice. 03F: initial CI, hosted verification, local performance measurements and README captures are delivered; repeat these for later code changes. This is not a claim that every Plan 03 feature is finished.
