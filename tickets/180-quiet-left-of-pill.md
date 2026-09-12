# 180: The row buttons come back at once left of the row's first pill

**What to build:** On the class view the row's three buttons (see dot skills · student report · see history) stay away for a second after the pointer last left a category pill or a drill dot (ticket 131's grace, so a sweep across markers never flashes them). Now the grace ends the moment the pointer is left of the row's leftmost pill, back towards the name where the buttons sit: they show at once, no wait. The row's own first pill is the line, so a move from one row's pill down into another student's name cell shows that student's buttons at once too. To the right of the first pill, between and beyond the markers, the second still holds; over a marker they still hide; a faded row in history mode still never shows them.

**Blocked by:** 131, 175.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13), with a screenshot of the three buttons beside a name and the pills to their right: "recently created a setting for a bit of lag if teacher is moving between pills in class view, these options don't pop up. want to make it so that once teacher moves left of leftmost pill, there is no lag & the 3 options auto pop up".

## Solution

- `app/teacher/TeacherLive.tsx`: a `markerMove` handler on every student's `RowGroup` (`onPointerMove` on the tbody, delegated like the over / out handlers). While the grid is not quiet and the pointer is off every marker, it reads the row's first `[data-dot]` button and, when the pointer's x is left of its left edge, clears the grace timer and sets `pillQuiet` at once; the existing `group-hover/row:visible` rule then shows the buttons in the same frame. Quiet already, or over a marker: nothing (the `:has` rules hide over a marker, and its leave restarts the clock as before).
- **The line is the pill button's left edge, not the name cell's.** The Algebra cell has ~16 px of padding left of its pill; the pill button is the hover target (its cream hover fill is the pill visually), so "left of the pill" means left of the button. The gap to the right of the first pill, and every gap between pills, keeps the grace: those are the spaces a teacher hopping between pills crosses.
- **Per row, on the grid's one clock.** The row under the pointer supplies the line; ending the grace quiets the whole grid, as ticket 131's one-clock rule already has it, so the row the pointer is in shows its buttons and every other row shows nothing (no hover).
- `README.md`: the sentence on the grace; the stray "**See history in…**" left by ticket 177 reads **See history**.

## Acceptance

- [x] Onto the first pill, then 4 px left of it (still in the Algebra cell): the buttons show within a frame, the grid quiet
- [x] Onto the pill, then 4 px right of it: still hidden at 0.3 s, back after the second; in the gap between Algebra and Functions: still hidden at 0.3 s, then at once on crossing left of Algebra
- [x] From row A's pill straight into row C's name cell: row C's buttons at once, row A's hidden
- [x] Down the pill column into row C's pill: hidden; then left of it: at once
- [x] A drill open under row C: from a dot chip to left of the pill: at once
- [x] History mode: a faded row's buttons stay hidden left of its pill; the student in history keeps their stack
- [x] Fresh entry onto a name, and back from outside the grid: at once, as before
- [x] vitest, eslint, tsc, `next build`, `check:laptop`, click-through `quiet180.mjs` (50 checks at 1400 × 1000 and 1280 × 800, real `Input.dispatchMouseEvent` moves)
