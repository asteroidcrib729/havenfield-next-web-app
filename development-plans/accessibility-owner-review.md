# Owner accessibility review

Prepared 2026-10-16; disposition updated 2026-10-17. Reviewer: project owner. Status: **optional human review, not yet performed**. P02-04/G3 verification is deferred under [the delivery closure](development-plan-02-closure.md); this checklist does not block Plan 03.

Allow about 25 minutes. Use your normal browser and Windows Narrator, or a screen reader you already know. [Microsoft's Narrator guide](https://support.microsoft.com/en-us/accessibility/windows/narrator/complete-guide-to-narrator) explains the controls. `Windows + Ctrl + Enter` toggles Narrator. Start on [Production](https://havenfieldre.vercel.app) for public pages and use [local Preview](http://localhost:3000) for editorial changes. Local Preview must be running with `npm.cmd run dev:preview`; it uses the separate Preview database.

## Section 01 — Record your setup

- Review date and time in Pakistan Standard Time:
- Browser and version:
- Screen reader and version:
- Pages tested:
- Findings and reproduction steps:

Do not record your password, session cookies, inquiry details or database URLs here. Retrieve existing local Preview credentials privately using [admin access](admin-access.md).

## Section 02 — Keyboard and screen reader

Use `Tab`, `Shift + Tab`, `Enter`, arrow keys where appropriate and `Escape`; keep the mouse aside for this pass. A pass means you can understand and operate the feature without sight or a mouse.

- [ ] Home: reach the skip link, navigation, collection and journal links in a sensible order. Focus is visible and never disappears behind the header.
- [ ] Hero: the playback control announces its name and state. Pausing works; essential text remains understandable without video.
- [ ] Collection: filter controls have meaningful names and values. Results and the no-results message are understandable.
- [ ] Property detail: gallery controls announce their purpose, dialogs keep focus inside, and Escape returns focus to the opening control.
- [ ] Journal/article: headings form a useful outline, links make sense, and informative images have useful descriptions.
- [ ] About/contact: each form field has a label; validation errors identify the affected field and can be reached without a mouse. Use fictional test data only in Preview.
- [ ] Login: email/password labels and failed-login feedback are announced. Do not repeatedly submit wrong passwords and trigger throttling.
- [ ] Editor: create one private draft named `Accessibility review draft`. Verify labels, validation messages, saving feedback, recovered drafts and the preview link.
- [ ] Revisions/media/deletion dialogs: focus enters the dialog, stays inside while open, and returns after cancellation. Use fictional images and your own temporary draft only.
- [ ] Media/inbox/operations: tables and controls have understandable names. Empty states and status messages are announced. Leave existing records unchanged.
- [ ] Delete only your temporary draft and unreferenced test image when finished; sign out.

## Section 03 — Native browser zoom

Set **200%** using the browser's zoom menu (Chrome/Edge: menu → Zoom). This must be browser zoom, not a CSS setting or operating-system magnifier. Repeat the main navigation and populated editor checks, then reset to 100%.

- [ ] No essential text or controls are clipped or overlap.
- [ ] Navigation, forms, filters, editor actions and dialogs remain reachable.
- [ ] The page reflows without sideways scrolling; a wide data table may have its own horizontal scrollbar.
- [ ] Focus stays visible when opening dialogs and moving between controls.

## Section 04 — Report the result

For each issue, send the page, action/key pressed, expected behavior, actual behavior and browser/screen reader. A concise example is: “Preview editor → Tab to media dialog → Escape → focus moves to the top of the page instead of the Media button.”

Reviewer decision: pending. Leave unchecked items unchecked until you perform them. Automated axe, Lighthouse, keyboard and CSS 2× checks do not replace this review. I can fix your findings and repeat the technical checks afterward.
