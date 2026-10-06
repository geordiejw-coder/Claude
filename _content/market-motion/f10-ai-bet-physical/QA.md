# F10 QA note: what was actually inspected

This covers the final render, `ai-bet-physical.mp4` (58.8 MB), from the current `scene.html`.

## Machine checks (run on the final scene)

| Check | How | Result |
|---|---|---|
| Container and codec | `ffprobe` | H.264 High, 1080 × 1920, yuv420p, 30/1 fps, **900 frames**, 30.000 s. **Video stream only, no audio.** |
| Decode | `ffmpeg -i ai-bet-physical.mp4 -f null -` | Decodes clean, with no errors |
| Fonts | `sceneReady` waits for local Inter at 400, 600, 700 and 800 and throws if any is missing. `qa.mjs` reads the computed font family | Loaded. The only family on the text layer is `Inter` |
| Network | Playwright route aborts anything that is not `file://`, in both render and QA | **0** requests blocked, so nothing was fetched from the network |
| Copy | `qa.mjs` compares the DOM text with the locked strings, and the whole text layer with their concatenation | All 7 strings match exactly. No other text is on screen |
| Text keep-out | Each frame counts particles drawn above 3% alpha inside any visible glyph box | **0** across all 900 frames, in both the render pass and the QA pass |
| Particle identity | The particle count is checked on every frame | Constant at 107,277, seeded once |
| Readable holds (≥ 2.5 s each) | `qa.mjs`, frame by frame. Every line must be at full opacity and at rest | Title 4.3 s · 1GW state 5.77 s · Compute 7.2 s · Final 6.33 s |
| Final line | | Fully on at **23.67 s** (the limit is 26.5 s) and holds on every frame to 30.0 s |
| Order | | May 2025 line first visible at 6.17 s, `1GW` first visible at 7.30 s |
| Source line | | Fully on from 6.60 s to 14.03 s, and visible on every frame where the figure is. Last visible at 14.47 s, after the figure's last visible frame at 13.80 s |
| 1GW never counts | Code review of `scene.html` | The figure is one static string whose opacity and rise are animated. No other number exists in the page |

Full numbers are in `qa-timing.json`.

## Looked at by eye

These were reviewed as images during this build:

- **The four stills** (`stills/ai-bet-physical-{3,10,18,26}s.png`), at full resolution and side by side:
  - **3 s:** dense cloud below eye level, with the title clear.
  - **10 s:** resolved lattice with the empty opening. `1GW` in Ice Blue, the label, the May 2025 line and the
    source.
  - **18 s:** connections drawn inside the same lattice.
  - **26 s:** the camera has moved so the cavity walls and lattice layers separate.
- **A contact sheet of the encoded MP4** (`contact-sheet.jpg`, one frame per second, decoded from the H.264 file):
  - No hard cuts.
  - The text states change only through mask and fade transitions.
  - The lattice is continuous from about 6 s to the end.
- **Full-resolution frames at 4 s, 6 s, 15 s and 29 s** from test renders.

## Failures found and fixed (each led to a re-render)

1. **Lattice too dim to read.** At first it was a tunnel of near-invisible dots. I made it coarser, turned and tilted
   it so it reads as a 3D structure, and made nodes brighter and larger.
2. **Connections not readable at 18 s.** Edges had 4 to 5 dim points each. They now have 18 points per edge with a
   higher settled alpha.
3. **Text drifted off the x 96 column edge.** Parallax moved it up to 34 px. Parallax is now capped at 10 px.
4. **Gap in `1GW`.** The tabular "1" left a gap before "GW". The hero now uses proportional numerals.
5. **Hard dark box around the title at 4 s.** It came from the keep-out edge. The fade was widened from 46 px to
   110 px, and the final render uses the softened edge.
6. **`qa.mjs` false negative on the source line.** The source line is anchored with `translateY(-100%)`, so QA now
   checks its opacity only.

## Known limits

- **Pre-connection lattice (6–14 s).** In this phase the lattice shows perspective rows converging toward a point
  low on the left. That is static perspective of the structure, not rotation. A reviewer may still read it as a
  "starburst", and it needs a human eye.
- **Source not re-verified.** The source line is the brief's own wording. It was not checked against the live
  OpenAI page.
- **Brand decisions to review.** No header label, no licence line and proportional numerals. See
  `COPY-SOURCE-MANIFEST.md`.
- **File size.** The 58.8 MB file comes from per-frame grain at CRF 18. Re-encode at a higher CRF if a platform cap
  needs it.
