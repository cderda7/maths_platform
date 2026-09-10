# 55: Class view: the header control reads see skills / full breakdown / close, a student's block is one hover target, and the board chip is gone

**What to build:** On `/teacher`: the column header's stacked buttons read "see skills" and "full breakdown"; the open level's button reads "close", and with the full breakdown open it is the only button. Hovering anywhere in a student's block (the row or the drill open under it) shows "see dot skills" / "student report" beside the name; while that student's row is open the first reads "close". The "Board · blank" chip is removed from the class view and from board controls, and never shown anywhere.

**Blocked by:** 46 (class view polish), 54 (board controls).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Three screenshots from the user (2026-09-10): the "Board · blank" chip under the class-view title ("remove board icon in all instances. never have this"); the header's "skills" / "sub-skills" pair, whose words did not say what they open ("see skills", "full breakdown"); and the open state reading "close skills" over "sub-skills", two buttons where one would do. A fourth: with a column open every row is tall, but the buttons beside a name only appeared while the mouse was over the name's own row, not the drill beneath it. And "see dot skills" kept its name once the row was open, so it was not obvious that clicking it again closes.

## Solution

`TeacherLive`: the header's words change; when the open level is `expanded` the list of buttons is filtered to that one level, and any open level's button reads "close" (it still closes the column, as before). Each student's row and drill row now share one `tbody` (`RowGroup`), which carries the `group/row` class, so the hover that shows `data-row-actions` covers the whole block. The row button reads "close" and clears `open` whenever the row is open in any mode. `BoardIndicator` is deleted with its `boardWord` helper and tests; `BoardControls`'s heading is the title alone.

## Acceptance

- [x] No "Board · …" chip on `/teacher` or `/teacher/board`; the component is gone
- [x] Header hover: "see skills" / "full breakdown" (a two-layer category: "see skills" only)
- [x] see skills open: "close" / "full breakdown"; full breakdown open: "close" alone; close clears the column
- [x] Follow-up: the lone "close" is as tall as the two-button stack it stands in for (same top and height)
- [x] Column open: hovering the drill row under a name shows "see dot skills" / "student report"
- [x] Row open (by the button or a dot): the button reads "close" and closes the row
- [x] vitest, eslint, tsc, `next build`; headless-Chrome click-through on port 3131; architecture note and root docs
