# 357: Holding ArrowRight speeds up time within the active stage

Supersedes ticket 354. Carson, after seeing 354's stage-jump-on-hold: "this has the unit of jumping ahead be
stages. i really want functionality within a stage. holding arrow key as like 1 second becomes 10 seconds
when right arrow key is held." Asked whether a tap should keep jumping stages while only the hold changed,
Carson chose to drop stage-jumping from ArrowRight entirely.

Research first: every live-updating surface reads "now" through exactly two hooks in `lib/store.ts`
(`useNow`, `useFrameNow`), and every pure function downstream takes `now` as a plain argument — none call
`Date.now()` themselves. So the whole feature is one change at the clock layer; nothing else in the app
needed to know this was happening.

```
lib/demoClock.ts (new, pure)                        lib/store.ts
┌───────────────────────────────────────┐           ┌────────────────────────────────────────────────┐
│ DemoClock { realMs, offsetMs }         │           │ timeScale = 1                                    │
│                                         │           │ demoClock: DemoClock = { realMs: now(), 0 }      │
│ tickDemoClock(clock, realMs, scale)     │──────────▶│ demoNow():                                       │
│   realMs <= clock.realMs → no-op       │  called   │   demoClock = tickDemoClock(demoClock,           │
│   else offsetMs +=                     │  from     │                             Date.now(), timeScale)│
│     (realMs - clock.realMs)*(scale-1)  │  clockTick│   return demoClockNow(demoClock)                 │
│   pure · demoClock.test.ts             │  &        │                                                   │
│                                         │  frameTick│ setDemoTimeScale(scale):                          │
│ demoClockNow(clock) = realMs+offsetMs  │           │   demoNow()          ← flush old scale first      │
└─────────────────────────────────────────┘          │   timeScale = scale                              │
                                                       │   wake clock listeners now, not next tick        │
                                                       │                                                   │
                                                       │ clockTick()   → clock = demoNow()      (1 Hz)     │
                                                       │ frameTick()   → frameClock = demoNow() (rAF)      │
                                                       │   both existing loops, now demoNow()-backed,      │
                                                       │   share one virtual timeline                     │
                                                       │                                                   │
                                                       │ resetSession(): timeScale=1, demoClock reset too  │
                                                       │   (else a fresh demo reads as already ahead       │
                                                       │    of itself)                                     │
                                                       └────────────────────────┬──────────────────────────┘
                                                                                │
                                                          every existing useNow()/useFrameNow() consumer
                                                          (classReadiness, playBoard/simulatedRunAt,
                                                           tryAgainShowing, dueDecision, ~30 components)
                                                          — unchanged, automatically runs on the sped-up
                                                          clock since it never read Date.now() itself
                                                                                ▲
                                                                                │
                                        lib/arrowHold.ts (rewritten)           │
                                        ┌────────────────────────────────────────┐
                                        │ DEMO_FAST_FORWARD_SCALE = 10            │
                                        │ ownsArrowKey(e) — unchanged from 354:   │
                                        │   e.defaultPrevented (DuePicker's grid, │
                                        │   useReorder's Alt+arrow) or a typing   │
                                        │   target                                │
                                        │ useDemoFastForward():                   │
                                        │   keydown → setDemoTimeScale(10)        │
                                        │   keyup / blur → setDemoTimeScale(1)    │
                                        └───────────────────┬──────────────────────┘
                                                             │
                              ┌──────────────────────────────┴───────────────────────────┐
                              ▼                                                            ▼
                  components/SkipTo.tsx                                  app/teacher/TeacherSkipTo.tsx
                  (mouse-only pills, unchanged;                          (mouse-only pills, unchanged;
                   calls useDemoFastForward())                            calls useDemoFastForward())

Removed: lib/arrowHold.ts's old useArrowRightHold/holdStepDelayMs (ticket 354's accelerating discrete-step
schedule), lib/demo.ts's teacherDoneAdvances (only existed to tell that schedule when to stop). Nothing else
referenced either.
```

Files:

- `lib/demoClock.ts` (new) — `DemoClock`, `tickDemoClock`, `demoClockNow`. The pure core; everything else is
  wiring.
- `lib/store.ts` — `timeScale`, `demoClock`, `demoNow()`, `setDemoTimeScale`; `clockTick`/`frameTick` (the
  existing `useNow`/`useFrameNow` backers) now call `demoNow()` instead of `Date.now()`; `resetSession`
  resets the clock alongside the lesson.
- `lib/arrowHold.ts` — rewritten: `DEMO_FAST_FORWARD_SCALE`, `ownsArrowKey` (kept), `useDemoFastForward`.
- `lib/demo.ts` — `teacherDoneAdvances` removed.
- `components/SkipTo.tsx` / `app/teacher/TeacherSkipTo.tsx` — ticket 354's per-list stepping hook calls
  replaced with `useDemoFastForward()`; the pill lists and their mouse `onClick`s are untouched.

Verified against a real production build (`next build && next start`) driven over CDP with genuine
`Input.dispatchKeyEvent` presses: on Sam's class-wait screen (`[data-count]`, classmates trickling in),
3 real seconds unheld advanced arrivals by 1 (1 of 19 → 2 of 19); the same 3 seconds held advanced them by
8 (2 of 19 → 10 of 19, matching the ~9-per-30-virtual-seconds the fixture's arrival spacing predicts);
releasing and waiting 1.5s more advanced it by 1 again (10 of 19 → 11 of 19), confirming the clock drops
straight back to real time rather than continuing to run fast or rewinding.
