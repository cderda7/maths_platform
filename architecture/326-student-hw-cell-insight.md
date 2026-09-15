# 326: Sam's homework cells show the insight placeholder too

## Files touched

| File | What it does |
| --- | --- |
| `lib/hwInsight.ts` | Ticket 324's placeholder (`HW_INSIGHT_MESSAGE`, `HW_INSIGHT_MS`, `flasher`) gains `studentCellShowsInsight(cell)`: true for a completed or missed cell, or an open-status cell not yet opened (in the Future); false for the opened homework's cell. |
| `lib/hwInsight.test.ts` | Adds the rule by state and the demo's column at fresh, "send homework" and "homework open". |
| `app/student/StudentClassroom.tsx` | `HomeworkColumn`: `shown` state plus one lazy `flasher`, disposed on unmount; `insightCell(rest, body)` renders a cell that goes nowhere as a `<button>` with its state's ground and line at rest, `ink-soft` ground, outline and focus border while shown, and an `aria-hidden` overlay of white text in its own box; the opened cell's link button is untouched; an `sr-only` polite live region beside the cells. |
| `FUTURE_FEATURES.md` | "Sam's cells open his own homework insight" scoped under ticket 324's section; entries under 290 and 293 updated; a short section for this ticket. |
| `tickets/326-…`, `ARCHITECTURE.md`, `DECISION_LOG.md`, `README.md` | Docs. |

## How it connects

```
 lib/homeworks.ts homeworkColumn(cards, classHomeworks(c)) (290, 292, 307) ─▶ pieces {id, status, opened, due, submitted, row, span}
                                                                                   │
                                                                                   ▼
 app/student/StudentClassroom.tsx  HomeworkColumn (Sam's iPad, beside Completed)
 ┌───────────────────────────────────────────────────────────────────────────────────────┐
 │ const [shown, setShown] = useState<string|null>(null)                                  │
 │ const [flash] = useState(() => flasher(setShown))   ◀── lib/hwInsight.ts (324)         │
 │ useEffect(() => () => flash.dispose(), [flash])         HW_INSIGHT_MESSAGE, 2500 ms    │
 │                                                                                        │
 │ piece ──▶ studentCellShowsInsight(p)?  ◀── lib/hwInsight.ts (326)                      │
 │            │ yes: completed / missed / in Future          │ no: opened homework          │
 │            ▼                                              ▼                             │
 │  ┌ button data-hw-cell=hw-1 ───────┐          ┌ button data-hw-cell=hw-3 ───────┐       │
 │  │ ✓ HW1 completed / due / submitted│          │ HW3 · due Mon 14 Sep           │       │
 │  └──────────────────────────────────┘          └────────────────────────────────┘       │
 │  pressed:                                        onClick ─▶ router.push                │
 │  ┌ button hw-2 data-hw-insight ─────┐              /student/homework/hw-3 (292, 293)    │
 │  │▓ HW insight scoped in ▓▓▓▓▓▓▓▓▓▓▓│ ink-soft ground + outline (+ focus border),       │
 │  │▓ FUTURE_FEATURES      ▓▓▓▓▓▓▓▓▓▓▓│ white text, overlay in the cell's own box         │
 │  └──────────────────────────────────┘                                                  │
 │  <span role=status aria-live=polite class=sr-only> message while a pressable is shown  │
 └───────────────────────────────────────────────────────────────────────────────────────┘
   click / Enter / Space ─▶ flash.press(id) ─▶ setShown(id), setTimeout 2.5 s ─▶ setShown(null)

 FuturePanel (292): unchanged, not pressable        SetCard (287): Completed cards open reports, unchanged
 app/teacher/Classroom.tsx HomeworkColumn (324): same flasher and message, unchanged
 FUTURE_FEATURES.md "Sam's cells open his own homework insight" ◀── what the press stands in for
```
