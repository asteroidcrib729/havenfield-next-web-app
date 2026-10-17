# Development plan 03 - delivery closure

Delivered 2026-10-17 (Asia/Karachi). **29 of 29 checklist entries complete.** Production remains https://havenfieldre.vercel.app; the protected editorial Preview remains https://havenfieldre-preview.vercel.app.

## Section 01 - Final six items

| Item                       | Delivered result and evidence                                                                                                                                                                                                                                                                                                                             |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Property authoring         | Schema 3, preserved four IDs/slugs/inquiries, private drafts, publication, gallery order/alt/focal settings, optimistic versions, revisions and action records. [Guide](property-and-media-authoring.md); [Production](plan03-property-hosted-production.json) and [Preview](plan03-property-hosted-preview.json) checks.                                 |
| Media authoring            | Collections, versioned metadata, three crop previews, read-only repository picker/usage, property/current/history deletion protection. Schema-3 recovery and legacy bundles tested. [Recovery evidence](plan03-property-recovery.json).                                                                                                                   |
| Feedback and design review | Busy/success/error states, confirmations, reduced-motion-safe feedback and optional-tool decisions. Unavailable browser-local choices can be removed without discarding valid homes. [Design review](plan03-design-review.md); [final browser check](plan03-final-browser-followup.json).                                                                 |
| Immutable Preview review   | Two pre-cutover builds are unavailable and have no aliases. Preserve history and use the freshly verified stable Preview. No resource deletion or protection changes. [Dated review](plan03-preview-dependency-review.json).                                                                                                                              |
| Page/asset audit           | 40 public and 20 authenticated loaded-screen checks at 320/1440 px: no broken images, overflow or automated axe violations. Private captures stay ignored. Removed 55 hash-verified unused derivatives, saving 3,153,868 bytes; retained 28 masters and the used vignette. [Audit](plan03-final-visual-audit.json); [cleanup](plan03-asset-cleanup.json). |
| Hosted performance         | One-shot baseline, three-run pre-tuning sessions and final hosted mobile measurements. Reduced query overhead, removed a noncritical preload, deferred article recommendations and corrected intermittent collection loading movement. [Final measurements](plan03-hosted-performance.json).                                                              |

## Section 02 - Final hosted mobile lab results

| Route                                          | Median performance | Median LCP | Median CLS |
| ---------------------------------------------- | -----------------: | ---------: | ---------: |
| /                                              |                 93 |     2.92 s |          0 |
| /properties                                    |                 97 |     2.15 s |          0 |
| /journal/a-clearer-guide-to-your-first-viewing |                 94 |     2.44 s |          0 |

All nine final runs have zero CLS; accessibility and SEO score 100 in each run. Scores and timings vary between runs. The final homepage median remains above the aspirational 2.5-second LCP target; individual blocking-time outliers remain visible in the JSON. These lab results support the implemented improvements and are not field INP, a user-perceived speed guarantee or a certification. Further performance tuning is optional portfolio maintenance.

## Section 03 - Delivery boundaries

76 service tests, 49 PostgreSQL tests and 14 browser journeys pass; suites overlap. Formatting, types, lint, build, full-history/staged secret scans and exact application CI/deployments are verified. [Machine-readable closure](plan03-closure-evidence.json) identifies the tested application commit; the final delivery message records the subsequent documentation commit.

Both active databases use schema 3, and the local pooled Preview profile matches the independent Preview database. Private pre/post migration exports were created; real schema-3 exports restored with complete table equality into disposable local databases. No live database was overwritten. Synthetic hosted properties and owned uploads were removed after checks; intentional audit/deleted-object records remain.

All 28 original images remain delivered. Three articles are public; six original journal drafts remain private in each environment until deliberately published. This is an editorial choice, not an unfinished publishing feature. No paid resource, purchase, card authorization or new animation service was needed. Plan 02 deferrals, human screen-reader/native zoom review, independent cloud-backup scheduling and field INP remain optional and are not reopened.
