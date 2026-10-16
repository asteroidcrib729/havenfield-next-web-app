# Development plan 02: completion audit

Audited 2026-10-16 (Asia/Karachi) against the current [Plan 02 checklist](development-plan-02.md), source, CI/release evidence and new-domain hosted checks. **Verdict: not fully complete. There are 53 checked items out of 64, with 11 unchecked composite acceptance items.** This is a checklist count, not a claim that 83% of implementation effort remains measurable or that every checked item was re-executed during this documentation review.

## Section 01 — What is delivered and verified

The Next.js/React/TypeScript/Tailwind application, independent identity, public property/journal flows, publisher CRUD/scheduling/revisions/SEO, recovery drafts, media library/reference protection, inquiry inbox/retention, incremental migrations, environment isolation and Git/Vercel delivery are implemented. Prior records include 55 local service tests, 41 PostgreSQL tests and eight browser journeys in passing hosted CI. SQLite/PostgreSQL service cases overlap; do not report their sum as distinct functional scenarios.

Hosted evidence includes 24 initial release check groups, 26 post-consolidation checks, and a real hosted Preview database restore of nine retained tables with migration/content comparisons. The new-domain review adds 49 checks covering public routes, canonical/RSS/sitemap URLs, Preview noindex, existing publisher login/article reads/logout in both environments, and screenshot image/layout/footer checks. This review does not substitute those smoke checks for the missing recovery, accessibility or performance acceptance work.

Current production is [havenfieldre.vercel.app](https://havenfieldre.vercel.app). Both active databases are in Prisma project `havenfield`, with production on `main` and preview on `preview`. The retired rollback project was deleted only after a fresh private export and active-resource/dependency checks. Current domain and deletion evidence is in [the maintenance record](maintenance-review-2026-10-16.json).

## Section 02 — Eleven outstanding checklist entries

| ID | Plan 02 item / gate | Delivered portion | Evidence still required |
| --- | --- | --- | --- |
| P02-01 | Section 03: independent exports and restoration | Checksummed exports, retention tools, local/hosted database restore and procedures exist | Independent protected destination, actual scheduled rotation, and complete hosted recovery including image bytes |
| P02-02 | Section 03: hosted database, TLS, pool, quotas and no-inactivity pausing | Account-owned production/preview services, verified TLS, bounded pooling and actual hosted operation | Current account quota/allowance review and documented provider/account inactivity policy; no unlimited-free claim |
| P02-03 | Section 04: hosted rate-limit secret and client addresses | Hosted secret enforcement and durable throttle tests exist | Real Vercel client-address/header trust validation; do not treat a user-supplied forwarding header as verified |
| P02-04 | Section 08: human keyboard/screen-reader/zoom review | Automated axe, browser keyboard and responsive checks exist | Actual screen-reader and 200% zoom review of populated public/editorial screens, with findings and fixes |
| P02-05 | Section 08: hosted performance and field evidence | Historical local Lighthouse measurements exist; all three local LCP medians exceed 2.5 s | Repeated hosted mobile measurements, fixes for unmet budgets, and field INP only when enough real data exists |
| P02-06 | Section 09: full isolated hosted Preview workflow | Hosted upload, publish/schedule/edit/redirect/inquiry/logout and database restore have evidence | Hosted revision-restoration and exact-time publication exercises; explicitly retain/serve referenced media through another redeploy, plus complete hosted image recovery |
| P02-07 | Section 09: compatible Production rollback | Production deployment, Preview cutover and rollback procedures exist | An observed bad-release/application rollback exercise preserving newly written content; do not confuse deleting an obsolete rollback database with proving release recovery |
| P02-08 | Section 09: operational ownership/monitoring | Operator guide, diagnostics, bounded error review and protected maintenance exist | Actual scheduled-job observation, quota/backup monitoring and confirmed operational ownership/destination/scheduler |
| P02-09 | G3: Visitor | Public journeys, responsiveness and automated accessibility exist | Close the human accessibility and performance requirements above |
| P02-10 | G5: Operations | Isolated environments, secrets, diagnostics and procedures exist | Close independent backup/schedule/quota/client-address acceptance above |
| P02-11 | G6: Delivery | Public Git remote, passing clean-checkout CI and real deployments exist | Close compatible rollback, complete hosted recovery/storage persistence and remaining composite hosted acceptance |

G1 Data, G2 Publisher and G4 Discovery remain checked with their recorded evidence. The other three composite gates remain open. No unchecked item is silently moved out of Plan 02 to make its completion count look better.

## Section 03 — Measurements and current limitations

Historical local mobile medians were: home LCP 3.06 s, collection 3.03 s and representative article 2.65 s; scores were 93/93/96 performance, 100 accessibility and 100 SEO, with CLS zero. Those are simulated local runs, not current hosted measurements or field Core Web Vitals. The LCP target remains unmet in that record.

Private local exports are useful rollback artifacts but are not independent off-checkout backups. Current Prisma readiness proves present access, not an uptime SLA or a no-inactivity-pause guarantee. Manually invoking the maintenance endpoint proves its handler, not that Vercel's scheduled invocation occurred. Automated keyboard/axe tests do not establish a human screen-reader sign-off.

## Section 04 — Follow-through

[Plan 03](development-plan-03.md) starts by carrying forward these acceptance requirements, then adds 28 original images, richer per-page content and selected product features. Update Plan 02's individual checkboxes only when the corresponding missing evidence is recorded. Keep this dated audit as the snapshot of what was verified on 2026-10-16.
