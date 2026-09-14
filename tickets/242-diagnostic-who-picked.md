# 242: The teacher sees who picked each option and who repeated their own slip, and the class card names the problem

**What to build:** In the Mistakes view's flyout, each option cell of a sent step shows small initials avatars of the students who picked it. A student who picks the analogue of the slip they made on the original problem gets a mark on their avatar. The class view's card labels a running step with its problem ("Q1"), since the similar problem no longer identifies it.

**Blocked by:** 241.

**Status:** todo

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-14), in the grilling session on similar-problem diagnostics (240, 241), chose from offered options:

- A "Q1" label before the question on the class view's card only, not on the board.
- Initials avatars of who picked each option, in the Mistakes flyout only. The class card and the board get none, and the board stays anonymous.
- A mark on a student's avatar when they pick the analogue of their own original slip, so the teacher sees whether a slip was a one-off or a gap. A one-line summary ("2 of 3 who slipped on Q1 repeated it") was deferred.
- Slip labels stay general, never "Ethan's slip".

## Solution

- `lib/diagnostic.ts`: `pickersAt(run, step, now)` returns the student ids per option, the same arrivals `tally` counts (Sam once he answers). `repeatedSlip(step, studentId, option)` is true when that option's slip is the analogue of a slip in the student's original work on the problem, via 240's step picks mapping.
- `components/DiagnosticResults.tsx`, panel size only: a row of initials avatars (the roster avatar style, smaller) under each cell's count, wrapping inside the cell. A repeated slip shows as a ring or corner dot in the slip colour (the Mistakes view's slip pill red) with the avatar's title reading the student's name and "same slip as on Q1". Cells never change the flyout's width. Avatars appear live as answers land.
- `app/teacher/DiagnosticCard.tsx`: "Q1" before the step's question, in the eyebrow style.
- `FUTURE_FEATURES.md`: a one-line summary under a step's grid ("2 of 3 who slipped on Q1 repeated it"), deferred 2026-09-14 in favour of marks on the avatars.

## Acceptance

- [ ] Unit: pickers per option equal the tally counts at every `now`; `repeatedSlip` is true exactly for students whose original wrong line is that option's slip (Q1 step 2: Ethan on the signs-flipped option, Liam and Oliver on the product-right option).
- [ ] Click-through at 1280×800 and 1440×900 on a production build: avatars appear as each answer lands, their counts equal the cell's count, and every avatar sits inside its cell with no reflow of the flyout or the problem card; the repeat marks are on exactly the students above; a hover shows the name and "same slip as on Q1"; the class card reads "Q1" and has no avatars; the board and iPad show neither.
- [ ] vitest, eslint, tsc, next build, check:laptop
