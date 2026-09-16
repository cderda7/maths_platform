# 353: Holding ArrowRight speeds up the demo simulation

Carson: "add funtionality where holding on right arrow key speeds up the demo simulation." No such control existed
(confirmed by search); the closest thing is the presenter's click-driven "skip to" pill lists in `lib/demo.ts` /
`components/SkipTo.tsx` (Sam's) / `app/teacher/TeacherSkipTo.tsx` (the teacher's). ArrowRight now drives both: a tap
advances one pill's worth, a hold keeps advancing on its own accelerating schedule until release. The two lists don't
have the same shape, so they're driven differently — Sam's is a flat, time-ordered list walked pill by pill; the
teacher's only has one genuinely repeatable action ("students done with current stage") worth automating, since
"send assignment" needs a real Create-screen press to finish and "activity completed" is a deliberate single skip.

```
lib/arrowHold.ts (new)                              lib/demo.ts
┌─────────────────────────────────────────┐         ┌──────────────────────────────────────────────┐
│ holdStepDelayMs(repeats)                 │         │ teacherDoneAdvances(c, session, now)          │
│   450ms → halves every 2 steps → 60ms    │         │   canTeacherSkip("done", c)                   │
│   floor. pure · arrowHold.test.ts        │         │   && teacherSkip("done", c, session, now)     │
│                                           │         │        result refs !== the input (idempotent │
│ ownsArrowKey(e)                          │         │        once completeLesson's early-return     │
│   e.defaultPrevented                     │         │        fires — no deep-equal needed)          │
│   || focus is a typing target            │         │   pure · demo.test.ts                          │
│                                           │         └───────────────────────┬────────────────────────┘
│ useArrowRightHold(onStep, active)        │                                 │
│   "use client" hook:                     │                                 │
│   keydown (e.repeat skipped) → onStep()  │                                 │
│     then its own setTimeout chain at     │                                 │
│     holdStepDelayMs(repeats) until       │                                 │
│     onStep() → false / keyup / blur      │                                 │
│   onStep/active read via refs synced     │                                 │
│   in a plain effect (never during        │                                 │
│   render — react-hooks/refs)             │                                 │
└───────────────┬───────────────────────────┘                                 │
                │                                                             │
                ▼                                                             ▼
  components/SkipTo.tsx                                    app/teacher/TeacherSkipTo.tsx
  ┌─────────────────────────────────────┐                  ┌──────────────────────────────────────────┐
  │ at = useRef(-1)                      │                  │ useHoldToAdvanceStage(classroom):         │
  │ step(): at+1 < SKIP_TARGETS.length?  │                  │   step(): teacherDoneAdvances(live c,     │
  │   at++; jump(SKIP_TARGETS[at]);      │                  │     session, now)? jump("done") : stop    │
  │   go(set); true                      │                  │   active = canTeacherSkip("done", c)      │
  │   : false (last pill, hold stops)    │                  │   (no-op before a set is sent)            │
  │ useArrowRightHold(step, true)        │                  │ useArrowRightHold(step, active)           │
  └─────────────────────────────────────┘                  └──────────────────────────────────────────┘
        walks: start → warm-up → working →                       repeats: "students done with
        indiv review → class wait → group review →                current stage" — the same jump
        class review → report → homework                          its own pill click makes

  Deferred to FUTURE_FEATURES.md: neither list's ArrowRight reaches the homework jumps
  (HOMEWORK_SKIP_TARGETS), which only ever appear after the teacher's own manual +Homework press.

  Left alone on purpose: DuePicker's calendar grid (ArrowRight moves a day, own onKeyDown +
  e.preventDefault) and useReorder's Alt+ArrowRight tile move (also e.preventDefault) — caught by
  ownsArrowKey's e.defaultPrevented check, so this listener never fights either.
```

Files:

- `lib/arrowHold.ts` (new) — `holdStepDelayMs`, `ownsArrowKey`, `useArrowRightHold`. The only new pure/hook module;
  everything else is a small addition to code that already existed.
- `lib/demo.ts` — `teacherDoneAdvances(c, session, now)`: whether "students done" has anything left to do, so a held
  key knows when to stop rather than spinning uselessly once the lesson is fully over.
- `components/SkipTo.tsx` — a `useRef` index walking `SKIP_TARGETS` forward, one `useArrowRightHold` step at a time.
- `app/teacher/TeacherSkipTo.tsx` — `useHoldToAdvanceStage`, wiring `teacherDoneAdvances` + `jump("done")` to the hook.

Verified against a real production build (`next build && next start`) driven over CDP with genuine `Input.dispatchKeyEvent`
key presses (not `next dev`, and not calling the pure functions directly): tapping ArrowRight three times on Sam's
SkipTo walked `overview → warmup-chat → working`; holding it for ~2.5s reached `homework`, the last stage, and stayed
there through release and a further hold (no runaway timer, no console errors). On the teacher's TeacherSkipTo,
holding ArrowRight before any set was sent changed nothing; after sending and pressing Create by hand, holding it
for ~2.5s carried the lesson all the way to `lessonEndedAt` being stamped and Sam's session reaching `homework`.
