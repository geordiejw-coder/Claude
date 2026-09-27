# sp_ce market-motion style guide: particle-map data films

This brief is for Claude Code. It describes the visual and motion language of the sp_ce market-motion Reels, built
from the approved *Abu Dhabi Residential H1 2026* film, and how to reproduce it for new data. The reference
implementation (Remotion + TypeScript + Canvas 2D) lives in
`_content/market-motion/abu-dhabi-h1-2026/src/`. Read it alongside this guide.

The film is one continuous camera move through a single 3D "particle map". Every chart is built out of light points
that arrive, settle and hold still enough to read.

---

## 1. Principles

1. **One world, one camera, no cuts.** The film is a single camera move through one coherent 3D space. Scenes change
   because the geometry changes (the field rises, splits or settles), never because of a cut or a slide wipe.
2. **The dots are the data.** Particle counts and shapes are driven by the figures:
   - 15,500 transactions are drawn as exactly 15,500 points.
   - 82.7% off-plan means exactly round(15,500 × 0.827) points are tinted and sorted into their own channel.
   - Bar lengths and dot fields are proportional to their values on one shared scale.
   - Never add decorative particle noise that looks like data.
3. **Motion builds, then settles.** Particles move with purpose (arrive, flow, rise, sort, converge), then settle. A
   figure is only revealed once its geometry has formed, and then holds still enough to read.
4. **Restraint.** Pure black ground, white type, one accent (Ice Blue #AABCFF) and Soft Violet #E0ADF9 only for a
   quieter second series or the gradient word. No glow effects on type, no bounce, no lens flare, no hype.
5. **Evidence first.** Every figure appears whole, never counting up, and always with its own source and period
   line. Never merge publishers' series in one frame.

---

## 2. Stack and render

- **Engine.** Remotion 4 (React) at 1080 × 1920, 30 fps, H.264, yuv420p, no audio.
- **Capture format.** Capture PNG frames, not JPEG. JPEG gives yuvj420p full-range output, which phones display
  wrongly.
- **Layers, back to front.**
  1. Black ground.
  2. Faint ice-blue radial lift at the horizon (about 7% alpha).
  3. **Field canvas** (the Cavendish particle world).
  4. **Scene-particle canvas** (bars and fields for other publishers).
  5. **Bloom:** a quarter-resolution copy of the field canvas, CSS `blur(6px)`, opacity 0.75, `mix-blend-mode: screen`.
  6. **Grain:** four seeded 256px noise tiles cycling per frame, opacity 0.055, `overlay`.
  7. **Vignette:** a radial fade to black.
  8. **Top scrim** behind the typography: black, 90% fading to 0 by 48% of height.
  9. **Bottom scrim:** from y 1290, fading to solid black by y 1450, so the footer text never sits on particles.
  10. The typography, as DOM text.
- **Determinism.** Everything is a pure function of the frame number. Use seeded PRNGs (mulberry32) and no
  `Math.random`. Draw the canvases in `useLayoutEffect` keyed on the frame.
- **Performance.** Batch the particles into `Path2D` buckets by (colour × 8 alpha levels × 4 stroke widths). Draw each
  particle as a short line segment with `lineCap: 'round'`, using `globalCompositeOperation = 'lighter'`
  (additive). This runs about 15k particles × 2 evaluations per frame comfortably.

---

## 3. The world model (`world.ts`)

Coordinates: x is lateral, y is up and z is depth.

### Camera
- A single perspective camera: focal length f = 1020 px, with pitch, yaw and roll.
- It also has a **principal-point shift** (screen y of the optical centre, 0.56–0.675 × H). Use it to place the
  horizon low enough that the typography zone (top ~48%) stays clear.
- The path is a list of keys `[t, x, y, z, pitchDeg, yawDeg, rollDeg, principalY]`, interpolated with **non-uniform
  cubic Hermite (Catmull-Rom tangents)**, so velocity is continuous and the camera never stops at a key.
- A tiny sinusoidal "breathing" offset (±0.012) keeps holds from ever being frozen.
- The shape of the move:
  - Low glide forward (y ≈ 1.0–1.3).
  - A rise with a yaw into the landscape (y ≈ 3.4, pitch ≈ 19°).
  - A high look down over the split (y ≈ 5–6, pitch ≈ 30–33°).
  - A pull back and lower, so the stream becomes a composed band (y ≈ 5, z ≈ −12, pitch ≈ 14°).
  - A slow lateral drift under the later scenes.

### Projection
- Use one `project(cam, x, y, z)` for everything: particles, grid, contours, annotation anchors and label positions.
  **Typography pinned to geometry uses the same projection**, so labels stay attached as the camera moves.

### Ground texture
- **Grid:** 0.5-unit grid lines draped on the terrain, white at about 7.5% alpha. It is revealed radially from the
  centre in the first 2.8 s ("the map wakes up").
- **Contours:** iso-lines of the terrain from marching squares, computed once at 11 levels. Each contour is drawn at
  height `lift(t) × level`, so as the landscape rises the contours lift into a topographic stack. Ice Blue, about 20%
  alpha. The lower levels are revealed first.
- **Depth fade:** alpha × smoothstep(0.9 → 3.0 near) × (1 − 0.75 × smoothstep(14 → 34 far)).

### Terrain
- A static "value landscape": a sum of 4 Gaussians, with a main peak at (0.45, 8.6), plus a faint sine ripple.
- `lift(t)` scales its height: 0 → 2.75 world units, eased in-out, then back down for later scenes.
- Particles ride over the terrain as they flow (y = lift × terrain(x, z)), like wind over hills.

---

## 4. Particle recipes (how each dynamic graph is made)

### 4.1 Accumulation field: "the count"

*Used for:* 15,500 transactions.

- **Points:** N points, one per unit of the figure. Each has seeded lateral u ∈ [0,1], depth v ∈ [0,1], a brightness
  (0.35–1, power-skewed so most points are dim), 4 jitter values and a travel time of 0.7–1.15 s.
- **Flow position:**
  - Depth: z = Z0 + frac(v + t × 0.016) × 20, so the band slowly flows away into depth.
  - Lateral: x = (u − 0.5) × 4.8 + meander(z, t), where meander is 0.55·sin(0.3z + 0.8) + 0.22·sin(0.68z − 0.35t).
  - Fade at both ends of the band so the wrap-around never pops.
- **Arrival:**
  - Appearance times follow an inverse ease-in-out over about 3.35 s, so accumulation gathers pace, peaks, then
    settles. The order is a seeded shuffle, so points appear everywhere.
  - Each point swirls in on a quadratic Bézier from a scattered cloud to its flow position, with outCubic easing.
  - **The cloud stays below eye level** (start height ≤ ~1.2 world units, under the camera height), so arriving
    points project below the horizon and never cross the typography.
  - When a point lands it flashes: size × 1.6 and alpha × 1.9, decaying over 0.35 s.
- **Resolve:** the figure is revealed only when the last point has landed (`LAST_LANDING`). A single ice-blue pulse
  ring expands on the ground (radius 0 → 9 over 1.6 s, fading), and an ice underline sweeps under the number.

### 4.2 Value landscape: "the rise"

*Used for:* sales value, AED 67.8bn, +177.9% y/y.

- The same field rises (lift 0 → 2.75) into the terrain, and the camera rises and yaws to reveal it.
- **Annotation linework, drawn on progressively:**
  - A solid ice cross-section along the crest.
  - A **dashed white ghost profile at 1 / (1 + growth)** of the crest height. At +177.9% that is 1/2.779, so the
    visual gap is a true ratio.
  - A vertical bracket from ghost to crest.
- **One restrained light sweep** travels along z across the risen field. Brightness × (1 + 1.2 × gaussian around the
  sweep position) for about 2 s.
- **Annotation placement is computed per frame:**
  - Project the crest profile to screen.
  - Place the label box to the right of the headline label (x ≥ 720) and at least 34 px above the highest curve
    point in its horizontal span.
  - Draw a thin leader line from the crest to the box.
  - Never use fixed offsets. They collide as the camera moves.

### 4.3 Share split: "the sort"

*Used for:* 82.7% off-plan versus 17.3%.

- Exactly round(N × share) points are chosen by seeded shuffle.
- **Tint first:** the share points brighten to Ice Blue and the remainder dims toward Soft Violet. The tint travels as
  a wavefront into depth.
- **Then sort:** each point moves laterally to its channel. Mapping by rank within its group, on the original u, keeps
  paths short with minimal crossing. The channels are 82.7% and 17.3% of the band width, split by a 0.55 gap.
  - The sort also propagates as a **wavefront down the stream**: per-point stagger = 1.3 s × depth fraction.
- **Scale bar:** a short scale bar under the stream at a fixed depth, with ice and violet segments and end ticks.
  Its labels are pinned to the projected bar ends.

### 4.4 Pull back: "the summary"

- The camera pulls back and lowers, the stream narrows slightly and the landscape flattens. The field becomes a
  composed band below the three stacked figures, and above the footer.

### 4.5 Particle bars: "the comparison"

*Used for:* CBRE apartments +24.4%, villas +6.3%, headline +21.6%.

This is a separate screen-space canvas, because it's a different publisher and must not be the same particle set.
- **Equal density:** count = bar area / 11 px², so the number of particles is proportional to the value. Every bar is
  on one shared scale (max value / 0.82 of column width).
- **Stream in from the left:** each particle starts 150–380 px left of its target at the same height (±7 px), and
  eases in with outCubic over about 1.0 s. Arrival order follows target x, so bars **fill left to right like a
  flow**. Particles are soft in flight (alpha × 0.45 → 1) and flash briefly on landing.
- Particles stay within their bar's height band, so they never pass through labels.
- **Headline marker:** a dotted vertical line of particles at the headline value's x on the same scale, drawn top to
  bottom as dashes. Then one light sweep crosses both bars.
- **Settled state:** sub-pixel breathing only (±0.45 px). Nothing moves enough to hurt legibility.
- **Exit:** particles drift a further 40 px and fade.

### 4.6 Depth-lattice fields: "the levels"

*Used for:* Savills AED 17,200 / sqm and AED 12,100 / sqm.

- Each field is a 6-row lattice, back to front. Row spacing grows with r (y = 6.5r + 0.35r²) and column spacing grows
  toward the front (dx = 6 + 0.55r). Dot size (1.3 + 0.24r) and alpha (0.7 + 0.06r) also grow toward the front, which
  reads as a surface receding in depth.
- Field length is proportional to the value on a shared scale (max value / 0.86).
- **Converge out of depth:** each dot starts displaced ±160 px horizontally and ±7 px vertically (staying inside its
  band), with a depth factor z (size × (1 + 2.2z), alpha × (1 − 0.55z)). It focuses into place with in-out cubic
  easing over 0.9 s, staggered left to right.
- **Settled state:** a slow glint travels along the lattice (alpha 0.88–1). The exit reverses back into depth.

### 4.7 Motion blur (shutter streaks)

- Each particle is drawn as a segment from its position at `t − shutter` to its position at `t`. The shutter is 0.55
  of a frame for the field (about 180°) and 0.3 of a frame for bars and fields, scaled by the current time-map speed.
- Static particles get a 0.01 px segment so round caps render a dot.
- Streaks appear only while particles move fast, which gives the "light trail" feel on arrivals and none at rest.

---

## 5. Typography

- **Font:** Inter (variable) only, loaded from the sp_ce pack's `ASSETS/fonts`. Register it with a `FontFace` and
  **fail the render if it doesn't load**. Never reference a fallback family.
- **Weights:**
  - Hero figures: 700, large (206–224 px), tabular numerals, −0.035em tracking.
  - Labels: 600.
  - Sources and licence: 400.
- **Colours** (by token name from the pack's `design-tokens.json`, never typed as hex):
  - White for primary text.
  - Cloud `text-on-dark-2` for secondary text.
  - Mist `text-on-dark-3` for sources and metadata.
  - Ice Blue as the single accent.
- **Reveals:**
  - Labels use a **masked line reveal**: the text slides up out of its own clip with outExpo.
  - Figures appear **whole**: opacity 0 → 1 with a 16 px rise. Never roll digits, count up or blur. Those ghost in
    the encode and read as unreliable.
- **Kicker:** a small tracked uppercase line in Ice Blue (e.g. "ABU DHABI · RESIDENTIAL · H1 2026") persists across a
  series.
- **Docking:** a resolved figure scales down into a small ledger at the top of the frame as the next scene begins,
  then the ledger unfolds into the summary. The reader always knows where the numbers went.
- **Header:** the official sp_ce SVG at top left, plus "MARKET INTELLIGENCE" at top right, on every data scene. Never
  retype the logo.
- **Scene counter:** "04 / 05 — Price momentum" above the source lines.
- **End card:** "Find your space." in sentence case with the full stop.
  - Only "space" takes the Unicorn gradient (135°, #AABCFF → #E0ADF9). "Find your" and the full stop are solid white.
  - Both lines are the same size (160 px, Inter 600, line-height 1.02, −0.025em), set as a left-aligned block centred
    on screen.
  - No logo. The licence line sits quietly at the foot of the safe area.

---

## 6. Layout and safe area (1080 × 1920)

- **Text column:** x 96–984.
- **Footers:** the scene counter, source lines and licence all sit inside **y 220–1600**, with the licence bottom at
  y 1600. Nothing important goes in the top 220 px or below y 1600 (Instagram UI).
- **Vertical rhythm:**
  - Kicker ~468.
  - Hero figure 520.
  - Label ~778.
  - Supporting line ~840.
  - Particle world below ~960.
  - Scrim from 1290.
  - Counter 1400.
  - Source lines ending at 1558.
  - Licence ending at 1600.
- **Hard rule:** no text ever crosses a particle, curve, bar or label. Place text by computing projected geometry, keep
  the arrival clouds below eye level, and use the bottom scrim.

---

## 7. Pacing

- **Scene rhythm:** geometry forms, then the figure is revealed, then the frame holds, then everything leaves as the
  next geometry starts forming. Every transition is motivated by the previous geometry: accumulation leads to the
  rise, the rise to the split, and the split to the pull-back.
- **Holds:** every text frame is fully readable for **at least 2.5 s**, the summary for about 4.5 s, and the end card
  for 2.5 s.
- **Hold time-map (`world.ts`, `HOLDS`):** instead of re-cutting the choreography, film time maps onto "world" time.
  Across each hold window the whole world (camera, particles, text) eases down to a slower speed, with smoothstep
  ramps of 0.35 s, then back up. Relative timing is preserved and motion never stops. `scripts/holds.ts` reports every
  hold, and verification enforces them.
- **Reference timeline** (world time; film ≈ 46 s after the time-map):

  | World time | Scene |
  |---|---|
  | 0–3.6 | Title; the map wakes up |
  | 3–8.5 | Accumulation into 15,500 |
  | 8.5–13.3 | Rise into the value landscape |
  | 13.3–18.4 | Split into 82.7 / 17.3 |
  | 18.4–25.7 | Pull back into the three-figure summary |
  | 25.7–30.5 | Particle bars |
  | 30.7–35.5 | Depth-lattice fields |
  | 35.6–39.5 | End card |

- **Easing:**
  - Camera: Hermite.
  - Reveals: outExpo for masks, in-out cubic for figures.
  - Arrivals: outCubic.
  - Rises and sorts: in-out cubic.
  - No bounce or overshoot anywhere.

---

## 8. Data discipline

- All figures come from `data/market.json` as locked display strings. The typography never contains a literal
  number, and `scripts/verify.mjs` checks that.
- Every figure's scene carries its publisher's source and period. Other publishers' scenes use their own particle
  layer and dim the main field to about 10%, so no series reads as merged.
- Derived values (e.g. the 17.3% remainder) are computed and documented. Never round again or extrapolate.

---

## 9. Pitfalls already hit (avoid them)

- **Rolling or count-up digits** ghost and overlap in the encode. Reveal whole values instead.
- **Fixed-offset annotations** collide with curves as the camera moves. Place them from projected geometry every frame.
- **Arrival clouds above eye level** fly through the typography. Keep them low.
- **Particles under footer text.** Use the bottom scrim.
- **Morphing type into a logo** always jumps at the handoff, because font glyphs never match the logo artwork exactly.
  Fade the untouched logo in, or skip the logo.
- **Crossfading two opaque layers** dips brightness and ghosts edges. Layer the incoming image over a fully opaque
  base, or cut on a single frame.
- **JPEG frame capture** gives full-range yuvj420p video. Capture PNG.
- **Upscaling the raster PNG logo** looks soft. Use the SVG at its proportional size, on whole-pixel coordinates, with
  no transforms.

---

## 10. QA before hand-off

- Render stills at key beats and a timecoded contact sheet (`scripts/stills.mjs`, `scripts/contact_sheet.py`).
- Check at phone size (390 px wide).
- Check the logo region frame by frame for jumps.
- Run `npm run verify`. It checks:
  - locked figures and sources;
  - token and font files byte-identical to the pack;
  - no hex or rgba literals;
  - holds of at least 2.5 s;
  - codec, size, fps, pix_fmt and duration, and no audio track.
