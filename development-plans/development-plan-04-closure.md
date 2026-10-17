# Development plan 04 - delivery closure

Delivered 2026-10-17 (Asia/Karachi). **All six agreed improvements and the verification entry are complete: 7 of 7 checklist entries.**

| Improvement                 | Delivered result                                                                                                                                                                                                                         |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public studio demonstration | Guided, read-only property/journal/media/inquiry tour at /studio-demo. Fixed fictional samples; no private API reads, live inquiry data or writes.                                                                                       |
| Case study and walkthrough  | First-person [case study](case-study.md), 69.7-second 720p recording of actual isolated workflows, [text alternative](walkthrough-transcript.md), README links and refreshed screenshots.                                                |
| Floor plans and brochures   | Four distinct, explicitly illustrative arrangements; mobile room legends; current published-home brochures with print/PDF controls. Plans are suppressed when original specifications change.                                            |
| Inquiry management          | Conversation stages, internal notes, property filtering, version-protected saves and private formula-safe filtered CSV export. Existing review/archive states remain available.                                                          |
| Mobile loading              | Server-rendered responsive WebP posters and deferred film loading; reduced-motion/data-saving and error behavior retained.                                                                                                               |
| Editorial content           | Three reviewed original drafts published through the normal versioned service in each environment. Six stories now public; three original drafts remain private. Escaped line breaks normalized for proper Markdown paragraphs/headings. |

## Verification

81 service tests, 50 PostgreSQL tests, 17 browser journeys and one explicit isolated recording pass succeeded. The final three affected browser journeys were rerun after presentation refinements. Formatting, types, lint, build and dependency audit pass. [Exact application CI](https://github.com/asteroidcrib729/havenfield-next-web-app/actions/runs/39059049736) passed for b6c4b6b2d93b22046cd349bd633aa59d633e5819. Suites overlap; these counts are not a unique summed total.

Eight live loaded-screen checks cover the home, public studio and courtyard brochure, including 320/375/1440-pixel views where applicable. All images were decoded, brought into view and painted before screenshots. There were no broken images, horizontal overflow or automated axe violations. Human screen-reader/native-zoom review remains the owner's separate review.

Production and protected Preview pass [hosted checks](plan04-hosted-verification.json): publisher authentication, notes and stage persistence, property filtering, wrong-origin refusal, stale-version rejection, private CSV export, article/RSS/sitemap visibility, draft privacy and brochure/hero delivery. Invented test inquiries were deleted and publisher sessions logged out; ordinary audit actions and expiring retry receipts remain.

## Mobile measurements

| Homepage mobile lab median | Before |  After |
| -------------------------- | -----: | -----: |
| Performance score          |     91 |     98 |
| LCP                        | 2.92 s | 2.13 s |
| CLS                        |      0 |      0 |

Three runs per route; [baseline](plan04-performance-before.json) and [post-release results](plan04-performance-after.json) retain individual measurements. All nine final runs have zero CLS and accessibility/SEO scores of 100. Scores and timings vary; these are laboratory observations, not field INP or a speed guarantee. Home and collection routes match across sessions. The sampled article changed following publication, so article results are not a direct before/after comparison.

## Data, recovery and budget

Migration 004 is additive and preserved every original exported field/record in both databases. Backup format 4 includes conversation fields and accepts legacy formats 1-3. Six actual pre-migration, post-migration and publication snapshots restored with complete table equality into disposable local databases; neither live database was overwritten. Independent Production/Preview bindings and local pooled Preview access remain verified.

No purchase, card authorization, paid account, new cloud resource or AI generation was needed. The successful source recording, private backups and operator credentials remain ignored. Failed recording attempts and one stopped disposable PostgreSQL fixture were removed after boundary checks; see [cleanup evidence](plan04-cleanup.json).

[Machine-readable closure](plan04-closure-evidence.json) identifies the tested application source and application-tree fingerprint. The final Git delivery may include a subsequent documentation-only commit. Plan 02 deferrals and human accessibility review are not reopened.
