# 133 · The drill's dots count as markers, and the grace is one second

Route: `/teacher` (the class grid and the drills open under its rows).

## Files touched

| File | What it does |
|---|---|
| `app/teacher/TeacherLive.tsx` | `PILL_GRACE_MS = 1000`; `MARKER = "[data-dot], [data-node]"`; `markerOver` / `markerOut` delegated on each `RowGroup` tbody (act only on a crossing of a marker's boundary); the per-pill pointer props removed; the row-actions div gains the `[data-node]:hover` has-rule; `RowGroup` takes the two handlers. |

## How it connects

```
 <tbody class="group/row" onPointerOver={markerOver} onPointerOut={markerOut}>
 ├─ <tr data-row>      … <button data-dot> ▭ pill …                    ─┐
 └─ <tr data-drill-row> … HierarchyDrill → <button data-node> ● label … ─┤ MARKER
                                                                         ▼
     over/out bubbles up ──▶ target.closest(MARKER) && !marker.contains(relatedTarget)
                                  │ enter: clear timer, pillQuiet = false
                                  │ leave: timer(1 s) ──▶ pillQuiet = true
                                  ▼
 [data-row-actions]  invisible + (pillQuiet ? hover/focus-within visible,
                                  :has([data-dot]:hover) / :has([data-node]:hover) invisible : "")
```

`HierarchyDrill` is untouched: the delegation reads its existing `data-node` buttons.

## Verified by

vitest (395), eslint, tsc, `next build`; `dots.mjs` (port 3187 / CDP 9487, real timed mouse moves): sixteen checks of the computed `visibility` (pill at 0.6 s and 1.3 s; a drill's dot chip, its label, the blank of the drill row, a second chip restarting the clock, chip to the name, a clicked chip) and 2× crops on a chip and after the grace.
