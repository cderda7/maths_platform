# 222: A third wrong check leaves the problem for now; still wrong on the return, it closes unsolved

## Files touched

| File | What it does |
| --- | --- |
| `lib/groupReview.ts` | The whiteboard's rules: the derived itinerary (`visitsOf`, `dealPens`), `leaving`/`leaveAt`, closed vs resolved vs unsolved, per-visit `turnScript`, progress over closed problems. |
| `lib/classroom.ts` | The classroom reducer: `group/leave`, unsolved on a return's wrong check, `group/next` over visits, scripted `clear`. |
| `app/student/StudentApp.tsx` | The demo's clock: leaves on time, moves on after a close, plays the visit's script. |
| `app/student/screens/GroupBoardScreen.tsx` | The board: leaving notice, "comes back" pill, "last try". |
| `lib/debrief.ts`, `app/student/screens/GroupDebrief.tsx` | The debrief: close order, the unsolved variant beside the group's last try. |
| `lib/standings.ts` | The group bars (student header, teacher card) count closed problems. |
| `data/group-scripts.ts`, `data/classmates.ts`, `data/evaluation.ts` | Q7's four wrong tries; the new wrong line. |
| `lib/demo.ts` | The report jump's finished run with Q7 unsolved. |
| `lib/*.test.ts` | Itinerary, leave, return, unsolved, scripts, progress, debrief, report, standings. |

## How it connects

```
 GroupRun (classroom store)
   problems ─┐          left ─┐   seed ─► dealPens
             ▼                ▼
   visitsOf: Q1 Q2 Q3 Q7 Q9 Q10 │ Q7 (return)
   index ────────────────────────────────▲ currentVisit ─► pen, returning

 Q7, first visit (Liam)                        Q7, return (Jordan)
  check ✗ ─► Not yet                            check ✗ ─► unsolved[q7], unsolvedAt
  check ✗ ─► Not yet + Hint (221)                         │
  check ✗ ─► leaving ── LEAVE_PAUSE_MS ──► group/leave    ▼
                        (StudentApp loop,     left[q7]  GroupDebrief (unsolved):
                         index-guarded)       index+1     Handed in · Reworked · Group's last try
                                                          "not solved yet · we'll look at it together"
                                                          2 s ─► marks ─► 10 s ─► finish ─► done

 groupProgress = members' mistakes on (resolved ∪ unsolved) / all  ─► GroupBar 100%, teacher card 100%
```
