# 130 · More mistakes, more kinds of mistake

Routes: `/teacher/mistakes` (the shape shows here first), and everything else that reads the classmates: `/teacher`, `/teacher/report`, `/teacher/groups`, `/teacher/whole-class`, `/board`, the student's peers and group review.

## Files touched

| File | What it does |
|---|---|
| `data/evaluation.ts` | The per-line verdict table. Six new wrong lines (Q1 wrong pair, Q2 sign lost solving a factor, Q3 expansion sign, Q4 −b as −5, Q7 wrong pair after the third, Q9 −x with the sign left behind), each with its clue and note, and the `builtOn` lines a student writes after them; Q10's formal slip gains its follow-on sentence. |
| `data/classmates.ts` | The class. Eight new attempt scripts; 45 wrongs instead of 32 in the shape twelve (Q7) / one (Q6) / none (Q8); notes and clarifications extended to cover every wrong. The header comment records the shape. |
| `data/race.ts` | The other groups' scripted race. Mint's and violet's rows now have six and seven moments to match their unions, still two groups home before five minutes and two after nine. |
| `lib/*.test.ts` | `mistakes` (the shape), `standings`, `group`, `peers`, `examples`, `commentary`: expectations that named the old counts follow the data. No logic changed. |

## How it connects

```
 data/evaluation.ts                       data/classmates.ts
 ┌──────────────────────────────┐         ┌──────────────────────────────────────┐
 │ EVALUATION[q][tex] → verdict │◀────────│ attempts[q]: string[]  (every line   │
 │   wrong: clue, note, tags    │  keys   │   a key of EVALUATION[q])            │
 │   ok / builtOn / answer      │         │ wrong: q ids  · notes · clarification│
 └──────────────┬───────────────┘         └──────────────┬───────────────────────┘
                │ evaluateLine                            │ CLASSMATES
                ▼                                        ▼
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │ lib/mistakes  mistakesByProblem → rows per problem, slips = leaves of wrong  │──▶ /teacher/mistakes
 │               groupBySlip      → one pill per set of leaves                  │    (ticket 131 boxes
 │ lib/examples  bucketOf         → first wrong line's leaf → class review's    │     the exact line)
 │                                  examples (Q2 now has three buckets)         │──▶ /teacher/whole-class
 │ lib/peers     peerStruggles    → counts per problem (Q7 first with twelve)   │──▶ student peers
 │ lib/standings wrongSetsOf, unionOf → each group's union and total ───────────┼──▶ /board race
 │               + data/race.ts RACE_SCHEDULE[colour] (row length = union)      │
 │ lib/group     groupPlan        → the demo group's quick pass and discussion  │──▶ group review
 │ lib/commentary                 → notes as ideas, the clarification           │──▶ /teacher/report
 └──────────────────────────────────────────────────────────────────────────────┘
```

The identity of a mistake is the wrong line's entry in `EVALUATION`: its note is what the teacher reads, its clue what the student reads. Two students share a mistake when their wrong line is the same key; the skill pill groups on the entry's first tag. Q9's four "h = 6" students reach it by two routes (four lines or three) and are one mistake.

## Verified by

vitest (396), eslint, tsc, `next build`; `mistakes130.mjs` (port 3197 / CDP 9497): the problems present, every pill's label and span per problem, Q7 opened (twelve columns, one wrong line each, six / four / two by line), Q6, Q1, Q4, Q2, Q9, Q10 opened, and crops of the class view, report, groups and class review setup.
