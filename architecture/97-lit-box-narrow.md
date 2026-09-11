# 97 · The lit hint box is no wider than its fragment; 7x keeps its typeset spacing

Route: `/student?stage=practice` (any warm-up with a hint word pointing at a fragment typeset flush against a glyph: 7x, 3x², 10x, the conjured 1 before x²), the practice overlay.

## Files touched

| File | What it does |
|---|---|
| `lib/hint.ts` | `wrap` writes only the abutting-fragments gap (`ABUT`, `\kern0.7em`); ticket 96's thin space (`GLUE`) and its `flushBefore` / `flushAfter` checks are removed; `conjure` inserts the 1 with nothing after it. |
| `app/globals.css` | `.katex .hint-term` padding `0.2em 0`, margin `-0.2em 0`: the box is the fragment's width, taller than it. |
| `lib/hint.test.ts` | The pre-96 expectations: no `\,` in any wrapped TeX. |

## How it connects

```
 data/practice.ts                    lib/hint.ts                                   app/globals.css
 tex "x^2 + 7x + 12 = 0"      termTex(tex, terms, lit)                       .katex .hint-term
 term "middle coefficient" ─▶ x^2 + \htmlClass{hint-term hint-term-lit}{7}x + 12 = 0     padding 0.2em 0
                                                                 ▲                      margin −0.2em 0
                                          nothing between the 7 and the x:              (the box is exactly
                                          7x is one term, typeset as KaTeX sets it       the 7's cell, taller)

                                            x² + [7]x + 12 = 0
                                                 └─┘└ the x's cell starts where the box ends
```

The two-fragment gap of ticket 88 stays: `(x + 3)` `\kern0.7em` `(x + 4)` are two boxes with air between; a coefficient and its variable are one term with none.

## Verified by

vitest (337), eslint, tsc, `next build`; a headless click-through of the monic and non-monic warm-ups hovering each first-hint word and measuring the lit box against the glyph after it in DOM order (0px to the x's cell, the box no wider than the fragment), with 3× clips of each.
