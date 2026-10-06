# F10 copy and source manifest

Film: **F10 — Abu Dhabi's AI bet is physical** · `ai-bet-physical.mp4` · 30 s · 900 frames · 1080 × 1920 · 30 fps

## Claim

Stargate UAE was **announced** as a 1GW AI cluster in Abu Dhabi (May 2025 announcement).

The film does **not** say the cluster is operating. It does not say jobs or rents followed, or that a 2026 switch-on
happened. It has no 200MW first phase, no 5GW campus and no reference to house prices.

## On-screen copy, verbatim

Times are when each line is readable, meaning at full opacity and at rest. `qa-timing.json` measured them from the
scene.

| Window (brief) | Element | Exact text | Style | Readable |
|---|---|---|---|---|
| 0–6 s | Title, 2 lines | `Abu Dhabi's AI bet` / `is physical.` | Inter 84 px, 800 / 600, white | 1.10–5.40 s (4.3 s) |
| 6–14 s | Hero figure | `1GW` | Inter 224 px, 700, Ice Blue #AABCFF ("GW" at 0.62 em, 600) | 7.63–13.40 s |
| 6–14 s | Hero label | `Stargate UAE cluster announced` | Inter 46 px, 600, white | 6.87–13.47 s |
| 6–14 s | Supporting line | `Abu Dhabi · Announced May 2025` | Inter 34 px, 600, Cloud #E4E8EF | 6.57–13.57 s |
| 14–23 s | Statement, 2 lines | `Compute needs` / `infrastructure.` | Inter 84 px, 800 / 600, white | 15.20–22.40 s (7.2 s) |
| 23–30 s | Statement, 2 lines | `Read the city's` / `next economy.` | Inter 84 px, 800 / 600, white | 23.67–30.00 s (6.3 s) |
| 6.15–14.5 s | Source line | `OpenAI · Introducing Stargate UAE · 22 May 2025` | Inter 22 px, 400, Mist #8B95A7, bottom at y 1558 | fully on 6.60–14.00 s |

- The whole 1GW state (figure, label and May 2025 line together) is readable from 7.63 s to 13.40 s, which is 5.8 s.
- Order: the May 2025 line appears at 6.17 s and the figure at 7.30 s. The lattice and its opening are complete by
  about 6.0 s, before either one.
- `1GW` appears whole. It fades in over 0.4 s with a 16 px rise, and no other value is ever drawn.
- The source line appears before the figure and stays until 14.47 s, after the figure has fully exited at 13.80 s.

**Brand furniture:** the official sp_ce wordmark (`assets/sp_ce-logo.svg`, copied unchanged from
`abu-dhabi-h1-2026/public/brand/sp_ce-logo.svg`, which is the same file as `small.svg` at the repo root). It sits
top-left with its ink at x 96, y 226, 113 px wide.

**Nothing else is on screen.** There is no CTA, end card, licence line, logo from any other company, map, skyline,
person, data-centre model or housing arrow. `qa.mjs` checks that the text layer holds only the strings above.

## Source

| Field | Value |
|---|---|
| Publisher | OpenAI |
| Title | Introducing Stargate UAE |
| Date | 22 May 2025 |
| Supports | Stargate UAE announced as a 1GW AI compute cluster in Abu Dhabi, May 2025 |

The source line is the one the brief supplied, used verbatim. The figure was not re-checked against the live page
during this build, because no network fetch was made.

## Decisions to review

1. **No "MARKET INTELLIGENCE" header label.** The production spec pairs the wordmark with a tracked label. The brief
   locks the on-screen copy exactly, so only the wordmark is shown. To add the label, put it back into `scene.html`
   as a `#text` sibling at right x 984, top 229, 18 px, 600, +0.22em, Mist.
2. **No licence line.** The production spec records where a licence line goes (ending at y 1600) but gives no wording
   for this format. The reference film's licence is a broker licence attached to property-market claims, and this
   film makes none, so per the brief it is omitted.
3. **Hero numerals are proportional, not tabular.** The figure is a single number, and the tabular "1" left a wide gap
   before "GW".
