# 81 · Q5's turning point is two lines, the height then the point

Routes: `/student?stage=working` (Q5 on the pad), `…?stage=feedback` (the individual review), `…?stage=history`, the teacher's mirror.

## Files touched

| File | What it does |
|---|---|
| `data/assignment.ts` | Q5's solution ends `y = 4 - 8 - 5 = -9` ("Height on the axis", graph features) then `(2, -9)` ("Turning point", graph features + sketching) |
| `data/recognition.ts` | `RECOGNITION.q5` reads those two lines, five in all |
| `data/evaluation.ts` | Two correct keys replace the one packed key |
| `lib/evaluate.test.ts` | Pins the two closing lines, labels, verdicts; no `\quad` on Q5 |

## How it connects

```
   data/assignment.ts  Q5.solution            data/recognition.ts  RECOGNITION.q5         data/evaluation.ts  q5
   ┌────────────────────────┬──────────────┐   ┌────────────────────────┐                 ┌────────────────────────┬────┐
   │ (x - 5)(x + 1) = 0     │ Factorised   │   │ (x - 5)(x + 1) = 0     │ burst 1         │ (x - 5)(x + 1) = 0     │ ok │
   │ x = 5 or x = -1        │ x-intercepts │   │ x = 5 or x = -1        │ burst 2         │ x = 5 or x = -1        │ ok │
   │ x = (5 + (-1))/2 = 2   │ Axis         │   │ x = (5 + (-1))/2 = 2   │ burst 3         │ x = (5 + (-1))/2 = 2   │ ok │
   │ y = 4 - 8 - 5 = -9     │ Height  (new)│   │ y = 4 - 8 - 5 = -9     │ burst 4 (new)   │ y = 4 - 8 - 5 = -9     │ ok │
   │ (2, -9)                │ Turning point│   │ (2, -9)                │ burst 5 (new)   │ (2, -9)                │ ok │
   └────────────────────────┴──────────────┘   └────────────────────────┘                 └────────────────────────┴────┘
             │ model solution                          │ nextLine per burst                        │ evaluateLine(q5, tex)
             ▼                                         ▼                                           ▼
   worked solution / teacher view          session.lines.q5 (5 lines)  ──►  FeedbackScreen [data-lines]: 5 rows, roots branched
```

## Verified by

vitest (319 tests); eslint and tsc clean; `next build`; headless Chrome on the built app (port 3153,
CDP 9441): `/student?stage=feedback`, Q5 picked from the list ("Q5 · 5 lines") → "What you submitted"
shows five rows, the roots side by side, then the axis, `y = 4 − 8 − 5 = −9`, `(2, −9)`; screenshot.
