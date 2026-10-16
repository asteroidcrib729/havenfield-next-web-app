# Havenfield brand and asset register

## Identity

Havenfield is a fictional property collection and editorial studio created for this portfolio. The name connects shelter with openness. The tagline is **Room for a different rhythm.** The supporting descriptor is **Homes & perspectives.**

The brand presents considered architecture, natural light, landscape and useful everyday spaces. Its voice is calm, specific and welcoming. All property names, places, specifications and USD guide prices are synthetic. No testimonials, sales statistics, staff identities or claims of real availability are invented.

The new logo uses an original geometric home/courtyard motif. Its open roof and interior doorway suggest shelter without a borrowed building silhouette. The wordmark is implemented in the shared TSX logo; standalone SVG mark/wordmark assets are under `public/brand/`. No previous logo, favicon, texture, brochure, phone number, domain, social profile or company copy is used.

| Token | Value     | Purpose                |
| ----- | --------- | ---------------------- |
| Paper | `#f8f6f1` | Warm primary canvas    |
| Ink   | `#242b27` | Text and dark sections |
| Brand | `#875a40` | Terracotta accent      |
| Muted | `#626b63` | Supporting text        |
| Line  | `#dcded5` | Quiet dividers         |
| Soft  | `#eeeee6` | Secondary surfaces     |

Typography uses the physically available **Playfair Display Regular** for expressive headings and **Poppins Regular** for interface/body text. Files were copied unchanged and SHA-256 verified before the old font folder was removed. Commercial-looking font families and all unused formats were retired. Fonts are self-hosted with `next/font/local`, so a build does not fetch fonts from Google.

Family license notices were retrieved from the official Google Fonts repository: [Poppins OFL](https://github.com/google/fonts/blob/main/ofl/poppins/OFL.txt) and [Playfair Display OFL](https://github.com/google/fonts/blob/main/ofl/playfairdisplay/OFL.txt). Full notices remain beside the fonts in `public/fonts/`. This register records family provenance; the legacy downloaded binaries were retained as requested, rather than replaced with different versions.

## New media

| Local asset                               | Source                                                                     | Use                                               |
| ----------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------- |
| `public/brand/mark.svg`, `logo.svg`       | Original project-authored SVG geometry/type                                | Favicon and brand reference                       |
| `public/media/courtyard.jpg`              | New built-in image generation, optimized to JPEG                           | Fictional courtyard home                          |
| `public/media/coastal.jpg`                | New built-in image generation, optimized to JPEG                           | Fictional coastal residence                       |
| `public/media/woodland.jpg`               | New built-in image generation, optimized to JPEG                           | Fictional woodland pavilion                       |
| `public/media/interior.jpg`               | New built-in image generation, optimized to JPEG                           | Interior, approach section, and journal cover     |
| `public/media/havenfield-hero.mp4`        | New Higgsfield/Hailuo 2.3 generated footage, locally optimized with FFmpeg | Muted, controllable hero film                     |
| `public/media/havenfield-hero-poster.jpg` | First frame extracted from the new hero footage                            | Matching initial/reduced-motion/data-saving still |

The mobile hero starts with its poster and offers opt-in playback; desktop autoplay, reduced-motion/data-saving fallback and decode-failure fallback are tested. Raster 32/180/192/512 icons and the 1200 × 630 social card are generated from the original brand geometry by `scripts/generate-brand-assets.ts`.

The current MP4 is genuinely generated architectural footage with camera movement, foliage and water motion, rather than a zoom composed from a still. It replaces the original temporary twelve-second composition at the user's request. The six-second Hailuo 2.3 request produced 5.875 seconds; the optimized MP4 uses H.264/yuv420p at 1280 × 720, 24 fps, no audio and fast-start metadata. The browser uses a matching extracted still for reduced motion or data saving, with an existing playback control for other visitors. One generation cost 6 of the available 10 Higgsfield credits; the balance afterward was 4. No trial or paid enhancement was started. [Video generation record](hero-video-generation.md) records the complete prompt, job and verification. The footage depicts an invented home, not a recording of a real property.

Four prompts were used with the built-in image tool, without prior brand references:

1. **Courtyard:** an imagined low limestone courtyard residence on a quiet coastal hillside; glass, timber louvers, olive trees, native grasses, reflecting pool; wide architectural editorial composition with breathing room left, restrained golden-afternoon light; no people, words, logos, famous developments or watermark.
2. **Coastal:** an original contemporary residence with a sheltered terrace, calm horizon, pale limestone, timber and Mediterranean planting; natural afternoon light and realistic geometry; no people, words, logos, existing branded development or watermark.
3. **Woodland:** an original low-roof dark timber/glass pavilion, deck and mature forest; warm window light and natural textures; wide quiet architectural composition; no people, words, logos, existing branded development or watermark.
4. **Interior:** an imagined loft with tall windows, pale plaster, oak floor, cream sofa, sculptural dining table and courtyard view; natural soft shadows and calm wide interior composition; no people, words, logos, existing branded development or watermark.

Generated images were visually inspected and final project files are stored locally. They depict fictional concepts; gallery pairings illustrate a design direction rather than documenting one actual building. Newly uploaded editorial images must belong to the publisher or have suitable sharing permission. Uploads become public even for a draft cover, and image decoding/reencoding removes embedded metadata before storage.

The interface uses a minimalist editorial base, a compact bento section, limited glass over imagery, and Tailwind motion-safe transitions. It does not depend on live Haikei or Realtime Colors services; their planning guidance informed the token/decorative decisions. Motion Primitives was evaluated as a pattern reference, not copied as an unacknowledged component dependency.
