# 206: The fractions warm-up has a hint for writing the 6 over 2 and for adding 9/2 + 12/2

## Files touched

| File | What it does |
| --- | --- |
| `data/practice.ts` | The warm-up bank; the fractions warm-up now has one hint per line of its working (seven). |
| `lib/hint.test.ts` | Holds the fractions hint points, the new hints' boxes and `pickHint` at each line; the multi-point stall case is synthetic. |
| `lib/session.test.ts` | The reducer's hint walk on fractions, with the new indices. |
| `tickets/206-fractions-number-hints.md` | The ticket. |

## How it connects

```
  data/practice.ts  PRACTICES["algebra.number.fractions"]
    steps  0: … = 9/2 + 6     1: … = 9/2 + 12/2     2: … = 21/2     3 … 6
    hints  at [0] move the 6
           at [1] write the 6 over 2      ◄── new
           at [2] add the two numbers     ◄── new
           at [3] x terms' common denominator (was [1, 2, 3])
           at [4] [5] [6] as before
                         │
                         ▼
  lib/hint.ts   positionOf(lines) ─► pickHint / stalledHint ─► hintAnchor ("your line n")
                         │
                         ▼
  components/PracticePad.tsx ─► HintCard (linked words) ─► termTex lights the student's line in ReadAs
```
