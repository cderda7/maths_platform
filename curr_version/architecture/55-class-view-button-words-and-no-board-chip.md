# 55 · Class view: see skills / full breakdown / close, one hover target per student, no board chip

Routes: `/teacher` (the grid), `/teacher/board` (heading).

## Files touched

| File | What it does |
|---|---|
| `app/teacher/TeacherLive.tsx` | Header buttons: `all` = see skills (+ full breakdown unless flat); `levels` = only the expanded button when the expanded level is open; the active one reads "close" (`aria-label` "Close … for every student"). `RowGroup` is now a `<tbody className="group/row">` per student and the single `<tbody>` is gone, so `group-hover/row` covers the row and its drill row. `data-see-skills` reads "close" and calls `setOpen(null)` whenever `isOpen`, in any mode. `BoardIndicator` no longer imported or rendered |
| `app/teacher/BoardIndicator.tsx` | Deleted |
| `app/teacher/board/BoardControls.tsx` | Heading is `H1` alone; `useBatchedSession` no longer needed here |
| `lib/board.ts` | `boardWord` removed (its only reader was the indicator) |
| `lib/board.test.ts` | The `boardWord` assertions removed; `boardContent` tests unchanged |

## How it connects

```
   /teacher  TeacherLive
   ┌──────────────────────────────────────────────────────────────────────┐
   │ Class View                                                           │
   │ ROOTS OF A QUADRATIC — SET 3 · due Thu 10 Sep     (no Board · chip)  │
   │                                                                      │
   │ thead   STUDENT   [ALGEBRA] ──hover──▶ [see skills]                  │
   │                                        [full breakdown]              │
   │                    see skills open ──▶ [close] [full breakdown]      │
   │                    full breakdown open ▶ [close]        (one button) │
   │                                                                      │
   │ tbody.group/row  ┌─ tr  [PR] Priya Raman  [see dot skills] ● ● ● …  │
   │   (per student)  │                        [student report]           │
   │                  └─ tr  drill (RowDrill)                             │
   │    hover anywhere in the tbody ──▶ data-row-actions visible          │
   │    row open (button or dot)   ──▶ first button reads "close"        │
   └──────────────────────────────────────────────────────────────────────┘

   /teacher/board  BoardControls:  H1 "Board controls"   (indicator gone; lib/board.boardWord gone)
```

## Verified by

vitest (`lib/board.test.ts`, 8 tests); eslint and tsc clean; `next build`. Headless Chrome on the
built app (port 3131, CDP 9391), 19 assertions: no `data-board-indicator` and no "Board ·" text on
`/teacher` or `/teacher/board`; header words idle / groups open / expanded open as above; the
column closes from the lone "close"; with a column open the row actions are hidden until the mouse
is over the drill row, then visible with "see dot skills" / "student report"; opening a row reads
"close" (groups mode and category mode via a dot) and closes on click.
