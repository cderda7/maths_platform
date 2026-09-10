# 63 · Mistakes view: one pill spans the students who slipped on the same step; the header keeps only the difficulty tag

Route: `/teacher/mistakes`. Builds on ticket 62.

## Files touched

| File | What it does |
|---|---|
| `lib/mistakes.ts` | New `groupBySlip(rows)`: orders a problem's students so those with the same distinct slipped leaves sit together and returns `{ slips, start, rows }` per group |
| `lib/mistakes.test.ts` | Case for `groupBySlip` on hand-made rows and on the Q5 fixture |
| `app/teacher/mistakes/TeacherMistakes.tsx` | Header is label · equation · `DifficultyTag` at the right edge (no count, no leaf chips). One explicit grid per problem: tiles in row 1, a spanning `SlipChip` cell per group in row 2, working panels in row 3 when open |

## How it connects

```
   lib/mistakes.ts
   mistakesByProblem(session) ─▶ rows ─▶ groupBySlip(rows) ─▶ [{ slips, start, rows }]
                                                                    │  ordered = groups.flatMap(rows)
                                                                    ▼
   app/teacher/mistakes/TeacherMistakes.tsx      open: problemId | null
   ┌──────────────────────────────────────────────────────────────────────────────────┐
   │ Card per problem                                                                 │
   │  header:  Q5   y = x² − 4x − 5                                  [DifficultyTag]  │
   │  ──────────────────────────────────────────────────────────────────────────────  │
   │  <div grid  gridTemplateColumns: repeat(n, minmax(230px,1fr))>                   │
   │  row 1  ┃ button tile │ button tile │ button tile │ button tile ┃  (gridColumn i)│
   │         ┃  TR Tomas   │  HS Harper  │  RC Ruby    │  FD Finn    ┃                │
   │  row 2  ┃ ( quadratic )│ ( graph features ────────────────────── ) ┃  one cell per │
   │         ┃  span 1     │  span 3  (gridColumn: start+1 / span k)  ┃  SlipGroup    │
   │  row 3  ┃ lines       │ lines       │ lines       │ lines       ┃  only if open  │
   │  (open) ┃ wrong: red  │ wrong: red  │ wrong: red  │ wrong: red  ┃                │
   └──────────────────────────────────────────────────────────────────────────────────┘
        │ SlipChip (flex-1 justify-start: text left, 11.5px)
        ▼
   components/Tag.tsx  SlipChip ── --color-wrong-deep (unchanged from ticket 62)
   components/Tag.tsx  LeafChip ── no longer used on this screen
```

## Verified by

vitest (281 tests, one new); eslint and tsc clean; `next build`. A headless-Chrome run of the built app on port
3143 seeded the demo at "indiv review", opened `/teacher/mistakes` at 1600px and read the DOM for Q5: tiles in
the order Tomas, Harper, Ruby, Finn; two slip-group cells, "quadratic equations" over column 1 and "graph
features" spanning columns 2–4 (left 482px to right 1436px, exactly the three tiles' extent); the spanning
pill's computed font 11.5px, `justify-content: flex-start`, white background, `rgb(158, 47, 39)` border, and
its left edge at the same x as the name above it; the header text "Q5 … simple unfamiliar" with no "students"
word and no leaf chip, the tag's right edge 19px from the card's. Clicking Ruby's tile opened all four
columns with one red line each. Screenshots of Q2–Q10 closed and Q5 open were checked by eye.
