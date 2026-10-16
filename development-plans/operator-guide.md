# Havenfield operator guide

Updated 2026-10-16. Verified canonical origin: `https://havenfieldre.vercel.app`. Production and an independent protected Preview are deployed. The [deployment record](deployment.md) identifies their resources and verification; [release acceptance](release-acceptance.md) retains backup, accessibility and performance gates. Public GitHub delivery, hosted CI and native automatic deployments are verified in [Git delivery](github-publication.md).

Both active databases now belong to the GitHub-linked Prisma project `havenfield`: `havenfield-production` on `main`, and `havenfield-preview` on `preview`. The currently verified protected Preview is [the new-domain Preview](https://havenfieldre-preview.vercel.app). The old `havenfield-preview-rollback` project was deleted on 2026-10-16 after a fresh private export. Older immutable Preview deployment URLs can contain its now-retired connection and must not be used for new editorial work. See [project consolidation](prisma-project-consolidation.md) before using or retiring them.

## Section 01 — Environment matrix

| Setting               | Development                                                                              | Vercel Preview                                                                    | Vercel Production                                     |
| --------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Environment           | `APP_ENV=development`, or `APP_ENV=preview` + `LOCAL_PREVIEW=1` locally                  | Vercel supplies `VERCEL_ENV=preview`                                              | Vercel supplies `VERCEL_ENV=production`               |
| Canonical             | `http://localhost:3000`                                                                  | Intended Production HTTPS origin                                                  | Actual assigned HTTPS origin                          |
| Mutation origin       | `SITE_URL=http://localhost:3000`                                                         | `SITE_URL=https://havenfieldre-preview.vercel.app` for the stable protected alias | Actual Production HTTPS origin                        |
| Database              | Ignored SQLite by default, or the shared Preview database in explicit local Preview mode | Separate database bound `preview`                                                 | Account-owned database bound `production`             |
| Publisher and session | Deliberately generated local values                                                      | Independent private values                                                        | Independent private values                            |
| Blob                  | Ignored local upload directory                                                           | Independent store token, `journal/preview/` object prefix                         | Independent store token, `journal/production/` prefix |
| Maintenance           | Publisher expiry button; optional private local invocation                               | Publisher expiry button; Vercel scheduled jobs run on Production                  | Private `CRON_SECRET`, daily job in `vercel.json`     |

`NEXT_PUBLIC_SITE_URL` is public build-time configuration. All database URLs, publisher hashes, session secrets, restore tokens and cron secrets are server-only. Keep them in private provider settings or ignored environment files. Do not print them in build logs or put them in CLI arguments. `DIRECT_DATABASE_URL` is an optional direct connection used only by database CLI commands.

Before serving an independent PostgreSQL database, configure the appropriate private environment and run:

```powershell
npm.cmd run config:check
npm.cmd run db:migrate
npm.cmd run db:bind -- production
npm.cmd run db:seed
```

Use `preview` or `development` for those environments. Binding is deliberately immutable: a mismatched database is refused, not silently relabeled. Provision a different database when changing environments. `db:migrate`, `db:bind` and dedicated restore commands can prepare a database before normal runtime binding validation. Normal hosted requests never migrate schemas or fall back to ephemeral SQLite.

Verified remote TLS is required. The process pool has at most two connections, ten-second connection timeout, fifteen-second query timeout and ten-second idle cleanup. That is a per-process limit; concurrent serverless instances can still exceed a provider-wide free pool limit. Keep Preview traffic small, choose an appropriate region, use the provider's pool endpoint, and monitor actual usage.

## Section 02 — Editorial operations

Sign in at `/admin/login`. The navigation offers articles, new article, media library, inquiry inbox and operations.

Draft changes receive a server recovery snapshot after 1.5 seconds of inactivity. A recovery snapshot is separate from the article and never publishes it. Only an opaque reference is kept in tab session storage. Reloading the same tab offers recovery; a conflicting article version offers readable writing for manual merging. Closing all tabs loses the local recovery reference; these snapshots are not a general cross-device drafts browser. Use an explicit save for durable article management. Published/scheduled edits always require explicit saves.

Formatting buttons append safe Markdown snippets. The live preview reflects current writing; saved preview reflects the last explicit database save. Session expiry and failed saves preserve writing in the current tab. Sign in again in a separate tab before retrying. Do not reload a dirty editor to troubleshoot access until the writing is copied or recovery is confirmed.

Publication time is entered in the browser's local time zone and stored as UTC. Due scheduled stories become public on request, without a publication cron. Changing a slug preserves redirects; deletion intentionally returns 404 and removes its redirects. Restoring a revision always creates a draft. Optimistic version checks prevent overwriting another edit. Existing category/tag spelling is reused case-insensitively; established taxonomy URLs are preserved.

## Section 03 — Media ownership and recovery

Uploads accept decoded, static JPEG/PNG/WebP, at most 4 MiB and 24 million input pixels. They are rotated, resized within 2400 pixels, stripped of embedded metadata and converted to WebP. Images are public even in drafts. Never upload confidential material to this workflow.

The registry records ownership, generated key, dimensions, bytes, alternative text and operation state. Covers require descriptions. Inline images can be deliberately decorative. The library searches descriptions/identities, paginates, reuses images and displays article/revision/recovery references. Removing one article cannot remove an image used by another. Historical revisions retain references until the article is deleted.

Storage writes start with a durable `uploading` record and end with `active`. Storage deletion first marks `deleting`, then removes the object, then marks `deleted`. Failed operations remain reviewable and retryable. Inspect storage and recent actions before retrying. Pending uploads and reviewed unused cleanup have a seven-day grace period; active unreferenced images can also be explicitly deleted. Automatic retention never deletes media.

Deletion refuses referenced images and foreign environment prefixes. Local file operations reject unsafe keys and symbolic links. A removed URL cannot be reassigned through article saves or draft recovery. Public Blob CDN caches may continue serving previously fetched bytes after origin deletion; storage deletion is not instant erasure from every cache. [Blob caching documentation](https://vercel.com/docs/vercel-blob/using-blob-sdk) describes its cache controls.

## Section 04 — Inquiry lifecycle

The contact form validates the fictional property ID, consent, honeypot and durable request/email throttles. A UUID retry key lasts 24 hours: identical retries return one receipt; changed details with the same key are rejected. A saved record is not an email notification or a real agency appointment.

The protected inbox searches and paginates personal details, associates a home, and changes new/reviewed/archived states. Deletion is permanent in the active database. Records expire after 30 days. The explicit expiry action also clears old receipts/recovery drafts and action records older than one year. The daily job at 03:00 UTC uses Vercel's private Bearer `CRON_SECRET`; missing configuration fails closed. Scheduled-job availability and execution must be verified after deployment. [Vercel cron authentication](https://vercel.com/docs/cron-jobs/manage-cron-jobs) documents how the header is supplied.

Backups have separate retention. Publish a real contact and verify expiry/backup handling before collecting real personal information. Optional notification email remains outside this milestone; no interface claims email was delivered.

## Section 05 — Backup ownership and routine checks

The project owner is the initial publisher, release operator and backup operator. The database and media services are now provisioned, but no independent backup destination or backup scheduler is configured. Choose private independent storage outside this checkout, encrypt it appropriately, restrict access and test reachability before enabling a schedule. A second copy inside `.data` is a recovery fixture, not an independent backup.

Run a recovery export daily and before migrations/releases. Configure `BACKUP_DESTINATION` privately, then:

```powershell
npm.cmd run recovery:export
npm.cmd run backup:prune
# After reviewing the named candidates:
npm.cmd run backup:prune -- --apply
```

The retention tool keeps the latest copy from seven distinct days and four distinct weeks; overlaps produce at most eleven retained bundles. It skips incomplete/unrecognized directories and refuses unexpected contents or symbolic links before deletion. Review incomplete export folders manually. Exports fail on unresolved storage operations or missing/mismatched bytes; a manifest is written last to identify a complete bundle. A snapshot taken while an object is concurrently removed may fail and must be retried after operations settle.

Use a private always-running scheduler or a Windows Task Scheduler job with this checkout as its working directory, an environment file stored outside Git and both export/prune commands. A personal computer that is turned off cannot guarantee daily backups. Configure monitoring for missed exports; hosting cron handles inquiry expiry, not independent backup exports.

Check `/admin/system` after publishing changes and on incident reports. It shows capability readiness, applied migrations and recent actor/action/time/target records. Request failures have sanitized IDs; search server logs by the response `X-Request-ID`. Public `/api/health` returns only `ok` or `unavailable` and waits at most two seconds. Refresh health on demand; avoid continuous database-consuming polling.

## Section 06 — Incident and access recovery

For a failed write, retain the browser tab and correlate the request ID. Check capability settings, the database provider's health/quota, TLS and environment binding, then retry. Never work around errors by disabling TLS or pointing Preview at Production.

For publisher access recovery, privately run `admin:password`, update the hash and session secret in the correct environment and redeploy/restart. Rotation invalidates earlier sessions. Verify old cookies fail and the new deliberate credentials work. There is no public reset endpoint or shipped reset credential.

For a bad release, stop writes if integrity is uncertain, take a current recovery bundle, and roll back to an application revision compatible with the current schema. Migration 002 adds tables/columns and is compatible with the previous application queries, but the previous migration CLI refuses a newer ledger; do not run that CLI during application rollback. Never drop columns or restore an old database over newer content as a default rollback. Use an independent restore target and the [recovery procedure](database-recovery.md), verify the restored media/articles/inquiries, then deliberately switch configuration and traffic.

## Section 07 — Current local deployment access

The project-local CLI is `.cache/deployment-tools/node_modules/.bin/vercel.cmd`, version 64.0.2. Its authentication directory is `.cache/vercel-auth`, and `.vercel/project.json` links the `havenfield` project in `farazhussain-5000s-projects`. Verify that link before deployment or environment changes:

```powershell
$havenfieldCli = '.\.cache\deployment-tools\node_modules\.bin\vercel.cmd'
& $havenfieldCli project inspect --non-interactive --scope farazhussain-5000s-projects --global-config .cache/vercel-auth
```

Initial generated publisher credentials are in ignored `.cache/deployment/owner-access.json`. Production and Preview private CLI environments are in their respective `.cache/deployment/*.env` files. Move deliberate access details to private password storage before clearing these caches. None belongs in Git, screenshots, public evidence or deployment uploads. This installed CLI and cached configuration are local operational state, not application source that a clone must ship.

## Section 08 — Current domain and administrator access (2026-10-16)

Production uses `https://havenfieldre.vercel.app`. Vercel Production `SITE_URL` and both environments' `NEXT_PUBLIC_SITE_URL` were corrected and rebuilt; Preview now uses the stable protected alias as its explicit mutation origin; [local Preview](local-preview.md) uses localhost and the same Preview data services. Both previous `havenfield-five.vercel.app` and `havenfield-portfolio.vercel.app` return 404. Follow [admin access](admin-access.md) to retrieve the existing private credentials or deliberately rotate them. [The maintenance record](maintenance-review-2026-10-16.json) contains sanitized current-domain, screenshot and rollback-deletion evidence.

## Section 09 — Verified local Preview and audit follow-up

[Local Preview](local-preview.md) documents the configured Development scope and ignored `.env.local`, shared Preview publisher/media credentials, immutable binding guard and `db:status` / `dev:preview` commands. Production credentials remain separate. The Operations screen reports the last completed protected maintenance time. Hobby schedules execute within their configured hour; completed records alone do not independently establish scheduler origin. [The audit follow-up](development-plan-02-delivery.md) records the current 56/64 checklist and the eight remaining gates.

## Section 12 — Free backup and rollback follow-up (2026-10-16)

The owner selected no payments/cards and their existing personal Google account. Follow [free encrypted backups](free-backups.md) for the prepared archives, separate recovery key, manual browser upload and remaining daily-schedule requirement. Follow [human accessibility review](accessibility-owner-review.md) for owner testing. The [real Production rollback rehearsal](production-rollback-rehearsal.md) preserved a newer hidden draft/revisions and restored automatic deployment assignment. A temporary hosted database/private-image recovery passed; its resources and separately prefixed Development variables were removed. P02-07 is closed; P02-01, P02-04 and the remaining P02-06 conditions stay open.
