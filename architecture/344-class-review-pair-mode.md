# 344: Class review works an example, then the class does a near-identical question

## Files touched

| File | What it does |
| --- | --- |
| `lib/classReview.ts` | New. The three steps' order (`CLASS_STEPS`, `stepsFor`, `lastStep`), a student's turn on Q** derived from the lines their pad has read (`turnState`, `turnFor`), and the demo's scripted Q** working (`classTurnScript`). |
| `lib/classroom.ts` | `WholeClassSession` gains `step`, `reveal` and `movedBy` on the current slide; `wc/setup` drops `mode`; `wc/next` walks a question's steps (reveal Q*'s lines, then the transition to `turn`); `wc/advance` (the countdown's own action, idempotent by `id`) moves to the next question or ends the review; `currentSlide` reads the step and, for `worked`/`turn`, the pair; a new advance kind `class-review-next` with its own grace (`CLASS_REVIEW_GRACE_MS`, 5 s) beside the others' `GRACE_MS` (`graceFor`). |
| `lib/board.ts` | `boardContent`'s whole-class slide carries `step`, `pair` and `reveal` for the smartboard. |
| `lib/frozen.ts` | `frozenView` mirrors the classroom's step and pair for the student's screen. |
| `lib/session.ts` | `classReview: Record<problemId, {ink, lines}>` and the `class-review/*` actions (`stroke`, `reveal`, `undo`, `clear`); `classWorkOf` reads one problem's ink and lines. Never touches `lines`, `rework` or any scored field. |
| `lib/demo.ts` | The "class review" skip drops `mode` from its setup call (a question always runs all three steps when it has a pair). |
| `components/WorkedLines.tsx` | New. Q*'s steps up to `shown`, one row each, the shared look the board, the teacher's controls and the student's screen all use. |
| `components/ClassStepControl.tsx` | New. The one control that moves class review on, read from the classroom's `advance`/`isPending`: through a question's steps, then the five-second countdown with Cancel, in the board's and the laptop's sizes. |
| `components/useClassAdvance.ts` | New. The countdown's own effect, called from the board, the laptop's controls and every iPad: whichever tab's clock reaches the deadline first dispatches `wc/advance`; the others' next render sees `movedBy` already set and do nothing. |
| `app/board/SmartBoard.tsx` | The whole-class slide draws its step: `examples` as before (the teacher's live pad, the pen working anywhere on the slide); `worked` as `WorkedLines`; `turn` as one calm panel naming no student and no count. `ClassStepControl` sits where the "current slide" arrows were. |
| `app/teacher/board/BoardControls.tsx` | The laptop's own steps, the same three views, `ClassStepControl` beside End; "Show marks" only on `examples`. |
| `app/teacher/whole-class/WholeClassSetup.tsx` | The mode picker (`FollowMode`, its two option buttons, the "select one" nudge) is gone; `Project` needs only the ordered questions. |
| `app/teacher/WholeClassCard.tsx` | The Class tab's card reads the pathway's shared pill for class review now (ticket 334); its own text is unaffected by the mode's removal. |
| `app/student/screens/FrozenScreen.tsx` | Reads the classroom's step through `frozenView`; `examples` as before, `worked` as `WorkedLines`, `turn` as `ClassTurn`. The banner names the step. |
| `app/student/screens/ClassTurn.tsx` | New. Q** on the student's own pad: `PadSection` beside a `Working` column, each line from `turnFor` in the mark it earned (`MARK_LOOK`, the same table `PracticeSteps` reads), a misconception chip on a wrong line, "Couldn't read this line" on one the check can't place, and the open-slot / done copy. |
| `app/student/StudentShell.tsx` | The `frozen` stage renders `FrozenScreen` regardless of step (it always did; the step lives in the classroom now, not a stage of its own). |

## How it connects

```
 data/pairs.ts (ticket 310)                lib/stepCheck.ts (311/325)      lib/ladder.ts (312)
   QUESTION_PAIRS, pairFor(id)                checkStep(step, line)          markLine, MARK_RULES, MARK_LOOK
        │                                          │                              │
        ▼                                          ▼                              │
 lib/classReview.ts ◄344                                                          │
   stepsFor / lastStep / workedLines                                              │
   turnState(steps, lines) ───────────────────────────────────────────────────────┘
   turnFor(problemId, lines)        classTurnScript(problemId)  (LADDER_SLIPS, padScript — ticket 311)
        │                                    │
        ▼                                    ▼ (the demo pad's script)
 lib/classroom.ts ◄344  wc/setup·wc/next·wc/advance
   WholeClassSession.step / reveal / movedBy
        │                        │
        │                        └─ lib/session.ts ◄344  classReview[pid].{ink,lines}, class-review/*
        ▼                                    │
 lib/board.ts ◄344 boardContent      lib/frozen.ts ◄344 frozenView
        │                                    │
        ▼                                    ▼
 app/board/SmartBoard.tsx           app/student/screens/FrozenScreen.tsx
   Slide: examples → WorkedLines →     Examples → Worked (WorkedLines) → ClassTurn
   "the class is writing" panel                                             │
        │                                                                   ▼
        │                                                    app/student/screens/ClassTurn.tsx ◄344
        ▼                                                       PadSection + Working column, marked live
 components/ClassStepControl.tsx ◄344  (board + app/teacher/board/BoardControls.tsx, laptop)
   "Worked example →" · "Next line" · "Students' turn →" · "Next question →" / "Finish"
        │
        ▼ advance/start "class-review-next" (5 s, lib/classroom.ts graceFor)
 components/useClassAdvance.ts ◄344  (mounted on the board, the laptop, every iPad)
        │
        ▼ wc/advance (idempotent by id)
 next question's examples, or wc/end once the last question's turn is moved on from

 app/teacher/whole-class/WholeClassSetup.tsx ◄344  — no mode; Project needs only the questions
```

## Notes for ticket 320

`lib/classReview.ts`'s `turnFor(problemId, lines)` is the one call a live view makes per student to read their progress on Q**: `written` (each line and its mark), `step`, `left` and `done`. `lib/session.ts`'s `classReview[pid]` is where those lines live per student; a classmate's during the live lesson would come from wherever their simulated Q** lines are written (not built here — ticket 320 is the first reader of more than one student's turn). The board and the laptop never show a count; ticket 320 is where the class's progress first appears.
