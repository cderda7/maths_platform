# 131 · A two-second grace after leaving a pill before the row's buttons return

Route: `/teacher` (the class grid).

## Files touched

| File | What it does |
|---|---|
| `app/teacher/TeacherLive.tsx` | `PILL_GRACE_MS` (2000); `pillQuiet` state + `pillTimer` ref with `pillEnter` / `pillLeave` on every category pill button; the row-actions div keeps its hover / focus-within / `:has` classes only while quiet; `data-pill-quiet` on the table; timer cleared on unmount. |

## How it connects

```
 pointer enters any <button data-dot>  ──▶ pillEnter: clear timer, pillQuiet = false
 pointer leaves it                     ──▶ pillLeave: timer(2 s) ──▶ pillQuiet = true
                                                 │ (another pill entered first: cleared, restarted)
                                                 ▼
 [data-row-actions]  invisible  + (pillQuiet ? "group-hover/row:visible group-focus-within/row:visible
                                                group-has-[[data-dot]:hover]/row:invisible" : "")
                       ▲                                        ▲
                       │ while not quiet: nothing can show it   │ while quiet: as tickets 125–128
 <table data-grid data-pill-quiet>   one clock for the whole grid (rows A and B share it)
```

## Verified by

vitest (395), eslint, tsc, `next build`; `grace.mjs` (port 3185 / CDP 9485, real `Input.dispatchMouseEvent` moves timed with `sleep`): twenty checks of the computed `visibility` (fresh entry, pill then name at 1.5 s and 2.4 s, two pills 1.3 s apart, down the column into another row, pill to another row's name, click with the drill open, away from the grid, keyboard focus) and 2× crops just off the pill and after the grace.
