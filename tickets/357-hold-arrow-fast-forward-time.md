# 357: Holding ArrowRight speeds up time within the active stage

**What to build:** while ArrowRight is held, the demo's shared clock runs at 10× real time, so whatever is
already playing out on screen (classmates arriving, the group board's simulated run, a countdown) visibly
speeds up in place. Releasing the key returns it to real time. This replaces ticket 354, which instead
jumped between stages on the same key.

**Blocked by:** none. Supersedes ticket 354.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Ticket 354 built "holding ArrowRight speeds up the demo simulation" as stage-to-stage jumping — Sam's SkipTo
walked its bookmark list forward, the teacher's TeacherSkipTo repeated "students done with current stage".
Carson, after seeing it: "but this has the unit of jumping ahead be stages. i really want functionality
within a stage. holding arrow key as like 1 second becomes 10 seconds when right arrow key is held." Asked
directly whether a tap should still jump stages while only the hold changed, Carson chose to drop
stage-jumping from ArrowRight entirely — it now does one thing: run time faster while held.

Research before building confirmed the right seam: every live-updating surface in the app reads "now"
through exactly two hooks in `lib/store.ts` (`useNow()`, ticking once a second; `useFrameNow(active)`,
ticking every animation frame for the group intro's bar). Every pure function downstream — `classReadiness`,
`playBoard`/`simulatedRunAt`, `tryAgainShowing`, `dueDecision` — takes `now` as a plain argument and never
calls `Date.now()` itself. So a single change at the clock layer reaches every one of these without touching
any of them: `demoNow()` folds real elapsed time into an accumulating offset, growing 10× as fast while
`timeScale` is above 1 (`setDemoTimeScale`, `lib/store.ts`; the pure accumulation math is `tickDemoClock` in
the new `lib/demoClock.ts`).

Ticket 354's `lib/arrowHold.ts` (`useArrowRightHold`, `holdStepDelayMs`) and `lib/demo.ts`'s
`teacherDoneAdvances` existed only to serve stage-jumping and are removed; `components/SkipTo.tsx` and
`app/teacher/TeacherSkipTo.tsx` are back to mouse-only "skip to" pills, now also mounting the new
`useDemoFastForward()` hook.

## Acceptance

- [x] Holding ArrowRight (anywhere except a typing target or a control that already claims the key) runs
      the shared demo clock at 10× real time; releasing it (keyup or a window blur mid-hold) returns it to
      1×
- [x] The 10× offset accumulates rather than resets: releasing and re-holding continues from where the
      virtual clock already is, it never rewinds
- [x] Nothing jumps between stages on ArrowRight any more — ticket 354's stage-stepping is fully removed
- [x] `resetSession` ("Reset demo") also resets the clock's scale and offset, so a fresh demo isn't born
      already ahead of itself
- [x] ArrowRight never interferes with `DuePicker`'s date-grid navigation or `useReorder`'s Alt+arrow tile
      move (same `ownsArrowKey` defer-on-`e.defaultPrevented` mechanism as ticket 354)
- [x] `tickDemoClock`/`demoClockNow` (`lib/demoClock.ts`) are pure and unit-tested
- [x] vitest (2285, all green), eslint, tsc, `next build`; a real production build driven over CDP with
      genuine keyboard events: 3 real seconds unheld advanced classmates' arrivals by 1, the same 3 seconds
      held advanced them by 8 (~10×), and releasing dropped straight back to the real-time rate
- [x] Ticket docs: `architecture/357-hold-arrow-fast-forward-time.md`, ARCHITECTURE, DECISION_LOG,
      FUTURE_FEATURES; ticket 354's own docs marked superseded rather than rewritten

## Solution

- **`lib/demoClock.ts`** (new). `DemoClock { realMs, offsetMs }`; `tickDemoClock(clock, realMs, scale)` —
  pure, advances the offset by `(realMs − clock.realMs) × (scale − 1)`, a no-op on a stale/repeated
  timestamp; `demoClockNow(clock)` — `realMs + offsetMs`. Works in elapsed deltas rather than a fixed rate,
  so it produces the same virtual timeline whether it's ticked once a second or once a frame.
- **`lib/store.ts`.** Module-level `timeScale` and `demoClock`; `demoNow()` ticks the clock at the current
  scale and returns its virtual now; `clockTick()`/`frameTick()` (the two existing `useNow`/`useFrameNow`
  backers) call it instead of `Date.now()` directly. `setDemoTimeScale(scale)` flushes time at the old scale
  before changing it, and wakes the once-a-second clock's listeners immediately so a press is felt at once
  rather than up to a second later. `resetSession()` resets `timeScale`/`demoClock` alongside the lesson.
- **`lib/arrowHold.ts`** (rewritten). `useDemoFastForward()` — `"use client"` hook: `keydown`
  (`DEMO_FAST_FORWARD_SCALE = 10`) / `keyup` / blur toggle `setDemoTimeScale`; `ownsArrowKey` (unchanged from
  ticket 354) defers to anything that already claimed the key. Ticket 354's `useArrowRightHold` and
  `holdStepDelayMs` are gone — nothing else used them.
- **`lib/demo.ts`.** `teacherDoneAdvances` removed — it only existed to let ticket 354's hold know when to
  stop repeating "done", which no longer happens.
- **`components/SkipTo.tsx` / `app/teacher/TeacherSkipTo.tsx`.** Back to plain mouse-driven pills; each now
  calls `useDemoFastForward()` instead of the old per-list stepping hook.
