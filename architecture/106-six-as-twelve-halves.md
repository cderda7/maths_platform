# 106 · The fractions worked example writes the 6 as 12/2 before combining the numbers

Route: `/student?stage=practice` (the fractions warm-up), "I need help" → "worked example"; the same steps drive the hint placement on the pad.

## Files touched

| File | What it does |
|---|---|
| `data/practice.ts` | The fractions working (`w-fractions`) has a new step at index 1, "x/4 + x/2 = 9/2 + 12/2" ("Wrote the 6 over 2, to match the other fraction"), tagged fractions. The hints after the first are placed by line, so their `at` lists moved down one: `[1, 2, 3]` for the common-denominator hint (the new line included), `[4]`, `[5]`, `[6]` for the rest. |
| `lib/hint.test.ts` | Every index into the fractions steps moved with the step; pins the first three lines and the `at` lists; the stall test covers a hint written for three points. |
| `lib/session.test.ts` | The skip-ahead case reads five steps (to 3x/4 = 21/2) before asking, then the sixth. |

## How it connects

```
 data/practice.ts  w-fractions.steps                     hints[i].at (a line number, 0 = blank pad)
 ┌────────────────────────────────────────────────┐      ┌──────────────────────────────────────┐
 │ 0  x/4 + x/2 = 9/2 + 6      moved the 6        │◀── 1 │ [1,2,3] common denominator (x/4, x/2) │
 │ 1  x/4 + x/2 = 9/2 + 12/2   6 over 2   ◀ NEW   │◀── 2 │        … the linked fragments are on  │
 │ 2  x/4 + x/2 = 21/2         combined           │◀── 3 │        … all three lines              │
 │ 3  x/4 + 2x/4 = 21/2        common denominator │◀── 4 │ [4] same denominator, numerators      │
 │ 4  3x/4 = 21/2              like terms         │◀── 5 │ [5] clear the 4, other side           │
 │ 5  3x = 42                  times 4            │◀── 6 │ [6] undo the 3                        │
 │ 6  x = 14                   divide by 3        │      │ (blank pad: [0] move the 6)           │
 └────────────────────────────────────────────────┘      └──────────────────────────────────────┘
          │                                                        │
          ▼                                                        ▼
 components/PracticeCard.tsx                              lib/hint.ts
   reveals steps[0..shown) one per press                    positionOf(lines) = index of the step the
   ("First step" / "Next step", gone after the 7th)         last read line matches + 1
                                                            pickHint / stalledHint read hints[i].at
                                                            against that position (unchanged code)
```

Nothing in `lib/` or `components/` changed: the pad places hints by matching the student's last read line to a step, so a new step is data plus the `at` lists that name lines by number.

## Verified by

vitest (340), eslint, tsc, `next build`; a headless click-through (`example106.mjs`): the fractions pad's problem, seven reveals in order with each step's TeX read from KaTeX's annotation, the second step's four fractions on one baseline, the reveal button gone after the last; the lit box sweep (`npm run sweep:hint-boxes` against the build): 30 checks pass, the fractions rows now including the 12/2 line with the common-denominator hint lit.
