# EXAMPLES – reference frames

Three reusable layouts, not campaigns. Bracketed text and `00.0` figures are slots: replace them with approved copy and figures. Open `Reference Frames.dc.html` to see each frame clean, with its safe-zone guide, and with these notes. Guides are a toggle (`guides` prop) and are off in the artwork.

---

## 01 · Dark market-intelligence statistic
`Frame-Dark-Statistic.dc.html` · 1080×1350 (4:5)

**Hierarchy:** section label → statistic → statistic label → one supporting line → source/period. Frame 01 of a set, so no licence footer.
**Composition:** particle field fills the upper half and fades out before the text; all text sits bottom-left on one 72px left edge. Wordmark top-left, scene counter top-right.

| Element | Token |
|---|---|
| Ground | `sp-charcoal-blue` #1C1F2A |
| Particle field | `heat-5 → heat-0`, decorative, fades to ground by y≈720 |
| Wordmark | `logo-mark-small.png` (white), 176px wide |
| Scene counter | mono 500 22px, `sp-mist` |
| Section label | Inter 500 24px +0.12em uppercase, `sp-ice-blue` |
| Accent rule | unicorn gradient 96×8px |
| Statistic | Inter 600 220px -0.02em tabular, `sp-white` |
| Statistic label | Inter 500 36px, `sp-cloud` |
| Supporting line | Inter 400 32px, `sp-mist` |
| Source / period | JetBrains Mono 400 22px, `sp-mist` |

**Safe zone:** 72px inset; nothing critical outside x 34–1046 (3:4 grid crop).
**Motion (if animated):** particles drift 4–12px/s; label 480ms; statistic appears whole at 600ms with 16px rise; source last. No counting.

---

## 02 · Light editorial / insight
`Frame-Light-Editorial.dc.html` · 1080×1350 (4:5)

**Hierarchy:** image → section label → headline → body → source/period.
**Composition:** full-bleed photo top (1080×620, square corners), text block below on Paper. Headline max 3 lines; body max 2 sentences.

| Element | Token |
|---|---|
| Ground | `sp-paper` #F7F8FA |
| Image | real photo; placeholder `#D9D9D9` |
| Wordmark | `logo-mark-small.svg` (black), 176px, in the text block |
| Section label | Inter 500 24px +0.12em uppercase, `sp-deep-indigo` #3D4E8F |
| Accent rule | unicorn gradient 96×8px |
| Headline | Inter 600 72px -0.02em, `sp-ink` |
| Body | Inter 400 32px/1.4, `sp-slate` |
| Source / period, counter | JetBrains Mono 22px, `sp-slate` (Mist fails contrast on light) |

**Safe zone:** 72px inset for text; the photo may bleed.

---

## 03 · Reel end-card / logo
`Frame-Reel-End-Card.dc.html` · 1080×1920 (9:16)

**Hierarchy:** wordmark → tagline (key line, largest text) → licence. No web address on social.
**Composition:** centred on x 540, vertically centred in the content-safe box (y 220–1500). Nothing in the top 220px, bottom 420px or right 160px except the ground.

| Element | Token |
|---|---|
| Ground | `sp-black` #000000 |
| Wordmark | `logo-mark-small.png` (white), 320px visible width. Reels keep the plain wordmark; the descriptor lockup is for first/last carousel frames |
| Tagline | Inter 600 88px/1.02 -0.025em, `sp-white`; only "space" in unicorn gradient, full stop solid |
| Licence | `The Prop Co Real Estate Space LLC OPC · Broker Licence No. 202400892044`, Inter 400 22px, `sp-mist`, two centred lines, bottom of the safe box (y ≤ 1500). Final card, so it carries the footer |

**Motion:** wordmark fades in 800ms (emphasis easing), tagline 480ms after 240ms, licence 360ms. Hold 2.5s. No glow, sweep or flare on the logo.
