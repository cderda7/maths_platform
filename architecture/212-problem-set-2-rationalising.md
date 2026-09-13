# 212: Problem Set 2 — Rationalising and expanding with surds, finished

## Files touched

| File | What it does |
| --- | --- |
| `data/pset2/assignment.ts` (new) | `PS2_PROBLEMS`: ten hand-checked problems `ps2-q1` … `ps2-q10` (surd brackets, (√7 + 2)², (3 − √2)(3 + √2), rationalising single-term and conjugate denominators, conjugate fractions added, the rectangle's area and diagonal), every step tagged; `PS2_ASSIGNMENT` (`pset-2`, Fri 28 Aug, New skills surds + binomial identity); `PS2_PATHWAY`. |
| `data/pset2/evaluation.ts` (new) | `PS2_EVALUATION`: every line anyone wrote, keyed by problem then exact TeX, with verdicts, tags (first tag = the Mistakes cluster), clues, notes and names. |
| `data/pset2/classmates.ts` (new) | `PS2_SAM` and the nineteen `PS2_CLASSMATES`, each with confidence, `done`, `wrong`, the working, notes, words and a group line; header lists the habits. |
| `data/pset2/index.ts` (new) | `PS2: FinishedSet`. |
| `data/pset2/pset2.test.ts` (new) | Set 2's particulars: Sam's slips, the named habits, the top gap's lead (binomial identity 9, expansion 8, fractions 7), four columns at most. |
| `data/finishedSets.ts` | The PS2 slot uncommented: `export { PS2 } from "./pset2";`. |
| `scripts/laptop-check.mjs` | `"pset-2"` measured on Class, Mistakes, Groups and a report. |
| `data/story.ts`, `specs/class-story.md` | Set 2's column only: Amelia's New skills habit is on Q7 and Q8, Grace's communication habit on Q5, Q6 and Q7 (statuses unchanged); sheet regenerated. |
| `lib/renamedSets.ts`, `lib/renamedSets.test.ts`, `lib/classroom.ts` | `pset-2` is no longer an old id: no redirect to Set 6, and seating stored under `pset-2` stays Set 2's. |

## How it connects

```
  data/pset2/assignment.ts ──┐
  data/pset2/evaluation.ts ──┼──► data/pset2/index.ts  PS2: FinishedSet
  data/pset2/classmates.ts ──┘              │
                                            ▼
                         data/finishedSets.ts  export { PS2 } from "./pset2"
                                            │
                                            ▼
                         lib/finishedSets.ts  FINISHED_SETS (by due date)
             ┌──────────────────┬───────────┴──────────┬─────────────────────┐
             ▼                  ▼                      ▼                     ▼
   lib/assignments.ts     lib/evaluate.ts        lib/seating.ts       lib/setHistory.ts
   pset-2 bundle          ps2-q* tables          default groups       Set 6 pills "PS2 · Fri 28 Aug"
             │
             ├─► /teacher Classroom card (top gap binomial identity, 20/20)
             └─► /teacher/a/pset-2/{class,mistakes,groups,report}

  lib/renamedSets.ts  RENAMED_SET_IDS without pset-2 ──► next.config.ts (no redirect)
                                                     └─► lib/classroom.ts migrateClassroom (keeps pset-2 seating)

  data/story.ts (PS2 column) ──► data/finishedSets.test.ts equality ◄── PS2 records
```
