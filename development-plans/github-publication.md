# GitHub publication and continuous deployment

Updated 2026-10-15 (Asia/Karachi). Publication is authorized by the project owner. Target: public repository [asteroidcrib729/havenfield-next-web-app](https://github.com/asteroidcrib729/havenfield-next-web-app), branch `main`, connected to the existing Vercel project `havenfield` and [portfolio origin](https://havenfield-portfolio.vercel.app).

## Section 01 — Pre-publication review

The publishable tree contains only the independent Havenfield application, fictional content, original brand assets, retained font licenses, tests, tooling and development records. Gitleaks 8.30.1, downloaded from its official release and SHA-256 verified, found zero credential matches in the initial 205-file publishable snapshot. Manual review also covered previous-client identifiers, personal contact details, private connection strings, keys and local runtime data. Editorial/operations screenshots display synthetic `editor@havenfield.test` identities and generated test records.

Real database URLs, publisher credentials, session/cron secrets, Blob tokens, Vercel authentication and local runtime data remain in ignored environment/cache/data directories. Private infrastructure identifiers and the video-generation job identifier were removed from public documentation; the operational reference map is kept in ignored local storage. Public service names, deployment URLs, source hashes and asset provenance remain available. Third-party font notices are preserved. The loopback PostgreSQL CI password is a disposable fixture, and the fake connection string in error-handling tests is deliberate synthetic data.

The staged tree must pass a second scan before any commit. Complete history must pass a scan before the first push. Future pushes and pull requests run the same pinned, checksum-verified Gitleaks release against complete history in GitHub Actions. Dependency audit, TypeScript, ESLint, service tests, a production build, isolated PostgreSQL tests and Chromium browser journeys run in the application-checks job. Hosted secrets are never supplied to those jobs.

## Section 02 — Development iteration commits

There was no existing commit history to preserve. The first delivery groups the final reviewed source into meaningful implementation scopes without inventing historical snapshots or backdating commits:

1. Root tooling and the Next.js/TypeScript/Tailwind migration foundation.
2. Independent Havenfield identity, media, fictional content and public TSX pages.
3. TypeScript editorial APIs, authenticated studio, persistence, recovery and test coverage.
4. Development plans, release evidence, README and continuous integration.

The final application is validated as a complete tree; these scopes describe the delivered work rather than independently runnable historical builds. Commits use the GitHub account's no-reply address to avoid publishing the author's personal email.

## Section 03 — Delivery verification

Publication, clean-checkout CI and native Vercel Git integration are being completed in this iteration. This record will be updated with verified outcomes before delivery is declared complete. The existing Vercel project, separately bound databases, media stores and private environment settings are reused. Production should follow `main`; other pushed branches should create isolated Preview deployments.

The final verification compares local `HEAD`, `origin/main` and GitHub's branch SHA, checks the working tree, inspects Vercel's connected repository/production branch, and confirms a deployment caused by a pushed Git revision reaches READY on the portfolio domain. Independent backups, human accessibility acceptance and other remaining product gates are tracked separately in [release acceptance](release-acceptance.md).
