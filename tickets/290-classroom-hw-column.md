# 290: HW column beside Completed (HW1 and HW2)

**What to build:** homework becomes a kind of assignment, weekly, and Sam's Classroom shows a column of homework cells to the right of his Completed cards, each spanning the rows of the in-class sets it covers: a green "HW1 completed" beside Problem Sets 1–2 and a caution "HW2" with "problems added to next HW" beside Problem Sets 3–4.

**Blocked by:** 287 (both change the Completed cards).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-15): "for each PSet, add a cell to the right forming a column that says 'HW{N} completed' or 'HW{N}' caution sign -- the same triangle with an exclamation mark as is in the missing student row within a pset." Then: "have HW once a week ... have HW cell to the right of PSet, not within. ... have the HW cell span the relevant assignments. so HW1 right of PS1 & PS2; height spans both."

## The homework model (agreed 2026-09-15)

1. Each homework has a due date and covers the in-class sets **due after the previous homework's due date, up to its own**. Weekly: HW1 = PS1 (Tue 25 Aug) + PS2 (Fri 28 Aug), due Tue 1 Sep; HW2 = PS3 + PS4, due Mon 7 Sep; HW3 = PS5 + PS6, due Mon 14 Sep (created in ticket 291).
2. A homework = the teacher's 10 problems everyone does + each student's own mistakes from its sets (a problem **ever wrong**: first submission wrong or not attempted, even if fixed later; ticket 256's rule).
3. **Homeworks never overlap** (a homework is due before the next is created). Record this in ASSUMPTIONS.md; "overlapping homework" goes to FUTURE_FEATURES.
4. Missing the due date with problems undone = **missed, final**: the caution stays for good; nothing done later turns it green.
5. A missed homework's undone **own** problems (never the teacher's 10) join the next homework, deduplicated by skill among the student's own problems (ticket 294).
6. A homework's contents freeze when it opens to students (ticket 292); a set created later goes to the next homework.

Sam's history (demo data, separate named story data): **HW1 done on time, HW2 missed, none of it done.**

## This ticket's slice

- Homework as an assignment kind with id, name ("Homework 1"), due date, covered sets (by the date rule), and per-student status (completed / missed / open).
- Sam's Classroom: the content column widens to near the iPad's full width (minus gutters) so cards keep about today's width and a ~190 px HW column fits to their right.
- **Cells**: one per homework, spanning its covered Completed rows, row-aligned (top of the first row to bottom of the last).
  - completed: green check + "HW1 completed"
  - missed: the Class View's Missing caution triangle (light blue, `!`) + "HW2" + small grey note "problems added to next HW" (ticket 292 switches it to "current HW" once the next homework is open)
- Triangle and completed cells are **not pressable**.
- A Completed set not covered by any homework yet (PS5 now; PS6 once completed) gets an empty space of the column's width so the column stays straight.
- The column exists only beside Completed (not To do or Missing).
- Record the model in the decision log.

## Acceptance

- [x] Unit tests: coverage by date rule, HW1/HW2 statuses for Sam, missed is final
- [x] Classroom shows HW1 cell spanning exactly PS1–PS2 rows, HW2 caution spanning PS3–PS4, empty space beside PS5 (and PS6 when completed); cards still open their reports (ticket 287)
- [x] The caution triangle is the same drawing as the Class View's Missing mark
- [x] Cells ignore presses; nothing on the page scrolls horizontally on the iPad
- [x] No difficulty tags
- [x] vitest, eslint, tsc, next build, check:laptop; click-through measuring cell spans against row rects
- [x] ASSUMPTIONS.md entry; ticket docs, architecture note, ARCHITECTURE, decision log, future features
