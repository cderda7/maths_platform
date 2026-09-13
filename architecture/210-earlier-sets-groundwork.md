# 210: Groundwork for the earlier sets: one list of finished sets, a shared suite, the class story sheet

## Files touched

| File | What it does |
| --- | --- |
| `data/finishedSet.ts` (new) | `FinishedSet`: a finished set's fixture, name, pathway, Sam, nineteen classmates, evaluation table, optional frozen groups. Type only. |
| `data/finishedSets.ts` (new) | The list: one `export { PSN } from "./psetN";` per set, commented blank-separated slots for PS1–PS4 (tickets 211–214). |
| `data/pset5/index.ts` (new) | `PS5`, Set 5 as a `FinishedSet`. |
| `data/pset5/classmates.ts`, `data/pset5/evaluation.ts` | Nine students' Set 5 work changed so no category jumps more than one step to Set 6; the axis-for-height line tagged graph features; unused lines dropped; header lists the habits. |
| `data/pset5/pset5.test.ts` | Only Set 5's particulars (card 47 mistakes, top gap graph features 9, non-monic next on 7; Q4 rows). |
| `lib/finishedSets.ts` (new) | `FINISHED_SETS` (every export of the list, oldest due first), `finishedSetById`. |
| `lib/dueDate.ts` (new) | `dueOrder`, moved from `lib/classroomCards.ts` (re-exported there). |
| `lib/assignments.ts` | `REGISTRY` = the live set, then `FINISHED_SETS` newest first; public read functions unchanged. |
| `lib/evaluate.ts` | The table index = Set 6's `EVALUATION` + every finished set's `evaluation`. |
| `lib/seating.ts`, `data/groups.ts` | A finished set's frozen groups come from the set (`groups ?? DEFAULT_GROUPS`); `FROZEN_GROUPS` holds only the live set. |
| `data/story.ts` (new) | The class story sheet, single source: `STORY_SETS` (PS1–PS6: due, New skills, pathway, categories, outlines for 1–4, top gap) and `STORY` (20 students × 6 categories × 6 sets: status, habits with problem numbers, hand-in counts, an arc). |
| `lib/classStory.ts` (new) | `recordStatus`, `missedProblems` (real records against the sheet), `renderClassStory` (the markdown), `storySetOf`. |
| `specs/class-story.md` (new, generated) | The sheet for people; `npm run story:sheet` rewrites it. |
| `data/story.test.ts` (new) | The sheet: complete, habits placed, one step, Priya, Set 6 rows equal the real end state, markdown up to date. |
| `data/finishedSets.test.ts` (new) | The shared suite over every registered finished set, including equality with its sheet column. |
| `lib/setHistory.test.ts`, `lib/assignments.test.ts`, `lib/renamedSets.test.ts` | Registry-derived assertions; `KNOWN_REAL_JUMPS` removed, no jumps allowed. |
| `scripts/laptop-check.mjs` | `FINISHED_SETS` list with slots; each measured on Class, Mistakes, Groups, a report. |
| `package.json` | `story:sheet` script. |
| `tickets/211`–`214` | Exact files, slot, sheet column, authoring notes. |

## How it connects

```
  data/psetN/ (211-214)        data/pset5/
  assignment evaluation         assignment.ts evaluation.ts classmates.ts
  classmates index.ts ─┐        index.ts  PS5: FinishedSet
                       │              │
                       ▼              ▼
          data/finishedSets.ts   export { PS5 } from "./pset5"   (one line per set)
                       │
                       ▼
          lib/finishedSets.ts  FINISHED_SETS (oldest due first, lib/dueDate.dueOrder)
            │                  │                         │
            ▼                  ▼                         ▼
   lib/assignments.ts    lib/evaluate.ts           lib/seating.ts
   REGISTRY live+past    TABLES by problem id      frozen groups
     │ assignmentIds / earlierAssignmentIds / assignmentBundle / recentSets
     ├─► Classroom cards, Class / Mistakes / Groups tabs, reports
     ├─► lib/setHistory.ts (history pills, ticket 215)
     └─► Create's New skills inference (recentSets)

  data/story.ts  STORY_SETS + STORY ─────► lib/classStory.ts renderClassStory ─► specs/class-story.md
        │                                         ▲ recordStatus, missedProblems
        ├─► data/story.test.ts  complete, one step, Set 6 == data/classmates.ts end state
        └─► data/finishedSets.test.ts  describe.each(FINISHED_SETS): contract + column n == records
```
