# F10 Revision 3 QA note: what was actually inspected

This covers the final render, `ai-capital-capacity-skills.mp4` (13.1 MB), from the current `scene.html` and
`render.mjs`.

## Machine checks (run on the final scene and render)

| Check | How | Result |
|---|---|---|
| Container | `ffprobe` | H.264 High, 1080 × 1920, yuv420p, 30/1 fps, **900 frames**, 30.000 s. **Video stream only, no audio** |
| Native length | `render.mjs` | 900 frames, each rendered at its own time `t = i/30`. Nothing is retimed or stretched |
| Decode | `ffmpeg -f null` | Clean |
| Fonts | `sceneReady` throws if Inter at 400, 600, 700 or 800 is missing. QA reads the computed font family | Only `Inter` is used |
| Network | Non-`file://` requests are aborted in both render and QA | 0 requests |
| Copy | `qa.mjs` compares every text line with the brief, in order, and checks that nothing else is in the text layer | All 6 blocks match. No other text |
| Data holds ≥ 2.5 s | Frame by frame: every line, the figure and the source at full opacity and at rest | US$1.5bn **2.70 s** (3.93–6.63) · 1GW **2.70 s** (7.93–10.63) · 95% **2.60 s** (12.10–14.70) |
| Overview ≥ 4.5 s | Same method | **8.10 s** (16.43–24.53) |
| Title / final | Same method | Title 2.67 s (0.37–3.03). Final fully on at 26.00 s, then holds on every frame to 30 s |
| Sources while figures are on | On all 900 frames, for each beat and each overview row: source opacity ≥ figure opacity whenever the figure is visible | **0 violations** |
| 95% split before the number | At the first frame where `95%` has any opacity (11.77 s), count the settled field dots by colour | **950 Ice Blue + 50 white**, so the split is resolved |
| Share field during the hold | Every readable 95% frame | 950 + 50 dots on every frame. Equal dot size (fixed 5.2 px, no depth scaling) |
| Not compared by size | Overview figure font sizes | All three at **150 px**. No bars, and no shape scaled by a value |
| Text keep-out | Particles over 3% alpha inside visible glyph boxes | **0** on all 900 frames |
| Particle identity | Count per frame | Constant at 24,000, seeded once |
| Render determinism | Full-run frames 120, 159, 300, 402, 615 and 855 diffed against isolated single-frame renders | Identical, apart from 1 level on one pixel in frame 855 |

Numbers come from `qa-timing.json`.

## Looked at by eye

- **The six stills** in `stills/`, one from mid-hold of each state, at full resolution. Each was checked for layout,
  safe area, text clearance and the right source:
  - title 1.8 s
  - US$1.5bn 5.3 s
  - 1GW 9.3 s
  - 95% 13.4 s
  - overview 20.5 s
  - foundations 28.5 s
- **The contact sheet** decoded from the MP4 (`contact-sheet.jpg`, one frame per second): the order of states, no hard
  cuts, and a structure always present.
- **Close crops** of the 95% field: the Ice Blue 95% and the visible white 5% (the last 50 dots in reading order), and
  the transition frames at 11.0–11.5 s.

## Failures found and fixed (each led to another render)

1. **Share field invisible.** Coincident particles in one stroke bucket paint once, so 24 particles per dot at 4.5%
   alpha showed nothing. The field alpha is now set so that a single particle carries the dot.
2. **White flare at 11.2 s.** Particles converging on the field drew a blown-out streak wall. Slots are now matched by
   x-bands and y, so moves are local. There is no arc into or out of the field, and particles stay dim until each dot
   has formed.
3. **Sources overlapping.** The outgoing and incoming source lines overlapped by about 0.4 s. Each source now enters
   after the previous one has gone, and leaves after its own figure.
4. **Overview figures before their sources.** Overview figures appeared about 0.4 s before their sources. Labels and
   sources now lead each figure by 0.35 s and leave after it.
5. **Title hold under 2.5 s.** The first title hold measured 2.47 s, so its build was tightened.
6. **Stale 1 px text sliver** at x 768–966, y 832.
   - **Symptom:** it appeared on 523 of 900 frames from the parallel render. It was the top edge of the US$1.5bn
     label, left from its mask reveal at 3.1 s.
   - **Cause:** reproduced with a screenshot on every frame. Under partial raster, Chromium's capture alternated
     with a stale buffer. A hero-figure `will-change` layer also differed from isolated renders.
   - **Fix:** each worker now gets its own Chromium with `--disable-partial-raster`, and the `will-change` layer was
     removed.
   - **Now:** the sliver is only on frames 93–95 and 212–215, during the label reveals where it belongs. Full-run
     frames match isolated renders.

## Known limits / for review

- **Old cut may have the same artefact.** `../f10-ai-bet-physical/` was rendered with the earlier shared-browser
  `render.mjs`, so it may carry the same kind of stale-buffer sliver. It was left alone as instructed and not
  re-checked.
- **Sources not re-verified.** The sources are the brief's wording and dates. They were not re-fetched or checked
  against the publishers' pages.
- **Brief transition at 11.2 s.** The material converging into the 95% field still reads as a bright band of short
  vertical streaks for about 0.3 s, before the dots settle at 11.5 s.
- **Brand furniture carried over** from the earlier F10 cut: no "MARKET INTELLIGENCE" label and no licence line.
  See `COPY-SOURCE-MANIFEST.md`.
- **Spec path not mounted.** `/Volumes/JW SSD/...` is not mounted here, so the repo copy of the production spec was
  used.
