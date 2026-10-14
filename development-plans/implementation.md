# Havenfield implementation and validation

Updated 2026-10-14 (Asia/Karachi). This implements [development plan 01](development-plans-01.md); the retained plural filename is the existing plan, not a second plan.

## Delivered application

Havenfield is a new fictional real estate and editorial brand, with an original SVG identity, original copy, four illustrative homes, three original journal articles, four newly generated architectural images, and new AI-generated architectural hero footage. The current six-second Higgsfield/Hailuo clip replaces the earlier still-image composition; [video generation record](hero-video-generation.md) records the replacement and credit budget. Playfair Display and Poppins are self-hosted from the previously available files with their license notices.

The public site includes the home page, searchable/filterable property collection, property details and galleries, about, amenities, contact, journal, article pages, privacy, terms and cookies. All pages are React TSX. Styling uses Tailwind utilities and theme tokens; the old manual stylesheets, HTML, PHP, Composer dependencies, client content and media have been removed.

Next.js Node route handlers supply TypeScript REST APIs. Express would add a second application lifecycle without a needed independent service, so the backend remains within Next.js for Vercel. PostgreSQL is the production database; local SQLite exists only for development and tests. Production never silently substitutes SQLite.

The editorial studio provides authenticated creation, editing, deletion, drafts, publishing, unpublishing, scheduling, Markdown previews, uploaded covers and alternative text, categories, tags, SEO titles/descriptions, canonical URLs, noindex, revisions, restoration as a draft, old-slug redirects, private previews, search/filtering and pagination. Version checks protect concurrent edits. Scheduled articles appear when due without cron. The application intentionally has one configured publisher; no default credentials, public signup or password-reset email service is included.

Blog publication controls also govern public APIs, RSS and sitemap discovery. Article structured data escapes executable markup. Custom SEO titles are complete titles; the global brand template is bypassed to avoid duplicate brand suffixes. Inquiries record consent and return a demo receipt without pretending to send email.

## Verification

`npm.cmd run check` checks strict TypeScript, ESLint, Vitest and the production build. The service/content suite contains 21 tests covering authentication, mutation safety, throttling, persistence, publication visibility, revisions, query normalization, safe Markdown and discovery feeds.

`npm.cmd run test:e2e` builds and runs a local production server with a separate temporary SQLite database and synthetic credentials. All three browser journeys passed before final handoff:

- Public property filtering, empty/reset states, inquiry receipt, article discovery, RSS and unauthorized admin rejection.
- Seven routes at 320, 375, 768 and 1440 pixels without horizontal overflow; reduced-motion behavior; automated WCAG checks on the contact form.
- Admin login, image upload, draft exclusion, publication, editing, slug redirect, restoration, future scheduling, deletion and logout. The populated editor also fits at 320 pixels.

Browser testing identified and resolved footer contrast and empty admin-status filtering issues. The article-title regression is included in the public journey. Automated accessibility checks cover the tested form, not a complete human accessibility audit. Unit/browser tests use local relational persistence; they do not establish hosted provider connectivity.

The dependency audit reports no known vulnerabilities in the locked dependency tree. CI runs the checks and browser journeys with Node 24 and Chromium; hosted CI has not run yet because no remote repository has been configured. The [sanitized validation evidence](validation-evidence.json) records the final results. The final browser command exited successfully with all three tests passing; a lingering owned Windows test-server process was stopped after the assertions completed.

Visual evidence: [desktop homepage](screenshots/home-desktop.png), [mobile homepage](screenshots/home-mobile.png), [editorial studio](screenshots/editor-desktop.png). These contain fictional content and synthetic test data.

The subsequent generated-video replacement is recorded in [video generation record](hero-video-generation.md). Its focused browser run passed actual video decoding/playback/pause/resume, reduced-motion behavior, and the responsive/accessibility journey; the homepage previews were refreshed.

## Cleanup and repository

[cleanup.md](cleanup.md) records the historical consolidation and migration cleanup. [cleanup-evidence.json](cleanup-evidence.json) retains historical counts with anonymized retired-directory labels; its old-phase limitations are historical, not current implementation claims. Only one root Git repository remains, with no configured remote or initial commit. Credentials and local runtime databases are ignored.

Next.js 16.4 created a managed root `AGENTS.md` during development. `agentRules: false` disables that generated file to honor the requirement that README is the sole root Markdown file. Installed-version documentation remains available under `node_modules/next/dist/docs/` for future contributors.

## Hosted handoff

[database-options.md](database-options.md) evaluates free relational hosts against the explicit no-inactivity-pause requirement. Prisma Postgres Free is the recommended candidate under its published idle policy; free operation/storage quotas still apply and it is not an unlimited availability guarantee.

No Vercel deployment, hosted PostgreSQL connection or production Blob upload is claimed as verified. Configure the canonical site origin, claimed PostgreSQL database, publisher secrets and Blob token, then run explicit migrations and optional seeding. [deployment.md](deployment.md) contains the commands and operational details.

## Plan 02 execution

The first database milestone is implemented with ordered/checksummed migrations, a tested version-1 upgrade, real PostgreSQL concurrency tests and private export/empty-target restoration. [Execution record](development-plan-02-progress.md) contains the current validation results and open product work. [Database recovery](database-recovery.md) contains operator commands and backup limitations. Earlier test counts in this document remain historical foundation evidence.
