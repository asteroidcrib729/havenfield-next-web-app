# Havenfield - a real estate publishing application

I built Havenfield to demonstrate a complete property website: discovering homes, comparing choices, making a demo inquiry and maintaining the content behind it. Its brand, homes, places and editorial content are fictional. I do not present it as a live agency or claim commercial results.

[Explore the website](https://havenfieldre.vercel.app) · [Explore the studio tour](https://havenfieldre.vercel.app/studio-demo) · [Source](https://github.com/asteroidcrib729/havenfield-next-web-app)

## The problem I worked through

A property website needs more than attractive listing cards. Visitors need to narrow a collection, preserve their choices and understand a home. A publisher needs to change that content without editing application code, losing work or exposing private drafts.

I designed the visitor and publisher workflows together. I use original architectural concept imagery, self-hosted typography and a restrained visual system to keep attention on the homes.

## A short demonstration

1. Filter the collection, open a home and compare it with another saved choice.
2. Explore its illustrative plan and printable brochure.
3. Submit an inquiry using invented details; the receipt states that no email or booking is sent.
4. Explore the public studio tour to see property, journal, media and inquiry examples.
5. In the private studio, edit a home, prepare and publish an article, inspect image usage and update a conversation.

[Recorded walkthrough](https://havenfieldre.vercel.app/media/havenfield-walkthrough.mp4). A [text alternative](walkthrough-transcript.md) describes each sequence. The recording uses an isolated local database and invented records. It demonstrates the real application; it does not expose production credentials or actual inquiries.

## Implementation decisions

I use Next.js, React, strict TypeScript and Tailwind. Route handlers validate requests and call separate TypeScript services. PostgreSQL provides hosted relational persistence; SQLite supports isolated local checks. I kept the backend inside the existing application because its workload does not require a separate API server.

Production and Preview use independent databases and storage. Numbered migrations preserve schema history. Version checks reject conflicting edits, revisions preserve deliberate recovery points, and media references prevent deleting an image that content still uses. Public queries exclude drafts.

The public studio tour uses fixed synthetic samples rather than private administrative endpoints. Publisher access remains private. Inquiry notes and exports require an authenticated session.

## What I can show

- Shareable search/filter state, browser-local saving and comparison.
- Accessible gallery controls, responsive layouts and reduced-motion behavior.
- Property authoring, publishing, revisions and media management.
- Journal publishing, search metadata, related homes, RSS and sitemaps.
- Inquiry receipts, internal conversation stages, notes and CSV exports.
- Automated service, PostgreSQL and browser checks, plus repeatable deployment and recovery tooling.

These are implementation capabilities, not claims about client revenue or conversion rates. Lab performance measurements and their limitations are recorded separately under the development plans. Human accessibility review remains a separate assessment.

## Boundaries and tradeoffs

The property imagery and floor plans are illustrative, not measured architectural documentation. Inquiry requests do not send email or book a viewing. Browser-local saved homes do not follow a person between devices. The application uses a single private publisher account rather than a multi-tenant administration product.

I chose these boundaries so the demonstration stays usable, understandable and affordable on the existing free infrastructure.
