# 327: Where students are: no "nobody yet"; a pill's time says "here" or "took"

## Files touched

| File | What it does |
| --- | --- |
| `lib/session.ts` | `StudentSession.checkInAt` (ms, 0 unknown). `overview/start` (straight to the check-in when the set has no goal) and `goal/continue` take an optional `at` and record it as the check-in. |
| `lib/session.test.ts` | The check-in time from either path; none without an `at`. |
| `app/student/StudentApp.tsx` | START and CONTINUE dispatch with `at: Date.now()`. |
| `lib/whereStudents.ts` | `duration(ms)` (was `stepTime`); `PillTime {kind: "here" \| "took", span}` on `WherePill.time`; `checkIns(set, session, now)`; `whereRows(places, problems, classmates, now, checkedIn)` picks the time: a hand-in "took" (`since − checkedIn[id]`), any other place "here" (`now − entered`). |
| `lib/whereStudents.test.ts` | Here from the row entry (Jordan's warm-up, Liam through his Q1 help and into Q2), took for every hand-in at the end and 90 minutes on, Sam's took from his session and none without a check-in. |
| `app/teacher/WhereStudentsAre.tsx` | `useWhereRows` passes `checkIns`; `StudentPill` draws `data-pill-time="here"` (figures in the fixed 46 px slot, then "here") or `data-pill-time="took"` ("took 7 min"); `PlaceTable` leaves an empty row and a folded range blank. |
| `tickets/327-…`, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `README.md` | Docs. |

## How it connects

```
 Sam's iPad                                         the stream (data/stream.ts, lib/stream.ts)
 START / CONTINUE ──{at: Date.now()}──▶ lib/session.ts    classmate timeline opens on the check-in at 0
                     checkInAt                            startedAt, pauses ─▶ wallAt(start, pauses, 0)
                         │                                          │
                         ▼                                          ▼
 lib/place.ts classPlaces (314) ─▶ {id, place, since}     lib/whereStudents.ts checkIns(set, session, now)
                         │                                          │ {sam: checkInAt, liam: start, …}
                         ▼                                          │
 lib/whereStudents.ts carryPlaces ─▶ {…, entered}                   │
                         │                                          │
                         ▼                                          ▼
 lib/whereStudents.ts whereRows(places, problems, classmates, now, checkedIn)
   place handed-in ─▶ time {kind: "took", span: duration(since − checkedIn[id])}   fixed
   any other place ─▶ time {kind: "here", span: duration(now − entered)}           ticks
                         │
                         ▼
 app/teacher/WhereStudentsAre.tsx  PlaceTable / StudentPill
 ┌──────────┬────────────────────────────────────────────────────────────┐
 │ Warm-up  │ (JW) Jordan Whitlock  non-monic factorising ▮▯▯  [23 s] here│  figures in a 46 px slot
 ├──────────┼────────────────────────────────────────────────────────────┤
 │ Q1       │                                                            │  blank, no "nobody yet"
 ├──────────┼────────────────────────────────────────────────────────────┤
 │ Handed in│ (PR) Priya Raman  took 4 min   (TR) Tomas Reyes  took 7 min │
 │          │ Chloe Abara absent                                         │
 └──────────┴────────────────────────────────────────────────────────────┘
```
