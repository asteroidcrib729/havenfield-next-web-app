# Production rollback rehearsal

Completed 2026-10-16, approximately 22:30–22:32 Pakistan Standard Time. The owner authorized testing immediately. P02-07's compatible application rollback is demonstrated with a **simulated incident**: both revisions were healthy, and no deliberately broken public release was deployed.

## Section 01 — Concrete targets and preflight

- Project: `havenfield`, canonical origin `https://havenfieldre.vercel.app`.
- Starting deployment: `dpl_FEGpznWimrbnwGSmqfjSC5F1q61A`, Git revision `3bc464302e74de77698f57e43188225ccc32090b`.
- Immediately previous eligible Production deployment: `dpl_B8x1YgV3E19jvKCgqS2t1HK7AtJ5`, Git revision `4b3fb9dfcb120939943a26a840d31c7eef09dfde`.
- Vercel Hobby supports rollback to the immediately previous Production deployment. See [Instant Rollback](https://vercel.com/docs/instant-rollback).
- A fresh complete private Production bundle was exported and validated before the exercise. This was a local precaution, not an independent Drive backup.
- Both immutable deployments passed health, publisher authentication and original three-article checks. No database migration changed between the revisions.

The immutable Production URLs are protected. Development OIDC authentication did not grant access to them. Vercel CLI's authenticated curl also failed because it forwarded a global CLI flag to curl. Automatic approval review then rejected reusing an existing protection credential until the owner explicitly authorized that use. After that approval, the existing credential was used privately only to check the two exact Production targets. No protection setting was disabled or broadened, and no credential was exposed or committed.

## Section 02 — Observed exercise

1. Through the current public origin's authenticated API, created one hidden synthetic draft and saved a second version. Both writes happened after the previous application deployment had been built.
2. Ran the real Vercel rollback to the immediately previous deployment and verified that the project's active Production target changed to it.
3. Through the canonical Production origin, confirmed health, the exact newer draft title/body/version, both revision records, hidden public status and the original public article count.
4. Promoted the original current deployment back. Verified its Production target and `autoAssignCustomDomains=true`. This matters because Vercel disables automatic Production domain assignment during a rollback.
5. Confirmed the restored current application could still read the newer draft, then deleted only that synthetic draft using its version-protected API. The initial deletion request omitted the required version and was safely refused; the versioned cleanup succeeded.
6. Compared all original article rows against the preflight snapshot: the content hash is unchanged. Production returned to three articles and three revision records, with healthy public requests.

No database snapshot was restored over live data. No original article, inquiry or media object was deleted. Publisher audit records legitimately retain the rehearsal's login/edit/delete history.

## Section 03 — Interpretation and future use

This proves the actual Production rollback/promote path and preservation of writes newer than the rollback target. The incident trigger was simulated; it does not claim that a genuinely defective application was deployed or that every future schema change is reversible. Recheck compatibility and protect backups before future releases.

Future operators should inspect the linked project, current deployment and eligible previous revision, take a verified backup, test the target, roll back only the application, verify data, and explicitly promote the desired revision to restore automatic deployment behavior. Do not reuse the historical IDs here without checking current inventory. See [sanitized evidence](free-operations-evidence.json).
