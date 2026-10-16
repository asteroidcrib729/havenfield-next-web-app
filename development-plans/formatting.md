# Project formatting

Added 2026-10-16 (Asia/Karachi). Prettier and its SQL plugin are exact development dependencies in `package.json` and `package-lock.json`; `npm.cmd ci` installs the same versions locally and in CI.

## Section 01 — Commands

```powershell
# Format every applicable file recursively from the project root.
npm.cmd run format

# Check the same complete scope without changing files.
npm.cmd run format:check

# Formatting, TypeScript, lint, service tests and production build.
npm.cmd run check
```

Both formatting scripts scan `.` rather than a list of selected source folders. New nested source, test, script, configuration and documentation files are therefore included automatically when their file type is supported. A formatting difference fails `format:check`; parse/configuration errors also fail. GitHub Actions runs the formatting check through its existing `npm run check` step after a clean install.

## Section 02 — Coverage and settings

`.prettierrc.json` selects two-space indentation, a 100-column preferred width and LF line endings. `.gitattributes` keeps text checkouts at LF on Windows and CI, with explicit binary asset exclusions. Prettier handles TypeScript/TSX, JavaScript/MJS, CSS, JSON, YAML, Markdown and supported HTML files. The SVG override uses its HTML parser for the project's SVG assets. `prettier-plugin-sql` handles SQL using the PostgreSQL dialect, including `database/schema.sql` and new migration files.

Prettier follows both `.gitignore` and `.prettierignore`. Dependencies, generated output, runtime databases/uploads, local credentials and cache artifacts are excluded. `package-lock.json` and `next-env.d.ts` remain generated-tool-owned. Binary images/video/fonts and plain license/environment/ignore text do not have applicable Prettier parsers; they are not reformatted. Existing font licenses remain intact. No whole application, test, script or documentation directory is excluded.

The formatter does not sort Tailwind classes or rewrite SQL embedded in ordinary TypeScript strings. It formats the surrounding code while preserving those string values. ESLint continues checking code quality separately.

The PostgreSQL scale test and performance measurement script use the shared Prettier configuration when writing their checked-in JSON reports. Regenerating those reports therefore preserves formatting. Other cache/runtime exports remain outside the formatting scope.

## Section 03 — Applied migration exception

`database/migrations/001-initial.sql` and `002-product-operations.sql` have already been applied. `src/server/migrations.ts` verifies their normalized SQL checksums against the database ledger, so even whitespace-only formatting would reject deployed database startup. `.prettierignore` names only these two immutable files; it does not exclude the migration directory or all SQL.

For a new migration, create its numbered SQL file, run `npm.cmd run format`, review the SQL and test it before applying it anywhere. Once applied, preserve its exact contents and add that specific filename to the immutable-file list in `.prettierignore` as part of the reviewed migration release. Make subsequent schema changes in another migration rather than editing applied SQL. Formatting does not modify database rows or rewrite stored checksums.

## Section 04 — Editor use

Point your editor's Prettier extension at the workspace installation and enable format-on-save if desired. The checked-in configuration supplies the same rules as the command line; no editor-specific settings or Git hooks are required. Always run `npm.cmd run format:check` before publishing changes.

## Section 05 — Initial validation

The initial coverage audit found 188 supported files and no unsupported source-file extensions. Formatting, TypeScript, ESLint, the production build, 55 service tests, 41 PostgreSQL tests and eight browser journeys passed. The two applied migrations, private local environment file and font-license bytes were verified unchanged. Existing historical measurement values remain intact; the PostgreSQL test's new measurement output is retained privately with local verification artifacts. Service and PostgreSQL cases overlap and are not 96 unique scenarios.

References: [Prettier installation and CI](https://prettier.io/docs/install), [ignore rules](https://prettier.io/docs/ignore) and [SQL plugin](https://github.com/un-ts/prettier/tree/master/packages/sql).
