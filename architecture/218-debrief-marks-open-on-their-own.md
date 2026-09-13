# 218: The group debrief has nothing to write; the marks open on their own

## Files touched

| File | What it does |
| --- | --- |
| `lib/debrief.ts` | The debrief's pure rules: marked versions, `UNMARKED_MS` / `marksAt` / `marksOpen` (new), the hold, the pending debrief. The prompt rules are removed. |
| `lib/debrief.test.ts` | Tests the five-second timing, that it plus the hold fits a peer's wait, and `debrief/done`; the prompt and note tests are removed. |
| `lib/session.ts` | `DebriefNote` is `{ done }`; only `debrief/done` remains. |
| `app/student/screens/GroupDebrief.tsx` | The debrief screen: three versions, marks from `marksOpen`, then a reflect + Next row that holds its space until then. |
| `lib/report.ts`, `app/teacher/report/TeacherReport.tsx` | The report facts and card lose the group notes; Starred stands alone. |
| `tickets/218-debrief-marks-open-on-their-own.md` | The ticket. |

## How it connects

```
 classroom store (group run)                     student session
   group/check ─► resolvedAt[q] ──┐                 debrief[q] = { done }
                                  │                        ▲
                                  ▼                        │ debrief/done
 GroupBoardScreen ─► pendingDebrief ─► GroupDebrief ───────┘ (+ group/next if still on q)
                                         │
       now ◄── useNow (1 s tick)         │ marksOpen(resolvedAt, now)?
                                         ▼
     t from check     0 s ─────────── 5 s ──────────────────────── 15 s ───►
     versions         unmarked (green)│ marked (red / blue)
     bottom row       invisible       │ "take a moment to reflect" [next ◌] │ [next]
                                   marksAt            holdProgress         holdOver
```
