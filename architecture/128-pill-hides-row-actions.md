# 128 · A category pill under the pointer hides the row's buttons

Route: `/teacher` (the class grid).

## Files touched

| File | What it does |
|---|---|
| `app/teacher/TeacherLive.tsx` | The row-actions `div` beside the student's name gains `group-has-[[data-dot]:hover]/row:invisible`, which beats its `group-hover/row:visible` while a category pill inside the same `tbody` is hovered. Nothing else changed. |

## How it connects

```
 <tbody class="group/row">                       one per student (RowGroup)
 ├─ <tr data-row>
 │   ├─ name cell ──▶ [data-row-actions]  invisible
 │   │                  group-hover/row:visible          ◀── pointer anywhere in the tbody
 │   │                  group-focus-within/row:visible   ◀── keyboard focus anywhere in it
 │   │                  group-has-[[data-dot]:hover]/row:invisible  ◀── …except over a pill (wins: later + more specific)
 │   └─ category cells ──▶ <button data-dot> ▭ pill      its own way in (click: drill; dblclick: full)
 └─ <tr data-drill-row>  (when open)                       still inside the group, buttons show here
```

Header hover controls (`group/head`) are a separate group and untouched.

## Verified by

vitest (390), eslint, tsc, `next build`; `rowactions.mjs` (port 3183 / CDP 9483, real `Input.dispatchMouseEvent` moves): twelve checks of the computed `visibility` (name, first pill, between pills, last pill, confidence cell, pill clicked with the drill open, drill row, pill focused with the pointer away, header controls) and 2× crops of the row in each state.
