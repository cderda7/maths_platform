# 324: A homework cell press shows the insight placeholder

## Files touched

| File | What it does |
| --- | --- |
| `lib/hwInsight.ts` | New: `HW_INSIGHT_MESSAGE` ("HW insight scoped in FUTURE_FEATURES"), `HW_INSIGHT_MS` (2500) and `flasher(show, ms)`, a one-at-a-time flash whose `press(id)` shows an id and (re)starts the timer and whose `dispose()` clears it. |
| `lib/hwInsight.test.ts` | New: message, duration, clear, restart, move, dispose (fake timers). |
| `app/teacher/Classroom.tsx` | `HomeworkColumn`: each cell is a `<button>` (text-left, focus ring, hover tint); `shown` state plus one lazy `flasher`, disposed on unmount; the pressed cell turns `bg-ink-soft` with its line `outline-ink-soft` (an open cell's line is ticket 321's `hw-card-edge` outline, kept on focus) or `border-ink-soft` (the sent cell's dashed border) with an `aria-hidden` overlay of white text in its own box; an `sr-only` polite live region beside the cells. |
| `FUTURE_FEATURES.md` | New "Homework insight (ticket 324)" section; entries under 290, 291, 292 and 305 updated to point at it. |
| `tickets/324-…`, `ARCHITECTURE.md`, `DECISION_LOG.md`, `README.md` | Docs. |

## How it connects

```
 lib/classroomCards.ts teacherHomeworkColumn(past, c) (305) ─▶ pieces {id, row, span, state, done/total}
                                                                  │
                                                                  ▼
 app/teacher/Classroom.tsx  HomeworkColumn
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │ const [shown, setShown] = useState<string|null>(null)                        │
 │ const [flash] = useState(() => flasher(setShown))  ◀── lib/hwInsight.ts (324)│
 │ useEffect(() => () => flash.dispose(), [flash])        HW_INSIGHT_MESSAGE    │
 │                                                        HW_INSIGHT_MS 2500    │
 │  PAST  [ PS5 card ............ → ] │ ┌ button data-hw-cell=hw-3 ──────┐      │
 │                                    │ │ Homework 3 / due / sent · …    │      │
 │  PS4   [ ...................... → ] │ └────────────────────────────────┘      │
 │                                    │ ┌ button hw-2 (pressed) ─────────┐      │
 │  PS3   [ ...................... → ] │ │▓▓ HW insight scoped in ▓▓▓▓▓▓▓▓│ ink-soft ground + border,
 │                                    │ │▓▓ FUTURE_FEATURES      ▓▓▓▓▓▓▓▓│ white text, overlay
 │                                    │ └────────────────────────────────┘ in the cell's own box
 │  <span role=status aria-live=polite class=sr-only> message </span>          │
 └──────────────────────────────────────────────────────────────────────────────┘
   click / Enter / Space ─▶ flash.press(id) ─▶ setShown(id), setTimeout 2.5 s ─▶ setShown(null)
   press again ─▶ timer restarts        press another cell ─▶ shown moves there

 app/student/StudentClassroom.tsx HomeworkColumn (290, 307): unchanged, plain divs, no press
 FUTURE_FEATURES.md "Homework insight (ticket 324)" ◀── what the press stands in for
```
