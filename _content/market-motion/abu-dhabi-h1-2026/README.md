# sp_ce — Abu Dhabi City Residential Market, H1 2026 · market-motion film

A code-rendered, vertical market-motion film for Instagram Reels (1080 × 1920, 30 fps, 46.4 s, H.264, no audio), built in Remotion.
Every mark on screen is drawn from code: no image generation, stock footage or AI imagery.

| Output | Path |
| --- | --- |
| Final film | `out/abu-dhabi-h1-2026.mp4` |
| Contact / key-frame sheet | `out/contact-sheet.jpg` (35 frames, timecoded) |
| Final branded frame | `out/final-frame.png` |
| Locked data | `data/market.json` (the only source of on-screen numbers) |
| Source | `src/world.ts` (camera, terrain, particles, contours, timeline anchors), `src/Field.tsx` (canvas renderer), `src/Film.tsx` (H1 typography), `src/PublisherScenes.tsx` (CBRE and Savills scenes), `src/Ending.tsx` + `src/brand.ts` (signature ending), `src/theme.tsx` (shared type primitives, legal line) |

> **Location note.** This was built in a Linux cloud container, where `/Volumes/JW SSD/…` does not exist.
> The folder is laid out to drop straight into
> `/Volumes/JW SSD/Space/Space 2026/_content/market-motion/abu-dhabi-h1-2026/`.
> Copy this directory there, then run `npm install` to restore `node_modules`.

## Motion-language note (reference benchmark)

**Caveat.** The reference video was not attached to this session: no video file reached the container. The notes below
set out the motion grammar the brief describes the reference as having, and how this film applies it. Before sign-off,
compare them with the reference itself.

- **Camera behaviour.** One camera moves through one world for the whole film, with no cuts. It is driven by a cubic
  Hermite spline with continuous velocity, so it never stops at a keyframe. The film opens with a low glide forward over
  a waking grid. The camera then rises and yaws as the field lifts into a landscape, tilts down over the split stream, and
  finally pulls back and lowers so the stream becomes a composed band under the final metrics. A slow sinusoidal drift
  runs underneath, so no frame is ever frozen.
- **Transition logic.** Each beat is caused by the geometry before it:
  - the title recedes as the camera passes through it;
  - the points that arrive *are* the count, so the counter reads the number of points that have landed;
  - the settled field rises into the value landscape;
  - a ghost profile at 1 / 2.779 of the crest makes the +177.9% bracket a true ratio;
  - the landscape settles back and its points sort laterally into two channels, 82.7% and 17.3% of the width. The split
    travels down the stream like a wavefront;
  - each resolved number docks into a small ledger, and the ledger unfolds into the final frame.
- **Density.** The film builds from sparse to dense to resolved. There are exactly 15,500 light points, one per
  transaction, and 12,819 of them (round(15,500 × 0.827)) are tinted as the off-plan flow. The peaks are at about 7.3 s
  (count resolves, with a pulse ring), about 10–12 s (a light sweep across the risen landscape) and about 15–16 s (the
  split). After that the density eases off for the final frame.
- **Typography rhythm.** Lines are revealed through masks (they slide out of their own clip with a short blur), and the
  kicker's tracking tightens as it enters. Digits roll in slot columns, blurred by velocity and settling right to left.
  The counter blurs each digit in proportion to how fast that place is changing. Numbers are large and light (Inter 300);
  labels are small and tracked. One accent colour (ice blue #AABCFF) carries the data, and violet #E0ADF9 appears only on
  the 17.3% remainder.
- **Layering and texture.** The layers, from back to front, are: navy horizon lift → draped grid → contour lines lifted
  to their altitude → additive particles with 180° shutter motion-blur streaks → quarter-resolution screen bloom →
  seeded film grain → vignette and legibility scrims → typography, with slight parallax linked to the camera's yaw and
  roll.
- **Deliberately not copied.** The reference's subject matter, artwork, branding, palette, typefaces and specific shots.
  The film also avoids real-estate clichés (buildings, keys, aerials, handshakes), hype language and CTAs.

## Latest changes (client review)

- **Scope caveat removed.** The line under 15,500 ("Abu Dhabi City residential unit sales; excludes residential
  complexes, duplexes and penthouses.") has been removed. The city scope note stays in the H1 summary footer.
- **End card: tagline only.** The final card shows the tagline "Find your space.", in sentence case with the full
  stop, on two lines, with no logo.
  - **Colour:** "Find your" and the full stop are solid white; only "space" carries the Unicorn gradient
    (`gradient.unicorn`, 135°).
  - **Type:** Inter 600, line-height 1.02, -0.025em, with both lines at one consistent size.
  - **Size exception:** the size is 160 px, a client-approved exception to `tagline-scale.reel-end-card` (88 px),
    which read too small. The two lines are left-aligned as one block and centred in the frame.
  - **Licence line:** it sits quietly at the foot of the safe area (bottom at y 1600), because it's there to meet the
    legal requirement, not to be part of the advert.
  - **Hold:** 2.5 s once complete.

## sp_ce design-system pack: status for this job

The pack (`/sp_ce-design-system-pack`, v1.0.0) was read after the film was approved. The client chose
**option B**: keep the approved Reel, apply only the fixes that don't conflict with it, and treat the rest
as approved exceptions for this job.

**Applied (pack-compliant)**
- **Font:** Inter is loaded from the pack's `ASSETS/fonts/Inter-VariableFont_slnt_wght.ttf`, a byte-identical copy
  in `public/fonts/`. The render fails if it doesn't load.
- **Tokens:** `tokens/design-tokens.json` is a byte-identical copy of the pack file, and `src/tokens.ts` reads
  colours and sizes from it by name. No hex values are typed into the source.
- **Secondary text:** Cloud `text-on-dark-2`. Metadata, sources and the licence line use Mist `text-on-dark-3`, and
  hairlines use `hairline-dark`.
- **Number reveals:** the value fades in whole with a 16px rise (`motion.distance-px.statistic-rise`).
- **Holds:** every text frame stays fully readable for at least 2.5 s (`min-hold-per-statistic`), and the end card
  holds for 2.5 s. To get there without re-cutting the approved choreography, a smooth time-map (`world.ts`, `HOLDS`)
  eases the whole world down to a slower speed across each hold, then back up. Relative timing is unchanged and the
  motion never stops. `scripts/holds.ts` reports every hold, and `npm run verify` enforces them.

**Approved job-specific exceptions (not changed)**
1. Weights 700–800 for hero metrics and the title.
2. Sources and scene counters set in Inter, not JetBrains Mono.
3. The licence line on every scene with a market claim.
4. Safe area x 96–984, y 220–1600.
5. The official `small.svg` (white) is used as the logo, rather than the pack's PNG.
6. (Resolved) The end card now follows the pack tagline spec, with no logo.
7. The three-number summary, and two rates on one frame.
8. Title in capitals.
9. Source-line wording kept as approved.
10. Soft Violet accents.
11. Scene counters with em dashes, and rule lines.

The cinematic motion language is also an exception: the travelling camera, depth and parallax, particle arrivals,
bloom, motion-blur streaks and light sweeps.

## Final production pass (Reels)

- **Brand system.**
  - **Palette:** pure black #000000 ground and white type, with Ice Blue #AABCFF and Soft Violet #E0ADF9 used only as
    accents and in the "space" gradient.
  - **Font:** Inter Variable is the only typeface (`public/fonts/InterVariable-latin.woff2`, the rsms Inter 4 build
    from `@fontsource-variable/inter`). No Inter Variable file was supplied, so this official build stands in. No
    fallback font is referenced anywhere, and the render fails if Inter doesn't load.
  - **Weights:** hero metrics 700 (title 800), labels 600, sources and licence 400.
  - **Header:** the official sp_ce SVG plus MARKET INTELLIGENCE on every data scene.
- **Numbers.** Rolling digits and the count-up are gone. Every figure is revealed with an opacity-only fade, with no
  motion or blur, so frames stay stable. 15,500 appears once the particle field has finished accumulating.
- **Particle scenes.** `src/SceneParticles.tsx`, with geometry from `src/publisherLayout.ts`:
  - **CBRE price momentum:** particles stream in and fill the Apartments (+24.4%) and Villas (+6.3%) bars on one
    shared scale, with equal density, so the number of particles is proportional to the value.
    - The +21.6% headline forms as a dotted particle marker on that scale, followed by one restrained light sweep.
    - Everything then settles, moving by no more than a pixel.
  - **Savills current pricing:** particles converge out of depth into two lattice fields whose lengths are
    proportional to AED 17,200 and AED 12,100 / sqm. After that they hold, with only a slow glint.
- **Sales-value annotation.** The +177.9% / SALES VALUE label is placed every frame from the projected curve. It
  always sits right of "residential sales value", at x ≥ 720, and at least 34px above the curve.
- **Three-number summary** (Cavendish only; source, period and scope shown): readable from about 20.4 s to 25.0 s.
- **Caveat** beside the first 15,500: "Abu Dhabi City residential unit sales; excludes residential complexes,
  duplexes and penthouses."
- **Safe area.** Scene counters (y 1400), source lines and the licence line (bottom at y 1600) all sit inside
  x 96–984, y 220–1600. Below y 1290 a black scrim dissolves the particle map, so no text sits on particles.
- **End logo.** The letters only move and scale uniformly; no glyph is stretched, and the "a" compresses into the
  underscore as briefed. On one frame, 38.0 s, the settled letters are replaced by the official SVG, unmodified and in
  proportion (about 650 × 274 px). It sits on whole pixels with no transform, and there are no blended frames, so
  nothing can ghost. The logo holds for 2.2 s with the licence line.

Timeline (world time; the film runs 47.4 s once the hold time-map is applied): title 0–3.6 s, transactions 3–8.5,
sales value 8.5–13.3, off-plan 13.3–18.4, H1 summary 18.4–25.7, CBRE 25.7–30.5, Savills 30.7–35.5, ending 35.6–40.5.

## Revision 2 (after first-draft approval)

The first draft (0–21 s) is the approved baseline and is unchanged apart from the points below.

- **Wording.** Headline copy says "Abu Dhabi". "Abu Dhabi City" survives only in the Cavendish source footer
  ("Source: Cavendish Maxwell, Abu Dhabi City residential series · H1 2026") and in the scope note.
- **Two publisher-specific scenes**, each with its own source line. The Cavendish particle field dims to about 28%
  under them, so neither scene reads as part of that series:
  - **21.5–24.75 s, CBRE:** RESIDENTIAL PRICES, +21.6% Y/Y. Apartments +24.4% and Villas +6.3% are drawn as bars on a
    shared scale, with a dashed marker at the +21.6% headline value.
  - **24.9–28.35 s, Savills:** CURRENT PRICING. Apartments AED 17,200 / SQM and Villas & Townhouses AED 12,100 / SQM,
    each with a proportional rule, plus the caveat "Average transaction rates; project mix affects comparison."
- **Legal line.** "The Prop Co Real Estate Space LLC OPC · Broker Licence No. 202400892044" is shown at 22px on every
  scene with a market claim (3.4–28.4 s), and again under the logo on the final frame.
- **Signature ending (28.45–32.4 s).**
  - "find your" appears in white, with "space" beneath it in an ice-blue (#AABCFF) to soft-violet (#E0ADF9) gradient.
  - After a hold, the word stretches (its tracking opens and the glyphs widen slightly). The "a" compresses onto the
    baseline and becomes a flat bar, and all the letters settle into the "sp_ce" positions.
  - The frame then hands off to the official SVG and holds on the logo and the legal line.
  - Easing is cubic in-out throughout, with no bounce, glow or flare.
- **Duration.** The film is now 32.4 s. The brief suggested about 20–24 s but also said not to rush the figures. Each
  new scene gets about 3.3 s and the ending about 4 s. Reaching 24 s would mean compressing the approved first draft.

**Official logo.** The ending lands on `public/brand/sp_ce-logo.svg`, an unmodified copy of the supplied
`small.svg` (white wordmark, viewBox 342 × 144). Its glyph extents are measured in `src/brand.ts`, and each letter
of the morph lands on its matching logo glyph. The underscore bar lands on the logo's underscore rectangle. The logo is
scaled so the ink height of its "s" matches the typeset "s", then it fades in over the letters in about 0.3 s. As the
letters settle they shift from the gradient to the logo's white, so no colour jump shows at the handoff. The supplied
"sp_ce | Real Estate" lockups remain in the repo root and are not used.

## Timeline

| Time | Beat |
| --- | --- |
| 0–3 s | The grid and contours wake radially from darkness. ABU DHABI CITY / RESIDENTIAL MARKET / H1 2026 is revealed through masks as the camera glides forward. |
| 3–8 s | 15,500 points swirl in and settle into a flowing field. The count follows the landed points and resolves to **15,500** "residential transactions", with a pulse ring and the **+103.6% y/y** annotation. |
| 8–13 s | 15,500 docks into the ledger. The field rises into a value landscape, and **AED 67.8bn** rolls in. A crest profile, a dashed ghost profile and a bracket reveal **+177.9% y/y** pinned to the peak. |
| 13–18 s | The landscape settles back. Points tint (ice-blue off-plan, quiet violet remainder) and sort into two channels, with the split sweeping into depth. **82.7%** rolls in with "off-plan / share of residential sales volume". A scale bar reads 82.7% off-plan / 17.3%. |
| 18–21 s | The camera pulls back. 82.7% moves to its final row, the ledger rows unfold above it, and the final frame reads **15,500 sales · AED 67.8bn · 82.7% off-plan**, with the y/y annotations, the full source (pp. 2, 4 and 5) and the City scope note. |
| 21.5–24.75 s | CBRE price momentum (see Revision 2). |
| 24.9–28.35 s | Savills current pricing. |
| 28.45–32.4 s | Signature ending: find your space → sp_ce. |

"Abu Dhabi · Residential · H1 2026" stays on screen as the kicker whenever a metric first appears. A short
source line sits at the foot of the frame from 3 s to 18 s.

## Accuracy

The only figures are the locked facts in `data/market.json`. From Cavendish Maxwell: 15,500, +103.6%, AED 67.8bn,
+177.9%, 82.7%, and the remainder 17.3% (= 100 − 82.7). From CBRE: +21.6%, +24.4% and +6.3%. From Savills:
AED 17,200 and AED 12,100 per sqm. Numbers do pass through intermediate values while they
move: the counter climbs as points land, and the slot digits roll. Each one always settles on the locked value, and is
never shown settled on anything else. The film makes no comparison to Dubai and gives no advice.

`npm run verify` checks the data file against the locked facts for all three publishers, plus the legal line. It also confirms that the typography source contains no
literal numbers, and uses ffprobe to check the MP4's codec, size, frame rate, duration and that it has no audio.

## Build

```bash
npm install
npm run studio                      # interactive preview
npm run render                      # → out/abu-dhabi-h1-2026.mp4
python3 scripts/contact_sheet.py    # → out/contact-sheet.jpg (needs Pillow)
node scripts/stills.mjs 7.6 12 21.9 # → out/stills/*.png, for review
npm run verify
```

`npm run render` defaults to the container's pre-installed headless Chromium. On a Mac, run
`REMOTION_BROWSER= npx remotion render src/index.ts AbuDhabiH12026 out/abu-dhabi-h1-2026.mp4`, which lets Remotion use
or download its own browser.

Font: Inter (SIL OFL) is bundled from `@fontsource/inter` into `public/fonts/`, so the render needs no network access.
