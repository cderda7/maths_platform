# 207: The Live diagnostic's example options sit in an even two-column grid

## Files touched

| File | What it does |
| --- | --- |
| `app/teacher/DiagnosticPush.tsx` | The mistake view's Live diagnostic chip and flyout; the example tab's options are now a two-column grid. |
| `tickets/207-diagnostic-option-grid.md` | The ticket. |

## How it connects

```
 /teacher/a/<id>/mistakes
   TeacherMistakes ─► DiagnosticPush (flyout, 460 px)
                        ├─► example tab, before a send
                        │     ┌──────────┬──────────┐
                        │     │ A  FitText│ B  FitText│   grid-cols-2, equal halves
                        │     ├──────────┼──────────┤
                        │     │ C  FitText│ D  FitText│
                        │     └──────────┴──────────┘
                        └─► after a send: DiagnosticResults size="panel" (the same 2 × 2 grid)
```
