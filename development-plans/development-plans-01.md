# Development plan 01: Havenfield

Implementation scope updated 2026-10-14. This is the existing plan 01 requested by the user; its established filename remains `development-plans-01.md`.

## Accepted architecture and identity

Build a completely independent portfolio identity, with no adaptation of previous brand copy, logos, properties, operational contact details, or media. The selected name is **Havenfield**, with the tagline **Room for a different rhythm** and the descriptor **Homes & perspectives**. All content is fictional and clearly presented as a portfolio concept.

The application uses Next.js App Router, React, strict TypeScript and Tailwind-first styling. REST handlers run on Node.js, with server services and parameterized relational SQL separate from transport. Next.js provides sufficient API structure for this project's scope. Express is supported on Vercel, but an independently deployed API would add an application boundary without serving a current requirement; no custom Next.js server is introduced.

Production targets Vercel and standard managed PostgreSQL. Local development/tests use SQLite only outside Vercel. Prisma Postgres Free is the current recommended candidate for avoiding inactivity-based pausing, based on its documented vendor claim; provider quotas, backup limitations and live verification boundaries are in [database-options.md](database-options.md).

## Completed directory and source transition

The initial phase consolidated redundant source copies into one root repository and removed operational credentials/history. This implementation phase replaces that retained source entirely. There are no PHP handlers, Composer manifests/vendor copies, static HTML pages, old frontend scripts, or legacy CSS/media folders in the authored project. All application pages are TSX and all backend code is TypeScript.

```text
project-root/
  .git/
  README.md
  .env.example
  package.json, package-lock.json
  next.config.ts, tsconfig.json, postcss.config.mjs
  eslint.config.mjs, vitest.config.ts, playwright.config.ts
  src/
    app/                 # Public pages, admin pages, REST routes, SEO outputs
    components/          # Shared brand, navigation, galleries, forms and editor
    content/             # Original typed fictional properties
    lib/                 # Shared schemas, types and site configuration
    server/              # Authentication, SQL, CMS, inquiries and media
  public/
    brand/               # Original SVG logo assets
    fonts/               # Retained local fonts and license notices
    media/               # Newly generated images and hero film
  database/schema.sql
  scripts/               # Explicit migrations, seed and password setup
  tests/                 # Service/content tests and browser journeys
  development-plans/     # All authored Markdown except root README
```

The next product milestone is [development plan 02](development-plan-02.md). Future plans use the next unused two-digit number (`development-plan-03.md`, then `04`, etc.); this historical plan 01 retains its original plural filename. All progress, architecture and production Markdown stays in this directory. The root contains one repository without imported legacy history; no remote is configured or publication claimed.

## Design assessment and implementation

Earlier source review identified a conventional luxury marketing layout: material textures, videos, sliders and decorative animation. The later legacy version added cards, responsive grids and a localized blur effect. These observations came from source inspection, not a rendered comparison.

| Design family | Legacy finding | Havenfield decision |
| --- | --- | --- |
| Skeuomorphism | Limited material/texture cues, not physical-control imitation | Replace with flat semantic surfaces and photography |
| Neumorphism | Ordinary shadows did not form a paired inset/outset system | Avoid unclear control boundaries |
| Glassmorphism | One local blur treatment | Restrained image caption glass; opaque controls |
| Claymorphism | No coherent inflated 3D treatment | Not adopted |
| Brutalism | Polished commercial presentation rather than raw structure | Not adopted |
| Minimalism | Spacious sections mixed with competing decoration | Main editorial typography/spacing foundation |
| Maximalism | Visual complexity did not prove a coherent maximalist system | Curated content rather than accumulated effects |
| Liquid Glass | Ripples/blur were not refractive glass UI | No experimental refraction in core navigation/forms |
| Bento Grid | Repeated cards were mostly uniform grids | Intentional compact approach section with asymmetric tiles |
| Spatial UI | Tour links/utility CSS did not establish a spatial navigation model | Ordinary accessible galleries, without 3D dependency |

Motion Primitives, Haikei and Realtime Colors were evaluated as motion, decorative-shape and palette workflow references. The implementation uses original SVG geometry, semantic Tailwind tokens and motion-safe CSS transitions; it does not load those design services at runtime or claim copied components. See [brand-and-assets.md](brand-and-assets.md) for identity, prompts, font licenses and media provenance.

## Public experience

- Original home with controllable hero film, property collection, a bento approach section, journal discovery and inquiry CTA.
- Property search, setting/type/price/bedroom filters, sorting, empty states, detail specifications and accessible galleries.
- About, amenities and demo-specific privacy/terms/cookie pages rewritten from scratch.
- Public journal search/category/tag navigation, article typography/GFM, reading time, related articles, author/publication information and safe links.
- Genuine database-backed consented inquiry receipts, without SMTP delivery or representations of actual sales activity.
- Responsive layouts and reduced-motion/data-saving fallbacks. Self-hosted Playfair Display/Poppins use the already-present font binaries, verified before source removal.

## Editorial workflow and TypeScript replacement

The former general admin is replaced by a publishing-focused studio with one explicitly configured publisher. It provides login/logout, searching/filtering/pagination, create/update/delete, drafts, publication/unpublication, future scheduling, metadata, author/category/tags, cover images/alt text, safe Markdown write/preview, private saved previews, revision history and draft restoration, dirty-change warnings, and optimistic concurrency errors.

Scheduling is evaluated by the public database query at request time. Unpublished and future-scheduled content cannot be obtained through the public endpoints, RSS, sitemap or article route. Old published slugs redirect while their article remains public. Restoring a revision deliberately withdraws publication until editorial review.

SEO fields include title, description, canonical and noindex. BlogPosting structured data, Open Graph/Twitter metadata, related links, public sitemap and RSS follow actual published content. SEO readiness checks describe actionable editorial checks, not fabricated ranking scores. Noindex is an indexing instruction, not draft access control.

Image uploads validate actual JPEG/PNG/WebP content, limit size/pixels, strip metadata and encode WebP. Vercel uses Blob storage; development uses ignored local data. Uploads are public even when used by a draft. The application cap fits Vercel's server-upload limit. Media references can also use approved local assets or validated HTTPS URLs.

Authentication uses a deliberate email, scrypt hash and random session secret; signed HttpOnly cookies; verified origin/mutation headers; SQL-backed rate limits; and validation before persistence. No public signup, default password, legacy credential, reset-mail account or disabled TLS verification is retained.

## Milestones and validation

1. **Root consolidation:** completed; historical cleanup is recorded separately.
2. **Independent identity/framework:** implemented with new copy, logo, imagery, film, fonts and root build commands.
3. **Public journeys:** implemented with responsive property/journal/inquiry pages and demo disclosures.
4. **TypeScript CMS/API:** implemented with relational storage, editorial lifecycle, security boundaries, upload handling and migrations.
5. **Local validation:** typecheck, lint, service/content tests, production build and browser journeys are recorded in [implementation.md](implementation.md). Failures found during verification are corrected before completion is reported.
6. **Hosted verification:** requires account-owned PostgreSQL, Blob settings, actual canonical domain and Vercel deployment. No credentials for those services were supplied, so this external step is not represented as completed.

No production files should be copied into separate deployment source directories. Use the one root application, one lockfile and deployment environment variables. Follow [deployment.md](deployment.md) for setup, explicit migration/seeding, editorial operation and the live verification boundary.
