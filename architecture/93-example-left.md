# 93 · The worked example card is left-justified

Route: `/student?stage=practice` (any warm-up's worked example, and the compact card beside the follow-up), the practice overlay.

## Files touched

| File | What it does |
|---|---|
| `app/globals.css` | `.math-left .katex-display` and `.math-left .katex-display > .katex` are `text-align: left`, unlayered, beside the other KaTeX overrides. |
| `components/PracticeCard.tsx` | The card carries `math-left`; the two-case row and the reveal button no longer centre themselves. |

## How it connects

```
 PracticeCard  <Card class="math-left p-7">
 ┌────────────────────────────────────────────┐
 │ Solve.                         [fractions] │
 │ x/4 + x/2 − 6 = 9/2      ← .katex-display  │   KaTeX: .katex-display { text-align: center }
 │ ────────────────────────────────────────── │          .katex-display > .katex { display: block; text-align: center }
 │ x/4 + x/2 = 9/2 + 6      ← [data-step]     │   globals.css (unlayered, after katex.css):
 │ x/4 + x/2 = 21/2                           │          .math-left .katex-display,
 │ [x = −3] [x = −4]        ← [data-branches] │          .math-left .katex-display > .katex { text-align: left }
 │ [ Next step ]                              │
 └────────────────────────────────────────────┘
   every first glyph and the button on the card's content edge
```

Why not a utility: Tailwind's utilities sit in a cascade layer and KaTeX's stylesheet does not, so an unlayered rule from KaTeX beats any utility on the same element whatever its specificity (see the "Unlayered CSS beats utilities" note). The override has to be unlayered as well, which is what `globals.css` already does for `.katex-display { margin: 0 }`.

## Verified by

vitest (337), eslint, `next build`; a headless click-through of the fractions and factorising
warm-ups measuring the first glyph of the problem and of every step, the two-case boxes and the
Next step button: all at x 463 against a content edge of 462 (compact card: 159 against 158).
The first attempt set `text-align` on `.katex-display` alone and measured the block, not the
glyphs, which is why the inner `.katex` rule and the glyph measurement are both there.
