# Plan 03 content and images

The image [manifest](plan-03-assets.json), [contact sheet](assets/plan03-contact-sheet.webp) and [execution record](development-plan-03-progress.md) describe the original content. All scenes are invented AI-generated design concepts. Images are not records of real properties or proof of measured layouts.

## Original image processing

Retain original PNGs privately. The ignored `.data/plan03/source-map.json` maps stable image IDs to source paths; `.data/plan03/generation-prompts.json` holds exact submitted prompts where retained. Run `npm.cmd run assets:process` locally, then `npm.cmd run format`. A clean checkout intentionally contains no raw sources or private source map. Public WebP files already work without regenerating them.

The processor verifies original-file consistency, strips metadata through reencoding, enforces master size budgets, builds responsive derivatives and recreates the runtime alt-text index/contact sheet. The source and optimized hashes in the register distinguish actual new images from crops. The four pilot prompts are normalized briefs; the other 24 exact prompts are recorded. Reference IDs link each gallery view to its property pilot.

No existing developer, photographer, listing or former-client media was used as a reference. Generated outputs are shared as project concept assets; no claim of exclusive rights or an actual building is made. Font licenses remain separate. The original hero film and its historical credit record remain unchanged.

## Draft review and publication

The six source drafts are in `src/content/journal-drafts.ts`. The explicit import command creates missing drafts and preserves existing articles. Use an isolated local profile to review first:

```powershell
npm.cmd run content:plan03 -- --environment=development
npm.cmd run content:plan03 -- --environment=development --apply
```

Use `--environment=preview` with the existing private Preview profile, and use Production only through a deliberately selected Production profile. A mismatch is rejected. The default is a dry run. Do not paste database URLs or administrator credentials into commands, documentation or Git.

In the editorial studio, review body headings, cover/alt, tags, SEO title/description and related-home meaning. To publish, deliberately change status to Published or Scheduled and review noindex/canonical settings. Draft imports default to noindex; remove that setting when an article is approved for search indexing. Public routes, feeds and recommendations exclude drafts.

Only known original seed slugs whose cover is still `/media/interior.jpg` receive the new distinct cover. All other fields and custom covers are preserved; updates create revisions/action records. Repeating the importer creates no duplicate drafts or extra cover revisions.
