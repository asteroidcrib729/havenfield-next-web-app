# Cleanup record

## Initial consolidation

The user authorized root consolidation and confirmed separately maintained backups. The operation was bounded to this checkout; external backups and the original hosted service were not changed.

Canonical public/admin source was compared by normalized paths and SHA-256. All 179 selected copies passed verification before their source trees were retired. One Node dependency installation was retained. Two nested local repositories, redundant website copies, operational SSH/FTP/environment material, plaintext account notes, screenshots containing credentials, obsolete installers/extensions/archives, uploaded samples and unnecessary large media were removed. Both old repositories had no configured remotes; their history was not imported.

Across the compared site trees, a scoped hash analysis found 2,338 duplicate-content groups, 4,660 additional copies and 300,299,462 redundant bytes. These counts excluded dependencies/Git and were not an assertion that every retired source variant was identical.

After asset/reference normalization, the initial consolidation removed **27,630 files / 4,566,915,531 logical bytes** (about 4.25 GiB). It verified 169 non-generated final source hashes, 1,450 retained dependency hashes and the legacy CSS build. Five inherited missing carousel assets were recorded at that time. A temporary Windows lock cleared on retry; no process was terminated.

Historical evidence is in `cleanup-evidence.json`; retired customer-specific directory labels are anonymized for the new portfolio context. It is a phase-0 record, not a statement of the current application structure.

## Framework and brand replacement

The current development phase removed the remaining legacy source after new routes/services were created. Its additional removal was **168 files / 140,577,591 logical bytes**. Before deletion, 85 new implementation/assets/tool files were hash-protected, and both chosen font copies matched the originals.

Removed material includes all root/admin HTML, PHP backend/configuration, Composer manifests, legacy frontend scripts, old jQuery/Slick/ripple code, every legacy stylesheet and generated CSS output, unused/proprietary-looking fonts, old logos/favicons, previous images/amenity images/videos, and the old PostCSS config.

The only retained old binaries are the requested Playfair Display/Poppins font files, now in `public/fonts/` with family license notices. All images, video, logos, properties, article text and UI copy are new. The old `Scripts` directory was carefully cleared of JavaScript while preserving the newly authored database/password TypeScript/MJS tools, then renamed to lowercase `scripts` for consistent Git/Linux paths.

The previous inherited carousel missing-resource issue no longer exists because the entire carousel/theme was replaced. The previous private-reference ignore rules were removed; new `src/`, `public/`, `database/`, `scripts/` and tests are normal source files. Generated `.cache`, `.data`, `.next`, dependencies, secrets, browser traces and reports remain ignored.

One root Git repository remains on `main`; no commit, remote or GitHub publication was requested. Only `README.md` is authored Markdown at root. All project plans/progress/production notes are in this directory.

Temporary audit scripts, raw generated-source working copies and failed-test traces are disposable local validation output. Final assets and sanitized validation summaries are retained. Removal totals above measure deleted logical contents, not free-space changes or net directory size; the new application/dependencies/assets were created separately.

The final handoff removed six migration/documentation/validation scratch scripts or records and the redundant courtyard source PNG from `.cache`. Final JPEG/video assets and the three review screenshots remain available. The npm cache and ignored local development data remain local runtime tools rather than legacy project source.
Next.js generated a managed root `AGENTS.md` during development. Its documented `agentRules: false` configuration disables regeneration, and the generated-only file was removed to retain README as the sole root Markdown document.

## Generated video replacement (2026-10-14)

The old 2,024,027-byte still-image hero composition was replaced at the same public path by a 1,110,172-byte Hailuo-generated clip. A 123,290-byte matching poster was added; the original courtyard property image remains in use. Temporary downloaded source/encoded copies, extraction working files and helper scripts were removed after final asset verification. No unrelated source or local runtime database was deleted.

## Product-plan navigation (2026-10-14)

The completed video-only `development-plans-02.md` record was renamed to `hero-video-generation.md`, preserving its prompts, generation details and validation references. README and related documentation links were updated. The requested singular `development-plan-02.md` now contains the product-completion backlog and acceptance gates; no source, media or Git history was deleted by this documentation change.

## Plan 02 database test lifecycle (2026-10-14)

Disposable PostgreSQL clusters and migration/recovery fixture directories were created only in owned `.data/*-test-*` or `recovery-smoke-*` paths and removed after their connections/processes closed. One synthetic CLI export was removed after its smoke check. Default development data, production services, original static assets and Git history were not cleared. Source-preparation and smoke-check scratch files under `.cache` were removed after final verification; the new test/migration/recovery tools remain under `scripts`, `src/server` and `tests`.

## Plan 02 product verification cleanup (2026-10-14)

Audited and removed 9 earlier UUID browser databases with their sidecars and 7 confirmed test upload files: 34 files / 6,471,342 logical bytes. Upload ownership was established from the test databases and checked against an isolated read copy of the default database. Six protected default-database/font/hero hashes are unchanged. Unidentified uploads, the older explicitly named e2e fixture and independent backups were preserved. New browser/portable-database/recovery/performance fixtures now remove their own data after owned processes close.

The temporary clean-install source/dependency copy and 41 owned preparation files were removed after verification. The copy's two Next-generated pg/sharp junctions were unlinked without traversing or deleting their targets before recursive cleanup. Review screenshots and sanitized machine evidence remain under development-plans; root application dependencies and the npm cache remain available. No external service, root Git history or default development database was deleted.

## Deployment verification cleanup (2026-10-15)

Removed 27 task-owned preparation/debug/verification helpers, duplicate provider environment exports, temporary browser session snapshots, fixture identity files and raw CLI records from `.cache/deployment`: 770,597 logical bytes. Cleanup was limited to regular files in the resolved workspace-owned directory, with link checks. Hashes confirmed that the three private publisher/Production/Preview configuration files were unchanged. Screenshots, the installed CLI, its private authentication directory and root project linkage remain available.

Actual hosted verification removed only the synthetic articles, uploads and inquiries it created. Both independent databases now retain the three original seed articles, zero active uploaded media and zero inquiries. Deleted media registry/audit records remain as the application's deliberate operation history. No account, service, seed article, default local database or real user content was deleted. [Local cleanup evidence](deployment-cleanup-evidence.json) and [hosted isolation/fixture evidence](deployment-isolation-evidence.json) record the checks.

## Public-source privacy cleanup (2026-10-15)

Removed private Vercel project/team, Prisma project/database, Blob store and generation job identifiers from publishable documents. Preserved their operational reference map in ignored local cache storage. Real provider credentials, publisher secrets, runtime data and authentication remain ignored and were not committed. Font notices and public deployment/asset provenance remain intact. Full-history credential scanning is added to CI; sanitized results are recorded in [publication evidence](publication-security-evidence.json).

## Retired Prisma rollback project (2026-10-16)

The owner explicitly requested deletion of `havenfield-preview-rollback`. Verified its exact project identity, confirmed both active databases belonged to the shared Havenfield project, checked that the target contained only the original preview database and no Compute apps/object-store buckets, and created a fresh private checksummed export. Deleted the target project through the authenticated Prisma CLI and verified it disappeared from the project inventory. Production/Preview credentials and active databases were preserved; existing admin access and public content pass at the new domain. No local rollback exports, live Blob stores or active project resources were deleted. Historical immutable Preview URLs using the removed database are retired. [Maintenance evidence](maintenance-review-2026-10-16.json) records sanitized results.
