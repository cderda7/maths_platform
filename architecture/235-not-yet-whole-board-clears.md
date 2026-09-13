# 235: Not yet shows the whole attempt, and a wrong check wipes the board

## Files touched

| File | What it does |
| --- | --- |
| `lib/groupReview.ts` | `markFirstMistake` (was `cutAtFirstMistake`): every line of an attempt, the first wrong one marked red; nothing hidden. |
| `lib/classroom.ts` | `groupReducer`'s `group/check`: a wrong check now empties the board's `strokes` as well as its `lines`. |
| `app/student/screens/GroupBoardScreen.tsx` | The Not yet card draws every marked line, caption "first mistake in red", no "more lines" row. |
| `lib/groupReview.test.ts` | Pins the whole-attempt marking and the wiped board. |
| `tickets/235-not-yet-whole-board-clears.md` | The ticket. |

## How it connects

```
 pen-holder presses Check
        │ dispatchClassroom({ type: "group/check" })
        ▼
 lib/classroom.ts  groupReducer
   checkBoard(problem, lines) ── wrong ──►  attempts[q] += { lines, correct: false }
                                            strokes: []  ◄235 (was kept)
                                            lines:   []
        │ classroom store (localStorage + BroadcastChannel, every member's iPad)
        ▼
 GroupBoardScreen.tsx
   ┌ board (PadSection) ───────┐   ┌ column ─────────────────────────────┐
   │ strokes [] → blank ruled  │   │ NOT YET · first mistake in red  ◄235 │
   │ next attempt starts clean │   │ markFirstMistake(q, last.lines) ◄235 │
   └───────────────────────────┘   │   every line, first wrong one red    │
                                   │ Hint (from the 2nd wrong check)      │
                                   │ Read as (run.lines, empty again)     │
                                   └──────────────────────────────────────┘
```
