# Administrator access and credential setup

Updated 2026-10-16 (Asia/Karachi). Production sign-in: [havenfieldre.vercel.app/admin/login](https://havenfieldre.vercel.app/admin/login).

## Section 01 — Existing configured account

Production and Preview already have deliberately generated publisher credentials. On 2026-10-16 the saved passwords were compared to their scrypt hashes, and actual sign-in, authenticated article reads and logout passed in both deployed environments. No credentials were reset during the domain update.

The workspace's **ignored, private** `.cache/deployment/owner-access.json` contains the administrator email and separate passwords at `environments.production.password` and `environments.preview.password`. Open that file locally and use the appropriate environment; it is intentionally absent from the public GitHub repository. A fresh clone does not contain it. The corresponding private operator environment files are `.cache/deployment/production.env` and `.cache/deployment/preview.env`.

Passwords, password hashes, session secrets and connection URLs must not be copied into this public document or README. A hash is a server configuration value; the sign-in form takes the original password, not its hash. The application has no default password, public registration or email-based reset service. Losing the original password requires deliberately generating a new hash.

## Section 02 — Set a local email and password

1. Use Node.js 24 and install the locked dependencies with `npm.cmd ci`.
2. If `.env.local` does not exist, copy `.env.example` to `.env.local`. If it already exists, edit it in place; do not overwrite database settings, local OIDC credentials or other private values.
3. Set `ADMIN_EMAIL` to an email address you control. It identifies the editor and need not be a Havenfield-branded mailbox. This setting does not configure email sending.
4. Run `npm.cmd run admin:password` in an interactive terminal. Enter a unique 12–256 character password at the hidden prompt.
5. Copy the generated `ADMIN_PASSWORD_HASH` and `SESSION_SECRET` into `.env.local` privately. The hash has the form `scrypt:<64 hexadecimal salt characters>:<128 hexadecimal hash characters>`; the generated secret is a separate random signing key.
6. Restart the local dev server and open `http://localhost:3000/admin/login`. Sign in using the configured email and the password you entered in step 4.

With no `DATABASE_URL`, local development uses the ignored SQLite database. Prepare it with `npm.cmd run db:migrate` and `npm.cmd run db:seed` if needed. Do not point local tests at hosted production data.

## Section 03 — Configure or rotate Vercel credentials

In Vercel, open project **havenfield → Settings → Environment Variables**. Select exactly the environment being changed, then privately configure:

| Variable               | Value / purpose                                                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ADMIN_EMAIL`          | Deliberate editor email; use the exact intended identity                                                                                          |
| `ADMIN_PASSWORD_HASH`  | The full scrypt value produced by `npm.cmd run admin:password`; store as Secret                                                                   |
| `SESSION_SECRET`       | An independent random value of at least 32 characters; the generator provides one; store as Secret                                                |
| `NEXT_PUBLIC_SITE_URL` | `https://havenfieldre.vercel.app` for Production and Preview canonical metadata                                                                   |
| `SITE_URL`             | `https://havenfieldre.vercel.app` in Production; `https://havenfieldre-preview.vercel.app` in hosted Preview; localhost in explicit local Preview |

Use independent production and preview passwords/session secrets. Preserve `DATABASE_URL`, Blob credentials and maintenance settings when rotating an editor credential. Redeploy the selected environment after saving: editing a Vercel variable does not update an already built deployment. Verify login, article access, logout and old-session rejection. A password-hash or session-secret change invalidates existing publisher sessions by design.

If you automate updates, pass secrets using a private file/stdin rather than a command argument or copied chat message. Keep private operator files synchronized with the selected environment and store the chosen original password in your password manager. Do not commit screenshots of the editor's identity, environment settings or generated output.

## Section 04 — Troubleshooting

| Symptom                                              | Check                                                                                                                    |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Incorrect credentials                                | Correct environment/password, trimmed configured email and complete scrypt hash; do not try to sign in with the hash     |
| Editorial account is not configured                  | All three auth variables are present on that deployment, and the deployment was rebuilt after saving them                |
| Request origin is not allowed after changing domains | Production `SITE_URL`, public canonical and the browser origin agree; Preview uses its configured stable alias origin    |
| Programmatic write is rejected                       | Send the exact `Origin`, `x-requested-with: Havenfield`, valid session cookie and the route's documented payload/version |
| Private Preview shows Vercel login                   | Use an authorized Vercel account; platform protection and the application's publisher session are separate               |

The current account remains a single publisher. Multiple editors, roles and invitation/recovery flows need a separate security design before implementation.

## Section 05 — Current local Preview profile

The current ignored `.env.local` uses the Preview publisher/hash/session settings and Preview PostgreSQL/Blob services. Sign into localhost with the saved Preview password; Production retains its separate password. Use [the local Preview guide](local-preview.md) before changing this profile or pulling Vercel variables.
