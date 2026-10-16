# Development plan 02: complete the Havenfield product

Current follow-up (2026-10-16): **56/64 checked; eight open**. [Immediate delivery evidence](development-plan-02-delivery.md) closes PostgreSQL policy/quota verification, hosted client-address validation and current hosted lab performance. Field INP is not measured; human accessibility and recovery/operations gates remain open.

Created 2026-10-14; deployment and GitHub delivery updated 2026-10-15 (Asia/Karachi). Status: implemented, published with passing hosted CI and automatically deployed from GitHub to Vercel; full release acceptance still requires independent recovery, human accessibility and performance evidence. The [2026-10-16 completion audit](development-plan-02-audit.md) confirms 53 checked of 64 total items; 11 remain open. See the [execution record](development-plan-02-progress.md), [Git delivery](github-publication.md), [deployment](deployment.md) and [database recovery procedure](database-recovery.md).

Previous foundation: [development plan 01](development-plans-01.md). Supporting records: [implementation](implementation.md), [deployment](deployment.md), [database comparison](database-options.md), [cleanup](cleanup.md), [brand and assets](brand-and-assets.md), and [hero video generation](hero-video-generation.md).

## Section 01 — Product definition and immediate priorities

The next milestone is a complete, maintainable portfolio product: visitors can browse fictional homes and useful articles, submit a clearly identified demo inquiry, and use the site on mobile or with assistive technology. The publisher can operate the journal, manage its media, review saved inquiries, and recover content without editing the database manually. The application runs on Vercel with verified durable storage and documented release/recovery procedures.

Havenfield remains an independent fictional brand. Real listings, transactions, payments, appointments with real agents, and investment advice are outside this milestone. A portfolio inquiry must never imply that a real agency will respond.

| Priority                 | Work                                                                                                                                                         | Completion evidence                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| P0: release blockers     | PostgreSQL verification, versioned migrations and recovery, production/preview configuration, publisher security, storage limits and operational diagnostics | Repeatable database tests, tested restoration, isolated environments, real hosted smoke checks |
| P1: complete the product | Media library, inquiry inbox, editorial reliability, public journey polish, SEO, accessibility and performance                                               | Publisher completes the whole workflow through the UI; all supported public journeys work      |
| P2: later expansion      | Multiple publishers, property CMS, advanced search, optional email delivery and additional presentation features                                             | Separate scoped decision after P0/P1 acceptance                                                |

Implementation includes the media/editor/inquiry workflows and operations/recovery tooling. Checked items denote verified implementation or the linked hosted acceptance evidence. Unchecked composite items retain their outstanding operator, hosted or human sign-off requirements. See [release acceptance](release-acceptance.md), [operator guide](operator-guide.md) and [performance/quotas](performance-and-quotas.md).

**Start immediately with PostgreSQL integration tests and migration versioning.** Then establish the media data model and inquiry lifecycle before expanding the interface. Video replacement and additional paid asset generation are deferred; the current clip remains usable.

## Section 02 — Verified baseline and concrete gaps

The baseline below describes the source at the start of execution; the linked execution record supersedes its completed gaps. Source inspection confirmed that Next.js/React/TypeScript/Tailwind, the independently branded public pages, property filtering/galleries, journal, authenticated blog CRUD, scheduling, revisions, slug redirects, image upload validation, consented inquiry storage, RSS, sitemap and structured article metadata already exist. This plan extends them rather than scheduling the rewrite again.

The recorded foundation checks passed 21 service/content tests and three browser journeys. A later focused run passed hero playback and responsive/accessibility checks. These are historical local results, primarily against SQLite; hosted CI, PostgreSQL, Vercel deployment and Blob writes are not verified by those records.

| Current implementation                                                         | Product gap                                                                            | Relevant source                                               |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| PostgreSQL adapter plus local SQLite adapter                                   | Real PostgreSQL behavior and concurrency have not been integration-tested              | `src/server/database.ts`, `tests/server.test.ts`              |
| One schema file; migration function reapplies it and records version 1         | No ordered incremental migrations, checksums or tested upgrade/recovery path           | `database/schema.sql`, `scripts/database-migrate.ts`          |
| Upload returns a public URL                                                    | No media inventory, reference tracking, reuse picker or safe orphan cleanup            | `src/server/media.ts`, `src/components/admin/post-editor.tsx` |
| Inquiry endpoint inserts rows                                                  | No publisher inbox, lifecycle, retention tooling or duplicate-submission protection    | `src/server/inquiries.ts`, `database/schema.sql`              |
| Deliberate publisher secrets and signed sessions                               | No startup configuration report, operational recovery exercise or durable action audit | `src/server/auth.ts`, `.env.example`                          |
| Safe Markdown, explicit saves and conflict checks                              | No draft autosave/recovery or complete media/taxonomy workflow                         | `src/components/admin/post-editor.tsx`                        |
| Generic 503 response for unexpected failures                                   | No request correlation or sanitized operational error reporting                        | `src/server/http.ts`                                          |
| CI workflow exists; root repository has no configured remote or initial commit | Hosted CI and reproducible release delivery remain unproven                            | `.github/workflows/checks.yml`                                |

## Section 03 — P0: persistence, migrations and recovery

- [x] Add an isolated PostgreSQL integration-test target, with a local/CI disposable database. Never point tests at the production database.
- [x] Exercise both adapters for blog creation/update/delete, revisions, slug conflicts, escaped searches, tags, publication boundaries, inquiries, throttling and transaction rollback.
- [x] Test genuinely concurrent edits, duplicate-slug creation and rate-limit updates using separate connections. Require one valid outcome and explicit conflict responses rather than lost updates.
- [x] Replace the single replayed schema with ordered migrations, an applied-version/checksum ledger, transaction handling and a migration lock. Refuse changed applied migrations and concurrent migration execution.
- [x] Test a fresh installation and an upgrade from the existing version-1 schema with content, revisions and redirects intact. Keep seeding idempotent and separate from migrations.
- [ ] Establish independent database exports and a restoration command/procedure. Choose explicit backup frequency and retention, and restore into an isolated database before calling recovery ready.
- [x] Include media metadata and object inventories in recovery planning; database backup alone does not preserve Blob objects.
- [x] Configure the account-owned production PostgreSQL service and verify TLS, pooled connections, quotas and the explicit no-inactivity-pause requirement. Prisma Postgres is the documented candidate, subject to its current account policy and limits; do not claim unlimited free availability.

Progress: version-2 database exports, historical-format upgrades, complete media inventories, checksummed byte bundles, isolated CLI restoration and seven-daily/four-weekly retention tooling pass locally. The owner is the initial backup operator. Independent protected storage, actual daily scheduling and hosted Blob restoration remain open (items 6/8 and hosted release gates).

**Acceptance:** fresh setup, repeat migration, version-1 upgrade, concurrent operation and restore tests pass against PostgreSQL. A restored article retains its body, publication state, revisions, redirects and valid media references.

## Section 04 — P0: environment, access and operational reliability

Keep the current Node.js Next.js Route Handlers and reusable `src/server` services. Express is a viable TypeScript backend on Vercel, but this milestone does not require an API framework migration. If showcasing a separately deployed API becomes an explicit goal, record that architecture change before moving transport, authentication and deployment boundaries.

- [x] Centralize typed environment validation for canonical origin, allowed mutation origins, database, publisher secrets and media storage. Distinguish required capabilities from optional integrations; produce actionable configuration errors without exposing values.
- [x] Separate development, Preview and Production secrets/data. Preview publishing, deletions and uploads must not mutate production content. Validate trusted preview request origins independently of the production canonical URL.
- [x] Prevent Preview indexing with deployment-aware metadata/response headers and robots behavior. Authentication continues to protect private routes independently of indexing controls.
- [x] Require a non-default rate-limit hashing secret for hosted deployments; remove the current development-secret fallback from hosted operation. Verify client-address handling in the actual Vercel environment.
- [x] Exercise invalid credentials, expired/tampered sessions, wrong origins, absent mutation headers, throttling and password/secret rotation on real route handlers. Document deliberate publisher recovery without adding public signup or shipping reset credentials.
- [x] Add durable publisher action records for publish/unpublish, scheduling, revision restoration, deletion and media cleanup. Record actor/action/time/target; exclude passwords, secrets and complete inquiry or article bodies from logs.
- [x] Add sanitized structured errors and request IDs. Preserve useful operator diagnostics while keeping public responses generic. Add bounded database/query timeouts and accurate rate-limit retry information.
- [x] Implement a minimal readiness check with timeouts and an operator-facing configuration/health summary. Public checks expose no infrastructure or credential details. Avoid continuous polling that consumes free database allowance unnecessarily.
- [x] Review a compatible Content Security Policy and production HTTPS headers, then verify Next.js scripts, images, preview screens and Blob media under the policy.

Capability validation, immutable bindings, exact Preview origins, noindex, private-secret enforcement, audit records, correlated errors/readiness and nonce CSP are implemented. Actual separate hosted environments, HTTPS, secure cookies, Blob operations and zero browser CSP violations now pass. Explicit verification of platform client-address handling remains open.

**Acceptance:** misconfigured hosted capabilities fail clearly, private writes require a valid publisher session and approved origin, Preview is isolated, and an operator can correlate a failure and recover access without reading secrets from logs.

## Section 05 — P1: finish the editorial and media workflow

Preserve the existing blog lifecycle, SEO fields, safe rendering and optimistic version checks.

- [x] Add a relational media registry: generated key, storage URL, content type, dimensions, byte size, alternative text, upload time, publisher and retention state. Track references from article covers and supported inline images.
- [x] Provide a searchable/paginated media library, reuse picker and safe inline-image insertion. Require appropriate alternative text; support explicitly decorative images with an intentional empty description.
- [x] Restrict deletion to owned, unreferenced objects. Show affected articles before destructive changes. Shared media must survive deletion of one article; failed database/object operations must leave a recoverable state.
- [x] Detect abandoned uploads and add an explicit grace period plus reviewed cleanup. Never automatically delete an object merely because a draft was abandoned in the browser.
- [x] Make public draft-image behavior explicit throughout the editor. A private article does not make its public Blob cover private; sensitive draft media requires a separate private-storage design.
- [x] Add draft autosave with an honest saving/saved/failed state and conflict protection. Published edits remain explicit saves; autosave must not silently publish changes or alter publication status.
- [x] Provide useful Markdown formatting controls, validated image insertion, field-level errors, and live/saved preview distinctions. Preserve writing through expired-session reauthentication and failed saves.
- [x] Add category/tag suggestions and normalization to prevent inconsistent duplicates, while preserving existing article URLs and taxonomy links.
- [x] Confirm scheduling uses clear local-time input and UTC persistence. Due articles must appear consistently in routes, feeds and sitemap without requiring a cron job. Add exact-boundary tests.
- [x] Test stale edits, duplicate slugs, upload failures, repeated clicks, restore-as-draft and deletion while filtering/paginating the list.

**Acceptance:** the publisher can create, preview, upload/reuse media, save, schedule, publish, edit, restore, unpublish and delete an article without manual SQL or broken/shared-image deletion. Interrupted work has a recoverable draft.

## Section 06 — P1: complete inquiry handling and data lifecycle

- [x] Add a publisher-only inquiry inbox with pagination, search, property association and new/reviewed/archived states. No public endpoint returns saved personal details.
- [x] Validate submitted property references against the fictional inventory; distinguish general inquiries from property-specific inquiries.
- [x] Add bounded idempotency for duplicate submissions/retries and disable repeated submission while the browser request is pending. Preserve form contents on recoverable errors.
- [x] Keep honeypot/throttling protections, test their behavior, and enforce limits without requiring a new paid captcha service by default.
- [x] Define an explicit retention period and implement safe inquiry deletion/expiry. Align the privacy and cookie pages with the actual deployed collection/storage behavior; avoid assertions of unverified legal compliance.
- [x] Make receipt text explain the demonstration, storage and absence of email delivery. Operator review is not a promise that a real agent will reply.
- [x] Treat transactional email as an optional, separately configured integration. If introduced, distinguish a persisted inquiry from a failed notification and use retry/idempotency rather than pretending delivery succeeded.

**Acceptance:** a visitor submits once and receives one durable receipt; the publisher finds the record, changes its state and deletes it; unauthorized readers cannot retrieve it; retention behavior matches the published explanation.

## Section 07 — P1: public experience, content and search visibility

- [x] Review every public route for complete original copy, purposeful calls to action, useful empty/error states and consistent fictional-product disclosure. Keep the public experience coherent without introducing fake staff, testimonials or availability.
- [x] Give each property a coherent image gallery, descriptive per-image alternative text and complete validated specifications. Clearly label concept imagery where illustrations do not represent the same building.
- [x] Make collection filters/sorting shareable in the URL and preserve them through detail/back navigation. Add useful recovery for invalid property slugs and empty searches.
- [x] Complete journal pagination/search/taxonomy states and long-form typography. Consider a lightweight article table of contents for longer stories; verify headings, tables, images and external links.
- [x] Provide route-appropriate loading/error/404 behavior, gallery keyboard operation, mobile navigation dismissal and reliable focus after dialogs and navigation.
- [x] Audit titles, descriptions, canonical URLs, social previews, article structured data, RSS and sitemap against an actual production origin. Keep drafts/future content out of discovery; preserve valid old-slug redirects and handle deleted articles intentionally.
- [x] Create coherent social preview images and appropriate raster app icons. Verify external canonical/noindex behavior and crawlability, including whether robots exclusions prevent crawlers from seeing a required noindex instruction.
- [x] Keep the present hero and poster. Test video failure fallback and data-saving behavior. Defer the proposed 60-second film until functional release work is accepted and its download budget is measured.

**Acceptance:** a visitor completes property discovery, detail viewing, article discovery and demo inquiry journeys on desktop and mobile, with accurate URLs, understandable states and correct production metadata.

## Section 08 — P1: accessibility and measured performance

- [x] Expand accessibility checks beyond the contact form to public navigation, property filters/galleries, article pages, login, populated editor, revision dialogs, media picker and inquiry inbox.
- [ ] Perform manual keyboard and screen-reader checks for labels, announcements, focus order/restoration, modal containment, gallery changes, error summaries and video controls. Include 200% zoom and narrow populated states.
- [x] Preserve reduced-motion/data-saving behavior and verify that fallback media remains visible after a video load/decode failure.
- [x] Measure a real mobile production run before setting budgets. Initial targets: Lighthouse performance/accessibility/SEO at least 90 on representative public routes; LCP at most 2.5 seconds, CLS at most 0.1, and INP at most 200 ms when sufficient field data exists. Treat lab results as measurements, not field guarantees.
- [x] Optimize image sizes, fonts, hero loading and unnecessary client bundles in response to measured bottlenecks. Avoid a heavier animation stack without a demonstrated product benefit.
- [x] Bound repeated journal queries with request-scoped deduplication and carefully designed caching. Test publication changes and scheduled visibility under any cache; do not trade correctness for lower query usage.
- [x] Test larger synthetic datasets, query plans, pagination and pool limits, and document expected monthly database/storage operation use against the selected free allowance.

Local evidence: public Lighthouse medians are performance 93/93/96, accessibility 100 and SEO 100; CLS is zero. Simulated LCP medians are approximately 3.06/3.03/2.65 seconds, so the 2.5-second target remains open. Browser-driven keyboard/axe checks pass; a human screen-reader/200% zoom review and field INP are not claimed.

**Acceptance:** representative populated screens pass the agreed automated and manual checks, measured regressions are corrected, and the published performance record states the environment and limitations.

## Section 09 — P0/P1: validation, deployment and support

- [x] Extend CI with disposable PostgreSQL, migration/restore checks, dependency review and complete browser journeys. Keep real production secrets and content out of test jobs and uploaded artifacts.
- [x] Make browser test processes shut down reliably on Windows and Linux. The revised isolated runner has local Windows evidence and two successful Ubuntu GitHub CI runs, each completing eight Chromium journeys and normal job teardown; earlier manually stopped local runs remain historical evidence.
- [x] Test storage failures, database outages, interrupted uploads, concurrent edits and retries. Prefer tests proving user-visible recovery and data integrity over tests duplicating implementation details.
- [x] Prepare release notes, application license/asset notices, updated setup instructions, environment matrix, migration instructions and operator guides under `development-plans/`; README remains the sole authored root Markdown file.
- [x] Prepare the one root repository for GitHub: retain independent source/media provenance and font licenses, exclude secrets/runtime databases and review the staged scope. The owner authorized public delivery; four scoped commits are published to [havenfield-next-web-app](https://github.com/asteroidcrib729/havenfield-next-web-app). Snapshot/index/history secret scans pass; see [Git delivery](github-publication.md).
- [ ] Configure an isolated Vercel Preview with hosted PostgreSQL and Blob. Verify real authenticated upload, publish, schedule, slug redirect, restore, inquiry and logout behavior, including cold invocation and persisted data after redeployment.
- [ ] Prepare Production migration/deployment and a compatible application rollback. Demonstrate recovery from a bad release without silently discarding newly written content; destructive schema rollback is not the default.
- [x] Configure the canonical domain and HTTPS, verify headers/cookies/metadata, and record the deployed commit and successful smoke checks. The assigned portfolio domain serves the verified Git-triggered Production revision; [Git delivery](github-publication.md) records its SHA, CI and post-redeploy smoke checks. Search Console setup remains an owner-account task; submission does not guarantee indexing or ranking.
- [ ] Establish error review, quota monitoring and backup/restore ownership, with a short operator checklist and incident procedure. Routine operation must not depend on editing production files manually.

**Acceptance:** CI passes from a clean checkout; a real isolated Preview passes the full workflow; recovery is demonstrated; and the Production release has a documented deployed revision and verification record.

## Section 10 — Execution order and release gates

| Order | Deliverable                                                           | Dependency / gate                                                     |
| ----- | --------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 1     | PostgreSQL test target, versioned migrations, version-1 upgrade tests | Local work can start immediately; no production credentials needed    |
| 2     | Environment validation, security/error diagnostics, recovery tools    | Builds on the persistence foundation                                  |
| 3     | Media registry/library and inquiry lifecycle/inbox                    | Requires migrations and protected publisher APIs                      |
| 4     | Editorial reliability and public journey/SEO/accessibility polish     | Uses completed media/inquiry services                                 |
| 5     | Performance measurements, complete CI and release documentation       | Requires populated realistic test journeys                            |
| 6     | Hosted Preview, backup restoration, Production smoke checks           | Requires account-owned services and private environment configuration |

The owner subsequently authorized service provisioning and deployment. `havenfield.vercel.app` was unavailable; the owner selected `havenfield-portfolio.vercel.app`, which was the initial live origin with independent Production/Preview databases and Blob stores. On 2026-10-16 the owner changed it to `havenfieldre.vercel.app`; current canonical and origin checks pass. [Deployment evidence](deployment.md) supersedes the original absence of accounts. Independent backups and the remaining composite acceptance exercises stay open in [release acceptance](release-acceptance.md).

Account-dependent work uses private provider/Vercel settings. Never paste database passwords, session secrets or Blob tokens into this plan, chat, Git or screenshots. Account provisioning and paid services remain explicit choices; useful local implementation proceeds before those choices are needed.

Local feature execution is complete. Full Production release acceptance requires the remaining account-dependent, human accessibility and performance checks below; it has not been declared complete:

- [x] **G1 — Data:** PostgreSQL integration, incremental upgrades, concurrency and restore are proven.
- [x] **G2 — Publisher:** complete editorial/media/inquiry workflows work through authenticated UI with recovery and audit records.
- [ ] **G3 — Visitor:** public journeys are complete, original, responsive and accessible.
- [x] **G4 — Discovery:** production metadata, visibility, redirects, sitemap and RSS are consistent.
- [ ] **G5 — Operations:** isolated environments, secure configuration, diagnostics and quota/backup ownership are established.
- [ ] **G6 — Delivery:** clean-checkout CI and real hosted deployment/storage smoke checks pass, with release and rollback evidence.

Multiple editors/roles, database-managed property inventory, full-text search, notifications, analytics, internationalization, favorites/comparisons, interactive maps, and a separate Express API are future scope decisions. They are not silently added as blockers for the single-publisher portfolio product. Future numbered plans use `development-plan-03.md`, then `04`, under this directory.
