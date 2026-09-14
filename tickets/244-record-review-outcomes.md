# 244: Every record carries what review made of its mistakes

**What to build:** Every set record (all twenty students on Problem Sets 1–6, Sam's finished-set records included) says, for each problem it got wrong, whether the student fixed it on their own rework, their group fixed it, or it stayed wrong, with the working behind it: the second submission, and the group's rework or last try. The teacher's student report then fills every review column and shows those versions side by side (ticket 243 reads `Classmate.review`).

**Blocked by:** 243.

**Status:** ready

**Triage:** `ready-for-agent`

---

## Problem Statement

Agreed with the user on 2026-09-14, grilling ticket 243: every student on every set gets real review columns (1a), not only the live student. The records hold only their first submission (`wrong`, `attempts`), so a record today fills only Correct first try and Incorrect.

## Solution (agreed)

- **Who fixes what (8a), hand-checked per case:** a one-off slip is fixed on the student's own rework; a slip another member of their group did not make is fixed in group review; a habit (the class story sheet shows a gap in that category) stays wrong, and is marked unsolved in group review when their group took the problem on.
- **Working, not just outcomes (15):** each fixed or reworked problem needs the second submission written line by line (every line in the set's evaluation table, a wrong line carrying its slip's leaf), and a group-reviewed problem needs the group's rework (correct) or last try (wrong), shared by the group's members.
- **Where it lives:** `Classmate.review` per record; the story sheet (`data/story.ts`, `specs/class-story.md`) gains a review part per set so tests pin every record to the sheet, as they pin statuses.
- **Live Set 6 (9a):** a classmate's outcome shows only once the class has reached that stage; before individual review ends every unfixed problem sits in Incorrect, the columns never shifting.
- Groups per set: the set's own seating (`lib/seating.ts`).

## Acceptance

- [ ] Unit: every record's review against the sheet; every second submission and group version evaluates as the outcome says (holds when fixed, a wrong line when not); group versions identical across a group's members; live Set 6 stage-gated
- [ ] Click-through: all twenty reports on all six sets show the sheet's columns and open the right versions, nothing wider than its column, nothing to scroll
- [ ] vitest, eslint, tsc, next build, check:laptop
