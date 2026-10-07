# F10 Revision 3 — Abu Dhabi's AI bet: capital, capacity, skills

This is an sp_ce market-intelligence film: 30 s and 900 natively rendered frames at 1080 × 1920, 30 fps. It is
silent H.264 (High profile, yuv420p). It replaces the 1GW-only cut, which stays untouched in `../f10-ai-bet-physical/`.

| File | What |
|---|---|
| `scene.html` | The whole film: one HTML page, where `renderAt(t)` is a pure function of time |
| `render.mjs` | Headless Chromium (Playwright) → PNG frames → ffmpeg |
| `qa.mjs` | Measures timing, copy, source pairing, the 95% split and text keep-out from the scene. Writes `qa-timing.json` |
| `ai-capital-capacity-skills.mp4` | The render |
| `stills/` | One frame from the middle of each hold (see `QA.md`) |
| `contact-sheet.jpg` | One frame per second, decoded from the MP4 |
| `COPY-SOURCE-MANIFEST.md` | Exact copy, sources, timings and claims guardrails |
| `QA.md` | What was inspected and the results |
| `assets/` | Inter variable TTF and the official sp_ce SVG wordmark, both unchanged |

## Render

```sh
cd _content/market-motion/f10-ai-capital-capacity-skills
NODE_PATH=/opt/node22/lib/node_modules node render.mjs --frames /path/to/frames --workers 4   # ≈ 4 min on 4 vCPU
NODE_PATH=/opt/node22/lib/node_modules node qa.mjs
```

- **Fonts and logo:** before frame 0 the page waits for local Inter (weights 400, 600, 700 and 800) and the logo. If
  either fails, the render stops.
- **Network:** any request that is not `file://` is aborted, and the render fails.
- **Encode:** `ffmpeg -framerate 30 -i f%04d.png -an -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -profile:v high -movflags +faststart`
- **Frames:** every frame is rendered at its own time. Nothing is retimed or stretched.
- **Workers:** each worker runs its own Chromium with `--disable-partial-raster`. Without that flag, screenshots
  alternated with a stale buffer that kept a 1 px text sliver (see `QA.md`).
- **Preview:** open `scene.html` in a browser for a real-time loop, or add `?t=13` for a single moment.

## How the film works

There is one particle system of 24,000 points, seeded once with `mulberry32(0xF10C3)`. Every point keeps its
identity throughout. It moves through six states, and each state's slots are matched to particles by screen position
(40 x-bands, then y), so motion stays local.

| State | Picture | Settled by |
|---|---|---|
| 0 | A dense cloud below eye level, present from frame 0 | — |
| 1 | A connected structure: 46 hubs linked to their nearest neighbours, with material along the links | 3.2 s, before US$1.5bn |
| 2 | A compute-like lattice: a regular 9 × 4 × 5 frame, turned 28° and tilted 12° | 7.6 s, before 1GW |
| 3 | The full share field (see below) | 11.6 s, before 95% |
| 4 | A quiet band under the overview rows | — |
| 5 | One closing relationship: a single connected foundation grid under the last line | — |

**The share field (state 3).**
- It is 40 × 25 = 1,000 equal dots facing the camera, with 24 coincident particles per dot.
- In reading order, the first 950 dots turn Ice Blue in a wave from 11.15 s to 11.7 s. The last 50 stay white at 55%,
  still visible.
- Every dot is drawn at the same fixed size, with no depth fade.
- The split is resolved before the figure starts to fade in at 11.75 s.

**What the pictures do not show.** None of the shapes scales with a figure, and the overview's three figures are set
at the same 150 px with no bars. The three numbers are different measures and are not compared.

**Camera and look.**
- One quadratic-Bézier camera move with continuous velocity, and no cuts.
- Particles are drawn as streaks with a 0.55-frame shutter.
- Bloom, an Ice Blue horizon lift, the spec vignette and seeded grain are layered on top, as in the house reel.
- A screen-space keep-out stops any particle being drawn inside a letter.

**Brand.** Values follow `MARKET-MOTION-PRODUCTION-SPEC.md` and the pack tokens. The local copy at
`_content/market-motion/` was used, because `/Volumes/JW SSD/...` is not mounted in this environment.
