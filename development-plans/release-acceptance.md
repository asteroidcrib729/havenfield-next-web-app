# Release verification and optional follow-up

Updated 2026-10-17. **Plan 02 is delivered.** [The closure record](development-plan-02-closure.md) records 57 verified original entries, seven explicit deferrals and zero blocking items. Earlier tables and dated updates below preserve technical evidence; their unperformed checks are optional follow-up, not Plan 03 prerequisites. No human screen-reader sign-off, automated independent backup or enterprise availability guarantee is claimed.

## Section 01 — Locally implemented scope

Plan 02 now includes ordered migrations, real PostgreSQL concurrency/recovery coverage, environment bindings, protected operations diagnostics, nonce CSP, publisher action records, media inventory/reuse/reference protection/reviewed cleanup, draft recovery, taxonomy normalization, inquiry inbox/idempotency/retention, shareable collection filters, concept-gallery descriptions, article contents navigation, raster icons/social card, mobile hero loading improvements and recovery bundles with image bytes.

The executable checks and measurements are recorded in [execution progress](development-plan-02-progress.md), [machine-readable evidence](development-plan-02-evidence.json), [database scale evidence](database-scale-evidence.json) and [performance evidence](performance-evidence.json). These are historical local results. The subsequent authorized deployment provisioned account-owned services and passed [24 hosted check groups](deployment-hosted-evidence.json); synthetic cloud fixtures were removed. No Git commit or push was performed.

## Section 02 — Account provisioning and hosted acceptance

| Gate                 | Required evidence                                                                                              | Owner / next action                                                                                                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Production origin    | Assigned HTTPS domain; availability and redirects verified                                                     | Completed: owner-selected `havenfieldre.vercel.app`; canonical metadata and publisher origin were corrected and reverified on 2026-10-16                                                |
| Durable PostgreSQL   | Account-owned database, verified TLS/pool/limits and current no-inactivity-pause policy                        | Provisioned: separate Prisma databases, direct/pooled TLS and migrations/bindings verified; continue account quota review                                                               |
| Preview isolation    | Independent bound database, secrets and storage; Preview noindex and trusted origin verified                   | Completed: separate databases, secrets and stores; cross-environment database access is refused                                                                                         |
| Real Blob operations | Authenticated upload/reuse/reference denial/delete plus persistence after redeploy                             | Real upload, delivery, reference denial and deletion pass in both environments; explicit media persistence after another redeploy remains an acceptance exercise                        |
| Independent recovery | Daily protected off-checkout export, rotation, actual Blob restore and content smoke check                     | Backup operator selects destination/scheduler and restores into independent services                                                                                                    |
| Hosted application   | Cold invocation, schedule boundary, redirects, inquiry, logout, headers/cookies and persistence after redeploy | 24 hosted groups pass; staged Production reads existing articles after redeployment. Hosted exact-time publication/revision-restoration exercises and actual cron execution remain open |
| CI/Git delivery      | Chosen public remote, source/asset review, clean CI run and deployed commit                                    | Completed: public `havenfield-next-web-app`, passing full-history secret scan and Ubuntu CI, verified matching Git revision in an automatic Production deployment                       |

Do not insert secrets into this file. Capture service names, domain, environment, deployed revision, dates and pass/fail observations only. Search Console requires the owner's selected domain/account and does not guarantee indexing.

## Section 03 — Accessibility and performance sign-off

Automated axe/Lighthouse checks and browser-driven keyboard tests cover public pages, galleries, login, populated editor, media, inbox and operations. Keyboard tests verify Escape dismissal and trigger focus restoration. Screenshots and width checks cover 320–1440 pixels. Automation is not a human screen-reader review.

Before release, complete these with an actual screen reader and browser at 200% zoom:

- [ ] Read navigation, skip link and route heading changes; check logical focus order.
- [ ] Read filter labels/results, gallery changes, hero playback state and reduced-motion fallback.
- [ ] Read article headings/contents, tables and meaningful/decorative images.
- [ ] Read editor validation, recovery notices, live/saved previews and session-expiry recovery.
- [ ] Open revision/media/deletion dialogs, verify focus containment and return after cancel/confirmation.
- [ ] Read populated media/inquiry/operations screens and verify narrow/zoomed controls remain reachable.

Local Lighthouse results use simulated mobile throttling; they are not field Core Web Vitals. Keep the Production LCP target of 2.5 seconds, CLS target of 0.1 and field INP target of 200 ms. Repeat on the actual hosted origin and record medians/variance. Field INP cannot be established without sufficient real usage. Any unmet local or hosted performance target remains visible in the measurement record.

## Section 04 — Source and asset release review

Only README is authored root Markdown. Plans, operating notes and machine evidence live here; temporary hosted screenshots are in ignored cache storage. Runtime databases, uploads, exports, environment files, test traces, caches and credentials are ignored and excluded from deployment tracing. The repository has one root `.git` and the public GitHub remote. Snapshot, index and complete history scans found no credentials. The initial CLI upload has a historical SHA-256 [source manifest](deployment-source-manifest.json); subsequent Git deployments have verified commit provenance in [delivery evidence](github-delivery-evidence.json).

The new code/copy/vector identity is independent; font notices remain with retained Poppins/Playfair files. Generated images and the hero have provenance in [brand and assets](brand-and-assets.md). Review the user's generation-account sharing terms and publisher-upload rights before public delivery. The software license covers application source, not third-party fonts or a guarantee of exclusive rights in generated assets. No old client source, VPS keys or brand assets belong in the public repository.

## Section 05 — Audit delivery update (2026-10-16)

[The current follow-up](development-plan-02-delivery.md) brings Plan 02 to 56/64 checked. Both actual account-owned PostgreSQL services, current quotas/policy, certificate-verified TLS and real Vercel client-address handling are proven. Nine hosted mobile lab runs meet the score/LCP/CLS targets; field INP remains unmeasured. Hosted revisions, timed publication and exact image bytes across a Preview redeploy pass; synthetic resources were cleaned up. The Operations screen now reports completed maintenance timestamps. Earlier tables preserve initial-release evidence; their missing hosted timing/revision/media portions are superseded here. Independent backup/hosted recovery, human assistive-technology sign-off, unambiguous scheduled-origin evidence, monitoring and compatible Production rollback remain open.

## Section 06 — Free recovery and rollback follow-up (2026-10-16)

[Current follow-up](development-plan-02-delivery.md) is now **57/64 checked; seven open**. The owner-authorized real Production rollback preserved newer content and restored automatic assignment. Private hosted database/image recovery passed and temporary resources were deleted. [Encrypted Drive backups](free-backups.md) are prepared but need owner upload, independent download verification and scheduling. [Human review](accessibility-owner-review.md), recovered public-site image delivery and established cold invocation remain unproven. See [sanitized results](free-operations-evidence.json).
