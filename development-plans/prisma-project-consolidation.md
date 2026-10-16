# Prisma project consolidation

Updated 2026-10-15 (Asia/Karachi). Status: active Production and Preview databases consolidated into Prisma project `havenfield`; the protected Preview cutover passed 26 hosted checks.

Current maintenance note (2026-10-16): the owner-authorized retirement of `havenfield-preview-rollback` is complete after a fresh private export. Both active databases remain in `havenfield`; production is now `https://havenfieldre.vercel.app` and the verified protected Preview is [the current Preview](https://havenfield-riv3gj2i6-farazhussain-5000s-projects.vercel.app). The original cutover/rollback descriptions below preserve the 2026-10-15 snapshot. See [current maintenance evidence](maintenance-review-2026-10-16.json).

## Section 01 — Target organization

The existing GitHub-linked project has been renamed from `havenfield-production` to `havenfield`, preserving its project ID and repository association. Its `main` branch retains database `havenfield-production`. The separate database `havenfield-preview` now belongs to its non-default `preview` branch. Both are ready in Singapore. The repository association remains `asteroidcrib729/havenfield-next-web-app`, active on default branch `main`.

Prisma rejected linking the same repository to the former standalone preview project with the explicit conflict “This repository is already linked to a project.” Consolidation changes resource organization; the application continues to use Vercel hosting, its TypeScript services and the existing SQL migration ledger.

## Section 02 — Verified preparation

- [x] Confirm the existing production project and its `main` branch.
- [x] Create a non-default `preview` branch in the GitHub-linked project.
- [x] Create private, checksummed application exports of both existing databases before management changes.
- [x] Verify two applied migrations, three articles and three revisions in each export; preserve media registry, audit and inquiry receipt records.
- [x] Keep connection strings, credentials, private resource identifiers and backup content outside Git and public documentation.
- [x] Obtain authenticated management access for the operation absent from the connected plugin.
- [x] Reassign the existing preview database if supported; otherwise provision a new database on the target preview branch and restore the reviewed private export.
- [x] Verify the target's preview binding, migration checksums, table content and media references.
- [x] Verify Production remains bound to its existing database and Preview cannot access Production through the application's binding checks.
- [x] Update only Vercel Preview database configuration if the supported procedure changes connection strings.
- [x] Redeploy and test the protected Preview; verify content, publisher access, discovery noindex and health.
- [x] Record the final shared-project database inventory and repository association.

The exports are private local rollback artifacts in ignored `.data/`. They do not close the independent off-checkout backup acceptance gate. Both environments contain deliberate operation history; their backups must preserve that history rather than replacing the preview with seed data.

## Section 03 — Execution and rollback

Prisma documents a [database update API](https://www.prisma.io/docs/rest-api/endpoints/databases/patch-databases-by-database-id) that changes branch association, and a [database create API](https://www.prisma.io/docs/rest-api/endpoints/databases/post-databases) that accepts an existing project and branch. Cross-project reassignment must be verified against the actual API; the public schema alone does not establish that it is supported for the current default preview database.

The connected Prisma plugin exposes branch creation, but lacks database reassignment and creation within an existing project. Its database-create tool creates a new project, so it cannot produce the desired organization. Installed Prisma CLI 8.0.0-rc.22 only in ignored `.cache/prisma-tools`; the owner completed official browser login with authentication in ignored `.cache/prisma-auth`. No Prisma ORM dependency was added to the application.

The metadata-reassignment attempt returned 404 for the cross-project target branch even though that branch was independently verified. The database-clone endpoint returned an empty HTTP 500 response. Inventory checks confirmed neither attempt created a database. The supported CLI then created an empty database under the existing project's `preview` branch, and the application restoration service copied a fresh repeatable-read source export into it. All nine retained tables and both migration identities matched exactly before cutover; the source stayed stable during restoration. The target's `preview` binding, verified TLS/direct and pooled endpoints, and bidirectional environment rejection checks pass.

Only the hosted Preview `DATABASE_URL` changed. Its direct URL is stored in the private operator environment file; Vercel does not need an additional direct-connection variable. Existing publisher, session, cron and media settings remain intact. Production's connection and private operator settings are preserved.

The new protected Preview is [the verified cutover deployment](https://havenfield-1f0w4kgvl-farazhussain-5000s-projects.vercel.app), deployment `dpl_A9yZiFMWAz1t6DDxN357N1KCbFSG`, READY. Its 26 hosted checks cover health, retained public/private editorial content, publisher login and secure strict cookies, anonymous authorization denial, operations/media inventory, durable synthetic draft creation/read/deletion, draft privacy, four mobile/browser routes, Preview noindex, logout and Production availability. Final checks leave three articles and three revisions in each active database, with no synthetic draft remaining. Deliberate audit history from verification remains.

The former source project is named `havenfield-preview-rollback` and is retained with the original database as a rollback copy. It is outside the active two-database arrangement. Use the new Preview origin for editorial work: older immutable Preview deployment URLs still contain the prior database connection. Rollback can restore the private original Preview URL and redeploy; source retirement requires reviewing those old deployment dependencies. No source database or project was deleted during this migration.

Prisma's repository connection remains active after the shared-project rename. No Prisma Compute app or cloud-deploy workflow was added. Vercel continues to deploy pushed application revisions using its existing GitHub integration. [Machine-readable consolidation evidence](prisma-consolidation-evidence.json) records the verified outcome without private identifiers or credentials.

## Section 04 — Provider access

The CLI uses its own [Prisma account login](https://www.prisma.io/docs/cli/auth); the ChatGPT plugin connection does not supply a CLI session. Use the official browser login or a privately configured service token. Never paste access tokens, database passwords or exports into chat, Git, shell arguments or public logs.

Provider approval requirements apply to the actual administrative action. Existing user authorization covers the requested consolidation, but does not replace a Prisma Console approval when the account policy requires one.
