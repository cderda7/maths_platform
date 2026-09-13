# 228: Group review's debrief moves on by itself, never goes back, and Sam writes Q7

## Files touched

| File | What it does |
| --- | --- |
| `lib/debrief.ts` | `pendingDebrief` (latest closed problem only), `debriefEndsAt`. |
| `app/student/StudentApp.tsx` | The demo's clock loop: ends the debrief at its time, moves the group on, passes `DEMO_PENS` to `group/begin`. |
| `app/student/screens/GroupDebrief.tsx` | Doc comment: Next goes by itself. |
| `lib/groupReview.ts` | `GroupRun.pens`, `beginRun(…, pens)`; `visitsOf` gives a pinned problem's return the same pen. |
| `lib/classroom.ts` | `group/begin` carries `pens`. |
| `data/group-scripts.ts` | `DEMO_PENS`, the simulation's exception to the shuffle. |
| `lib/demo.ts` | The group-review and report jumps begin with `DEMO_PENS`. |
| `lib/*.test.ts` | Debrief, pens, the jump's pen order. |

## How it connects

```
 closedInOrder(run) ──► .at(-1) ──► pendingDebrief ──► GroupBoardScreen shows GroupDebrief
                                        │
 StudentApp clock (1 s) ────────────────┤ now ≥ debriefEndsAt = close + 2 s + 10 s
                                        ▼
                             debrief/done (session)  +  group/next (if the group is still on it)

 group/begin { members, problems, pens: DEMO_PENS }   ◄── StudentApp, lib/demo.ts jumps
        │
        ▼
 beginRun ─► pen = dealt ∪ pinned ─► visitsOf: first pass  Q1 sam · Q2 zara · Q3 jordan · Q7 sam · Q9 liam · Q10 zara
                                               return      Q7 sam (pens.q7), else the next in the deal
```
