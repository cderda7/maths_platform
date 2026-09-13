# 192: Class View's Key rides the bottom of the view as the teacher scrolls

## Files touched

| File | What it does |
| --- | --- |
| `app/teacher/TeacherLive.tsx` | Class View. The side column is a flex column; the Key card sits in a `flex-1` box at its end and is `sticky bottom-12` in the teacher frame's scroll region. The cards above are untouched. |
| `tickets/192-sticky-key.md` | The ticket. |

## How it connects

```
 TeacherChrome
 └─ main [data-teacher-scroll]  (overflow-y-auto, py-12) ◄── the Key's sticky scroller
    └─ grid 1fr | 320px   (row height = roster card)
       ├─ roster Card (table)
       └─ side column  flex-col gap-6  (stretched to the roster's height)
          ├─ WholeClassCard · Pathway · GroupProgress · Diagnostic   (live set only; top, scroll away)
          └─ flex-1 box, justify-end       ◄── the Key's sticky bounds: below the last card, down to
             └─ Key Card  sticky bottom-12     the roster's bottom (no overlap, no jump at the end)
                └─ StatusKey
```
