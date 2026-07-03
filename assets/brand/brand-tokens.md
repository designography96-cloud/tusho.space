# Tusho — Brand Tokens (source of truth for the site)

> Palette confirmed by owner 2026-07-03 (overrides the older v1.0 guidelines docx,
> which listed Georgia/Arial and a warmer palette). Voice, values, and photography
> direction from the docx still apply — see `voice-notes.md`.

## Color — fixed, must be followed

| Token    | Hex       | RGB           | CMYK        | Role |
|----------|-----------|---------------|-------------|------|
| Ink      | `#191A1B` | 25 26 27      | 74 67 64 78 | Main black — dark-mode background, light-mode text, logo |
| Paper    | `#FAFBFC` | 250 251 252   | 1 0 0 0     | Main white — light-mode background, dark-mode text, logo |
| Ash      | `#CDD0D2` | 205 208 210   | 19 13 13 0  | Rare — dividers, borders, secondary surfaces |
| Smoke    | `#848688` | 132 134 136   | 51 41 40 5  | Rare — captions, labels, muted text |
| Charcoal | `#38393A` | 56 57 58      | 70 62 60 52 | Rare — secondary elements, elevated dark surfaces |

Rules:
- Ink + Paper carry the entire site. Ash / Smoke / Charcoal only where hierarchy genuinely needs a third value.
- No other colors in the brand shell. The work (videos, images) carries all color.

## Typography

Two voices (confirmed by owner 2026-07-03, replacing the docx's Georgia/Arial):
- **Josefin Sans** — display voice (hero statements, section titles, index rows).
  Thin geometry that rhymes with the wordmark. Weights: Thin 100 / Light 300 / Regular 400 / Medium 500 / SemiBold 600.
- **Circular Std** — body, labels, stats. Book 400 / Medium 500 / Bold 700 / Black 900 + italics.

All woff2 in `/assets/fonts/`.

## Logo

- `assets/logo/tusho-wordmark-ink.svg` — Ink fill, for Paper/light backgrounds
- `assets/logo/tusho-wordmark-paper.svg` — Paper fill, for Ink/dark backgrounds
- viewBox 0 0 161.74 70.22 (ratio ≈ 2.303 : 1)
- Line-construction wordmark "TUSHO" — thin architectural strokes. Never stretch,
  no shadows/effects, clear space = cap height of the T on all sides, min 32px wide digital.
