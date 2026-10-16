# Performance and quota record

## Section 01 — Measurement boundaries

The original measurements run on a local Next.js production build with disposable seeded SQLite and Lighthouse 13.5.0 in headless Edge using simulated mobile throttling. See [historical local public-route evidence](performance-evidence.json). Current hosted measurements appear in Section 04. Scores and simulated timings vary with host load; they do not establish Vercel latency, provider availability or field INP. The 2.5-second Production LCP target remains a release check wherever local measurements exceed it.

The first homepage measurement transferred about 1.75 MB and scored 89. Mobile playback now requires an explicit action, removing the initial film download; subsequent measurements transfer about 0.52 MB. Desktop autoplay remains supported, and poster fallback covers reduced motion, data saving and decode failures. Image priority/compression, font delivery and contrast/accessibility names have been reviewed against actual measurements. No animation library was added.

Final measurements and scores are summarized in the execution record. Repeat against the actual assigned domain, including cold invocations and representative uploaded covers. Obtain field Core Web Vitals only when there is sufficient real use; TBT is a lab measurement, not INP.

## Section 02 — PostgreSQL scale check

[Database evidence](database-scale-evidence.json) records a real PostgreSQL 18 run with 5,000 synthetic articles, a 12-item page near offset 4,800, actual query plans, indexed slug lookup and ten concurrent jobs sharing at most two pool connections. Timing is local evidence, not a hosted service SLA. The public list scans/sorts more rows when most articles are published; that is recorded in the plan rather than hidden by forcing the planner to use an index. A four-home/small-journal portfolio does not require full-text search or a search service.

Article metadata and rendering share a request-scoped lookup through React cache. Scheduled visibility is still evaluated on each new request; there is no cross-request publication cache. Media reference updates preserve historical reference rows and inspect only the current revision, avoiding repeated downloads of every historical article body on each save.

## Section 03 — Free-tier operating estimate

Prisma's [pricing](https://www.prisma.io/pricing) currently lists 200,000 operations/month, 2 GB storage and a free pooled connection limit of ten. Its [provider comparison](https://www.prisma.io/blog/serverless-postgres) states no database scale-to-zero or cold starts; the idle policy is a provider claim, not an uptime guarantee. Both account-owned databases and their current usage have now been verified; see Section 04. Its [FAQ](https://www.prisma.io/docs/postgres/faq) explains what happens when the free allowance is exhausted. Continue reviewing account usage before reaching the shared allowance.

Budget conservatively for SQL queries, transaction control, connection binding checks and publisher writes; actual provider metering is authoritative. Illustrative planning assumptions:

| Monthly activity                                 | Budget assumption                                        | Planned operations |
| ------------------------------------------------ | -------------------------------------------------------- | ------------------ |
| 10,000 homepage/journal/article visits           | Up to 5 each, including related stories/taxonomy         | 50,000             |
| 100 explicit article writes/restores             | Up to 35 statements including revisions/references/audit | 3,500              |
| 500 recovery saves                               | Up to 10 statements each                                 | 5,000              |
| 100 inquiries                                    | Up to 20 statements with limits/receipts/transactions    | 2,000              |
| Publisher views, cron, exports and cold bindings | Reserved operational headroom                            | 10,000             |
| Planning total                                   | Estimates, not measurements of billing                   | 70,500             |

Do not interpret this estimate as capacity promised by the application or provider. Many media objects or large histories increase publisher work. Serverless instances each own a two-connection pool, so five busy processes can reach a ten-connection provider limit. Monitor provider metrics and reduce concurrent Preview traffic or choose a different allowance before approaching limits. Health checks and the operations screen do not poll continuously.

Keep uploaded media well below storage allowance and review normalized byte totals and provider egress. Static project assets ship with the source deployment; public uploads occupy Blob storage. Independent recovery bundles consume separate storage. Production and Preview databases, separate Blob stores and Prisma operation counters are verified. Independent backup storage, automated quota alerts and backup monitoring remain open.

## Section 04 — Actual hosted mobile and account review (2026-10-16)

Three sequential Lighthouse mobile lab runs per route were executed against `https://havenfieldre.vercel.app`, using headless Edge and simulated throttling. All nine runs meet the score/LCP/CLS budgets. [Hosted evidence](hosted-performance-evidence.json) records individual values.

| Route                                          | Median performance / accessibility / SEO | Median LCP | Median CLS |
| ---------------------------------------------- | ---------------------------------------- | ---------- | ---------- |
| /                                              | 100 / 100 / 100                          | 1.64 s     | 0.000      |
| /properties                                    | 99 / 100 / 100                           | 1.59 s     | 0.000      |
| /journal/a-clearer-guide-to-your-first-viewing | 96 / 100 / 100                           | 2.41 s     | 0.000      |

These results are laboratory measurements, not field INP or a human accessibility sign-off. The worst measured LCP across the nine runs is below 2.5 seconds. Field INP still needs sufficient real traffic.

The account shows Prisma Free; actual CLI snapshots reported 590 Production operations at 16:05 UTC and 202 Preview operations at 16:09 UTC on 2026-10-16. Published current allowance is 200,000 operations/month and 2 GB shared storage, with ten pooled connections and no automated backups. Each application process uses at most two connections; concurrent environments share provider limits. No upgrade was purchased. [Audit follow-up](development-plan-02-delivery.md) separates completed checks from independent backup and monitoring work.
