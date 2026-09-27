# ASSETS

Official files, copied unaltered from the sp_ce design system. Do not edit, re-export, recolour or re-trace them.

## logos/

Colour rule: **SVG = black, for light backgrounds. PNG = white, for dark backgrounds.**
Wordmark files (`logo-mark-*`) include built-in padding (visible mark ≈ 86% of file width); the descriptor lockup is cropped tight. Size by the visible mark.

| File | Mark | Use |
|---|---|---|
| `logo-mark-small.svg` | `sp_ce` wordmark, short underscore | **Default.** Corner mark on light frames |
| `logo-mark-small.png` | same, white | **Default.** Corner mark on dark frames and Reel scenes |
| `logo-mark-medium.svg` / `.png` | wordmark, medium underscore | Larger sparse compositions |
| `logo-mark-long.svg` | wordmark, long underscore | Wide banners, light only (no white PNG supplied) |
| `logo-mark-xlong.svg` / `.png` | wordmark, extra-long underscore | Very wide formats only |
| `logo-real-estate.svg` | `sp_ce \| Real Estate` descriptor lockup, black | Covers and end-cards on light |
| `logo-real-estate.png` | same, white | Reel end-cards and covers on dark |

Missing: a white PNG of `logo-mark-long`. Request it from the brand owner rather than creating one.

## fonts/

| File | Family | Use |
|---|---|---|
| `Inter-VariableFont_slnt_wght.ttf` | Inter (variable) | All headlines, statistics, labels, body. Weights 400/500/600 |
| `JetBrainsMono-VariableFont_wght.ttf` | JetBrains Mono (variable) | Source, period, data labels and scene counter only. Licence footer is Inter. |
| `JetBrainsMono-Italic-VariableFont_wght.ttf` | JetBrains Mono Italic | Rarely needed; metadata only |

Both families are open-source (SIL Open Font License). Licence text files were not supplied with the source; add them here when available.

```css
@font-face { font-family: "Inter"; src: url("ASSETS/fonts/Inter-VariableFont_slnt_wght.ttf") format("truetype"); font-weight: 100 900; }
@font-face { font-family: "JetBrains Mono"; src: url("ASSETS/fonts/JetBrainsMono-VariableFont_wght.ttf") format("truetype"); font-weight: 100 800; }
```
