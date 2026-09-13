# 226: Group review starts with the description, every way in

## Files touched

| File | What it does |
| --- | --- |
| `lib/classroom.ts` | `group/restart { student }`: no run, that student not arrived. |
| `lib/classroom.test.ts` | The restart, and the intro showing on the next begin. |
| `app/student/StudentApp.tsx` | Restarts group review for a `?stage=class-wait` / `?stage=group` link; the gate and board effects wait for `now > 0` and for the store. |
| `tickets/226-group-intro-every-entry.md` | The ticket. |

## How it connects

```
 ways in                                         what starts the description
 ───────────────────────────────────────────     ─────────────────────────────────────────
 pathway: rework/done ─► class-wait ─► group/start ─┐
 teacher: force-review grace ends ─► group ─────────┤
 skip bar "group review" ─► skipFixture ────────────┼─► group/begin at boardOpensFor(start, now)
     (fresh classroom, run opens in 30 s)           │      (only once now > 0)
 link ?stage=group | class-wait                     │
   └─► group/restart (no run, not arrived) ─────────┘
                                                            │
                                                            ▼
                          GroupBoardScreen: now < run.startedAt ? GroupIntro : the board (Q1)
```
