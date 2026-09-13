# 208: Problem Set 2 becomes Problem Set 6, Problem Set 1 becomes Problem Set 5

## Files touched

| File | What it does |
| --- | --- |
| `data/assignment.ts` | The live fixture, now `pset-6` "PROBLEM SET 6 — ROOTS OF A QUADRATIC", due Thu 10 Sep; problems `q1` … `q10` unchanged. |
| `data/pset5/` (was `data/pset1/`) | The past set: `PS5_ASSIGNMENT` (`pset-5`, due Mon 7 Sep), `PS5_PROBLEMS` (`ps5-q1` … `ps5-q10`), `PS5_CLASSMATES` / `PS5_SAM`, `PS5_EVALUATION`, `pset5.test.ts`. |
| `data/draft-seed.ts` | Create's seeded title "Problem Set 6 — Roots of a quadratic". |
| `data/groups.ts`, `lib/evaluate.ts` | Import the renamed Set 5 modules (frozen groups, evaluation tables). |
| `lib/assignments.ts` | The registry's names; `LIVE_SET_BEFORE_CREATE` (was `PROBLEM_SET_2_BEFORE_CREATE`). |
| `lib/renamedSets.ts` (new) | Old id → new id, old seeded titles → new; `currentSetId`, `currentSetTitle`. No imports. |
| `next.config.ts` | `redirects()`: `/teacher/a/<old id>` and `/teacher/a/<old id>/:path*` → the new id (307, query kept). |
| `lib/classroom.ts` | `migrateClassroom` also renames a stored classroom (group copies' keys, the created set's and draft's seeded titles). |
| `lib/history.ts`, `lib/setHistory.ts`, `lib/stream.ts`, `lib/commentary.ts`, `lib/demo.ts`, `data/stream.ts`, `app/teacher/*` | Doc comments name the sets by their new numbers. |
| `lib/renamedSets.test.ts` (new), `lib/*.test.ts` | The map, the redirects, the migration, the history dates before Sep 7; the other tests follow the new ids. |
| `scripts/laptop-check.mjs` | Measures `/teacher/a/pset-6/…` and `/teacher/a/pset-5/…`. |

## How it connects

```
  old link /teacher/a/pset-2/mistakes?x          browser localStorage (pre-rename)
            │                                      classroom/v1: assignmentGroups{pset-2,pset-1},
            ▼                                                    assignment.title "PROBLEM SET 2 …"
  ┌───────────────────┐    reads    ┌─────────────────────┐        │
  │ next.config.ts    │◄────────────│ lib/renamedSets.ts  │        ▼
  │ redirects() 307   │             │ pset-2 → pset-6     │  ┌──────────────────────┐
  └─────────┬─────────┘             │ pset-1 → pset-5     │─►│ lib/classroom.ts     │
            │                       │ old seeded titles   │  │ migrateClassroom     │
            ▼                       └─────────────────────┘  │  (classroom-store    │
  /teacher/a/pset-6/mistakes?x                               │   load, every read)  │
            │                                                └──────────┬───────────┘
            ▼                                                           │ state under new ids
  app/teacher/a/[id]/layout ─ isAssignmentId ─► lib/assignments.ts ◄────┘
                                                 REGISTRY
                                                 ├─ pset-6 live  ◄─ data/assignment.ts
                                                 └─ pset-5 past  ◄─ data/pset5/*
                                                          │
                                   Classroom cards, tabs, history pills ("Sep 7")
```
