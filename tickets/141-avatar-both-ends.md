# 141: The roster's avatar at both ends of the row

**What to build:** On the class view's roster the student's avatar is back before the name, where it was before ticket 136, as well as in the last column after Set. Everything ticket 136 built stands (16 px name in its fixed slot, the **in progress** pill beside it at one x, the avatar closing the row), and the roster still fits the 1280 × 800 laptop's card with no scroll.

**Blocked by:** 136.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12), on ticket 136's build: "avatar in both places -- where it was og in addition to your placement on the right". Ticket 136 had read "place the avatar there" as a move, and spent the width that freed on the bigger name and the inline pill; the leading avatar needs 44 px (32 and its 12 px gap) the roster did not have at 1280.

## Solution

- `app/teacher/TeacherLive.tsx`, the roster only:
  - `<Avatar>` before the name block again, in the cell's `flex items-center gap-3`; the closing avatar's cell stays (`px-2` now).
  - The width comes from sizing each category column to its chip instead of 96 for all: `columnWidth(c)` returns a number of px by the chip's letters (≤ 7: 80, 8: 88, ≤ 10: 96, more: 132; the chip is about 20 px plus 8 a letter, so Algebra 75 sits in 80, Graphing 83 in 88, Functions / Reasoning / New skills 91–93 in 96, Communication 126 in 132), which is 22 px; Confidence 92 → 84 (`CONFIDENCE_COL`; its head word is 60 px, the skills under it are `FitText`), the closing avatar's column 56 → 48 (`AVATAR_COL`), and the pill `px-1.5 gap-1` (88 → 82 px). The student column is 420 (`STUDENT_COL`: 20 + 32 + 12 + 142 + 82 + 12 + 96 + 20 = 416 with Sam's row hovered).
  - The column widths and the table's minimum width are inline styles from those numbers (`rosterMinWidth(columns)` = 1204 for the demo's six categories), not arbitrary Tailwind classes, since the sum is computed.
- Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `README.md`.

## Acceptance

- [x] Every row: the avatar at the cell's left (20 px in, 32 wide), the name 64 px in, and the same initials in the closing avatar; every ticket 136 check still holds (slot 142, Sam's pill at the slot's end, a pill after Ruby Castellanos at Sam's x, common row height, chips clear by ≥ 2 px and on one line, hover buttons right of the pill inside the cell, open row and column view spanning ten columns)
- [x] At 1280: columns 420 · 80 · 96 · 88 · 132 · 96 · 96 · 84 · 64 · 48 = 1204 in the 1208 card, no scroll, no page overflow; at 1400 the table stretches to the card
- [x] vitest (423), eslint, tsc, `next build`, `npm run check:laptop` (16 route/size checks), headless run (`verify141.mjs` at 1280 and 1400) with crops
