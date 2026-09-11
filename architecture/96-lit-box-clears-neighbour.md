# 96 · The lit hint box stops short of the glyph next to it

Route: `/student?stage=practice` (any warm-up with a hint whose word points at a fragment typeset flush against a glyph: 7x, 3x², 10x, the conjured 1 before x²), the practice overlay.

## Files touched

| File | What it does |
|---|---|
| `lib/hint.ts` | `wrap` writes `\,` between a wrapped fragment and a flush glyph on either side (`flushBefore`, `flushAfter`: letter, digit or bracket, spaces skipped, not a command name); `conjure` writes it after the inserted fragment. `ABUT` (`\kern0.7em`) and `GLUE` (`\,`) named. |
| `app/globals.css` | `.katex .hint-term` padding `0.2em 0.12em` with the matching negative margin; the 2px same-colour ring on `.hint-term-lit` and its transition are gone. |
| `lib/hint.test.ts` | The thin space on both sides, none beside an operator, relation, brace or command name; expectations updated; the no-layout-change sweeps allow the gap at rest. |

## How it connects

```
 data/practice.ts                       lib/hint.ts                                 app/globals.css
 tex "x^2 + 7x + 12 = 0"        termTex(tex, terms, lit)                    .katex .hint-term
 term "middle coefficient" ─▶   x^2 + \htmlClass{hint-term hint-term-lit}{7}\,x + 12 = 0     padding 0.2em 0.12em
                                                               ▲                            margin −0.2em −0.12em
                                       GLUE: the x is flush against the 7,                  (box reaches 0.12em past the 7,
                                       so a thin space (0.1667em) goes between,             the thin space is 0.1667em:
                                       lit or not                                           1px of air before the x)

                                         x² + [ 7 ] x + 12 = 0
                                               └─┘ └ outside the box
```

The gap is written at rest too, so hovering the word changes colour only; the sweeps in `lib/hint.test.ts` compare every warm-up's spacing lit against rest.

## Verified by

vitest (338), eslint, tsc, `next build`; a headless click-through of the monic and non-monic warm-ups hovering each first-hint word and measuring the lit box against the glyph after it in DOM order (1px of air before the x, 3px before "="), with 3× clips of each.
