# 284: A student's skill tree opens as a sheet over the rows below, nothing moves

**What to build:** On a set's Class View a student's open skill tree (see dot skills, a pill, a row tap) no longer inserts a row into the roster that pushes every student below it down. It opens as a sheet laid over the rows under the student's row, as history's results stand over the rows above: no row, head or card moves as a tree opens, closes or swaps.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-14), after ticket 280 anchored the pressed row by scrolling the frame: "ok the jumping around is kind of not great. let's change to the pop up over the next students' row idea. same idea as to how show history works".

## Solution

- `DrillSheet` in `app/teacher/TeacherLive.tsx`: an absolutely positioned sheet in the roster box (beside `HistoryBlocker`), left and width the table's, top the open student's row's bottom edge, measured in layout px (the frame is zoomed) on every table or tree resize. Paper under the drill row's cream, a line top and bottom and a soft shadow, so it reads as lifted over the rows.
- Its height is the tree's, stretched to the bottom line of the row it ends over, so the cut is a row's line and never a sliver of a row. Past the last row it is the tree's own height, and the roster box takes bottom padding so the frame can scroll to its end (removed on close).
- A click on the sheet's blank paper closes it (a click over a covered row is that); trees (`[data-col]`), work, buttons and links keep their clicks. Rows above and below the sheet keep ticket 280's rules: empty space only closes, pills and row buttons act at once.
- Hovering the sheet keeps the open student's row buttons in view (the sheet is outside their `tbody`), after the marker grace as on the row; the sheet reports pill/dot markers like the row did.
- The column view (a header's "see skills" / "full breakdown") still opens rows under every student: not a single student's tree. Ticket 280's row anchoring stays for it.

## Acceptance

- [x] Click-through at 1280×800 and 1440×900 (`click284.mjs`, 548 checks, real mouse events): all of ticket 280's cases re-read for the sheet (a row under the sheet: a tap closes, the next opens; a row below the sheet and a row above: empty space and Confidence close, pill, see dot skills, see history at once); for Mia, Noah, the first, second-to-last and last rows opened by button, pill and row tap: no row moves, table and card keep their height, the sheet starts at the row's bottom edge and spans the table, the next row is covered, the sheet ends on a row line or past the last row, the tree fits inside, the end of the sheet scrolls into view, a node click keeps it, the row buttons show over the sheet, blank paper closes it and the scroll height returns
- [x] `click279` re-run (1250), vitest 943, eslint, tsc, next build, check:laptop 74
