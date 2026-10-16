# GitHub publication and continuous deployment

Updated 2026-10-16 (Asia/Karachi). Publication is authorized by the project owner. Target: public repository [asteroidcrib729/havenfield-next-web-app](https://github.com/asteroidcrib729/havenfield-next-web-app), branch `main`, connected to the existing Vercel project `havenfield` and [portfolio origin](https://havenfieldre.vercel.app).

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

The public repository was created and all four iteration commits were pushed. The first delivery revision is `c5644ac2d878d97149b82d6db7fafab7090cc989`; local `HEAD` and `origin/main` match and the working tree is clean. The publishable snapshot, exact index and complete four-commit history each passed Gitleaks with zero findings. TypeScript, full ESLint, 55 service tests, 41 isolated PostgreSQL tests and the dependency audit pass locally.

Native Vercel Git integration is connected and the project API confirms GitHub organization `asteroidcrib729`, repository `havenfield-next-web-app` and Production branch `main`. The existing Vercel project, separately bound databases, media stores and private environment settings are reused. Other pushed branches use Preview deployments. No deployment token or hosted database credential is added to GitHub Actions.

The first [clean-checkout Actions run](https://github.com/asteroidcrib729/havenfield-next-web-app/actions/runs/38632322005) passed on Ubuntu with Node 24: complete-history secret scan, dependency audit, TypeScript, ESLint, 55 service tests, production build, 41 isolated PostgreSQL tests and eight Chromium browser journeys. The owned browser server shut down normally on Linux. The [post-connection run](https://github.com/asteroidcrib729/havenfield-next-web-app/actions/runs/38632523723) also passed.

Pushing `b946fd0499ab09f83d4a202ddeb4852577768986` after connection automatically created Production deployment `dpl_Cra1EEeBLyMCADx2cxNLCGtWRBgn`, with Vercel source `git`, branch `main` and that exact GitHub SHA. It reached READY and acquired `havenfield-portfolio.vercel.app`. Health, homepage, public journal, robots and sitemap return 200; the three seed articles persisted. [Machine-readable delivery evidence](github-delivery-evidence.json) captures this verified snapshot. A later documentation-only completion commit records these results; the final local/remote SHA and automatic deployment are checked again after its push.

Native Vercel deployments and GitHub Actions both run on pushes. Vercel's integration is not configured to wait for the Actions jobs. Keep credentials out of source before committing; the CI scanner detects matches in published history and does not replace the pre-commit review.

Prisma's GitHub repository association is also active on shared project `havenfield`. Production and Preview remain distinct databases on `main` and `preview` branches within that project; [project consolidation](prisma-project-consolidation.md) records the data-preserving migration and protected Preview checks. Prisma rejected a second association for the former standalone preview project because the repository was already linked. The application continues to deploy through Vercel; this association does not add automatic SQL migrations or a Prisma Compute deployment.

The final verification compares local `HEAD`, `origin/main` and GitHub's branch SHA, checks the working tree, inspects Vercel's connected repository/production branch, and confirms a deployment caused by a pushed Git revision reaches READY on the portfolio domain. Independent backups, human accessibility acceptance and other remaining product gates are tracked separately in [release acceptance](release-acceptance.md).
