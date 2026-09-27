# sp_ce market-motion production spec

This spec is measured from the final published reel, `abu-dhabi-h1-2026` (46.4 s, commit 179898c). It records
proportions, scale and pace only; no content. Unless stated otherwise:
- **Fractions** are of the frame width W = 1080 or height H = 1920.
- **Times** are film seconds, as the viewer sees them, after the hold time-map.

## 1. Frame

- **Canvas:** 1080 × 1920, 30 fps, H.264 yuv420p, PNG frame capture, no audio. Ground is pure black #000000.
- **Safe area for all text:** x 96–984 (0.089–0.911 W) and y 220–1600 (0.115–0.833 H).
  - Nothing sits in the top 220 px or below y 1600.
  - Right-aligned text ends at x 984.
- **Text column:** a single left edge at x = 96. Column width is 888 px (0.822 W).

**Vertical anchors:**

| Element | Top (px) | Fraction of H |
|---|---|---|
| Header: logo ink top and tracked label | 226 | 0.118 |
| Ledger (docked figures) | 300 / 350 | 0.156 / 0.182 |
| Kicker | 468 | 0.244 |
| Hero figure | 520 | 0.271 |
| Hero label | 778 | 0.405 |
| Supporting line | 840 | 0.438 |
| Horizon / particle field begins | ≈ 960 | 0.50 |
| Bottom scrim starts | 1290 | 0.672 |
| Scene counter rule | 1400 | 0.729 |
| Source lines end | 1558 | 0.811 |
| Licence line ends | 1600 | 0.833 |

- **Header:** official SVG wordmark, ink width 113 px (0.105 W), at top left. The tracked uppercase label ends at
  x 984 (right edge).
- **Summary rows:** tops at 498 / 720 / 942 (0.259 / 0.375 / 0.491 H). Row pitch is 222 px (0.116 H), with a hairline
  205 px under each row top.
- **End card:** a two-line block centred on y 860 (0.448 H); the licence line ends at 1600.

## 2. Scale

| Role | Size px | Fraction of W | Weight | Tracking |
|---|---|---|---|---|
| Hero figure | 224 | 0.207 | 700 | −0.035em, tabular |
| Hero figure, with currency prefix | 206 | 0.191 | 700 | same |
| Prefix / suffix on a hero | 0.40 em / 0.62 em (%) | | 600 | |
| Summary figure | 150 | 0.139 | 700 | |
| Secondary figure (two per frame) | 136 | 0.126 | 700 | |
| Title lines | 84 | 0.078 | 800 / 600 | −0.03em |
| End-card tagline (both lines equal) | 160 | 0.148 | 600 | −0.025em, lh 1.02 |
| Row value (bar scenes) | 52 | 0.048 | 700 | |
| Hero label | 46 | 0.043 | 600 | −0.01em |
| Row label | 44 | 0.041 | 600 | |
| Annotation figure | 40 | 0.037 | 700 | |
| Ledger figure | 38 | 0.035 | 700 | |
| Supporting line | 34 | 0.031 | 600 | |
| Headline label (uppercase) | 30 | 0.028 | 600 | +0.16em |
| Kicker (uppercase, accent) | 26 | 0.024 | 600 | +0.16em |
| Scene counter / annotation tag | 22 | 0.020 | 600 | +0.14–0.16em |
| Source line / licence | 22 | 0.020 | 400 | 0 |
| Header label | 18 | 0.017 | 600 | +0.22em |

- **Ratios:** hero : label : source = 224 : 46 : 22 ≈ **10 : 2 : 1**. Hero : kicker ≈ 8.6 : 1. Hero : summary figure
  ≈ 1.5 : 1.
- **Font:** Inter only, at weights 400 / 600 / 700 / 800.
- **Colours:** white for primary text, Cloud #E4E8EF for secondary, Mist #8B95A7 for sources and licence, and one
  accent, Ice Blue #AABCFF.

## 3. Spacing and occupancy

- **Margins:** 96 px left and right (0.089 W each).
- **Vertical gaps:**
  - Kicker to hero top: 52 px (0.027 H).
  - Hero bottom to label: 34 px (0.018 H).
  - Label to supporting line: 14 px.
  - Row label to its bar or field: 18–40 px.
  - Source lines to licence: 42 px.
- **Frame bands:**

  | Band | y (px) | Share of frame height |
  |---|---|---|
  | Top platform zone (empty) | 0–220 | 11.5% |
  | Header and ledger | 220–390 | 9% |
  | Type block | 468–900 | 22.5% |
  | Particle field in focus | 960–1290 | 17% |
  | Field dissolves under the scrim | 1290–1400 | 6% |
  | Footer stack | 1400–1600 | 10.4% |
  | Bottom platform zone (empty) | 1600–1920 | 16.7% |

  - Where type and field meet, a top scrim (black, 90% fading to 0 by 48% of H) keeps the type over near-black.
  - In bar and field scenes the particle graphics sit inside the column, at y 770–1200 (0.40–0.63 H).
- **Rule:** type never overlaps particles, curves, bars or other labels. Annotations are placed each frame from
  projected geometry, clearing the curve by at least 34 px.

## 4. Pacing

- **Total:** 46.4 s (1,393 frames).
- **Rhythm:** each scene has a build (geometry forms, then the figure is revealed), a hold (the complete frame, still
  readable), and an exit (docks or dissolves while the next geometry starts).

| Scene | Start–end | Share of film | Build | Hold | Exit |
|---|---|---|---|---|---|
| Title | 0–3.6 | 7.8% | 1.3 (0.57→1.87) | 1.0 | 0.75 |
| Count (accumulation) | 3.0–12.0 | 19.3% | 4.6 (particles 4.2, figure fades in over the final 0.4) | 3.0 | 1.4 (dock) |
| Rise (value landscape) | 11.9–19.5 | 16.4% | 3.6 (figure 0.4, lift 1.8, annotation 1.4) | 2.6 | 1.4 (dock) |
| Split (share) | 18.1–24.9 | 14.6% | 3.7 (tint wave, then sort wave) | 2.6 | 0.45, into summary |
| Summary (3 figures) | 24.9–32.6 | 16.7% | 2.7 (docked figures fly in) | 4.5 | 0.6 |
| Particle bars | 32.6–37.4 | 10.3% | 1.4 text / 2.5 particles | 2.8 | 0.56 |
| Depth fields | 37.6–42.4 | 10.3% | 1.25 text / 2.4 particles | 3.0 | 0.56 |
| End card | 42.5–46.4 | 8.4% | 1.4 | 2.5 | none (film ends) |

- **Hold rules:**
  - Every complete text frame holds for **2.5 s or more**, and the summary for **4.5 s or more**.
  - Holds are made with a smooth time-map: across each hold window the world slows to 0.23–0.62× speed, with
    0.35 s smoothstep ramps. Motion never stops.
- **Element timings:**
  - Label reveal: 0.6 s, outExpo (masked slide-up).
  - Figure reveal: 0.4 s, in-out cubic, opacity with a 16 px rise.
  - Staggers: 0.12–0.35 s.
  - Exits: 0.5–0.55 s, in-out cubic.
  - Scene overlap: the next build starts 0.1–0.2 s before the previous exit finishes.

## 5. Particles

### Main field (one per data unit)
- **Count:** equals the figure (15,500).
- **Size:** 0.9–6 px stroke, = 9 / depth, clamped. The median is about 0.9 px, the 90th percentile about 1.9 px.
- **Brightness:** 0.35–1, skewed low (power 1.8).
- **Alpha and blending:** 8 alpha buckets, additive blending.
- **Colour:** white. When a share is shown, the share points turn Ice Blue (×1.6 brightness) and the remainder dims
  (×0.7) toward Soft Violet.
- **Flow:** 0.016 band-lengths/s along depth (0.32 world units/s). Settled screen drift is 20–42 px/s (median
  27 px/s), and 36–69 px/s during the sort.
- **Arrival:**
  - Staggered over 3.35 s on an inverse ease-in-out curve.
  - Each point takes 0.7–1.15 s on a Bézier path from a cloud below eye level.
  - Screen speed: median 61 px/s, 90th percentile 440 px/s.
  - On landing: a flash of +90% alpha and ×1.6 size, decaying over 0.35 s.
- **Rise:** the terrain lifts 0 → 2.75 units over 2.8 s.
- **Split:** tint wave 1.0 s plus 0.9 s spread across depth; sort 2.0 s plus 1.3 s spread across depth; channel gap
  0.55 units.
- **Ground texture:**
  - Grid: 0.5-unit spacing, white at 7.5% alpha.
  - Contours: 11 levels, Ice Blue at 20% alpha, lifted with the terrain.
- **Depth fade:** 0 → 1 over 0.9–3 units near the camera; 1 → 0.25 over 14–34 units far away.
- **Under other publishers' scenes:** the field dims to 10% over 1 s.

### Particle bars
- **Count:** bar area / 11 px² (for example 728 × 26 px gives 1,721 dots).
- **Scale:** bar length = value / (max value / 0.82) × column width; bar height 26 px.
- **Dots:** 1.5–2.4 px, alpha 0.55–1.
- **Motion:** each dot enters from 150–380 px left of its target and eases in over 1.0–1.2 s with outCubic, filling
  the bar left to right over 0.9 s. In flight its alpha is × 0.45 → 1.
- **Settled:** ±0.45 px breathing only.
- **Headline marker:** 33 dots of 2 px, in dashes, drawn over 0.45 s.

### Depth-lattice fields
- **Rows:** 6. Row y offset = 6.5r + 0.35r²; column spacing = 6 + 0.55r px.
- **Dots:** size 1.3 + 0.24r px; alpha 0.7 + 0.06r.
- **Scale:** length = value / (max value / 0.86) × column width, which gave about 635 and 448 dots.
- **Motion:** each dot converges from ±160 px horizontally and ±7 px vertically, with depth z = 0.6–1.4 (size ×
  (1 + 2.2z), alpha × (1 − 0.55z)). It takes 0.9 s, staggered over 0.8 s left to right.
- **Settled:** a glint with alpha 0.88–1.

## 6. Camera and light

- **Camera:**
  - Perspective, f = 1020 px (55.8° horizontal field of view).
  - Path length 24.4 world units, on a Hermite spline with continuous velocity.
  - Height 1.0 → 3.4 → 6.2 → 5.0 → 3.7.
  - Pitch 5° → 33° → 8°.
  - Yaw −6° → +8°.
  - Roll 0.8° or less.
  - Principal point 0.56–0.675 H.
  - Breathing ±0.012 units.
- **Parallax:** the text layer moves with the camera: x = −sin(yaw) × 260 px (34 px maximum), y = sin(roll) × 60 px.
  In world space, parallax comes from true 3D projection.
- **Depth of field:** none optically. Depth is read from size falloff and the near and far alpha fades.
- **Motion blur:** each particle is drawn as a streak.
  - Field: shutter 0.55 frames (≈198°).
  - Bars and fields: 0.3 frames.
  - Both are scaled by the time-map speed.
- **Bloom:** a quarter-resolution copy of the field, blurred 6 px (≈ 24 px at full resolution), opacity 0.75, screen
  blend.
- **Grain:** 4 seeded tiles, opacity 0.055, overlay blend.
- **Vignette:** a radial fade (140% × 90%) from 55% to 85% black.
- **Atmosphere:** an Ice Blue radial lift at the horizon, alpha 0.075, rising to 0.11 at the crest.
- **Sweeps (one per scene at most):**
  - Landscape: a Gaussian band (σ ≈ 0.67 units) crossing the field in 2.8 s, brightness +120%.
  - Bars: σ 45 px, crossing in 0.75 s, brightness +80%.
- **Pulse ring:** radius 0 → 9 units over 1.6 s, alpha 0.5 → 0, when the count resolves.

## 7. Transitions

- **Title to scene:** the title lines mask out upward while the text layer scales up 6% and rises 120 px, as if the
  camera passes through.
- **Figure to figure:** the resolved figure docks, shrinking 224 → 38 px into the ledger over 0.8 s. The next figure
  fades in at the same time.
- **Geometry to geometry:**
  - The settled field **lifts** into a landscape.
  - The landscape **flattens as the share tints**, and then sorts.
  - The sort pulls back into a band beneath the summary.
- **Into the summary:** the camera pulls back while the docked ledger figures fly down to rows of 150 px, staggered
  by 0.1–0.2 s, and the kicker re-enters.
- **Summary out:** the whole text layer rises 70 px and fades over 0.6 s while the field dims to 10%.
- **Between publisher scenes:** text masks out and particles dissolve over 0.55 s. The bars drift 40 px as they go;
  the lattice falls back into depth. The next headline masks in 0.2 s later.
- **Into the end card:** the header fades out, then the tagline lines mask in 0.2 s apart, then the licence line. It
  holds for 2.5 s.
