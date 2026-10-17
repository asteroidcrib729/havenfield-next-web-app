# Database migrations and recovery

Updated 2026-10-17 (Asia/Karachi). [Free encrypted backups](free-backups.md) adds encryption and owner Drive-upload instructions. An isolated hosted database/private-image restoration passed; recovery of a deployed public website and independent Drive download verification remain open. See [current evidence](free-operations-evidence.json).

Current release: schema 4 and backup format 4. Conversation stages, private notes and inquiry versions are included; formats 1-3 normalize during restore. [Plan 04 recovery evidence](plan04-recovery.json) records six actual snapshot restores. Previously deferred independent backup scheduling remains optional portfolio maintenance.

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

Format-3 recovery includes catalog readiness, properties, property revisions, protected property/media references and media collection/focal/version fields. Formats 1 and 2 are checksum-validated before normalization to the current additive schema; original legacy bundle manifests are checked against their original backup checksum. Unrelated/newer schemas are refused. A restored format-2 export has no authored catalog: explicitly initialize the four original homes before using the property editor. Preserve the matching code revision and migration files with the recovery instructions. Deployment bindings are not copied from the source: bind the intended independent target after restoration.

After restoring, verify article bodies, publication state, revision history, redirects and inquiry counts privately. Verify that referenced media objects exist and can be served. Complete real hosted smoke checks before changing the live application's connection settings. Do not overwrite the original live database as a recovery shortcut.

For complete bundle recovery, also specify a dedicated empty `RESTORE_UPLOAD_DIR`. Then run `npm.cmd run recovery:restore -- <selected-bundle-directory>`. Local recovery stages original keys there; configure the recovered application's `LOCAL_UPLOAD_DIR` to that directory after verification. Restoring either local or existing Blob uploads into Vercel additionally requires an independent private `RESTORE_BLOB_READ_WRITE_TOKEN` and explicit `RESTORE_APP_ENV`. Objects are uploaded with overwrite disabled; local uploads are promoted into Blob, and covers, encoded inline URLs, property galleries and property/article revision/recovery snapshots are rewritten to the new store URLs before transactional database restoration. Target emptiness is checked before storage writes. If a later step fails, staged objects remain for review; no live object or database is automatically overwritten or deleted. Local CLI recovery is tested; actual hosted Blob recovery remains an acceptance gate.

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

## Section 05 — Free owner backup and private hosted restoration

[Free encrypted backups](free-backups.md) explains the selected Drive destination and `backup:key`, `backup:encrypt`, `backup:decrypt`. Current archives passed local decryption; a real-image bundle passed too. A separate temporary hosted PostgreSQL database restored article bodies, states, versions, revisions and media references; a private hosted Blob restored exact image bytes and refused unauthenticated access. The test resources and their temporary Development variables were removed. This exercise used the existing recovery functions with a private-object verification harness; the standard public-media restore CLI and a recovered public site were not claimed verified. Drive upload/download verification and scheduling remain open. [Evidence](free-operations-evidence.json).

## Section 06 - Property-authoring migration

[Property and media operations](property-and-media-authoring.md) describes migration 003 and explicit catalog initialization. Both hosted schema-3 exports were restored into owned disposable SQLite databases with complete table equality; [evidence](plan03-property-recovery.json) distinguishes that check from PostgreSQL integration coverage and from a recovered hosted website. Existing inquiry IDs/associations and the original four property identities are preserved. Earlier application builds do not understand database-authored catalog changes and are not a complete catalog rollback. Never drop the new tables or overwrite a live database with an older export as a shortcut.
