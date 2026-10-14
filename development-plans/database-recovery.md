# Database migrations and recovery

Updated 2026-10-14 (Asia/Karachi).

## Section 01 — Versioned schema operations

The authoritative migrations are the immutable, consecutively numbered SQL files in `database/migrations/`. `database/schema.sql` is retained as the historical version-1 fixture used by upgrade tests, not as the active migration source.

Run `npm.cmd run db:migrate` before serving a newly provisioned PostgreSQL database. The CLI loads private environment files and prefers `DIRECT_DATABASE_URL` when configured. Runtime functions use the pooled `DATABASE_URL` and never auto-migrate hosted PostgreSQL. Local SQLite applies migrations automatically on first connection.

The ledger stores version, filename, SHA-256 checksum and application time. Checksums normalize CRLF to LF, so Windows/Linux line endings do not produce false tampering reports. Never edit an applied migration; add the next numbered file. A changed filename/checksum, history gap or database version ahead of the application is refused.

PostgreSQL uses a transaction-scoped advisory lock and rejects an overlapping migration run; SQLite uses its immediate writer transaction. Pending migrations and their ledger writes commit together or roll back together. Full SQL scripts are executed without splitting at semicolons, preserving quoted literals and function bodies. The adapter binds portable query placeholders without replacing question marks inside quoted strings/comments.

For the known version-1 schema, the runner validates its expected application column inventory, adds filename/checksum metadata and preserves existing records. This is a compatibility check, not a full drift audit of every constraint or index. Incompatible or untracked application schemas require reconciliation; the runner does not guess their history.

Database migrations intentionally have no automatic destructive rollback. Before upgrading a hosted schema, take a verified independent backup and choose an application/schema-compatible recovery path.

## Section 02 — Private application data exports

After migration, run:

```powershell
npm.cmd run db:backup
```

The export writes a new JSON file under ignored `.data/backups/`. It contains articles, revision snapshots, old-slug redirects, inquiries and the applied migration identities. PostgreSQL export reads a repeatable-read snapshot; SQLite holds a transaction while reading. Transient rate-limit counters and publisher environment secrets are excluded.

The file contains article drafts and inquiry details. Keep it private, copy it to separately protected storage outside the checkout, and never place it under `public/`, documentation, Git or a browser-accessible directory. Local file mode is requested as private; Windows access protection still depends on the owner's filesystem permissions. JSON exports are not encrypted. The checksum detects accidental corruption, not malicious editing or proof of authenticity.

Operating policy: one protected export daily and before every schema release; retain seven daily copies and four weekly copies outside the checkout. The project owner is the initial backup operator. Retention tooling and scheduling instructions are in the [operator guide](operator-guide.md); the independent destination and real schedule still require provisioning. A file in `.data/backups/` alone is not an independent backup.

Database-only exports include the media registry, references, audit records, recovery drafts, inquiry states and retry receipts, but do not include image bytes. `recovery:export` additionally creates a bundle containing `database.json`, generated-key WebP files and a last-written checksummed `manifest.json`. Local objects and registered public Blob objects are read with bounded size/path checks. Interrupted media operations, missing bytes or registry-size mismatches fail the export. Repository-owned static imagery belongs in the separate source/asset backup.

## Section 03 — Restore into a separate empty target

Restore requires one explicitly configured private target: `RESTORE_DATABASE_URL` for PostgreSQL, or `RESTORE_SQLITE_PATH` for local recovery. The normal `DATABASE_URL` is never implicitly chosen as a restore destination. Set the target through a private environment file or process environment, not through a password-bearing shell argument.

For a local recovery exercise, use an ignored new path such as `.data/recovery-check.sqlite` as `RESTORE_SQLITE_PATH`, leaving `RESTORE_DATABASE_URL` blank. Then run:

```powershell
npm.cmd run db:restore -- .data/backups/<selected-export>.json
```

The CLI limits JSON input to 100 MiB. It verifies the checksum, table/column inventory and migration history. It refuses nonempty destinations and unknown application tables, migrates an empty target, and inserts data in foreign-key order inside one transaction. PostgreSQL locks the destination application tables during insertion; SQLite holds its writer transaction. Failed row insertion rolls back restored data; the empty migrated target may remain available for another recovery attempt.

Format-2 recovery requires compatible migration filenames/checksums. Historical format-1 exports are validated and upgraded to the current additive schema; unrelated/newer schemas are refused. Preserve the matching code revision and migration files with the recovery instructions. Deployment bindings are not copied from the source: bind the intended independent target after restoration.

After restoring, verify article bodies, publication state, revision history, redirects and inquiry counts privately. Verify that referenced media objects exist and can be served. Complete real hosted smoke checks before changing the live application's connection settings. Do not overwrite the original live database as a recovery shortcut.

For complete bundle recovery, also specify a dedicated empty `RESTORE_UPLOAD_DIR`. Then run `npm.cmd run recovery:restore -- <selected-bundle-directory>`. Local recovery stages original keys there; configure the recovered application's `LOCAL_UPLOAD_DIR` to that directory after verification. Restoring either local or existing Blob uploads into Vercel additionally requires an independent private `RESTORE_BLOB_READ_WRITE_TOKEN` and explicit `RESTORE_APP_ENV`. Objects are uploaded with overwrite disabled; local uploads are promoted into Blob, and covers, encoded inline URLs and revision/recovery snapshots are rewritten to the new store URLs before transactional database restoration. Target emptiness is checked before storage writes. If a later step fails, staged objects remain for review; no live object or database is automatically overwritten or deleted. Local CLI recovery is tested; actual hosted Blob recovery remains an acceptance gate.

## Section 04 — Repeatable local and CI verification

```powershell
npm.cmd run check
npm.cmd run test:postgres
npm.cmd run test:e2e
```

`test:postgres` starts an actual PostgreSQL 18.4 server from a development-only portable binary package, on loopback with a random port and temporary credentials. Its owned cluster directory is under ignored `.data/`; the runner shuts it down with `pg_ctl` and removes that directory. It installs no Windows service and creates no operating-system account.

Alternatively, `TEST_DATABASE_URL` may identify a deliberately disposable loopback `havenfield_test_*` database. The runner creates a random owned schema, runs its tests there and removes only that schema. Remote hosts and ordinary database names are refused. It does not load `.env.local` to discover a production target. CI supplies an ephemeral PostgreSQL service in this mode. Platform binary installation may require permitting the package's documented symlink hydration script on Unix; CI's service mode does not launch those binaries.

The same service/API tests run against SQLite and PostgreSQL. Migration/recovery tests prove fresh/repeat/incremental installation, changed/newer history rejection, legacy adoption, DDL rollback, overlapping PostgreSQL migration rejection, distinct backend connections, complete data restoration, corruption rejection and failed-restore rollback. Concurrency and exact scheduling-boundary cases exercise actual service behavior. Seeding runs twice through its real CLI and preserves publisher edits.

Implementation references: [node-postgres transactions](https://node-postgres.com/features/transactions), [PostgreSQL locking](https://www.postgresql.org/docs/current/explicit-locking.html), [portable binary package](https://github.com/leinelissen/embedded-postgres). Local PostgreSQL tests do not prove a configured provider's TLS, pooled endpoint, quotas or availability policy.
