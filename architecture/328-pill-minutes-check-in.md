# 328: Where students are: times in whole minutes; three minutes in a row turns dark purple

## Files touched

| File | What it does |
| --- | --- |
| `lib/whereStudents.ts` | `duration(ms)` now "<1 min" / "N min". `CHECK_IN_MS` (3 min). `PillTime.checkIn`: on "here", `now − entered ≥ CHECK_IN_MS`; on "took", false. |
| `lib/whereStudents.test.ts` | The minute formatter; Jordan on Q8 at 2:59 (muted) and 3:00 (check-in) and 20 min; every other expectation carries `checkIn`. |
| `app/teacher/WhereStudentsAre.tsx` | `StudentPill`: the "here" span is `text-accent-dark` with `data-check-in` when `checkIn`, else `text-ink-muted`; "took" unchanged. |
| `tickets/328-…`, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `README.md` | Docs. |

## How it connects

```
 lib/whereStudents.ts whereRows (315, 327)
   place handed-in ─▶ time {kind: "took", span: duration(since − checkIn), checkIn: false}
   any other place ─▶ time {kind: "here", span: duration(now − entered),
                            checkIn: now − entered ≥ CHECK_IN_MS (3 min)}        ◀── 328
                         │
   duration(ms) ─▶ "<1 min" │ "1 min" │ "2 min" …                                ◀── 328
                         │
                         ▼
 app/teacher/WhereStudentsAre.tsx  StudentPill
 ┌──────────┬──────────────────────────────────────────────────────────────┐
 │ Q2       │ (PR) Priya Raman  [<1 min] here    (JW) Jordan  [2 min] here │  text-ink-muted
 ├──────────┼──────────────────────────────────────────────────────────────┤
 │ Q8       │ (LO) Liam O'Connell  [3 min] here                            │  text-accent-dark
 │          │                      └─ data-check-in                        │  #2f2491
 ├──────────┼──────────────────────────────────────────────────────────────┤
 │ Handed in│ (TR) Tomas Reyes  took 7 min                                 │  muted, never purple
 └──────────┴──────────────────────────────────────────────────────────────┘
```
