# 354: Holding ArrowRight speeds up the demo simulation

**What to build:** ArrowRight, tapped or held, drives both presenter "skip to" controls forward — Sam's `SkipTo` and the teacher's `TeacherSkipTo` — the same jumps their own pills already make. Holding the key keeps advancing on an accelerating schedule instead of the OS's fixed key-repeat rate, so it visibly speeds up the longer it is held.

**Blocked by:** none.

**Status:** superseded by ticket 357 — Carson: "this has the unit of jumping ahead be stages. i really want functionality within a stage." The stage-jump-on-hold behaviour described below no longer exists; `lib/arrowHold.ts`, `components/SkipTo.tsx` and `app/teacher/TeacherSkipTo.tsx` now do what ticket 357 describes instead. Left below as the historical record of what this ticket actually built and why, per DECISION_LOG.md.

**Triage:** `ready-for-agent`

---

## Problem Statement

Carson: "add funtionality where holding on right arrow key speeds up the demo simulation." No existing keyboard-driven or continuously-running "simulation" existed in the codebase (confirmed by search: the only ArrowRight consumers were `DuePicker`'s date-grid navigation and `useReorder`'s Alt+ArrowRight tile move); the "demo" is the presenter's click-driven "skip to" pill lists in `lib/demo.ts` / `components/SkipTo.tsx` / `app/teacher/TeacherSkipTo.tsx`. Carson confirmed this is a new feature on top of that system, not a bug in something pre-existing.

Scope settled while building, since the two pill lists don't have the same shape:

- **Sam's SKIP TO (`SKIP_TARGETS`)** is a flat, time-ordered list of the whole lesson (start → warm-up → working → indiv review → class wait → group review → class review → report → homework) — each pill a one-shot jump to a bookmarked moment. ArrowRight walks this list in order, one pill per press.
- **The teacher's SKIP TO (`TEACHER_SKIP_TARGETS`)** is three independent buttons, not a list to walk: "send assignment" only stages Create's last step (the real send needs the presenter to press Create by hand, a different screen — nothing here can complete it automatically); "students done with current stage" is the one genuinely repeatable action, already advancing the whole class one stage per click; "activity completed" is a deliberate one-press full skip. ArrowRight here just repeats "students done" — the actual "run the lesson forward" action — and leaves "send" and "completed" as mouse-only, since neither fits a held key (one can't be automated past the Create screen, the other should stay a deliberate single press). Repeating "done" enough times already reaches the same end state "completed" jumps to directly.
- Neither list's ArrowRight handling reaches into the homework jumps (`HOMEWORK_SKIP_TARGETS`), which only ever appear after the teacher's own manual +Homework press elsewhere in the real UI — deferred to `FUTURE_FEATURES.md`.
- A global `keydown` listener had to defer to anything that already owns ArrowRight (`DuePicker`'s calendar grid, `useReorder`'s Alt+arrow) rather than fight it: it backs off on `e.defaultPrevented` or when the focused element is a text/typing target, so a presenter driving the date picker or a reorderable list never also fast-forwards the demo underneath.

## Acceptance

- [x] Tapping ArrowRight (anywhere except a typing target or a control that already claims the key) advances Sam's SkipTo to the next pill in `SKIP_TARGETS`, doing the same `jump` + navigation each pill's own click does; the last pill is a no-op
- [x] Holding ArrowRight keeps advancing Sam's SkipTo on an accelerating schedule (never the OS's fixed key-repeat) until release, a window blur, or the list runs out
- [x] The teacher's TeacherSkipTo: ArrowRight is a no-op before a set is sent; once sent, tapping or holding repeats "students done with current stage" the same way clicking it repeatedly would, stopping cleanly once the lesson is fully over (`teacherDoneAdvances`)
- [x] ArrowRight never interferes with `DuePicker`'s date-grid navigation or `useReorder`'s Alt+arrow tile move
- [x] `holdStepDelayMs` (`lib/arrowHold.ts`) and `teacherDoneAdvances` (`lib/demo.ts`) are pure and unit-tested
- [x] vitest (2282, all green), eslint (including `react-hooks/refs`), tsc, `next build`; a real production build driven over CDP with genuine keyboard events on both SkipTo and TeacherSkipTo (tap-by-tap and held), confirming the accelerating hold reaches every stage and stops cleanly on release
- [x] Ticket docs: `architecture/354-hold-arrow-speed-demo.md`, ARCHITECTURE, DECISION_LOG, FUTURE_FEATURES

## Solution

- **`lib/arrowHold.ts`** (new). `holdStepDelayMs(repeats)` — pure: starts at 450ms, halves every two auto-steps down to a 60ms floor, so the ramp reads as acceleration. `useArrowRightHold(onStep, active)` — a `"use client"` hook: a single `keydown` listener (ignoring `e.repeat`, the OS's own rate) runs its own `setTimeout` chain calling `onStep()` on that schedule until it returns `false`, `keyup` fires, or the window blurs; `onStep`/`active` are read through refs synced in a plain `useEffect` (never written during render, satisfying `react-hooks/refs`) so a change of either mid-hold — which happens every step, since each jump re-renders the component with a new closure — never interrupts an in-progress hold. Backs off via `ownsArrowKey`: `e.defaultPrevented` (sets by `DuePicker`'s calendar and `useReorder`'s Alt+arrow) or a text/contenteditable focus target.
- **`lib/demo.ts`.** `teacherDoneAdvances(c, session, now)` — pure: `canTeacherSkip("done", c)` first, then confirms `teacherSkip("done", ...)` would actually change anything by reference equality (`completeLesson`'s early-return hands back the exact classroom/session it was given once the lesson is fully over, so this needs no deep comparison).
- **`components/SkipTo.tsx`.** A `useRef` index (`at`), starting at -1, walked forward one `SKIP_TARGETS` entry per `useArrowRightHold` step; each step does exactly what a pill's `onClick` does (`jump` + `go(set)`).
- **`app/teacher/TeacherSkipTo.tsx`.** `useHoldToAdvanceStage`: `step()` reads the live classroom/session from the stores, calls `teacherDoneAdvances` to decide whether to continue, and calls `jump("done")` when it can; `active` is `canTeacherSkip("done", classroom)`, so a fresh press before any set is sent does nothing.
