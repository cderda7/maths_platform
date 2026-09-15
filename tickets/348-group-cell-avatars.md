# 348: The whole table in the cell it is working on

**What to build:** on the group grid (ticket 319), the cell a group is working on shows every present member of that group, not only the pen-holder, with the ring in the group's colour around the student holding the pen.

**Blocked by:** 319.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Carson on ticket 319's grid, 2026-09-16: "show all 4 student avatars in the box, with the colred ring around the student who's working."

Ticket 319 drew one avatar in the cell on the board, so the teacher could see whose turn it was but not who else was at that table. Group review is a table of four working one question together (three where a member is absent, as amber is with Chloe away), and the teacher walking the room reads the table, not just the pen.

Settled:

- **Every present member** of the group is drawn in the cell the group is on, in seating order (`members` from ticket 332's `groupsAt`), so amber draws three and the rest four.
- **The pen-holder's avatar** carries the ring in the group's colour; the other members' avatars are plain.
- **The cell** keeps a fainter inset ring in the group's colour, so the question a group is on still reads from across the grid while the strong ring names the student working.
- **Fit.** Four avatars have to fit a cell at 1280 × 800 with five groups sharing half the split: the avatars are measured before paint and shrink to fit, never wrapping, clipping, overlapping a neighbour or widening the grid.
- Nothing else about the grid changes: the tones, the "n/m" head, the chip, the cards and the class review band stay as ticket 319 built them.

## Acceptance

- [x] On `/teacher/a/pset-6/mistakes` during group review, the cell each group is working on draws every present member's avatar, in seating order, inside the cell's ring
- [x] The pen-holder's avatar, and only that one, has a ring in the group's colour; the ring follows the pen as turns change
- [x] Amber draws three avatars (Chloe absent), every other group four
- [x] The cell keeps its inset ring in the group's colour, fainter than the pen-holder's
- [x] A cell that is not on the board is unchanged: its tone, and the white ✕ when unsolved
- [x] The avatars fit inside the cell at 1280 × 800 and 1440 × 900: no wrap, no clipping, no overlap of the cell's edges or its neighbours, the grid no wider than its column, nothing scrolling sideways
- [x] The avatars' size is measured from the cells before paint (no state, no re-render) and does not change as the boards play; the grid's geometry is unchanged from ticket 319
- [x] The Class tab's group card, the cards on the right and every other stage of the split are untouched
- [x] vitest, eslint, tsc, next build, check:laptop, sweep:hint-boxes; click-through at 1280 × 800 and 1440 × 900 with Sam's iPad and the teacher tab against a production build
- [x] Ticket docs: `architecture/348-group-cell-avatars.md`, ARCHITECTURE, DECISION_LOG, FUTURE_FEATURES

## Solution

- **Model (`lib/groupGrid.ts`).** `cellAvatars(avail, members)` is the pure fit arithmetic: the avatar size, the gap between them and the initials' size that put `members` avatars, plus the pen-holder's ring, inside `avail` layout px, down to a floor.
- **Grid (`app/teacher/WhereGroupsAre.tsx`).** The cell on the board draws `column.members` as avatars, the pen-holder's ringed; a layout effect measures a cell before paint and writes `--cell-av`, `--cell-av-gap` and `--cell-av-text` on the grid, again on a resize and once the fonts have loaded.
