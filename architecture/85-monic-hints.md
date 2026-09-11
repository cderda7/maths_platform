# 85 · The factorising warm-up has a hint for every point in the working, past the brackets to the null factor law

Routes: `/student?stage=practice` (the warm-up, second skill), the mid-set practice overlay for monic factorising.

## Files touched

| File | What it does |
|---|---|
| `data/practice.ts` | `w-monic`: five hints, `at` [0]…[4], the pair / sum / brackets hints linked to the student's line; `w-monic-2`: four hints, `at` [0]…[3] |
| `lib/hint.test.ts` | The fixture's `at` list and bracket terms; a walk through the warm-up's hints by position, and the follow-up's; the "general hint" case moved to the null factor law problem |
| `lib/session.test.ts` | A blank-pad student asking repeatedly gets every hint in order then nothing; one line read on the overlay gets the pair-check hint |

No code changed: `pickHint`, `hintAnchor` and the pad already do everything, the fixture just gives them more to pick from.

## How it connects

```
   x² + 7x + 12 = 0            student's lines                        pickHint → the hint for here
   ─────────────────           ─────────────────────────────────      ──────────────────────────────────────────────
   blank pad ─────────────────  (none)                          pos 0  [0] "two numbers that multiply to the constant…"  → the problem lit
   line 1 ───────────────────  3 × 4 = 12 (or a pair unplaced)  pos 1  [1] "…check it adds to 7 as well; the pairs to try…" → your line 1: 3, 4, 12
   line 2 ───────────────────  3 + 4 = 7                        pos 2  [2] "…those are your two numbers, one in each bracket"  → your line 2: 3, 4
   line 3 ───────────────────  (x + 3)(x + 4) = 0               pos 3  [3] "a product is only zero when a factor is; set each bracket to zero" → your line 3: (x + 3), (x + 4), 0
                                   │ still stuck, asks again           [4] "x + 3 = 0 and x + 4 = 0, mind the signs"  (ahead of its point → the problem, no linked words)
   line 4 ───────────────────  x² + 4x + 3x + 12 ✓              pos 4  [4] the same, for a student who checked first
   line 5 ───────────────────  x = −3 or x = −4                 pos 5  null → "None for this step"

   pickHint(problem, lines, shown):  here (at ∋ pos) → general (no at) → ahead (min at > pos) → null
   hintAnchor(hint, lines):          latest of hint.at written, else 0 (the problem)

   ┌ READ AS ─────────────────┐        ┌ HINT 2  your line 3 ───────────────────────────┐
   │ 3 × 4 = 12               │        │ The two [brackets] multiply to give [0]. A      │
   │ 3 + 4 = 7                │        │ product is only zero when one of its factors is │
   │ ▒ [(x + 3)] [(x + 4)] = 0 ▒ ◄──────│ zero, so set each bracket equal to zero…        │
   └──────────────────────────┘        └─────────────────────────────────────────────────┘
```

Why "zero" three times and "0" once: every whole-word occurrence of a linked phrase is boxed
(`hintSegments`), and four boxed 0s in one sentence read as noise on the pad.

## Verified by

vitest (328 tests, one new, three rewritten); eslint and tsc clean; `next build`; headless Chrome on
the built app (port 3184, CDP 9484), the factorising skill opened from the warm-up's chips: blank pad,
"hint" gives the opening hint; three strokes read as the product, the sum and the brackets, "another
hint" gives "Hint 2 · your line 3", the null factor law; hovering "brackets" lights exactly
`(x+3)` and `(x+4)`, in the read-as column, and that line carries `data-highlight`; a further ask
gives "Hint 3", the spelt-out equations, and the row then reads "another hint · None for this step";
two more strokes (solved), still "None for this step". Screenshots of the lit bracket line and the
three stacked hints.
