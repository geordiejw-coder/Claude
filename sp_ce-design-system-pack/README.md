# sp_ce Design System Pack – start here

The single visual source of truth for sp_ce posts, carousels, market graphics and Reels.

## Who reads what first

| Reader | Read first | Then |
|---|---|---|
| **Claude Design** | `DESIGN-SYSTEM-GUIDE.md` | `EXAMPLES/` (open `Reference Frames.dc.html`, read `EXAMPLES/README.md`) |
| **Claude Code** | `CLAUDE.md` | `design-tokens.json`, `ASSETS/` |
| **Grok content bot** | `GROK-BOT-BRAND-BRIEF.md` | Nothing else required |
| **Human review** | `DESIGN-SYSTEM-GUIDE.md` | §9 QA checklist |

## Contents

```
sp_ce-design-system-pack/
├─ README.md                  this file
├─ DESIGN-SYSTEM-GUIDE.md     rules: logo, colour, type, layout, safe areas, data, motion, QA
├─ design-tokens.json         machine-readable values (the tokens win any conflict)
├─ CLAUDE.md                  operating rules + QA gate for Claude Code
├─ GROK-BOT-BRAND-BRIEF.md    handoff rules for the content bot
├─ ASSETS/
│  ├─ README.md               asset → use mapping
│  ├─ logos/                  official SVG (black) and PNG (white), unaltered
│  └─ fonts/                  Inter, JetBrains Mono, unaltered
└─ EXAMPLES/
   ├─ README.md               annotations: hierarchy, tokens, type, safe zones
   ├─ Reference Frames.dc.html   board: artwork, guide overlay, notes
   ├─ Frame-Dark-Statistic.dc.html
   ├─ Frame-Light-Editorial.dc.html
   ├─ Frame-Reel-End-Card.dc.html
   └─ renders/               PNG exports of the three frames (for tools that cannot open HTML)
```

Values match the sp_ce design system and the sp_ce Design Brief for Agents.

## Open items
- Supply a white PNG of `logo-mark-long` and the font licence files.
