# Property and media authoring

Updated 2026-10-17 (Asia/Karachi). This is the Plan 03 property/catalog migration and publisher guide. Release verification is recorded in [Plan 03 progress](development-plan-03-progress.md).

## Section 01 - Catalog initialization

Migration `003-property-authoring.sql` adds the catalog, revision history, upload references and media collection/focal/version fields. It preserves the earlier migrations and existing article, inquiry and upload records. Hosted requests never apply migrations.

Using the intended private environment profile, check the binding, export a backup, apply migrations, then explicitly initialize the catalog:

```powershell
npm.cmd run db:status
npm.cmd run db:backup
npm.cmd run db:migrate
npm.cmd run properties:seed -- --environment=preview
```

Use `--environment=production` only with the Production profile. A new isolated SQLite setup uses `db:seed`, which now initializes the catalog as well as articles. Seed initialization preserves the original four IDs (`hf-01` through `hf-04`), slugs, specifications and inquiry associations. Repeated initialization preserves publisher edits. An uninitialized nonempty catalog is refused for operator review.

Before initialization, the application renders the four original seed homes. Once initialized, the database is authoritative, including an intentionally empty catalog. Database failures do not reveal seed or draft homes as a fallback. The catalog is limited to 100 properties for this portfolio.

## Section 02 - Publisher workflow

1. Sign in at `/admin/login`, choose **Properties**, then **New property** or an existing home.
2. Enter original fictional copy, locality, setting, specifications, features and a lower-case URL slug. Existing slugs are fixed to preserve public links, browser-local selections and inquiry references.
3. Add up to 12 distinct photographs from the upload or read-only repository picker. The first photograph is the collection cover. Reorder photographs, describe each placement and adjust its horizontal/vertical focal point.
4. Add up to eight narrative sections and six related journal slugs. Only published related articles appear publicly; the journal provides a fallback.
5. Use **Preview concept** to inspect the current unsaved text and cover privately inside the authenticated editor. This does not create a public preview URL.
6. Save as **Draft** or deliberately choose **Published** and save. Draft homes are excluded from collection/search/detail pages, saved/compare displays, sitemap, article recommendations and new inquiries.
7. Review **Property revisions** and restore a version when needed. Restoration creates a new version with the retained fields **and publication status**. Restoring a published version makes the home public again.
8. Delete only an unwanted property without inquiry history. A home with retained inquiries cannot be deleted; save it as Draft to hide it while retaining those associations.

Property edits are explicitly saved. They do not have article-style autosave recovery. The editor warns about unsaved in-page navigation/browser departure and blocks sign-out while dirty. Keep the page open after a failed save; expired sessions require signing in separately before retrying. Version conflicts preserve current writing and require a deliberate reload or manual merge. No public signup or extra publisher accounts were introduced.

Existing inquiry receipts remain valid if a home is later unpublished. New submissions must select a currently published home. Saved-home IDs remain browser-local; unpublished/deleted homes disappear from the rendered shortlist without exposing private records.

## Section 03 - Media collections, crops and protection

**Media library** separates owned uploads from 28 original repository images. Uploaded descriptions and collection names are searchable/filterable. **Edit description** opens a keyboard-accessible image-details dialog with wide, card and portrait crop previews. Focal defaults apply when adding a property photograph; existing gallery placements retain their own saved alt/focal values. Article descriptions and crops keep their existing behavior. Metadata saves use a version check so a stale dialog cannot overwrite a newer edit.

Repository files and their metadata are read-only. Their usage inspector includes retained article/property/recovery references and fixed public-page placements. New or changed source-controlled imagery goes through the repository asset pipeline, not upload deletion.

Owned uploads cannot be deleted while referenced by a current property gallery or retained property revision, article/revision or interrupted article recovery. Removing an image from a gallery does not erase its revision history; delete the unused property only when allowed to release that protection. Usage links go to the correct article or property editor. Images remain public even when a property/article is a draft; do not upload confidential material.

## Section 04 - Recovery and deployment

Database export format **3** includes catalog readiness, properties, revisions, property/media protection and media collection/focal/version fields. Recovery remaps uploaded URLs inside property content and revision snapshots when moving stores. Format 1 and 2 exports are checksum-validated before normalization; legacy bundles retain their original manifest checksum validation. Restore still refuses nonempty or unknown targets.

An older format-2 export has no authored property catalog. After restoring it into the current schema, explicitly initialize the original inventory before editing. Keep the matching repository revision and migration files with the recovery instructions.

The schema change is additive. Earlier application builds can read their original tables, but do not understand database-authored homes; they are not a complete rollback for catalog edits. Use the current release or a deliberately reviewed compatible fix. Do not drop the new tables or restore an old export over a live database as a rollback shortcut. Production and Preview remain independently bound with separate credentials and storage.
