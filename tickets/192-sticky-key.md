# 192: Class View's Key rides the bottom of the view as the teacher scrolls

**What to build:** On every assignment's Class View (finished Problem Set 1 and live Problem Set 2), the Key card in the side column sits near the bottom of the window and stays there as the teacher scrolls the roster. The cards above it (Pathway, class review, group progress, Live diagnostic) keep their place at the top of the column, level with the table, and scroll away with it.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13, screenshots of Problem Set 1's and Problem Set 2's Class View): "let's make the default that key is in that right column, but always near the bottom of the page. when the teacher scrolls through the assignment, it moves with the scroll & stays at the bottom. make this the default for both a completed assignment & the assignment in progress. also, have this be true for the whole right column … but want key placed at bottom & other items aligned as far up top as possible (as in don't change), like move key down but i like the placement of the others."

## Solution

- `app/teacher/TeacherLive.tsx`: the side column is a flex column (it already stretches to the roster's height in the grid). The cards above the key are unchanged. The Key card sits in a `flex-1 justify-end` box that takes the rest of the column, and is `sticky bottom-12` against the teacher frame's scroll region (`[data-teacher-scroll]`).
  - Its box starts below the last card above, so on a short window the key can never ride up over them.
  - `bottom-12` equals the frame's bottom padding (`py-12`). The place it rides while scrolling is where it comes to rest on the table card's bottom at the end of the roster, so it doesn't jump. It also clears Reset demo at 1280 (`bottom-6` covered the pill's corner).

## Acceptance

- [x] pset-1 and pset-2 at 1280×800, 1400×1000 and 1512×860: at the top of the page the Key's bottom is near the window's bottom, at mid-scroll it is in the same place, and at the end it rests on the table card's bottom with no jump
- [x] pset-2: the Pathway card's top level with the table's at the top, and it scrolls with the table; the Key below the Live diagnostic card
- [x] An open drill row grows the roster and the Key still stays put; a 520 px tall window keeps the Key below the cards above
- [x] Reset demo never covers the Key
- [x] vitest 568 (after the rebase onto 190), eslint, tsc, next build, check:laptop 30; click-through `key192.mjs` (55 checks)
