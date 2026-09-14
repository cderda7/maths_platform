# 282: The report shows not attempted and covered in class review

**What to build:** On the student report (the teacher's and the student's own), a problem the student did not attempt that their group solved sits under "Correct after group review", its working starting with a *not attempted* first submission. A note under whichever column holds them names the problems not attempted. A new grey "Covered in class review" column, shown only when the set's pathway includes class review, takes the problems a group left unsolved that class review then covered, with the board's examples in their working. The old "not solved in group review" note and tag go.

**Blocked by:** 281.

**Status:** ready

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-14), after ticket 244's reports: a problem a student never attempted reads as Incorrect even when their group solved it, and a problem nobody could do reads as a plain failure even after the class went through it together. "want to model process for questions that nobody in a group can do, a real world reality — ALSO add column … 'covered in class review'".

Settled in the same conversation:

- **Not attempted, solved in group (2a):** the tile goes under "Correct after group review", and its working starts with a first-submission pane reading *not attempted*.
- **Not-attempted note (3c, 4):** it goes under whichever column the tile lands in, e.g. "Q9, Q10 not attempted", Incorrect included.
- **Removed (3c):** the "Q4, Q8 not solved in group review" note under Incorrect, and "· Not solved in group review" beside the outcome inside the working.
- **"Covered in class review" (9a):** a new outcome column after "Correct after group review" and before Incorrect.
  - Its tiles are grey and neutral (16b). It appears only when the set's pathway includes class review. A problem left unsolved in group that class review covered moves there; Incorrect keeps what class review never covered.
  - Its working shows the first submission (and second, if any), the group's last try, then a "Class review" pane with the examples the teacher put on the board, unmarked and anonymous (15a).
- **The live Set 6:** "covered" means the problems the teacher actually put on the board in class review. The column shows once class review has happened.
- **Both reports:** the student report's tiles use the same component (`components/OutcomeTiles.tsx`), so decide there too. The default is that the student report shows the same columns.
- **Found while building 278 (not settled with the user):** `holds` in `lib/report.ts` counts a first submission with no wrong line as right, so Sam's incomplete Q9 (stopped before the height) reads "Correct first try" on his live report. An incomplete problem should land where its later versions put it; decide alongside not attempted.
- **Fit:** every report still fits 1280×800 and 1440×900 with nothing to scroll (ticket 243's rule).

## Solution

- `lib/report.ts`: an outcome for covered in class review (after group, before wrong) read from a record's class review data (ticket 281) or, on the live set, the class review the teacher projected; a not-attempted problem the group solved is `group`; `shownVersions` gains the not-attempted first pane and the Class review pane; `unsolvedOf` and its note go, and a not-attempted note per column replaces them.
- `components/OutcomeTiles.tsx`: the grey column, only under a pathway with class review; the per-column not-attempted note.
- `app/teacher/report/TeacherReport.tsx`, `app/student/screens/ReportScreen.tsx`: the working's panes; "· Not solved in group review" removed.

## Acceptance

- [ ] Unit: outcomes for not attempted (group-solved, unsolved and uncovered, covered), the column only under class review, the live set's covered set from the projected problems once class review has happened, the panes per outcome, the note per column
- [ ] Click-through at 1280×800 and 1440×900: all twenty reports on all six sets and Sam live, both reports; grey tiles and the column only on PS1, PS3, PS6; working panes as above; notes on one line; nothing to scroll with nothing or any working open
- [ ] vitest, eslint, tsc, next build, check:laptop
