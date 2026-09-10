# 54: Whole-class review: the teacher writes on the smartboard, and switches the students' mode from it

**What to build:** In whole-class review the smartboard's "Ms Okafor's working" pane takes the pen: whatever the teacher writes there shows on every frozen student's pad and on the laptop. The board's header gains the same screens frozen / write with me toggle the laptop has. The "1 of 2" / "problem 1 of 2" text goes from the student screen, the board and the laptop's controls card, and the equation sits directly beside the Q label on all three.

**Blocked by:** 38 (whole-class review and the board).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The teacher stands at the smartboard during whole-class review, but the board's working pane was a read-only mirror of the laptop's pad: to write, they had to walk back to the laptop, and to change the students' mode they had to do the same. The student screen and the board both showed a "1 of 2" position label between the Q label and the equation (and on the board the equation was pushed to the far right), which the user did not want.

## Solution

`SmartBoard`'s `Slide` gives the pad the same three classroom actions the laptop sends (`wc/stroke`, `wc/ink-undo`, `wc/ink-clear`), so the board is a second writer of the one `wholeClass.ink[problem]` array; the laptop and every frozen student read it as before. The board's header holds the `wc/mode` toggle, styled as on the laptop but a size up for the wall. `boardContent` now carries `mode` so the board knows which pill is pressed. The position text is removed from `FrozenScreen`, the board header and `BoardControls`'s problem card; the teacher still has "Q2 · 1 of 2" on the board indicator above the controls.

## Acceptance

- [x] Board in whole-class review: a stroke drawn on the working pane appears on the frozen student's pad (and the laptop's)
- [x] Board header: screens frozen / write with me toggle; pressing one changes the student's banner chip and pad within a second
- [x] Undo and Clear on the board act on the shared ink
- [x] Student screen: "Q2  2x² + 7x − 4 = 0", no "1 of 2"; board and laptop card the same, the equation right beside the label
- [x] vitest (board content carries the mode), eslint, tsc, `next build`; two-tab headless-Chrome check; architecture note and root docs
