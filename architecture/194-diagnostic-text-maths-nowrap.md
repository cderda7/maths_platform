# 194: The Live diagnostic flyout reads at the page's size; typeset maths never splits across lines

## Files touched

| File | What it does |
| --- | --- |
| `app/globals.css` | Global tokens and KaTeX overrides; `.katex` is now `white-space: nowrap`, the app-wide rule that an expression never breaks. |
| `app/teacher/DiagnosticPush.tsx` | The mistake view's Live diagnostic chip and flyout (example tab, make-your-own tab, send / waiting / board links); larger text, 460 px panel. |
| `components/DiagnosticResults.tsx` | A diagnostic's result grid, shared by Class View's card, the flyout and the board; gains `size="panel"` for the flyout. |
| `tickets/194-diagnostic-text-maths-nowrap.md` | The ticket. |

## How it connects

```
 app/globals.css
   .katex { white-space: nowrap }  ──► every <M> (components/Math.tsx) on every route
                                        student stages · teacher views · board

 /teacher/a/<id>/mistakes
   TeacherMistakes ─► DiagnosticPush (per problem, live sets)
                        │  chip in flow, flyout 460 px, z-40 over the rows below
                        ├─► example tab: stem 17 px + option chips 16 px
                        ├─► own tab: inputs 16 px + FitText previews
                        └─► DiagnosticResults size="panel"  (17 / 16 / 14 px)

 DiagnosticResults
   size="card"  ◄── DiagnosticCard  (Class View side column, unchanged)
   size="panel" ◄── DiagnosticPush  (mistake view flyout)
   size="board" ◄── SmartBoard      (/board, unchanged)
```
