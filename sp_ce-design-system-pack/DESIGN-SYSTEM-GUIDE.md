# sp_ce Design System Guide

Single visual source of truth for every sp_ce post, carousel, market graphic and Reel. Values live in `design-tokens.json`. If this guide and the tokens disagree, the tokens win; report the conflict.

---

## 1. Purpose and character

space is a boutique residential advisory in Abu Dhabi. The visuals exist to make evidence easy to read.

- **Quiet.** Few elements, generous space, one idea per frame.
- **Premium.** Precise type, restrained colour, no decoration for its own sake.
- **Evidence-led.** Figures carry their source and period. Nothing is implied that the data does not show.
- **Modern.** Dark market-intelligence surfaces, particle-map language, clean data.

**Never:** broker aesthetics (gold, starbursts, "SOLD" stamps, price flashes, skyline clip-art, handshake stock), generic AI aesthetics (neon glow, purple-on-black glassmorphism, chrome, lens flare, holograms, AI-generated imagery).

---

## 2. Logo

Files: `ASSETS/logos/`. Use as supplied. Full mapping in `ASSETS/README.md`.

| Mark | Use |
|---|---|
| Wordmark `sp_ce` (small) | Default: corner mark on posts and middle carousel frames; all Reel scenes including the end-card |
| Wordmark medium / long / xlong | Wider underscore for large, sparse compositions only |
| Descriptor lockup `sp_ce \| Real Estate` | First and last carousel frames; report and deck covers and closing pages |

- **Variant:** SVG is black, for light backgrounds. PNG is white, for dark backgrounds. No other colours.
- **Clear space:** the height of the lowercase `s` on all sides. Nothing enters it.
- **Minimum size (visible artwork width):** wordmark 96px digital / 18mm print; lockup 200px / 35mm.
- **Social sizes:** frame corner wordmark 176px; Reel end-card wordmark 320px; carousel first/last lockup 400px (visible width).
- **Web address** (spacerealestate.me) goes on written reports and documents only, never on social or Reels.
- Files contain built-in padding (artwork is ~86% of file width). Size and align by the visible artwork.

**Prohibited:** retyping the mark in a font; recolouring (including gradient fills); outlines, shadows, glows, bevels; stretching or rotating; placing on busy photo areas; changing the underscore; combining with any mark other than "| Real Estate"; using `sp_ce` in a headline instead of the word "space".

---

## 3. Colour

**Lead dark:** Charcoal Blue `#1C1F2A` (default dark surface), Black `#000000` (end-cards, deepest ground), Ink `#1A2030` (panels on dark).
**Neutrals:** Slate `#4A5468`, Mist `#8B95A7`, Cloud `#E4E8EF`, Paper `#F7F8FA`, White `#FFFFFF`.
**Light-mode accents:** Ice Blue `#AABCFF` (brand-accent), Soft Violet `#E0ADF9` (brand-accent-2). Tints: Sky Wash `#D6E0FF`, Lilac Mist `#F0DCFB`.
**Serious-mode accents:** Midnight Blue `#1F2D5C`, Deep Indigo `#3D4E8F`, Plum `#6B4A7A`, Periwinkle `#7081B8`.
**Particle / data heat scale:** `#EEF2FF → #C7D2FF → #AABCFF → #7A92E8 → #4A5FB8 → #2A3878`.
**Status (meaning only):** Positive `#3D7A5C`, Attention `#B8893A`, Negative `#9E4848`, Info `#3D6B7E`; Terracotta `#C28560` as a one-off editorial accent.

**Modes.** Pick one lead mode per piece; the other supplies only small accents.
- **Light mode** (social, adverts, brand moments): White, Paper or the Charcoal Blue / Black brand dark as ground; Ice Blue and Soft Violet as accents; gradient allowed. The dark statistic frame and the Reel end-card are light-mode work on the brand dark.
- **Serious mode** (reports, advisory, dashboards, valuations, LinkedIn opinion): serious accents only. **No gradient.**

**Accent pairing**
- On dark: Ice Blue is the single accent. Soft Violet appears only as the far end of the unicorn gradient.
- On light: Deep Indigo for accent text and chart lines; the unicorn gradient for one rule or the tagline word.
- One accent per frame.

**Text contrast**
- On dark: White (primary), Cloud (secondary), Mist (metadata). All pass 4.5:1 on Charcoal Blue.
- On light: Ink (primary), Slate (secondary and metadata). Mist fails 4.5:1 on white; use it on light only at headline scale or for non-text.

**Approved gradients** (only these three)
1. **Unicorn** `linear-gradient(135deg, #AABCFF, #E0ADF9)` – the word "space" in the tagline, rule lines 4–15px tall, the map pin, small accents. Never full-bleed, never body text, never on a statistic, never in serious mode.
2. **Image overlay** `linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.55))` – headline over photo.
3. **Heat ramp** – legends and scale keys only.


---

## 4. Typography

- **Inter** for everything the viewer reads: headlines, statistics, labels, body. Weights 400 / 500 / 600 only.
- **JetBrains Mono** for data labels and small technical metadata only: source, period, scene counter. Never headlines, statistics, body or the licence footer.
- Sentence case everywhere. Uppercase only for section labels.
- Tabular figures on statistics and counters.
- No substitutes. CSS stacks fall back to system sans, but exported artwork must render in Inter. If it does not, fix it before export.

**Social hierarchy (1080px-wide canvas)**

| Role | Font | Weight | Size / line | Tracking | Notes |
|---|---|---|---|---|---|
| Hero headline | Inter | 600 | 72 / 1.05 | -0.02em | Max 3 lines. Reels: 88px |
| Statistic figure | Inter | 600 | 220 / 0.95 | -0.02em | One per frame, tabular |
| Statistic label | Inter | 500 | 36 / 1.3 | -0.01em | Max 2 lines |
| Section label | Inter | 500 | 24 / 1.2 | +0.12em | Uppercase |
| Body | Inter | 400 | 32 / 1.4 | 0 | Max 2 short sentences |
| Source line | JetBrains Mono | 400 | 22 / 1.45 | 0 | `Source: … · Period: …` |
| Licence footer | Inter | 400 | 22 / 1.45 | 0 | Final card/page only (§6a) |
| Scene counter | JetBrains Mono | 500 | 22 / 1 | +0.04em | `01 / 05` |
| Tagline | Inter | 600 | see below / 1.02 | -0.025em | "Find your space." Gradient on "space" only; "Find your" and the full stop solid |

Minimums on a 1080 canvas: body 28px, metadata 22px.

**Tagline scale.** The tagline is a key line: on a closing frame it is the largest text, larger in presence than the logo. Reel end-card 88px · carousel last frame 72px · square last frame 64px · 1920 deck closing 96px · A4 report cover/closing 52px. Never below 48px on social.

---

## 5. Layout

- **One message per frame.** Read order: section label → headline or statistic → label → one supporting line → source.
- **Whitespace is structure.** Margins 72px. Stack gaps 16 / 32 / 64 / 96 from the 4-pt scale.
- **Left-aligned** text on a single left edge. Centre only logos and the end-card tagline.
- **Phone-first.** Test at 390pt wide. If it needs zooming, it is too small or too full.
- **Dark market-intelligence composition.** Charcoal Blue ground; particle field or chart in the upper half; text anchored bottom-left; nothing competes with the statistic.
- **No divider lines or em dashes in social copy.** Separate with space, not rules. The unicorn rule is an accent, not a divider.
- Corners square on frames and photography. No shadows, cards or frosted panels on social artwork.
- Photography: real, calm, daytime, low contrast, no people, edge-to-edge or 4:5 / 3:2. Placeholder is flat `#D9D9D9` with "Placeholder image" centred. Never AI-generated or stock.

---

## 6. Safe areas

**Reel / Story 9:16 (1080 × 1920)**
- Top 220px: platform header. No content.
- Bottom 420px (y 1500–1920): caption and controls. No content.
- Right 160px (x 920–1080): action rail. No text.
- **Content-safe box: x 72–920, y 220–1500.** Logos may centre on x 540 if fully inside the box.

**Feed 4:5 (1080 × 1350):** content-safe box inset 72px. Keep essentials inside x 34–1046 for the 3:4 grid crop.
**Square 1:1:** inset 72px.

## 6a. Licence footer

`The Prop Co Real Estate Space LLC OPC · Broker Licence No. 202400892044`

Required once on every document and advert, on the **final card or page**. Not on every page. Locked wording; Inter 400 22px (same face as body text, never mono), Mist on dark or Slate on light, inside the safe area. On Reels, split it into two centred lines (company name, then licence number) so it stays within x 72–920.

**Legibility:** minimum sizes in §4; 4.5:1 contrast; each text frame holds at least 2.5s in video; captions never overlap the statistic.

---

## 7. Charts and data visuals

- One clear message per frame. One highlighted series; everything else Slate/Mist.
- Every data claim carries **source and period** in the source line. No source, no statistic.
- Use only approved figures. Never invent, estimate, round differently, extrapolate or "illustrate" with plausible numbers.
- Axis starts at zero for bars. Label directly; avoid legends where possible.
- Hairline axes (`rgba(255,255,255,0.14)` on dark, `#E4E8EF` on light). 3px series lines. No 3D, no pie charts beyond 2 segments, no gridline clutter.
- Heat scale for density and maps; always with a legend when it encodes values.
- Particle fields are decorative ground unless they are generated from real data. If decorative, they must not resemble a specific map or dataset.

---

## 8. Motion

**Character:** restrained, precise, premium.
- Fades and small translates (≤32px). Easing `cubic-bezier(0.2, 0.6, 0.2, 1)`; emphasis `cubic-bezier(0.16, 1, 0.3, 1)` for scene transitions only.
- Text in 480ms, statistic 600ms, logo 800ms, stagger 120ms, crossfade 360ms. 30fps.
- **Particle-map language:** points drift slowly (4–12px/s) and resolve into form. Heat-scale colours only. No bursts, trails or explosions.
- **Numbers reveal whole.** The final value fades in with a 16px rise. No counting up, rolling, odometers, blur or ghosting.
- Hold each statistic at least 2.5s. End-card holds 2.5s.

**Prohibited:** glow, lens flare, liquid-metal or chrome effects, light sweeps, bounce, springs, elastic overshoot, glitch, camera shake, parallax, 3D flips, noisy or looping background animation.

---

## 9. QA checklist (before export)

**Brand**
- [ ] Official logo file, correct variant (SVG black on light, PNG white on dark), clear space and minimum size respected
- [ ] Inter and JetBrains Mono loaded from `ASSETS/fonts`; mono used for source, period and counters only; licence footer in Inter
- [ ] Every colour is a token value; one lead mode; one accent per frame; gradient only where approved and never in serious mode

**Content**
- [ ] Copy matches the approved text word-for-word
- [ ] Every statistic has source and period; no invented or altered figures
- [ ] Licence footer present, verbatim, on the final card or page only
- [ ] Tagline, if used, reads "Find your space." with only "space" in the gradient
- [ ] One message per frame; body ≤ 2 sentences
- [ ] Sentence case; no em dashes, divider lines, exclamation marks or emoji in artwork

**Legibility**
- [ ] Nothing outside the content-safe box
- [ ] Text ≥ minimum sizes; contrast ≥ 4.5:1
- [ ] Checked at phone size (390pt wide)
- [ ] Right lockup: descriptor on first/last carousel frames and report covers; plain wordmark on Reels; no web address on social

**Motion (Reels)**
- [ ] Only fades, small translates and particle drift; approved easing and durations
- [ ] Numbers appear whole; no rolling or ghosting
- [ ] No glow, flare, bounce or noisy effects
- [ ] Each statistic holds ≥ 2.5s; end-card uses the plain wordmark and the tagline

**Export**
- [ ] Correct canvas size (1080×1350, 1080×1080 or 1080×1920)
- [ ] No guides, annotations or production notes in the artwork
