# 54 · Whole-class review: the teacher writes on the smartboard, and switches the students' mode from it

Routes: `/board` (whole-class slide), `/student` in whole-class review, `/teacher/board`.

## Files touched

| File | What it does |
|---|---|
| `app/board/SmartBoard.tsx` | `Slide`'s working pane is a live `PadSection`: strokes dispatch `wc/stroke`, Undo `wc/ink-undo`, Clear `wc/ink-clear` (the laptop's actions, verbatim). The header is `Q label · equation` on the left and the `wc/mode` toggle (`data-mode-toggle`, `aria-pressed`) on the right; the position text is gone. Pane marked `data-teacher-pad data-mode` |
| `lib/board.ts` | The `whole-class` content carries `mode: FollowMode` from `currentSlide`; the doc comment no longer says the board is never touched |
| `lib/board.test.ts` | The projecting test asserts `mode` is `frozen` at first, `write-with-me` after `wc/mode`, and back to `frozen` on the next problem (per problem) |
| `app/student/screens/FrozenScreen.tsx` | The "n of m" span between the equation and the columns removed |
| `app/teacher/board/BoardControls.tsx` | The "problem n of m" span on the problem card removed (the board indicator still says `Q2 · 1 of 2`) |

## How it connects

```
                       classroom store  (localStorage + BroadcastChannel, one per browser)
                       wholeClass.ink[problem]  ·  wholeClass.modes[problem]
                            ▲            ▲                ▲
        wc/stroke · undo · clear         │            wc/mode
                            │            │                │
   ┌────────────────────────┴───┐   ┌────┴─────────────────┴────┐
   │ /teacher/board  (laptop)   │   │ /board  (smartboard)       │   ← new: the board writes too
   │  PadSection "Your working" │   │  Slide                      │
   │  [frozen | write with me]  │   │   header: Q2  2x²+7x−4=0    │
   │  prev · marks · End · next │   │           [frozen | write with me]
   └────────────────────────────┘   │   A · B (· C)  examples     │
                                    │   PadSection "Ms Okafor's working"  Undo Clear
                                    └────────────────────────────┘
                                                 │ boardContent(c).teacherInk / .mode
                                                 ▼
   ┌──────────────────────────────────────────────────────────────┐
   │ /student  FrozenScreen        frozenView(session, classroom) │
   │  banner: reviewing with the class  [screens frozen]          │
   │  Q2  2x²+7x−4=0                       (no "1 of 2")          │
   │  Handed in · Reworked │ frozen: mirror of teacherInk, no pen │
   │                       │ write with me: own pad (followInk)   │
   └──────────────────────────────────────────────────────────────┘
```

## Verified by

vitest (271 tests); eslint and tsc clean; `next build`. A headless-Chrome run of the built app on
port 3115, three tabs sharing one profile: skip the student to whole-class review, draw a stroke
on the board's pane → the classroom store holds one stroke and the student's read-only pad shows
it; press "write with me" on the board → the student's chip and toolbar switch and the laptop's
toggle agrees; Clear on the board empties the ink; no position text on any of the three screens.
