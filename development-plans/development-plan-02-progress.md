# Development plan 02: execution record

Updated 2026-10-15 (Asia/Karachi). Production is live at [havenfield-portfolio.vercel.app](https://havenfield-portfolio.vercel.app). Fifty-three of 64 original checkboxes are verified; 11 composite acceptance items remain open for independent recovery, account quota/client-address review, additional hosted exercises, human accessibility or performance. The hosted deployment is complete; full product release acceptance is not claimed. See [the plan](development-plan-02.md), [deployment record](deployment.md) and [release acceptance](release-acceptance.md).

## Section 01 — Product behavior delivered

The publisher can create, preview, recover interrupted draft writing, save, schedule, publish, edit, unpublish, restore and delete stories. Recovery is server-side and version-protected; published/scheduled edits remain explicit. Category/tag suggestions reuse established spelling. Safe Markdown controls, inline image insertion, field errors, dirty-navigation guards and separate live/saved previews preserve the editorial workflow.

Media has a relational inventory, descriptions/decorative intent, search/pagination, reusable picker, article/revision/recovery reference protection and reviewed cleanup. Shared images survive deletion of another article. An upload is registered before storage begins; failed upload/deletion states remain inspectable. Deletion is limited to owned objects and environment prefixes. Storage failures, recovery conflicts and seven-day cleanup grace are tested.

The protected inquiry inbox supports search, pagination, property associations, new/reviewed/archived states and deletion/expiry. Consent, honeypot and durable throttles remain active. Duplicate retries produce one receipt; changed details with a claimed key conflict. Thirty-day retention and daily protected maintenance are implemented; actual scheduled execution requires deployment. Privacy/cookie copy describes URL filters, tab recovery references, retention and the absence of email delivery.

Visitors can share collection filters and retain them through detail/back navigation. Concept galleries have descriptive alternatives, keyboard controls and an honest moodboard explanation. Long-form articles offer contents links. Social PNG and raster icons use the independent brand. The current video remains; mobile playback is opt-in, desktop autoplay is supported and motion/data-saving/decode fallbacks are verified.

## Section 02 — Persistence, isolation and operations

Migrations 001/002 are ordered, checksummed, transactional and locked. Fresh/repeat/incremental execution, known version-1 upgrade, changed/newer history rejection and failed-DDL rollback pass against SQLite and actual PostgreSQL. Independent connection tests prove concurrency protection for edits/slugs/rate limits. Environment binding refuses cross-environment database use. Hosted configuration requires a canonical HTTPS origin, exact mutation origin and independent private secret.

The application keeps TypeScript services behind Node.js Next.js Route Handlers. Express remains an optional later transport decision; Vercel does not need a separately started Express process. Publisher actions persist actor/action/time/target without article/inquiry bodies or secrets. Generic public failures have sanitized request IDs, accurate rate-limit retry information and bounded waits. Readiness and the operations screen expose capability status, migration history and recent actions without continuous polling.

Nonce CSP and response headers are implemented and the real browser reports no CSP violations on checked public journeys. Metadata is resolved before streaming so old slugs produce HTTP redirects. Robots is deployment-aware and dynamic. RSS uses no-store to preserve exact publication boundaries; routes, feed and sitemap are tested immediately before/at a UTC scheduled time. Real Preview/Production HTTPS, Blob and client-address checks remain account gates.

## Section 03 — Recovery and failure handling

Format-2 exports contain article/revision/redirect, media/reference, action, recovery and inquiry/receipt data. Format-1 exports are validated and upgraded. Corruption, unknown/nonempty targets and failed row insertion are refused or rolled back. PostgreSQL repeatable-read export and exclusive restore locks preserve transaction consistency. Target environment bindings are retained independently; source Production bindings are never copied into Preview.

Complete recovery bundles include checked object bytes plus a final manifest. Actual CLI tests restore a real WebP, article body/publication, revisions, redirects and all cover/inline/revision references. Local-to-Blob URL remapping preserves encoded inline URLs and snapshots; the original export stays unchanged. Failed storage operations remain reviewable. Real Blob upload/restore is unverified because no store exists yet.

Daily/pre-release export, seven daily/four weekly retained copies, reviewed pruning, operator ownership, independent target recovery and application-compatible rollback are documented in [the operator guide](operator-guide.md) and [database recovery](database-recovery.md). Independent destination and scheduler provisioning remain open. Tests never select Production implicitly.

## Section 04 — Final checks and measurements

| Check | Result |
| --- | --- |
| Strict TypeScript, ESLint and optimized production build | Passed |
| Local tests | 55 passed across nine files |
| Actual PostgreSQL tests | 41 passed across three files, isolated loopback PostgreSQL 18.4 |
| Production browser journeys | Eight passed, Edge, automatic owned-server and fixture cleanup |
| Fresh source/install check | npm ci plus complete check passed in an isolated copy with freshly installed locked dependencies |
| Dependency audit | Zero reported vulnerabilities |
| Production tracing | 48 trace files checked; zero private/runtime/test/cache or portable-database/Lighthouse matches |
| Larger PostgreSQL fixture | 5,000 articles, bounded page/query plans and at most two observed pool connections |

The SQLite/PostgreSQL suites share service tests; their counts must not be added as distinct tests. Hosted GitHub CI and Linux browser teardown have not run. The fresh-install result is local Windows evidence. Browser cases cover hero playback/failure/data-saving, collection/inquiry/discovery, 320–1440 pixel widths, editorial lifecycle/revisions, URL/navigation/gallery keyboard/CSP, interrupted writing/media/inbox/operations and real handler authorization. Axe checks include login, populated editor, revision dialog, media picker/library, inbox and public screens.

Three sequential mobile Lighthouse runs per representative public route produced these medians:

| Route | Performance | Accessibility | SEO | LCP | CLS |
| --- | --- | --- | --- | --- | --- |
| Home | 93 | 100 | 100 | 3.06 s | 0 |
| Collection | 93 | 100 | 100 | 3.03 s | 0 |
| Representative article | 96 | 100 | 100 | 2.65 s | 0 |

Mobile initial homepage transfer fell from about 1.75 MB to 0.52 MB by deferring video playback. Cover priority/compression, contrast and accessible names were corrected from measured findings. The 2.5-second LCP target is not met by these simulated medians and remains open; no field INP or hosted performance guarantee is claimed. Human screen-reader and 200% browser zoom sign-off remain in [release acceptance](release-acceptance.md).

## Section 05 — Cleanup and external handoff

Owned test clusters/fixtures shut down and clean themselves automatically. Earlier UUID browser databases and confirmed test media were audited against the protected default database before removal. Default SQLite files, fonts and hero hash checks remain unchanged. Unidentified local uploads, the explicitly named older e2e fixture, independent backups and user runtime data are preserved. [Cleanup](cleanup.md) and [cleanup evidence](cleanup-product-evidence.json) record exact removal counts.

The one root repository remains on main with no commits or remotes. No publication was performed. README remains the sole authored root Markdown file; release notes, operating guidance, screenshots, license/asset context and evidence are kept under development-plans. The root MIT LICENSE covers application source, with third-party/generated asset notices handled separately.

At this earlier local milestone, the intended origin was https://havenfield.vercel.app and no hosted services existed. Section 08 below supersedes that state with the authorized account-owned deployment. Independent recovery remains a gate in [release acceptance](release-acceptance.md).

## Section 06 — Development footer regression (2026-10-14)

The reported blank button below the footer was the Next.js development indicator. Its shadow-root styles were rejected by the nonce-only style policy, leaving a static 56 × 46 pixel button in normal document flow. Disabled the indicator through `devIndicators: false` and allowed inline style elements only in development, as required for the framework's development overlays and style injection. Production retains nonce-based styles and excludes development-only script evaluation.

Verified the running development server on home, collection, journal and contact at 375/1440 pixels: no indicator, no horizontal overflow, footer aligned with the document end within subpixel rounding, and zero style-policy violations. TypeScript and focused ESLint checks passed. Direct framework-response checks confirmed the distinct development/production policies. The existing development server restarted automatically after the config change; no user process was terminated.
## Section 07 — Deployment access and upload preparation (2026-10-14)

At the first connection check, the user authorized deployment but the agent session exposed no Vercel/Prisma tools or authenticated CLI. Only local upload preparation was performed at that stage. The tools later became available and Section 08 records the subsequent provisioning and deployment.

Added a root deployment upload allowlist and ignored future `.vercel` account linkage in Git. A matcher-based inventory verified 127 eligible files (8,763,690 bytes), 16 excluded private/generated example paths and 10 required build/runtime paths. Application source, schema migrations, fonts and approved media remain included. See [deployment continuation](deployment.md) and [upload evidence](deployment-upload-evidence.json). Hosted release gates remain open until authenticated service access and actual hosted verification are available.

## Section 08 — Account-owned deployment and verification (2026-10-15)

The owner approved creation of independent Prisma Production/Preview databases in Singapore and completed project-local Vercel CLI login. The CLI verified the intended Hobby scope after plugin account-scope calls returned 403. Provisioned and linked `havenfield`, configured Next.js/Node 24 and Singapore functions, connected separate public Blob stores, and generated separate private publisher/session/maintenance credentials. Schema migrations 001/002, immutable bindings and three original articles are prepared in each database.

The original requested subdomain returned 409; the owner selected `havenfield-portfolio.vercel.app`, which Vercel assigned and verified. The platform converted the initial deployment to Production despite the Preview flag; a subsequent true Preview was configured and tested independently. Actual Vercel dry-run verification also caught a difference from the local ignore matcher: directory exceptions require the supported negation form. Corrected the allowlist before the first source upload. The final selection is 127 files, 8,763,816 bytes, with private/runtime/cache data excluded.

The preflight caught a CommonJS named-import incompatibility in the ESM configuration checker; the hosted browser caught Zod's dynamic compilation probe under strict CSP. Both were corrected without broadening the production policy. TypeScript, focused ESLint and all 55 local tests pass. The corrected Preview passed 12 hosted check groups; Production was then staged, checked for health and retained articles through authenticated CLI requests, promoted as that exact build, and passed the same 12 groups on the public origin.

Real tests cover publisher UI/session flags, forbidden origins/private reads, responsive pages/footer, actual Blob upload/WebP delivery/reference protection/deletion, draft/schedule/publish/edit/slug redirects, populated editor, idempotent inquiries/inbox/review/deletion, manual maintenance authentication and retention, logout and zero CSP violations. Cross-environment database bindings refuse access. Verification cleanup leaves exactly three original articles, zero active uploads and zero inquiries in each database. The SEO audit passes 11 routes plus robots, protected-page noindex and the social image. No error/fatal server records appeared in the reviewed five-minute window.

Production: `dpl_DgiRCmaxNBELUB3fKEqCtGvH6RMF` (READY, promoted; 42.879 seconds to READY). Preview: `dpl_7xJkog4a178bxiiNXDH8C2F9J6Dh` (READY, protected). No initial Git commit or remote exists; the [source manifest](deployment-source-manifest.json) identifies the actual uploaded source. [Release state](deployment-state.json) and the [hosted evidence](deployment-hosted-evidence.json) record results without credentials. Independent backups, hosted recovery, scheduled cron observation, additional composite hosted exercises, human accessibility, performance and hosted CI remain explicit acceptance work.

## Section 09 — Public GitHub delivery (2026-10-15)

The owner authorized committing all pending work and publishing the independent portfolio. Reviewed 207 publishable files; snapshot, exact staged tree and complete initial four-commit history pass Gitleaks 8.30.1 with zero findings. Private operational identifiers were removed from public records; real environment/authentication/runtime data remain ignored. Preserved font notices and reviewed screenshots containing synthetic editor identities. TypeScript, full ESLint, 55 service tests, 41 PostgreSQL tests and the dependency audit pass.

Created the public [havenfield-next-web-app repository](https://github.com/asteroidcrib729/havenfield-next-web-app), pushed four iteration-scoped commits and verified matching local/remote revisions and a clean tree. Vercel confirms its native Git connection and `main` Production branch. Both clean-checkout Ubuntu CI runs pass the full-history secret scan, dependency audit, TypeScript, ESLint, 55 service tests, production build, 41 PostgreSQL tests and eight Chromium journeys with normal Linux teardown. A post-connection push automatically produced a READY Production deployment from its exact Git SHA, assigned the portfolio domain, and retained the three seed articles. [Git delivery](github-publication.md) records the run/deployment evidence. Source/publication, Linux teardown and canonical-domain/deployed-revision checkboxes are now closed. Composite recovery, hosted exercises, accessibility and performance gates remain open.

## Section 10 — Shared Prisma project (2026-10-15)

Consolidated the two active databases under GitHub-linked Prisma project `havenfield`, preserving production on `main` and restoring the existing preview into a separate database on `preview`. The provider rejected cross-project reassignment and its clone endpoint returned HTTP 500; the supported CLI created an empty target and the existing restoration service copied all nine retained tables and both migration identities. Exact source/target comparisons, verified TLS, pooled access and bidirectional environment isolation pass. Only Vercel Preview DATABASE_URL changed; publisher/media and Production settings remain intact. The new protected Preview passes 26 hosted checks; both environments retain three articles and three revisions with no synthetic drafts. The former preview project is explicitly labeled as a rollback source. See [consolidation record](prisma-project-consolidation.md) and [evidence](prisma-consolidation-evidence.json). This completes the requested organization change; unrelated composite release gates remain open.
