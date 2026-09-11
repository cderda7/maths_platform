# 100 · A lit box around a whole fraction has more air above and below

Route: `/student?stage=practice` (the fractions warm-up's problem and read-as lines while a hint is open), the practice overlay.

## Files touched

| File | What it does |
|---|---|
| `lib/hint.ts` | `isFraction(text)`: a fragment beginning with `\frac`, `\dfrac` or `\tfrac` carries `hint-term-tall`, beside the per-axis classes of ticket 98. |
| `app/globals.css` | `.katex .hint-term-tall`: padding 0.2em above and below with the matching negative margin. |
| `lib/hint.test.ts` | The class per case; every wrapped whole fraction in the warm-up expectations. |

## How it connects

```
 data/practice.ts                lib/hint.ts  termTex(tex, terms, lit)                        app/globals.css
 "\dfrac{x}{4} + \dfrac{x}{2}…"  \htmlClass{hint-term hint-term-lit hint-term-tall}{\dfrac{x}{4}}   .hint-term          padding 0.08em 0.14em
   term "x terms"                          ▲ the fragment is a fraction                          .hint-term-tall     padding-top/bottom 0.2em
                                                                                                                     margin −0.2em (no movement)
      ┌─────┐
      │  x  │   ← 0.2em above the numerator
      │ ─── │
      │  4  │   ← 0.2em below the denominator
      └─────┘
   a digit's box keeps 0.08em: its cell already has air of its own above and below the ink
```

A fraction inside a wrapped fraction (the 4 of x/4 when "common denominator" is lit) still carries `hint-term-tight-y` (ticket 98): the inner box is tight against the bar, the outer one is tall.

## Verified by

vitest (338), eslint, tsc, `next build`; the ticket 98 headless sweep (every warm-up on offer, every line of the working written in turn, every hint word hovered) finds no overlaps and no glyph movement; 3× clips of the x/4 and x/2 boxes.
