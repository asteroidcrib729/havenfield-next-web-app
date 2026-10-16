# Plan 02 audit: immediately deliverable follow-up

Delivered 2026-10-16 (Asia/Karachi), following [the initial audit](development-plan-02-audit.md). **Current checklist: 56 checked of 64; eight remain open.** The change closes P02-02, P02-03 and the presently applicable laboratory portion of P02-05. It does not declare complete Production release acceptance.

## Section 01 — Delivered now

| Audit item                                        | Delivery and evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P02-02: PostgreSQL service and policy             | Both databases are ready in shared project `havenfield`, with separate immutable Production/Preview bindings. Certificate-verified client TLS passes for both. Runtime pools remain capped at two connections per process. The Free account's actual usage was read through Prisma CLI; current published allowance and no-inactivity-pause policy were reviewed. [Database decision](database-options.md) and [operating measurements](performance-and-quotas.md) now reflect the account and current 2 GB allowance. |
| P02-03: hosted client-address trust               | Hosted secrets remain enforced. The limiter prefers Vercel's platform forwarding header, validates a single IPv4/IPv6 address and refuses malformed chains. Local requests ignore forwarding headers. Two real protected-Preview login probes with different spoofed headers used one actual throttle identity; no attacker-selected throttle keys appeared. Regression tests cover these trust boundaries.                                                                                                            |
| P02-05: representative hosted mobile measurements | Nine actual Production mobile Lighthouse runs: three each for home, collection and an article. All nine performance scores exceed 90, all accessibility/SEO scores are 100, all measured LCP values are below 2.5 s, and CLS stays below 0.1. Median performance is 100/99/96; median LCP is approximately 1.64/1.59/2.41 s. [Hosted measurement evidence](hosted-performance-evidence.json) records each run.                                                                                                         |

Field INP is **not measured or passed**. The Plan 02 requirement applies when sufficient real-user data exists; that evidence is unavailable for this small portfolio and remains an ongoing measurement task. Lighthouse's accessibility score also does not establish human screen-reader acceptance. G3 stays open.

## Section 02 — Database and local Preview delivery

Production remains at `https://havenfieldre.vercel.app` with `havenfield-production` on Prisma `main`. Vercel Preview uses `havenfield-preview` on Prisma `preview`. Configured Vercel's Development scope and the ignored local environment with the same Preview database, publisher and Blob credentials; no Production secrets were copied into the local application profile. All unrelated local values were preserved and the previous local profile was privately backed up.

Added `LOCAL_PREVIEW=1` for an explicit local Preview process. It permits loopback origins while retaining PostgreSQL, secret, media and immutable binding checks. This flag is rejected on Vercel and outside the Preview environment. The local process refused an actual Production-bound database. Tests explicitly disable local Preview and retain isolated synthetic databases/uploads.

New commands: `npm.cmd run db:status` checks readiness/binding without migrations, and `npm.cmd run dev:preview` validates the private configuration before launching Next.js on the configured loopback address. [Local Preview instructions](local-preview.md) include the full environment matrix and credential retrieval.

Prisma shows **No deploy** because there are no Prisma Compute apps. GitHub association and database readiness are separate from Compute deployments; Vercel hosts this application. This is consistent with [Prisma's Console resource model](https://www.prisma.io/docs/console/concepts). No additional Compute app, duplicate database, paid plan or synthetic deployment record was created to change the label.

## Section 03 — Additional hosted and operational evidence

Local Preview's actual publisher UI login, hosted upload, revision restoration, real-time scheduled visibility and media reference protection passed. The same draft/image were then read through authenticated hosted Preview. Hosted API revision restoration and publication before/after a real UTC deadline passed independently. Production authenticated with its separate credentials, could not read the Preview-only draft, and retained three public articles.

Redeployed Preview, moved the protected `havenfieldre-preview.vercel.app` alias deliberately, and verified real browser publisher login using its configured origin. The exact draft version and referenced image bytes survived that redeploy; referenced-image deletion still failed safely. Removed only the synthetic draft and upload afterward, returning Preview to its original three articles. The stable alias is not a Production project domain and retains Vercel Authentication and noindex. Its deployment-specific URL had a network reset from this workstation; using the verified alias resolved access without disabling protection.

Exported and validated an ignored private recovery bundle from the hosted Preview snapshot, including a real 234,042-byte uploaded image and its checksum. This proves image-byte capture and bundle verification; it is not an independent backup destination or a completed restore into an independent hosted database/store.

The Operations screen now exposes the last completed protected retention-maintenance timestamp. Production contains completed maintenance records at `2026-10-15T03:17:08.386Z` and `2026-10-16T03:17:08.194Z`, consistent with the daily 03:00 UTC schedule and Hobby's hour-wide execution window. An attempted historical CDN-log query was denied because logs older than 12 hours require a paid entitlement; no upgrade was purchased. These action records establish completion, but do not independently prove whether the request came from the scheduler or an authorized manual invocation. The first observed request after a new deployment is also recorded without claiming a verified cold start.

An automated populated-editor CSS 2× zoom/reflow check passed. This is not a native browser zoom session or a human assistive-technology review.

## Section 04 — Eight acceptance entries still open

- **P02-01:** independent protected backup destination, actual rotation/scheduler and complete independent hosted database/image restoration.
- **P02-04:** a human keyboard/screen-reader/native-200%-zoom review with findings and corrections.
- **P02-06:** remaining composite hosted acceptance, especially independent hosted image recovery and explicitly established cold invocation. Hosted revision/timing/media-redeploy portions are now proven.
- **P02-07:** an observed compatible Production bad-release rollback that preserves new data. Rebuilding or deleting a rollback project does not demonstrate this.
- **P02-08:** confirmed independent backup/monitoring operations, automated quota/backup observation and unambiguous scheduled-invocation evidence.
- **G3 Visitor:** human accessibility acceptance.
- **G5 Operations:** independent backups and operational monitoring acceptance.
- **G6 Delivery:** complete hosted recovery and compatible rollback acceptance.

Those entries remain in Plan 02 rather than being moved out of scope. No account upgrade, new paid service, image-generation purchase or Production content/schema mutation was needed for this delivery. Sanitized checks are recorded in [delivery evidence](audit-delivery-evidence.json); private credentials, recovery objects and detailed operator artifacts remain ignored.
