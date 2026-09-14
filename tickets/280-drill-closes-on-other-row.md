# 280: Another student's row closes an open skill tree; pills and row taps open the full tree

**What to build:** On a set's Class View, while one student's skill tree is open under their row, a click on another student's row behaves like history mode: a click on empty space in that row (or any cell that is not a button, pill or link) only closes the open tree, and the next click there opens that student's full dot-skill tree. That row's "see dot skills" and "see history" act at once, and its category pill opens that category's tree at once. A category pill now opens the category's full tree (groups and their dot skills), not just the groups. The pressed row never moves on screen when a tree above it opens or closes.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-14), after ticket 279: "when i click out of the current student row, an expanded history collapses. this is great. want the same functionality for the dot skills view -- once i click into another student row, current expanded dot skills collapse". On what a click on the other row does: "if teacher clicks on 'see history' or 'see dot skills' in Noah's row, auto open. if teacher clicks on a category pill, open just that category's dot skills. (OH to that point rn clicking on category pill only opens group skills. show full tree (including dot skills) for that category pill instead). if teacher clicks elsewhere, simply close Mia's. if teacher clicks again into white space, open dot skill tree view".

Reproduced before the change (1280×800, PS6): with Mia's dot skills open, a click on Noah's row replaced Mia's tree with Noah's groups (or, on a pill, Noah's category groups) in one click. Found while testing: Mia's tree sits above Noah, so closing it moved Noah's row up by the tree's height, leaving a different student (Grace) under the pointer, whose row the next click would open.

## Solution

- `rowClick`: history's leave first, then `leaveDrill` (another student's tree open: close it, nothing else); otherwise toggle this row's tree, opening `expanded` (was `groups`; the full tree was a double-click).
- `pillClick`: the category's tree with `expandAll` (was the groups; the full tree was a double-click); the same pill again closes it. Pills and row buttons skip `leaveDrill`, so they act at once.
- Double-clicks on rows and pills are gone (a single click now opens what they opened); `repeated` ignores the second click of a double-click on the same target, so it never shuts what the first opened.
- Row anchoring: `anchorRow` records the pressed row's screen top before a tree opens or closes (`openRow`, `leaveDrill`, `openHistory`); a layout effect scrolls the teacher frame by the move (in layout px, the frame being zoomed) so the row stays under the pointer.

## Acceptance

- [x] Reproduced the old behaviour in the browser first
- [x] Click-through at 1280×800 and 1440×900 (`click280.mjs`, 334 checks, real mouse events): every PS6 category pill opens exactly the column view's full breakdown for that category and closes on a second press; a row tap opens the same tree as see dot skills; double-clicks keep them open; with Mia's tree opened three ways (see dot skills, a pill, a row tap), Noah's empty space and Confidence cell only close it and the next tap opens his full tree, his pill opens his category's full tree at once, his see dot skills and see history act at once, Mia's own empty space closes hers; a row above (Tomas) closing a tree below and a pill below a tree; history mode still leaves on another row's tap and pill; Noah's name still opens his page; every pressed row stays within 1 px on screen and under the pointer; no sideways scroll
- [x] vitest, eslint, tsc, next build, check:laptop
