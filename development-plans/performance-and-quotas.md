# Performance and quota record

## Section 01 — Measurement boundaries

Measurements run on a local Next.js production build with disposable seeded SQLite and Lighthouse 13.5.0 in headless Edge using simulated mobile throttling. See [raw public-route evidence](performance-evidence.json). Scores and simulated timings vary with host load; they do not establish Vercel latency, provider availability or field INP. The 2.5-second Production LCP target remains a release check wherever local measurements exceed it.

The first homepage measurement transferred about 1.75 MB and scored 89. Mobile playback now requires an explicit action, removing the initial film download; subsequent measurements transfer about 0.52 MB. Desktop autoplay remains supported, and poster fallback covers reduced motion, data saving and decode failures. Image priority/compression, font delivery and contrast/accessibility names have been reviewed against actual measurements. No animation library was added.

Final measurements and scores are summarized in the execution record. Repeat against the actual assigned domain, including cold invocations and representative uploaded covers. Obtain field Core Web Vitals only when there is sufficient real use; TBT is a lab measurement, not INP.

## Section 02 — PostgreSQL scale check

[Database evidence](database-scale-evidence.json) records a real PostgreSQL 18 run with 5,000 synthetic articles, a 12-item page near offset 4,800, actual query plans, indexed slug lookup and ten concurrent jobs sharing at most two pool connections. Timing is local evidence, not a hosted service SLA. The public list scans/sorts more rows when most articles are published; that is recorded in the plan rather than hidden by forcing the planner to use an index. A four-home/small-journal portfolio does not require full-text search or a search service.

Article metadata and rendering share a request-scoped lookup through React cache. Scheduled visibility is still evaluated on each new request; there is no cross-request publication cache. Media reference updates preserve historical reference rows and inspect only the current revision, avoiding repeated downloads of every historical article body on each save.

## Section 03 — Free-tier operating estimate

Prisma's [pricing](https://www.prisma.io/pricing) currently lists 200,000 operations/month, 1.01 GB storage and a free pooled connection limit of ten. Its [provider comparison](https://www.prisma.io/blog/serverless-postgres) states no database scale-to-zero or cold starts; this is the provider's current claim, not account verification or an uptime guarantee. Its [FAQ](https://www.prisma.io/docs/postgres/faq) explains what happens when the free allowance is exhausted. Recheck the actual account policy when provisioning.

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

Keep uploaded media well below storage allowance and review normalized byte totals and provider egress. Static project assets ship with the source deployment; public uploads occupy Blob storage. Independent recovery bundles consume separate storage. No free Blob account, billing policy, alert, database account or usage counter has been verified yet.
