# Hero video generation record

Updated 2026-10-14 (Asia/Karachi).

The user rejected the previous still-image zoom and requested a genuinely generated architectural video through the connected Higgsfield plugin, with a total budget of ten credits.

## Selection and generation

- [x] Verify the account balance and quote before submitting a job.
- [x] Compare economical models: Seedance 2.5 quoted 35 credits for five seconds; Seedance 1.5 Pro quoted 4.8 for four seconds; Grok Imagine Video 1.5 Lite quoted 5 for five seconds; Hailuo 2.3 quoted 6 for six seconds.
- [x] Submit exactly one Hailuo 2.3 text-to-video generation at 6 credits. The confirmed balance afterward is 4 credits. No trial was started and no other paid generation or enhancement was submitted.
- [x] Inspect representative frames for architectural continuity and natural motion.
- [x] Replace the old zoom MP4 and use a matching extracted poster.
- [x] Verify actual browser decoding, playback, pause/resume and reduced-motion fallback.
- [x] Refresh desktop/mobile preview screenshots and record final checks.

The result is a restrained single shot of a fictional limestone courtyard home, olive tree, timber screens, grasses and reflecting pool. The camera moves laterally through the scene, with changing foliage and water. No former-brand image was supplied. The intended six-second output measures **5.875 seconds**.

The website copy remains overlaid by React rather than generated into the video. The clip is muted and has no audio track. It loops normally; a perfectly seamless camera loop is not claimed. Reduced-motion/data-saving visitors receive the matching still, and the existing play/pause control remains available.

## Assets and provenance

- Video: `public/media/havenfield-hero.mp4`, H.264/yuv420p, 1280 × 720, 24 fps, fast-start MP4, 1,110,172 bytes.
- Poster: `public/media/havenfield-hero-poster.jpg`, 1280 × 720, extracted from the final video, 123,290 bytes.
- Review contact sheet: [six representative frames](video/hero-contact-sheet.jpg).
- Generation model: `minimax_hailuo`, variant `minimax-2.3`, requested 768p, landscape 16:9.
- The account-specific generation job identifier is retained in ignored local operational records.

The downloaded 1366 × 768 source was encoded locally with FFmpeg to a compatible 1280 × 720 hero, without paid upscaling. This replaces the earlier 1600 × 900, twelve-second still-image composition. Source/download working files are temporary ignored artifacts; final assets and review evidence stay in the project.

## Verification

Strict TypeScript and ESLint passed. The targeted Playwright run built the production app and passed both the new hero playback test and the existing responsive/accessibility journey. Edge decoded the actual 1280 × 720 MP4, advanced its playback time, paused/resumed through the UI, and switched to a still when reduced motion was enabled. Responsive checks covered seven routes at 320, 375, 768 and 1440 pixels. This media change did not alter backend services; their previous 21 passing tests remain recorded in plan 01's validation evidence.

The [desktop preview](screenshots/home-desktop.png) and [mobile preview](screenshots/home-mobile.png) now show the new hero poster. [Video validation evidence](video/validation-evidence.json) includes the final asset hashes and credit balance. The temporary owned Windows test server was stopped after the assertions finished, and the test command exited successfully with two passes. No hosted deployment was performed for this replacement.

## Generation prompt

> One continuous photorealistic architectural film for a quiet minimalist property website. An original single-storey pale limestone courtyard home with broad glass doors, warm oak screens, an olive tree, native grasses and a shallow reflecting pool in soft golden afternoon light. Wide landscape composition, building mainly on the right, calm uncluttered shadowed space on the left for website text. A very slow smooth lateral camera dolly produces clear realistic parallax between foreground grasses, olive tree and distant house, while the olive leaves and grasses gently sway in a breeze and small ripples move across the reflecting pool. Stable straight architecture, consistent daylight, restrained warm ivory and sage palette. Genuine natural scene motion throughout, not a still photograph or digital zoom. No people, vehicles, signage, lettering, logos, subtitles, cuts, sudden movement, surreal transformations or dramatic visual effects. Silent.
