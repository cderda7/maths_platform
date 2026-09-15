# 324: A homework cell press shows the insight placeholder

**What to build:** for the demo, pressing a homework cell on the teacher's Classroom turns that cell dark grey for a moment with white text reading "HW insight scoped in FUTURE_FEATURES", then it reads normally again; FUTURE_FEATURES scopes the homework insight view the press stands in for.

**Blocked by:** none

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-15): "just for the purpose of the demo, add functionality where clicking in HW tile leads to tile temp changing to dark grey background & white text that says 'HW insight scoped in FUTURE_FEATURES'. also read through F_F & ensure that it's actually scoped there".

Ticket 305 made the teacher's homework cells plain divs that open nothing. FUTURE_FEATURES had two short entries about a teacher homework results view (tickets 291 and 305), one with a stale reason (only Sam had homework data, which ticket 305 changed) and one saying cells are not pressable.

## Decisions

- Target: the teacher's Classroom homework column (ticket 305), every cell in every state (done counts, "sent · opens after Problem Set 6", Homework 3 open). Sam's iPad cells (ticket 290) are unchanged and stay unpressable.
- A cell is a button. A press (mouse, Enter or Space) shows "HW insight scoped in FUTURE_FEATURES", white, centred, on `ink-soft` (#3d3b66, the palette's dark grey; not the indigo accent), the tile's border included, for 2.5 s. A press during the message restarts the timer; pressing another cell moves the message there (one at a time).
- The message is an overlay inside the cell's own box: no cell, card or pinned region moves. A visible focus ring (the Classroom's `ring-accent/30`), a hover border tint, and a polite live region beside the cells announce the message (a button's children are presentational to assistive tech).
- Cursor: the teacher side's arrow, not a hand. `[data-teacher-root] *` sets `cursor: default` unlayered on purpose (ticket 61: links, buttons and rows never show the hand), so a `cursor-pointer` here would lose and would break that rule if forced.
- The timer is set from the press handler (`flasher` in `lib/hwInsight.ts`) and cleared on unmount; no state is set from an effect.
- FUTURE_FEATURES: one full "Homework insight" entry in a section for this ticket; the entries under tickets 290, 291, 292 and 305 that described the teacher's homework view or unpressable cells are brought up to date and point at it.

## Acceptance

- [x] Unit tests: exact message, 2.5 s, clear after the timer, restart on a second press, move to another cell, nothing after dispose
- [x] Every teacher cell (fresh; HW3 sent; activity completed with HW3 open) is a button; a real mouse press shows the exact message, white on ink-soft over the whole tile, text inside and centred on two lines; one cell at a time
- [x] No card, cell or pinned-region rect changes during or after; reverts by ~2.9 s; a second press restarts; another cell takes the message
- [x] Tab reaches a cell with a visible ring; Enter and Space press it; the live region reads the message
- [x] Card arrows still open their sets; Sam's iPad cells stay plain divs, a press changes nothing
- [x] 1280×800 and 1440×900, no sideways scroll; screenshots checked
- [x] vitest, eslint, tsc, next build, check:laptop; click-through against a production build
- [x] Ticket docs, architecture note, ARCHITECTURE, decision log, future features, README
