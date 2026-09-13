# 215: History pills read real earlier sets, link to them, and never jump

Routes: `/teacher/a/<id>/class` (history mode), `/teacher/a/<id>/class?history=<student>&open=<category>` (a real pill's link).

## Files touched

| File | What it does |
| --- | --- |
| `lib/history.ts` | Pure history maths. `HistoryPoint { date, status, set }`; `simulatedWalk` (a seeded one-step walk back from an anchor, Priya dark green); `simulatedDates` (a week before the first set, then weekdays up to it); `historyWith` (last five real results, topped up by the walk); `stepsApart`, `parseDay`, `formatDay`, `shortSetName`, `pillLabel`. The mixes, the shuffle and `HISTORY_DATES` are gone. |
| `lib/setHistory.ts` | Reads the Classroom's registry for a history. `HistorySource` (name, day, scope, records); `assessed` (home category touched, or New skills listed); `resultsFrom`; `historyFrom` (the core, fed synthetic sets in tests); `earlierSources(id)` via `earlierAssignmentIds` + `assignmentBundle` only; `categoryHistory({ id, due }, …)`; `historyPillHref`. |
| `app/teacher/TeacherLive.tsx` | `HistoryBlocker` draws a real pill as a `Link` with a focus ring and a set-naming aria-label, a simulated one as a span, the stack as a `role="list"`. In history mode a category cell's pill fills its column less 1 px a side, and history labels drop side padding and tracking, so "PS5 · MON 7 SEP" fits. `init` (`ClassViewInit`) opens history mode on a linked student with that category's stack open, scrolls the row into view and drops the query. |
| `app/teacher/a/[id]/class/page.tsx` | Reads `?history` and `?open` and hands them to `TeacherLive` as `init`. |
| `lib/history.test.ts` | The walk, the dates, the labels, Priya. |
| `lib/setHistory.test.ts` (new) | A synthetic six-set registry (skips graphing on two sets, New skills on one): reaching back, the last five, simulated fill and dates for any first day, one-step walks. The real registry: Set 6's pills, Set 5's all simulated, and every set × student × category checked for jumps (`KNOWN_REAL_JUMPS`: the 20 real Set 5 → Set 6 jumps for ticket 210's story sheet). |
| `data/pset5/pset5.test.ts`, `lib/renamedSets.test.ts` | Ticket 187's history tests moved to `lib/setHistory.test.ts`; the dates test reads `categoryHistory`. |

## How it connects

```
 lib/assignments.ts REGISTRY (Set 6 live, Set 5 finished, 211–214 as they land)
        │  earlierAssignmentIds(id)   assignmentBundle(e, null)
        ▼
 ┌───────────────────────────── lib/setHistory.ts ─────────────────────────────┐
 │ earlierSources(id) ─► HistorySource[] (oldest first: name, due, scope, record)│
 │        │                                                                     │
 │        ▼                                                                     │
 │ historyFrom(earlier, ownDue, student, category, today)  ◄── tests: synthetic │
 │   resultsFrom: assessed(set, cat)? ─► classmateHierarchy(record, set)        │
 │   firstDue = earlier[0].due ?? ownDue                                        │
 └────────┬─────────────────────────────────────────────────────────────────────┘
          ▼
 ┌───────────────────────────── lib/history.ts ────────────────────────────────┐
 │ historyWith: last five real ──┐                                              │
 │   missing = 5 - real          ├─► [ simulated … , real … ]  (HistoryPoint)   │
 │   simulatedWalk(anchor=oldest coloured real ?? today)                        │
 │   simulatedDates(firstDue): firstDue-7d, weekdays < firstDue                 │
 │ pillLabel: "PS5 · Mon 7 Sep" | "Fri 21 Aug"                                  │
 └────────┬─────────────────────────────────────────────────────────────────────┘
          ▼
 app/teacher/TeacherLive.tsx  HistoryBlocker (cream + stacks, ticket 175 geometry)
   real pill ─ <Link href=historyPillHref(set, student, cat)> ──┐
   simulated pill ─ <span>                                      │
                                                                ▼
 /teacher/a/pset-5/class?history=mia&open=graphing
   app/teacher/a/[id]/class/page.tsx ─ searchParams ─► TeacherLive init
     ─► history mode on mia, graphing open, row scrolled into view, query replaced
```
