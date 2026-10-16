# Production and local Preview connections

Verified 2026-10-16 (Asia/Karachi). The website runs on Vercel; its two PostgreSQL databases run in Prisma project `havenfield`.

## Section 01 — Why Prisma shows “No deploy”

Prisma's deployment indicator tracks Prisma Compute apps. This project has zero Compute apps and two ready databases. Connecting GitHub records the repository relationship; it does not deploy this Next.js application onto Compute. Vercel's own Git integration deploys the website. The databases are used through private PostgreSQL connection URLs, independently of that Compute indicator. This matches [Prisma Console's resource model](https://www.prisma.io/docs/console/concepts) and [its Compute deployment explanation](https://www.prisma.io/docs/compute/faq#where-it-has-trade-offs).

| Application                               | Configuration scope                                          | Database                                                | Prisma branch      |
| ----------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------- | ------------------ |
| `https://havenfieldre.vercel.app`         | Vercel Production                                            | `havenfield-production`, immutable `production` binding | `main`             |
| `https://havenfieldre-preview.vercel.app` | Protected Vercel Preview                                     | `havenfield-preview`, immutable `preview` binding       | `preview`          |
| `http://localhost:3000`                   | Ignored `.env.local`; backed by Vercel Development settings  | The same `havenfield-preview`                           | `preview`          |
| Automated tests                           | Explicit disposable SQLite/loopback PostgreSQL configuration | Isolated synthetic databases                            | No hosted database |

No Prisma Compute deployment is needed for this architecture. Do not replace these working databases or create a second app deployment merely to change the Console label.

## Section 02 — Start the configured local Preview

The current workspace's private `.env.local` is already configured. Its previous contents were retained in ignored local operator artifacts; unrelated local values were preserved. Database URLs, publisher credentials and media credentials were never copied into Git or this document.

```powershell
npm.cmd run config:check
npm.cmd run db:status
npm.cmd run dev:preview
```

The readiness output should report `environment: preview`, `localPreview: true`, `dialect: postgres` and `binding: preview`. Open the displayed localhost URL. Use the **Preview** password from ignored `.cache/deployment/owner-access.json`, together with its `email`, at `/admin/login`. The original Production password remains separate. [Admin access](admin-access.md) covers setup and rotation.

The launcher validates the existing database binding before starting Next.js. It binds only the configured loopback host/port and does not run migrations or seeds. A Production-bound database is rejected rather than relabeled. Local Preview requires its private publisher secret and the Preview Blob store; it cannot silently write local uploads that the hosted Preview cannot serve.

Edits, revisions, inquiry changes and uploads made locally are shared with hosted Preview. They are not isolated per browser or checkout. Use synthetic content for testing. Normal development requests do not migrate PostgreSQL; run reviewed migration procedures deliberately when needed. Automated tests explicitly disable local Preview and use disposable databases even when `.env.local` points at the real Preview.

## Section 03 — Private environment mapping

| Setting                          | Production                              | Hosted Preview                            | Local Preview / Vercel Development |
| -------------------------------- | --------------------------------------- | ----------------------------------------- | ---------------------------------- |
| `APP_ENV` / platform environment | Platform `VERCEL_ENV=production`        | Platform `VERCEL_ENV=preview`             | `APP_ENV=preview`                  |
| `LOCAL_PREVIEW`                  | Unset or `0`                            | Unset or `0`                              | `1`                                |
| `NEXT_PUBLIC_SITE_URL`           | Production HTTPS origin                 | Production HTTPS canonical                | `http://localhost:3000`            |
| `SITE_URL`                       | Production HTTPS origin                 | `https://havenfieldre-preview.vercel.app` | `http://localhost:3000`            |
| `DATABASE_URL`                   | Production pooled URL                   | Preview pooled URL                        | The same Preview pooled URL        |
| Publisher / session              | Production values                       | Preview values                            | The same Preview values            |
| Blob                             | Production store, `journal/production/` | Preview store, `journal/preview/`         | The same Preview store/prefix      |

`LOCAL_PREVIEW=1` is accepted only outside Vercel with `APP_ENV=preview` and loopback origins. It does not relax PostgreSQL binding, remote certificate validation or publisher-secret requirements. A hosted deployment with this flag fails closed. Local `VERCEL`, `VERCEL_ENV` and `VERCEL_URL` stay unset so a stale platform value cannot change its mode.

On a fresh authorized clone, install/login to Vercel CLI and link the existing project. Preserve an existing `.env.local` privately before pulling Development configuration:

```powershell
vercel env pull .env.local --environment=development
npm.cmd run config:check
npm.cmd run db:status
npm.cmd run dev:preview
```

Pull **Development**, whose values were deliberately configured for local Preview; do not pull Production into your local profile. Keep the short-lived Vercel OIDC value private. If previously exported platform variables exist in the terminal, clear them before running the local launcher. A fresh clone does not include the ignored owner credential file; obtain the Preview password from your password manager or deliberately rotate it using the admin guide.

For a completely isolated SQLite workspace instead, use blank `DATABASE_URL`/`DIRECT_DATABASE_URL`, `APP_ENV=development`, `LOCAL_PREVIEW=0`, localhost origins, local publisher values and no Blob token. Then run the normal local migration/seed commands. Do not overwrite the connected Preview profile accidentally.

## Section 04 — Verification and ongoing operation

The audit exercised actual local publisher login, a Preview Blob upload, revision restoration and real UTC publication. Hosted Preview read the same draft and cover; Production could not read that Preview-only draft. Separate certificate-verified TLS handshakes passed for both PostgreSQL endpoints. Tests continue to use synthetic isolated data.

The stable Preview alias retains Vercel Authentication and noindex. Use its exact configured origin for publisher writes. An immutable deployment hostname with a different origin is useful for inspection, but its publisher writes are intentionally rejected when `SITE_URL` is the stable alias. New manual Preview deployments must move the alias deliberately; a Production push must not move it to Production. Verify alias ownership when changing deployment configuration.

See [the audit follow-up](development-plan-02-delivery.md) for completion evidence and remaining acceptance gates.
