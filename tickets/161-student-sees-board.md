# 161: In class review the student sees the board, with "your initial response" where the board counts

**What to build:** In whole-class review the student's screen shows what the board shows: the problem, its stem, and the same two or three examples in the same columns with the same lines, beside the pad. The one difference is the corner of each example: the board reads "13/19 students" there; the student's screen shows nothing there except, on the example that is the student's own first hand-in, a light blue tag reading "your initial response". On the board itself the example cards are laid out so no line of working wraps.

**Blocked by:** 157.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12), with a screenshot of the board at Q2 where every column's first line broke as "2x² + 7x − 4 =" / "0": "change class review mode on student screen to display the same as what's on the board. reorganize the board so none of the lines spill over. the only dif — on the board view, it shows '13/19' — on student screen, don't want that. instead add tag in light blue saying 'your initial response'."

Until now the student's screen in class review showed the student's own work (handed in, then reworked, with ink) in small columns, so the class was looking at three anonymous examples on the wall while each iPad showed something else.

## Solution

- `components/ExampleColumns.tsx` (new): the examples as one component for both surfaces: `size="board"` (21 px lines, 44 px letter, `p-4` cards) and `size="student"` (16 px lines, 30 px letter). Each column takes a `corner` node. Lines are `whitespace-nowrap`; the component measures every line at the size's maximum and, when the columns are narrower than the widest line (a window narrower than the design width), scales every column's lines down together by the one ratio that fits, the way `FitText` fits a line. At the design widths (board 1440, iPad 1180) the lines are at the maximum.
- `app/board/SmartBoard.tsx`: the slide uses `ExampleColumns`; the pad is 380 px (its title and Undo / Clear on one line) instead of 400, the grid gap 16; the corner is the count as before.
- `lib/frozen.ts`: `FrozenView` carries `examples` (the board's `boardExamples` for the slide, marks only in the marked view) with `mine` on the example whose exact mistake (`mistakeOf`) is the student's first hand-in's, `session.lines`, not the rework. `versions` and `attempted` are gone.
- `app/student/screens/FrozenScreen.tsx`: the banner, then the problem's label, equation and stem, then `ExampleColumns` (student size) with the tag as the tagged example's corner (`self-center`, so the row stays the letter's height and the columns' first boxes stay level), beside a 310 px pad.
- `lib/frozen.test.ts`: rewritten around examples and the tag.
- Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `README.md`.

## Acceptance

- [x] Board at 1440 × 810: A, B, C with "n/19 students", no line wraps or spills (widest 240 of 253 px at 21 px), no column scrolls, the pad title on one line
- [x] Board at 1396 × 900, 1280 × 720 and 1100 × 700: no line wraps; one size across every column (20.9, 17.5, 12.2 px); back at 1440 the lines are 21 px again
- [x] Student at class review: the same three columns with the same lines in the same order as the board, no count anywhere, one light blue "your initial response" tag on B (Sam's first hand-in's mistake; his rework, which is correct, is not what is tagged), first boxes level across the columns, everything inside the screen
- [x] Show marks: the same lines red and blue on both surfaces; Next: both move to Q7, the tag on B again; write with me: the chip, the pad title on one line, the examples stay
- [x] vitest (452), eslint, tsc, `next build`, headless run (`review161.mjs`)
