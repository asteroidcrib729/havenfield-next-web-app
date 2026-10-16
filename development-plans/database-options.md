# Relational database decision

Reviewed 2026-10-14. The requirement is a free relational service without automatic inactivity-based pausing. The application remains on Vercel; database hosting is independent.

| Provider              | Current idle policy                                                                   | Fit                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Prisma Postgres Free  | Prisma describes the database as staying ready without scale-to-zero or cold starts.  | Recommended candidate, within its free quota.                                                  |
| Supabase Free         | Projects with low activity can pause after a seven-day window and require resumption. | Does not meet the requirement.                                                                 |
| Neon Free             | Compute suspends after five idle minutes; the free plan cannot disable this.          | Automatic wake-up is insufficient for the stated requirement.                                  |
| Aiven Free PostgreSQL | Aiven reserves the right to power off services lacking continuing activity.           | Does not meet the requirement.                                                                 |
| Turso Free            | Its CLI documentation describes inactivity archiving for free-plan groups.            | Do not treat automatic wake-up or new architecture announcements as a guarantee of no pausing. |

Prisma's [current provider comparison](https://www.prisma.io/blog/serverless-postgres) explicitly identifies its no-scale-to-zero/no-cold-start behavior as a vendor claim. This was not independently benchmarked against a configured account. The [pricing page](https://www.prisma.io/pricing) lists 200,000 monthly operations, 1.01 GB of storage, and up to 50 databases across a free workspace. The [FAQ](https://www.prisma.io/docs/postgres/faq) explains that exhausting the free allowance stops queries until a reset or upgrade. Free storage is not an availability SLA, and free backup automation is not included.

Use a claimed, account-owned production database. Do not use the unclaimed 24-hour temporary database offered by the anonymous CLI as a deployment database. Keep exports outside Git and test restoration. Operations are account-wide; each SQL query consumes allowance, so monitor usage and avoid unnecessary polling.

The app uses parameterized SQL with `pg`, a two-connection per-process pool, verified remote TLS, bounded queries, and indexed publication/slug lookups. It does not require Prisma ORM or tie its schema to one provider. Use a pooled ordinary PostgreSQL URL for Vercel and an optional direct URL for migrations. A different managed PostgreSQL provider can be substituted without changing the CMS model.

The local SQLite adapter is for development and tests. Vercel fails clearly when `DATABASE_URL` is missing; it never writes a supposedly persistent database to function storage. Production migrations and seeding are explicit commands, not cold-request work.

No hosted database has been provisioned or tested here. Configure a Prisma Postgres account and verify its current plan policy when connecting it. If an unconditional contractual always-on service is required, a paid plan or appropriately managed server remains a separate decision.

Policy sources: [Supabase pausing](https://supabase.com/docs/guides/platform/free-project-pausing), [Neon scale-to-zero documentation source](https://github.com/neondatabase/website/blob/main/content/docs/introduction/scale-to-zero.md), [Aiven service pricing](https://aiven.io/docs/platform/concepts/service-pricing), [Turso unarchive](https://docs.turso.tech/cli/group/unarchive).
