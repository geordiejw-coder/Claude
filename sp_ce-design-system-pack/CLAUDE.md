# CLAUDE.md – sp_ce visual production

## Before producing any sp_ce visual
1. Load `design-tokens.json`. It is the only source of colour, type, spacing, radius, safe-area and motion values.
2. Read `DESIGN-SYSTEM-GUIDE.md`.
3. Use logos and fonts from `ASSETS/` only (see `ASSETS/README.md`).
4. For layout patterns, start from `EXAMPLES/` and the notes in `EXAMPLES/README.md`.

## Never
- Substitute fonts. Inter for all read text; JetBrains Mono for data labels, source, period and scene counter only. The licence footer is Inter. Exported artwork must render in Inter.
- Recreate the logo as text, recolour it, or edit the SVG/PNG files. SVG (black) on light; PNG (white) on dark.
- Use a colour, gradient or size that is not in `design-tokens.json`. No new tints, opacities as new colours, or "close enough" hexes.
- Write, alter, round or invent data claims. Every statistic needs an approved source and period.
- Rewrite approved copy. Lay it out verbatim.
- Add glow, lens flare, liquid-metal, bounce, rolling numbers or noisy motion.
- Use the gradient in serious mode, or on anything in the tagline except the word "space".

## Build rules
- Canvas: 1080×1350 (feed), 1080×1080 (square), 1080×1920 (Reel). Keep content inside `safe-area` boxes.
- Reference tokens by name in code (CSS variables or constants generated from the JSON), not retyped literals.
- Load fonts with `@font-face` from `ASSETS/fonts/*.ttf`.
- Guides and annotations are toggleable layers, off at export.
- Licence footer (`legal.licence-footer`) goes once, on the final card or page of every document and advert.

## Visual QA gate (must pass before handing off)
- [ ] Official logo, correct variant, clear space, ≥ minimum size
- [ ] Inter + JetBrains Mono only; mono only on source, period, counters; licence footer in Inter
- [ ] All colours and sizes are token values; one accent per frame
- [ ] Copy verbatim; each statistic has source and period; nothing invented
- [ ] Licence footer verbatim on the final card/page; tagline gradient on "space" only
- [ ] All content inside the safe area; text ≥ 22px metadata / 28px body; contrast ≥ 4.5:1
- [ ] Motion: fades/small translates only, approved easing, numbers appear whole
- [ ] No guides, notes or placeholders left in exported artwork

If any item fails or a required input (copy, figure, source, period) is missing, stop and report it. Do not fill the gap.
