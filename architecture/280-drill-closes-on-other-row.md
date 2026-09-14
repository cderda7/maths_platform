# 280: Another student's row closes an open skill tree; pills and row taps open the full tree

## Files touched

| File | What it does |
| --- | --- |
| `app/teacher/TeacherLive.tsx` | `rowClick` closes another student's tree first (`leaveDrill`), then opens the full tree; `pillClick` opens a category's full tree; `repeated` swallows a double-click's second click; `anchorRow` + a layout effect keep the pressed row still on screen; row and pill `onDoubleClick` removed. |
| `components/HierarchyDrill.tsx` | Doc comment only: `expandAll` now comes from a pill's click. |

## How it connects

```
 Class View roster row (TeacherLive)
   ┌─────────────────────────────────────────────────────────────┐
   │ name/avatar link ── holistic page (unchanged)               │
   │ row buttons: see dot skills ─► openRow(expanded)            │
   │              see history   ─► openHistory                   │
   │ category pill ─► leaveHistory? ─► pillClick ◄280            │
   │                                    └► openRow(category,     │
   │                                         expandAll) ◄280     │
   │ anywhere else ─► rowClick ◄280                              │
   │                   leaveHistory? ─► leaveDrill? ◄280 (close) │
   │                   └► toggle openRow(expanded) ◄280          │
   └─────────────────────────────────────────────────────────────┘
          │ openRow / leaveDrill / openHistory call anchorRow ◄280
          ▼
   state: open { student, mode, category, expandAll } · column · history
          │ render: <RowDrill> under the open row (components/HierarchyDrill)
          ▼
   useLayoutEffect [open, column, history] ◄280
     pressed row's new top − old top ─► main[data-teacher-scroll].scrollTop
                                         (÷ frame zoom)
```
