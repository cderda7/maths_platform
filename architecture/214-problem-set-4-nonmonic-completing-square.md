# 214: Problem Set 4 — Non-monic factorising and completing the square, finished, with all twenty students' work

## Files touched

| File | What it does |
| --- | --- |
| `data/pset4/assignment.ts` (new) | `PS4_PROBLEMS`: ten hand-checked problems (`ps4-q1` … `ps4-q10`): non-monic splits, the null factor law, x² − 3x = 10, completing the square twice, a(x + h)² + k with its turning point, a minimum value, a 35 cm² rectangle. `PS4_ASSIGNMENT` (`pset-4`, Fri 4 Sep, New skills binomial identity and null factor law), `PS4_PATHWAY`. |
| `data/pset4/evaluation.ts` (new) | `PS4_EVALUATION`: every line anyone wrote, keyed by problem then exact TeX; a wrong line carries its slip's leaf only. Shared names: guessed pair (Q1, Q2, Q4), square added never taken away (Q6, Q8, Q9), half of b wrong sign (Q6, Q7), turning point sign (Q8, Q9), fraction flipped solving a factor (Q3, Q4). |
| `data/pset4/classmates.ts` (new) | `PS4_SAM` and `PS4_CLASSMATES` (19, class order), every record full; some right problems carry a student's own shorter right working (Sam's and Oliver's Q4, Mia's Q2 and Q10, Grace's and Ethan's one-line problems). Header names the habits. |
| `data/pset4/index.ts` (new) | `PS4: FinishedSet` on the default seating. |
| `data/pset4/pset4.test.ts` (new) | Set 4's particulars: categories and New skills, Sam's four slips, who stopped where, habit names, card 54 mistakes / top gap non-monic 9 / graph features next 8, columns per problem. |
| `data/finishedSets.ts` | PS4 slot uncommented. |
| `scripts/laptop-check.mjs` | `"pset-4"` uncommented. |
| `data/story.ts`, `specs/class-story.md` | PS4 column only: Q1's outline 2x² + 3x − 2; Zara's square habit adds Q9, Ruby's pair habit adds Q4 (so the top gap can be non-monic factorising). No status changed. |

## How it connects

```
  data/pset4/
   assignment.ts ── PS4_PROBLEMS, PS4_ASSIGNMENT (pset-4, binomial + NFL new)
   evaluation.ts ── PS4_EVALUATION (every written line)
   classmates.ts ── PS4_SAM, PS4_CLASSMATES (20 full records)
   index.ts ────── PS4: FinishedSet
        │
        ▼
  data/finishedSets.ts  export { PS4 } from "./pset4"
        │
        ▼
  lib/finishedSets.ts  FINISHED_SETS (PS1, PS2, PS4, PS5 by due date)
        │                    │                     │
        ▼                    ▼                     ▼
  lib/assignments.ts   lib/evaluate.ts       lib/setHistory.ts
  registry: Classroom  table index by        Set 5 and Set 6 pills:
  card, Class, Groups, problem id            "PS4 · Fri 4 Sep", linked
  report                    │
        │                   ▼
        └────────► lib/mistakes.ts ──► app/teacher/TeacherMistakes.tsx
                   rows, slips          Q1 … Q10 cards

  data/story.ts (PS4 column) ──► data/finishedSets.test.ts  PS4 == records
          │
          └──► npm run story:sheet ──► specs/class-story.md
```
