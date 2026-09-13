# 211: Problem Set 1 — Surds, finished, with all twenty students' work

## Files touched

| File | What it does |
| --- | --- |
| `data/pset1/assignment.ts` (new) | `PS1_PROBLEMS`: ten hand-checked surd problems (`ps1-q1` … `ps1-q10`), every line written whole and tagged; `PS1_ASSIGNMENT` (`pset-1`, Tue 25 Aug, New skills surds); `PS1_PATHWAY`. |
| `data/pset1/evaluation.ts` (new) | `PS1_EVALUATION`: every line anyone wrote, keyed by problem then exact TeX. Surd slips carry surds alone (New skills, the top gap); fraction, expansion and linear slips carry their Algebra leaf alone. Shared names: "square out, root not taken" (Q2, Q4, Q5), "square factor left under root" (Q1, Q6). |
| `data/pset1/classmates.ts` (new) | `PS1_SAM` (all right) and `PS1_CLASSMATES` (19 in class order), every record full: confidence, done, wrong, attempts, notes, clarification, group line. Header names the habits. |
| `data/pset1/index.ts` (new) | `PS1: FinishedSet` on the default seating. |
| `data/pset1/pset1.test.ts` (new) | Set 1's particulars: Sam's record, who stopped where, each student's mistake names, card 15 mistakes / top gap surds 7 / fractions next 3, the Mistakes names per problem and three columns at most. |
| `data/finishedSets.ts` | The PS1 slot uncommented: `export { PS1 } from "./pset1";`. |
| `scripts/laptop-check.mjs` | `"pset-1"` uncommented: Set 1's Class, Mistakes, Groups and a report measured at 1280. |
| `data/story.ts`, `specs/class-story.md` | PS1 column only: Chloe gains "√60 taken as 4√15" (Q5), Oliver "√(72 + 72) split" (Q10), Ruby's habit reads "a square factor left under the root" (Q1, Q6). Statuses unchanged; Q5, Q6 and Q10 needed a wrong student for the Mistakes tab to list all ten problems. |
| `lib/renamedSets.ts`, `lib/renamedSets.test.ts`, `lib/classroom.ts` (comment) | `pset-1` is no longer an old id mapped to `pset-5`: it is Set 1's own, so its routes are not redirected and its stored seating stays its own. `pset-2 → pset-6` untouched. |
| `lib/setHistory.test.ts` | `unregisteredBetween`: while Sets 2–4 are not registered, a real pair Set 1 → Set 5 is not a neighbour pair of the sheet and is skipped; inert once every sheet set is registered. |

## How it connects

```
  data/pset1/
   assignment.ts ── PS1_PROBLEMS, PS1_ASSIGNMENT (pset-1, surds new)
   evaluation.ts ── PS1_EVALUATION (every written line)
   classmates.ts ── PS1_SAM, PS1_CLASSMATES (20 full records)
   index.ts ────── PS1: FinishedSet
        │
        ▼
  data/finishedSets.ts  export { PS1 } from "./pset1"
        │
        ▼
  lib/finishedSets.ts  FINISHED_SETS [PS1, PS5] (by due date)
     │                    │                     │
     ▼                    ▼                     ▼
  lib/assignments.ts   lib/evaluate.ts       lib/seating.ts
  REGISTRY             ps1-q* tables         default groups
     │
     ├─► /teacher Classroom: Past card "Problem Set 1 — Surds", 20/20, top gap surds
     ├─► /teacher/a/pset-1/{class,mistakes,groups,report}
     └─► lib/setHistory.ts: Sets 5 and 6 history show a real "PS1 · Tue 25 Aug" pill
                             in Algebra, Communication, Reasoning, New skills

  next.config.ts ── RENAMED_SET_IDS (pset-2 → pset-6 only) ── no redirect on /teacher/a/pset-1

  data/story.ts PS1 column ──► data/finishedSets.test.ts (Set 1 equals its rows)
                          └──► specs/class-story.md (npm run story:sheet)
```
