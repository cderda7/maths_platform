# 284: A student's skill tree opens as a sheet over the rows below

## Files touched

| File | What it does |
| --- | --- |
| `app/teacher/TeacherLive.tsx` | The open student's `<tr data-drill-row>` is gone; `DrillSheet` draws the same `RowDrill` in an absolute sheet in the roster box, under the student's row, over the rows below. `sheetHover` keeps the student's row buttons in view over it. |

## How it connects

```
 roster box (div ref=rosterRef, relative) ─────────────────────────────┐
 │                                                                     │
 │  HistoryBlocker (z-25)   sheet over the rows ABOVE a history row    │
 │  DrillSheet     (z-15) ◄284 sheet over the rows BELOW the open row  │
 │     measure(): table rect, open row's bottom, content height        │
 │       top    = row.bottom          left/width = table              │
 │       height = next row line ≥ tree (or the tree past the last row) │
 │       roster.paddingBottom = overhang past the card + 24            │
 │     └── <RowDrill mode category|expanded …/>  (HierarchyDrill)      │
 │           click blank paper ─► onClose ─► setOpen(null)             │
 │           pointer enter/leave ─► sheetHover ─► row buttons visible  │
 │                                                                     │
 │  Card ─ table[data-grid]  (never grows for a single student's tree) │
 │          tbody per student: tr[data-row]  (+ column-view drill rows)│
 └─────────────────────────────────────────────────────────────────────┘
        ▲ ResizeObserver(table, sheet content) + window resize
```

`open` state, `openRow`, `rowClick`/`leaveDrill`, `pillClick` are unchanged from ticket 280; only where the tree renders moved.
