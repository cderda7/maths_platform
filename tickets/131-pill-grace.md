# 131: A two-second grace after leaving a pill before the row's buttons return

**What to build:** After ticket 128 the class grid's row buttons (**see dot skills** / **close**, **student report**) hide while the pointer is over a category pill. Now they also stay away for two seconds after the pointer last left any pill, so a teacher hopping between pills never sees them flash in the gaps; once the pointer has sat off the pills for two seconds while still in a row, the buttons pop up. A teacher who enters a row without touching a pill sees them at once, as before.

**Blocked by:** 128.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12): "let's also add a 2 second grace period. so like if teacher is jumping between pills, it doesn't show up. but if teacher hasn't entered a pill for 2 seconds & is sitting in the row, then expand & close pop up".

## Solution

- `app/teacher/TeacherLive.tsx`: `PILL_GRACE_MS = 2000`; one `pillQuiet` state for the grid (true at rest). Every category pill's `onPointerEnter` clears the timer and sets it false; `onPointerLeave` restarts a timer that sets it true after the grace. The row-actions div carries its hover / focus-within / has-rule classes only while `pillQuiet`; otherwise it is plainly `invisible`. The `:has` rule from 128 stays for the instant hide on entering a pill (state flips a frame later). The timer is cleared on unmount. The table exposes `data-pill-quiet` for tests.
- **One clock for the grid, not one per row.** The user's condition is about the teacher ("hasn't entered a pill for 2 seconds"), so moving from row A's pill into row B's name cell also waits; a per-row clock would show row B's buttons at once mid-sweep.
- Keyboard focus is untouched: a focused pill with the pointer away shows the buttons once quiet.

## Acceptance

- [x] Fresh entry onto a name: visible at once
- [x] Pill then name: hidden at 1.5 s, visible by 2.4 s
- [x] Two pills 1.3 s apart: still hidden 2.5 s after the first (clock restarted), visible 2.3 s after the second
- [x] Down the pill column into another row, and from one row's pill straight to another's name: that row waits too
- [x] Pill clicked (drill open), pointer into the drill row: hidden, then visible after the grace so close is reachable
- [x] Grace elapsed away from the grid, back onto a name: visible at once
- [x] vitest (395), eslint, tsc, `next build`, headless click-through (`grace.mjs`, 20 checks) with crops
