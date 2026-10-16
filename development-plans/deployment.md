# Vercel deployment and editorial operations

Updated 2026-10-16 (Asia/Karachi). Live portfolio: [havenfieldre.vercel.app](https://havenfieldre.vercel.app). Supporting records: [operator guide](operator-guide.md), [release acceptance](release-acceptance.md) and [release notes](release-notes.md).

## Section 01 — Verified hosted release

| Item                     | Verified result                                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Account/project          | Vercel Hobby, `farazhussain-5000s-projects/havenfield`                                                                          |
| Project                  | `havenfield`; private infrastructure identifier retained outside Git                                                            |
| Production deployment    | `dpl_DgiRCmaxNBELUB3fKEqCtGvH6RMF`, READY, promoted after staging checks                                                        |
| Initial canonical origin | `https://havenfield-portfolio.vercel.app` (historical; current origin is `https://havenfieldre.vercel.app`)                     |
| Preview deployment       | `dpl_7xJkog4a178bxiiNXDH8C2F9J6Dh`, READY, protected Preview                                                                    |
| Preview origin           | `https://havenfield-lzrolawbc-farazhussain-5000s-projects.vercel.app`                                                           |
| Runtime/region           | Next.js, Node.js 24, functions and data configured for Singapore                                                                |
| Production database      | Prisma Postgres `havenfield-production`, schema 2, immutable Production binding                                                 |
| Preview database         | Independent Prisma Postgres `havenfield-preview`, schema 2, immutable Preview binding                                           |
| Production media         | Public Blob `havenfield-production-media`, connected only to Production                                                         |
| Preview media            | Public Blob `havenfield-preview-media`, connected only to Preview                                                               |
| Source                   | Initial local-source release; GitHub publication and automatic deployment are recorded in [Git delivery](github-publication.md) |
| Build                    | Corrected Production reached READY in 42.879 seconds                                                                            |
| Error review             | Zero error/fatal runtime records in the five-minute reviewed window; no monitoring drain was configured by this task            |

The requested `havenfield.vercel.app` returned 409 because another project owns it. The user selected `havenfield-portfolio.vercel.app`; Vercel accepted and verified it. The initially assigned `havenfield-five.vercel.app` was removed by the owner. On 2026-10-16 both it and the former portfolio alias return 404; the current owner-selected domain is `havenfieldre.vercel.app`.

Vercel's plugin tools became available but explicit account-scope requests returned 403. The owner completed login to Vercel CLI 64.0.2, installed only in ignored `.cache/deployment-tools`, and the CLI verified the correct account and Hobby scope. Prisma required separate Console approval for the two database creations; both were approved and are ready. No plan upgrade or domain purchase was performed.

The platform treated this new project's first deployment as Production despite the Preview target. A separate Preview was then deployed and verified. Verification found a validator compilation probe blocked by CSP; `jitless` validation fixes it without weakening the production policy. The configuration checker also required a default CommonJS import for Node ESM. The corrected source passed Preview before Production was staged, checked and promoted.

Actual CLI dry-run selection contains 127 application/schema/asset/build files, 8,763,816 bytes. The upload allowlist excludes local databases, credentials, cached tools, plans, tests and build output. Source manifest SHA-256: `dfa3decee246237e4c4325f93ab40beb88252e221a91132a17e67bec625cf729`. [Source manifest](deployment-source-manifest.json), [hosted checks](deployment-hosted-evidence.json), [TLS checks](deployment-database-evidence.json), [migrations](deployment-migration-evidence.json), [isolation and fixture cleanup](deployment-isolation-evidence.json), [SEO audit](deployment-seo-evidence.json), [staging persistence](deployment-staging-evidence.json) and [release state](deployment-state.json) record the evidence without secret values.

The 24 hosted check groups cover mobile/desktop pages and footer, publisher UI login, secure cookies, unauthorized access and origin rejection, real Blob upload/WebP delivery/reference protection/deletion, draft/schedule/publish/edit/slug redirect, populated editor, inquiry idempotency/review/deletion, maintenance authentication and manual retention, zero CSP violations and logout. The three original articles remain in each database. Local TypeScript, focused ESLint and all 55 tests also pass.

The public repository is now [asteroidcrib729/havenfield-next-web-app](https://github.com/asteroidcrib729/havenfield-next-web-app), connected natively to this existing Vercel project. Its configured Production branch is `main`; other branches use Preview. The table above preserves the initial CLI release snapshot. [Git delivery](github-publication.md) records the subsequent pushed revisions, CI and automatic deployment verification. GitHub CI uses only synthetic loopback data; real hosted configuration remains private in Vercel.

Subsequent [Prisma consolidation](prisma-project-consolidation.md) places the two active databases in shared GitHub-linked project `havenfield`, on separate `main` and `preview` branches. The new Preview cutover deployment is `dpl_A9yZiFMWAz1t6DDxN357N1KCbFSG`; the earlier Preview in the initial-release table is historical. Production configuration remains intact, and the original preview source was retained for rollback at that time. It was deleted on 2026-10-16 after a fresh private export; see [current maintenance evidence](maintenance-review-2026-10-16.json).

## Section 02 — Local setup

Use Node.js 24. Install the locked dependencies and prepare local content:

```powershell
npm.cmd ci
npm.cmd run db:migrate
npm.cmd run db:seed
npm.cmd run dev
```

With no `DATABASE_URL`, development uses ignored `.data/havenfield.sqlite`. The seed inserts three original articles without overwriting edited records. The database CLI loads `.env.local`, then `.env`, without replacing environment values already supplied by the deployment or shell.

For admin access, copy `.env.example` to `.env.local`, set an email you control, and run `npm.cmd run admin:password`. It asks for a password with hidden input and prints a scrypt hash and random session secret for your private environment file. No built-in admin password exists. Restart the local server after changing secrets. Open `/admin/login`.

The editor supports drafts, scheduling, publication/unpublication, search/filter/pagination, Markdown/GFM, covers and alternative text, author/category/tags, search-title/description/canonical/noindex fields, optimistic version checks, revisions, private previews, and deletion. Restores always become drafts. Due scheduled articles become visible at request time; no background timer or cron is required.

## Section 03 — Production configuration

Choose the Next.js framework preset with this repository root as the project root. Vercel supports [Node.js 24](https://vercel.com/changelog/node-js-24-lts-is-now-generally-available-for-builds-and-functions). Use `npm run build`; do not configure a static export or start an Express process.

Configure these values privately in Vercel for the intended environment:

- `NEXT_PUBLIC_SITE_URL`: the actual canonical HTTPS production origin, set before building. The local default is localhost and must not become production SEO output.
- `DATABASE_URL`: the provider's pooled standard PostgreSQL connection URL. Remote certificates and hostnames are verified. `DATABASE_CA_CERT` is available for a private CA; insecure TLS disabling is not supported.
- `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`: the deliberate publisher identity and private authentication settings.
- `SITE_URL`: exact trusted mutation origin; current hosted Preview uses `https://havenfieldre-preview.vercel.app`; explicit local Preview uses localhost. A deployment-specific Preview without a stable alias may omit it to use `https://${VERCEL_URL}`.
- `CRON_SECRET`: independent private secret for the daily retention job.
- `BLOB_READ_WRITE_TOKEN`: access to a public Vercel Blob store, required for image uploads on Vercel. Review storage quota/billing before connecting a store. Existing approved `/media/` assets or HTTPS cover URLs remain usable without uploads.

Run migrations against the selected hosted database before serving it. The CLI prefers optional `DIRECT_DATABASE_URL`; otherwise it uses `DATABASE_URL`. Put connection values in an ignored environment file or the process environment, never in shell arguments, docs, Git or browser code.

```powershell
npm.cmd run db:migrate
npm.cmd run db:bind -- production
npm.cmd run db:seed
```

Use a separate `preview` binding for Preview. Configure private settings before seeding; normal access refuses a missing or mismatched hosted binding.

Migrate once per schema update; only seed when desired. Functions never auto-migrate or silently fall back to local SQLite. The active migrations are under `database/migrations/`; `database/schema.sql` is retained as a historical upgrade fixture. [Database recovery](database-recovery.md) documents checksums, legacy adoption, exports and restoration. Standard PostgreSQL tooling can export/restore it independently of the chosen host.

## Section 04 — Media and application behavior

Blog uploads accept actual JPEG/PNG/WebP images up to 4 MiB and a bounded pixel count. They are decoded, converted to WebP, and stripped of metadata. SVG/animated or invalid files are rejected. The request cap fits below Vercel's [4.5 MB function payload limit](https://vercel.com/docs/functions/limitations). Production writes to Vercel Blob; local writes to ignored `.data/uploads`. Public image URLs are not access-controlled draft storage. Deleting a blog does not delete media that another article might reuse; use the protected media library to inspect references and perform reviewed deletion/cleanup after its seven-day grace period. Interrupted operations remain recoverable.

Inquiries are stored with consent and return a receipt. They do not send mail or arrange a viewing. The portfolio UI asks visitors to use fictional information. No former SMTP, IMAP, MongoDB, PHP, VPS or FTP configuration remains.

Authentication uses signed eight-hour HttpOnly SameSite=Strict cookies, secure cookies in production, password-hash-bound session invalidation, same-origin mutation checks, and SQL-backed throttling. Rotating the password hash or session secret invalidates earlier sessions. There is one configured publisher and no public signup or password-reset email integration.

Production functions exclude local databases, environment files, test artifacts, caches and documentation from tracing. Any missing database/media/auth configuration produces a clear failure rather than a fake successful write. The homepage can still present the property concept if its journal query is unavailable.

## Section 05 — Verification and remaining acceptance

Run `npm.cmd run check`, `npm.cmd run test:postgres` and `npm.cmd run test:e2e` before delivery. The PostgreSQL target uses an isolated loopback test cluster or an explicitly disposable local service. Browser tests use synthetic temporary credentials and local SQLite, not production accounts. They launch the installed Edge browser; change the Playwright channel to a locally installed Chromium browser if necessary.

Production and protected Preview passed real browser/API/database/Blob verification on 2026-10-15. The corrected Production build was checked through authenticated staging requests and promoted without rebuilding. Cross-environment database bindings reject accidental access, and all synthetic articles, images and inquiries were removed. Independent backups, complete hosted recovery, human accessibility acceptance and real field performance remain open; hosted CI is now proven in the later delivery records; see [release acceptance](release-acceptance.md). The configured daily maintenance job has been manually invoked with its private credential, but scheduled execution itself has not yet been observed.

## Section 06 — Access, future releases and rollback

Publisher login is `/admin/login`. The generated email/password pairs for Production and Preview are only in the ignored local file `.cache/deployment/owner-access.json`. Keep the deliberate credentials in private password storage before clearing caches. No password, token, connection string or session cookie is included in these public notes. Rotate access using the existing password helper and environment-specific Vercel configuration; rotation invalidates prior signed sessions.

CLI authentication is stored in ignored `.cache/vercel-auth`, and the root `.vercel/project.json` links only this project. Future operators can use a normally authenticated Vercel CLI; this local installation is not a shipped application dependency. Inspect the linked project before consequential commands. Run the existing checks, deploy an isolated Preview, then stage Production with `--prod --skip-domain`, verify it, and promote the specific tested Production deployment.

CLI 64.0.2 incorrectly forwards `--global-config` to native curl. The staging check temporarily corrected consumption of that single argument in the ignored installed parser and restored the original file afterward; authentication, scope and protection rules were unchanged. The protected staging URL was checked through authenticated requests. A share-link fetch was rejected by automatic approval review and no shareable URL was created.

The previous application deployment is `dpl_4Ztm7ch8DUPbMMWFvxyova3k8e5z`; it uses the same schema and differs in browser validator behavior. It is recorded for deliberate application rollback, not promoted as a recovery exercise. Take an independent current backup before any future schema change; do not overwrite newer data with an old export. A live bad-release rollback and independent hosted recovery have not been demonstrated.

## Section 07 — New domain and rollback retirement (2026-10-16)

Current production is `https://havenfieldre.vercel.app`. Corrected Production `SITE_URL` and both environments' canonical setting, redeployed both, and verified canonical/feed/sitemap URLs and existing publisher access. The production deployment is `dpl_ApMseBkgT4pZhCNzcTyfyrjziMqr`; current protected Preview is `dpl_9ZQU6hFvjdGeG9Ckjz4skW76kqXB`. Captured fresh full desktop/mobile landing screenshots. Deleted only Prisma project `havenfield-preview-rollback`, preserving both active databases and all publisher/media settings. Historical release tables and JSON snapshots above retain their original deployment facts.

## Section 08 — Local Preview and current hosted verification (2026-10-16)

The stable protected Preview is `https://havenfieldre-preview.vercel.app`, with explicit `SITE_URL` matching that alias. Development is configured privately for localhost with the same Preview PostgreSQL/Blob/publisher settings. Production remains independent. [Local setup](local-preview.md), [audit delivery](development-plan-02-delivery.md) and [sanitized checks](audit-delivery-evidence.json) supersede the earlier Preview-origin instructions and open lab-performance assumptions. The latest CLI Preview snapshot is `dpl_BRa61m1XUqUjBxTysbLsNYar3Hdx`; real revision restoration, UTC publication and retained image bytes across redeployment pass.
