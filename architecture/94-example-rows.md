# 94 · Every worked example step is a ruled row, spaced like the problem and the first step

Route: `/student?stage=practice` (any warm-up's worked example, and the compact card beside the follow-up), the practice overlay.

## Files touched

| File | What it does |
|---|---|
| `components/PracticeCard.tsx` | The rule and the air move from the `<ol>` to each step `<li>` (`row`: `mt-6 border-t border-line pt-6`, compact `mt-4 … pt-4`); the button `<li>` keeps the top margin only. |

## How it connects

```
 PracticeCard
 ┌──────────────────────────────────┐
 │ Solve.               [fractions] │
 │ x/4 + x/2 − 6 = 9/2              │  problem
 │                                  │  24px   ┐
 │ ──────────────────────────────── │  rule   │ one row per step:
 │                                  │  24px   │ li.row = mt-6 border-t border-line pt-6
 │ x/4 + x/2 = 9/2 + 6              │  step 1 ┘
 │                                  │  24px
 │ ──────────────────────────────── │  rule
 │                                  │  24px
 │ x/4 + x/2 = 21/2                 │  step 2
 │                                  │  24px   (li.mt-6, no rule)
 │ [ Next step ]                    │
 └──────────────────────────────────┘
```

Before any step is shown the button sits 24px under the problem with no rule: the rule belongs to a step.

## Verified by

vitest (337), eslint, `next build`; a headless click-through of the fractions and factorising
warm-ups measuring, for every step, glyphs-above to rule (24) and rule to own glyphs (25, the rule
included), the button under the last step (24), and the compact card (16 and 17).
