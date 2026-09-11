# 98 · The lit hint box fits its surroundings per axis; the maths keeps its own spacing everywhere

Route: `/student?stage=practice` (every warm-up's problem and read-as lines while a hint is open), the practice overlay.

## Files touched

| File | What it does |
|---|---|
| `lib/hint.ts` | `wrap` writes no gap (ticket 88's kern is gone); each span's classes say how its box fits: `hint-term-tight-x` (`flushBefore` / `flushAfter`: a letter, digit, bracket, superscript or subscript flush against it, or an abutting span), `hint-term-tight-y` (`inFraction`: the whole numerator or denominator), `hint-term-abut` (the second of two abutting spans). `conjure` marks the inserted 1 tight-x. |
| `app/globals.css` | `.katex .hint-term` padding `0.08em 0.14em` with the matching negative margin; `.hint-term-tight-x` and `.hint-term-tight-y` zero one axis; `.hint-term-abut` `clip-path: inset(0 0 0 1px)`. |
| `lib/hint.test.ts` | The classes per case; the factors with no kern; the layout sweeps with no exemptions. |

## How it connects

```
 data/practice.ts                    lib/hint.ts  termTex(tex, terms, lit)                          app/globals.css
 ─────────────────                   ────────────────────────────────────────────                    ───────────────
 "x^2 + 7x + 12 = 0"                 x^2 + \htmlClass{hint-term hint-term-tight-x}{7}x               .hint-term
   term "middle coefficient"                 ▲ the x is flush: no side air                            padding 0.08em 0.14em
   term "constant"                   + \htmlClass{hint-term hint-term-lit}{12} = 0                    margin −0.08em −0.14em
                                             ▲ "+" and "=" beside it: air on every side             .hint-term-tight-x
 "\dfrac{x}{4} + …"                  \dfrac{x}{\htmlClass{hint-term hint-term-tight-y}{4}}            sides 0
   term "common denominator"                 ▲ the bar is above: no air above or below              .hint-term-tight-y
 "(x - 2)(x + 5) = 0"                \htmlClass{hint-term hint-term-tight-x}{(x - 2)}                 top and bottom 0
   term "factors"                    \htmlClass{hint-term hint-term-tight-x hint-term-abut}{(x + 5)}  .hint-term-abut
                                             ▲ flush against each other: a 1px clip parts the boxes   clip-path inset(0 0 0 1px)

   x² + [7]x + [ 12 ] = 0        x        [(x − 2)][(x + 5)] = 0
        └ tight-x  └ air        ───                   ▲ hairline
                               [ 4 ]  ← tight-y, wider than the glyph
```

The TeX rendered is the TeX in `data/practice.ts` (or the read line) with `\htmlClass` wrappers and nothing else; the tests assert its spacing equals the plain TeX's for every warm-up, at rest and lit.

## Verified by

vitest (338), eslint, tsc, `next build`; a headless sweep of every warm-up on offer (fractions, monic, null factor law, non-monic), writing each line of the working in turn, opening the hint offered at each point and hovering every linked word: no lit box in the problem or the read-as column intersects a glyph or fraction bar outside it, and no glyph moves between plain, wrapped and lit; 3× clips of each.
