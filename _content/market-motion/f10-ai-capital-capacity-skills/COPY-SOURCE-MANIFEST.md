# F10 Revision 3: copy and source manifest

Film: **Abu Dhabi's AI bet: capital, capacity, skills** · `ai-capital-capacity-skills.mp4` · 30 s · 900 frames ·
1080 × 1920 · 30 fps

## On-screen copy, verbatim, in order

"Readable" means every line is at full opacity and at rest, as measured by `qa.mjs` (`qa-timing.json`).

| Window | Copy | Readable |
|---|---|---|
| 0–3 s | `A future economy` / `needs more than` / `a headline.` | 0.37–3.03 s (2.67 s) |
| 3–7 s | **`US$1.5bn`** / `Microsoft investment in G42 announced` / `April 2024` · source `Microsoft · 16 Apr 2024` | 3.93–6.63 s (2.70 s) |
| 7–11 s | **`1GW`** / `Stargate UAE cluster announced` / `Abu Dhabi · May 2025` · source `OpenAI · 22 May 2025` | 7.93–10.63 s (2.70 s) |
| 11–15 s | **`95%`** / `Public-sector employees` / `completed AI training` / `Abu Dhabi · 2025` · source `Abu Dhabi DGE · 2025 review · 8 Jan 2026` | 12.10–14.70 s (2.60 s) |
| 15–25 s | Three rows, each with its own source:<br>1. `US$1.5bn` · `Investment.` · `Microsoft · 16 Apr 2024`<br>2. `1GW` · `Planned computing capacity.` · `OpenAI · 22 May 2025`<br>3. `95%` · `Skills already developed.` · `Abu Dhabi DGE · 2025 review · 8 Jan 2026` | 16.43–24.53 s (8.10 s) |
| 25–30 s | `Look at the` / `foundations of the` / `next economy.` | fully on at 26.00 s, holds to 30.0 s |

**Line breaks.** Three pieces of copy are split across lines because a single line is wider than the 888 px column
at spec sizes. The words themselves are unchanged.

| Copy | Single-line width | Split |
|---|---|---|
| 95% label | 1,022 px at 46 px | Two lines |
| Title | 1,077 px at 84 px | Three lines |
| Last line | 923 px for "Look at the foundations" | Three lines |

**Styles.**
- **Hero figures:** Inter 700, Ice Blue #AABCFF, at 206 px (with the currency prefix) or 224 px. "US$" and "bn" are at
  0.40 em, and "GW" and "%" at 0.62 em.
- **Labels:** 46 px at weight 600.
- **Supporting lines:** 34 px, Cloud.
- **Sources:** 22 px at weight 400, Mist, with the bottom at y 1558.
- **Overview figures:** 150 px for all three, the same size. Row labels are 34 px.
- **Brand furniture:** only the official sp_ce wordmark, top-left, 113 px ink width.
- **Everything else:** no other text, numbers, logos, maps, site plans, end card or CTA.

## Sources (as supplied in the brief; not re-fetched during this build)

| Figure | Publisher | Date | On-screen claim |
|---|---|---|---|
| US$1.5bn | Microsoft | 16 Apr 2024 | Microsoft investment in G42, announced April 2024 |
| 1GW | OpenAI | 22 May 2025 | Stargate UAE cluster announced, Abu Dhabi, May 2025 |
| 95% | Abu Dhabi DGE, 2025 review | 8 Jan 2026 | Public-sector employees who completed AI training, Abu Dhabi, 2025 |

**Source pairing.** Each source is fully on screen before its figure first appears, and leaves only after its figure
has gone. `qa.mjs` checks this on all 900 frames, for the three beats and for each overview row: 0 violations.

## What the film does not say

- **Cluster status:** it does not say the cluster is online. "Announced" and "Planned computing capacity" are the only
  status words.
- **Chips, jobs and rents:** it says nothing about chips, jobs or rents.
- **The Microsoft money:** it is labelled "Investment" and "Microsoft investment in G42". It is not framed as property.
- **The 95%:** it is labelled as training completed and as "Skills already developed". It is not called productivity.
- **Excluded figures:** it does not mention a 200MW phase or a 5GW campus. It has no housing arrow and no site plan.
- **Comparison:** the three figures are not compared. No shape is scaled by any value, and the overview uses
  identical type sizes with no bars.

## Carried over from the earlier F10 cut (review if needed)

- **No header label:** there is no "MARKET INTELLIGENCE" label and no licence line, because the copy is locked
  exactly.
- **Proportional numerals:** hero numerals are proportional, not tabular, so the "1" in "1GW" sits tight.
