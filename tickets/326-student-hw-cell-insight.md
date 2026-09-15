# 326: Sam's homework cells show the insight placeholder too

**What to build:** on Sam's iPad Classroom, pressing a homework cell that opens nothing (completed, missed, or sent and waiting in the Future) shows ticket 324's placeholder: the cell turns dark grey for 2.5 s with white "HW insight scoped in FUTURE_FEATURES", then reads normally. The open homework's cell keeps opening the homework screen.

**Blocked by:** 324

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-15), right after ticket 324 made the teacher's homework cells show the placeholder: "also add to student, if they go to click on their HW tile".

Sam's cells (tickets 290, 292, 307) were plain divs except the open homework's, which opens `/student/homework/<id>`. A presenter pressing HW1 or HW2 on the iPad got nothing.

## Decisions

- Target: `app/student/StudentClassroom.tsx` `HomeworkColumn`. Every cell that opens nothing is a button with the placeholder: completed (HW1), missed (HW2), and a sent homework's cell while it waits in the Future panel (HW3 after "send homework"). The rule is one pure function, `studentCellShowsInsight` in `lib/hwInsight.ts`.
- Unchanged: the open homework's cell (HW3 once in To do) still opens the homework screen and never shows the message; the Future panel's card stays unpressable (it is not a homework tile); Completed cards still open their reports; the teacher's cells (324).
- The look is 324's: the same `flasher`, message and 2.5 s; `ink-soft` ground and line (the `hw-card-edge` outline, and the 1px border a keyboard focus shows), white text centred in the cell's own box over its words and dates; one cell at a time, a second press restarts, another cell takes it; Enter and Space; a polite `sr-only` live region beside the cells.
- Type: 15 px medium, 21 px leading, `px-3` (324 used 17 px in a wider cell). In the 190 px cell it reads "HW insight scoped in" (152 px) over "FUTURE_FEATURES" (144 px), and fits HW3's one-row 56 px cell.
- At rest a cell keeps its state's own colours (green ground and line on completed, dark red line on missed, muted on waiting). Hover adds the Completed cards' shadow only, so no state colour changes; focus is the open cell's accent ring with the 1px border in the line's own colour.
- Nothing moves: at rest every element on the Classroom sits exactly where it did before the change (compared with a build of main), and during and after a press.
- FUTURE_FEATURES: 324's "Sam's cells opening their own read-back" becomes a full "Sam's cells open his own homework insight" entry; the entries under tickets 290 and 293 that said his cells are unpressable point at it.

## Acceptance

- [x] Unit tests: which cells show it (fresh, HW3 sent, HW3 open) and the rule by state
- [x] Fresh (HW1, HW2), HW3 sent (HW1-3) and HW3 open (HW1, HW2): each a button; a real mouse press shows the exact message on that cell only, white on `rgb(61, 59, 102)` over the whole tile, line included, text inside, not clipped, centred on two lines; still on at 2.2 s, off by 2.9 s with the state's colours back; the page path stays `/student`
- [x] Nothing moves at rest (against main's build), during or after; restart; another cell takes it; Tab ring, Enter and Space, focused tile dark to its border; live region polite
- [x] HW3 open: no overlay on its cell, a press opens `/student/homework/hw-3` with no message; the Future panel card is not pressable; Completed cards open their reports; the teacher's cell press unchanged
- [x] 1280×800 and 1440×900, no sideways scroll; screenshots checked
- [x] vitest, eslint, tsc, next build, check:laptop; click-through against a production build
- [x] Ticket docs, architecture note, ARCHITECTURE, decision log, future features, README
