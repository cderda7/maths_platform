# 180 · The row buttons come back at once left of the row's first pill

Route: `/teacher` (the roster).

## Files touched

| File | What it does |
|---|---|
| `app/teacher/TeacherLive.tsx` | `markerMove` (delegated `onPointerMove` on each student's `RowGroup` tbody): while the grid is not quiet and the pointer is off every marker, if the pointer's x is left of the row's first `[data-dot]` button it clears the grace timer and sets `pillQuiet` at once. `RowGroup` takes `onPointerMove`. The `PILL_GRACE_MS` comment and the row-actions comment record the exit. |
| `README.md` | The grace sentence: the second is waived left of the row's first pill; the stray "See history in…" reads "See history". |

## How it connects

```
 pointer over a marker ([data-dot] / [data-node])  ──▶ markerOver: clear timer, pillQuiet = false   (ticket 131)
 pointer leaves it                                 ──▶ markerOut:  timer(1 s) ──▶ pillQuiet = true
 pointer moves inside the tbody                    ──▶ markerMove (ticket 180):
        quiet already, or over a marker ──▶ nothing
        x < left edge of the row's first [data-dot] ──▶ clear timer, pillQuiet = true  (no wait)
        otherwise (between or beyond the pills)     ──▶ nothing: the second holds
                                                          │
                                                          ▼
 <table data-grid data-pill-quiet>  ── one clock for the grid
 [data-row-actions]  invisible + (pillQuiet && !faded ? "group-hover/row:visible … has-[[data-dot]:hover]:invisible" : "")
        ▲ shows in the same frame for the row under the pointer; other rows have no hover
```

## Verified by

vitest (479), eslint, tsc, `next build`, `check:laptop` (16); `quiet180.mjs` (port 3381 / CDP 9681, real `Input.dispatchMouseEvent` moves, 50 checks at 1400 × 1000 and 1280 × 800): fresh entry, over the pill hidden and the grid not quiet, 4 px left of the pill visible at once and quiet, 4 px right of it hidden at 0.3 s and back after the second, the Algebra–Functions gap hidden at 0.3 s then at once on crossing left of Algebra, row A's pill straight into row C's name, down the column into row C's pill then left of it, a drill node then left of the pill, a faded row in history mode hidden with the history student's stack kept, back from outside the grid.
