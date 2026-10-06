# F10 — Abu Dhabi's AI bet is physical

This is one sp_ce market-intelligence film: 30 s and 900 frames at 1080 × 1920, 30 fps. It is silent H.264
(High profile, yuv420p).

| File | What |
|---|---|
| `scene.html` | The whole film: one HTML page whose only input is time, through `renderAt(t)` |
| `render.mjs` | Headless Chromium (Playwright) → PNG frames → ffmpeg |
| `qa.mjs` | Measures text timing, copy, keep-out and particle count from the scene itself. Writes `qa-timing.json` |
| `ai-bet-physical.mp4` | The render |
| `stills/` | Frames at 3 s, 10 s, 18 s and 26 s, taken from the PNG capture |
| `COPY-SOURCE-MANIFEST.md` | Exact copy, timings, source and decisions to review |
| `QA.md` | What was actually inspected, and the results |
| `assets/` | Inter variable TTF and the official sp_ce SVG wordmark, both local copies of approved files |

## Render

```sh
cd _content/market-motion/f10-ai-bet-physical
NODE_PATH=/opt/node22/lib/node_modules node render.mjs --frames /path/to/frames --workers 4
NODE_PATH=/opt/node22/lib/node_modules node qa.mjs
```

- **Requirements:** Node 18+, Playwright with a Chromium build, and ffmpeg. `NODE_PATH` only needs to point at a
  global Playwright install. To use a different Chromium binary, set `CHROME_PATH=/path/to/chrome`.
- **Fonts and logo:** before frame 0 the page waits for local Inter (weights 400, 600, 700 and 800) and the logo
  image. If either fails, the render stops.
- **Network:** any request that is not `file://` is aborted, and a render that tried one exits non-zero.
- **Encode:** `ffmpeg -framerate 30 -i f%04d.png -an -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -profile:v high -movflags +faststart`
- **Partial renders:** `--only 90,300,540,780` renders just those frames for a check and skips the encode.
- **Preview:** open `scene.html` in a browser for a real-time loop, or add `?t=12.5` for a single moment.
- **Timing:** about 10 minutes for the full render on 4 vCPUs.

## How the film works

One particle system of 107,277 points is seeded once with `mulberry32(0xF10A1)`. Every point keeps its identity for
the whole film, and every position is a closed-form function of `t`. Nothing accumulates from frame to frame, so any
frame can be rendered alone.

1. **0–6 s: the cloud organises.**
   - The film opens on a dense cloud below eye level, already present at frame 0. It drifts slowly, without rotating.
   - From 1.15 s, points travel along Bézier paths into a 15 × 25 × 7 lattice, bottom of the structure first. The
     lattice is turned 31° and tilted 13°, so it reads as a built 3D structure rather than a tunnel.
   - Each point flashes as it lands, using the spec's +90% alpha and ×1.6 size.
2. **The opening.**
   - Lattice nodes whose projection from the 8 s camera pose falls inside the type block (x 50–1030, y 430–948) are
     never built. That leaves a real cavity in the structure where the text sits.
   - A soft screen-space keep-out also clears every visible line of text and the wordmark, so no point is ever drawn
     inside a letter.
   - The lattice and its opening resolve by about 6.0 s. The May 2025 line appears at 6.15 s, the label at 6.45 s,
     and `1GW` fades in whole at 7.25–7.65 s.
3. **14–17.6 s: connections become readable.**
   - These points are the same material. Until 14 s, 18 points per edge sit as a faint halo around their node.
   - From front to back, they then slide out along their edge, so the lattice's connections draw themselves from
     existing particles. No new objects are added.
4. **The camera.**
   - There is one quadratic-Bézier move with continuous velocity, which never stops and never cuts.
   - It gathers pace into the last hold, so the cavity walls and the lattice layers separate in parallax. That reveals
     the structure's depth while "Read the city's next economy." holds.
5. **World time.** The world runs on a smoothed time-map that drops to 0.4× during each text hold (spec §4).
6. **Look.**
   - Points are drawn as streaks with a 0.55-frame shutter, using additive blending in 8 alpha buckets.
   - A quarter-resolution bloom (6 px, screen 0.75), an Ice Blue horizon lift, the spec vignette and 4 seeded grain
     tiles are layered on top.

Brand values come from `MARKET-MOTION-PRODUCTION-SPEC.md` and the pack's `design-tokens.json`. Text sits in the safe
area (x 96–984, y 220–1600), and the hero, label and supporting lines use the spec anchors at y 520, 778 and 840.
Read `COPY-SOURCE-MANIFEST.md` for the decisions that need review: no header label, no licence line, and proportional
numerals.
