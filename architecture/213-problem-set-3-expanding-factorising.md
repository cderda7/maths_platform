# 213: Problem Set 3 — Expanding and factorising, finished, with all twenty students' work

## Files touched

| File | What it does |
| --- | --- |
| `data/pset3/assignment.ts` (new) | `PS3_PROBLEMS`: ten hand-checked problems (`ps3-q1` … `ps3-q10`): expansion, (2x − 3)², (3x + 5)(3x − 5), x² − 49, two monic pairs, a perfect square, a common factor first, a pair expanded back, one non-monic by the split, a show-that. An identity line carries the binomial identity, the line simplifying it expansion. `PS3_ASSIGNMENT` (`pset-3`, Tue 1 Sep, New skills binomial identity); `PS3_PATHWAY`. |
| `data/pset3/evaluation.ts` (new) | `PS3_EVALUATION`: every line anyone wrote, keyed by problem then exact TeX. Shared names: "pair guessed, not expanded back" (Q5, Q8), "pair multiplies, doesn't add" (Q5, Q8), "sign flipped writing the pair" and "check copied from the question" (Q5, Q8), "squared each term separately" (Q2, Q10). Ethan's one-line wrong perfect square is wrong and a skipped step at once (`compounds`). |
| `data/pset3/classmates.ts` (new) | `PS3_SAM` (Q8's pair signs) and `PS3_CLASSMATES` (19 in class order), every record full. Header names the habits and who carries them. |
| `data/pset3/index.ts` (new) | `PS3: FinishedSet` on the default seating. |
| `data/pset3/pset3.test.ts` (new) | Set 3's particulars: Sam's one slip, Liam missing, who stops at nine, Jordan's / Mia's / Noah's mistake names, four columns at most per problem, top gap binomial identity 9 then monic factorising 7. |
| `data/finishedSets.ts` | The PS3 slot uncommented: `export { PS3 } from "./pset3";`. |
| `scripts/laptop-check.mjs` | `"pset-3"` uncommented: Set 3's Class, Mistakes, Groups and a report measured at 1280. |
| `app/teacher/TeacherMistakes.tsx` | The slip-chip row wraps chip by chip and a chip's name never wraps inside it (a lone column with two slips read "monic / factorising"). |

## How it connects

```
  data/pset3/
   assignment.ts ── PS3_PROBLEMS, PS3_ASSIGNMENT (pset-3, binomial identity new)
   evaluation.ts ── PS3_EVALUATION (every written line)
   classmates.ts ── PS3_SAM, PS3_CLASSMATES (20 full records)
   index.ts ────── PS3: FinishedSet
        │
        ▼
  data/finishedSets.ts  export { PS3 } from "./pset3"
        │
        ▼
  lib/finishedSets.ts  FINISHED_SETS (by due date: ... PS3, PS5)
     │                    │                     │
     ▼                    ▼                     ▼
  lib/assignments.ts   lib/evaluate.ts       lib/seating.ts
  REGISTRY             ps3-q* tables         default groups
     │
     ├─► /teacher Classroom: Past card "Problem Set 3 — Expanding and factorising",
     │                        19/20, top gap binomial identity
     ├─► /teacher/a/pset-3/{class,mistakes,groups,report}
     │        └─ mistakes ─► TeacherMistakes slip chips (wrap per chip, never inside one)
     └─► lib/setHistory.ts: Set 5 and 6 history show a real "PS3 · Tue 1 Sep" pill
                             in Algebra, Communication, Reasoning, New skills

  data/story.ts PS3 column (unchanged) ──► data/finishedSets.test.ts (Set 3 equals its rows)
```
