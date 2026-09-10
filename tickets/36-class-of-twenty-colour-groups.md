# 36: Class of twenty in five colour groups

**What to build:** The class has twenty students. The teacher sets five static groups of four by dragging students between five colour columns on a class-level groups page, seeded from a seating-chart fixture and reused across assignments; uneven groups are allowed with a warning. A group's only identity is its colour. Every teacher view shows all twenty, and the platform-generated grouping stays available for reporting.

**Blocked by:** None (can start immediately).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Seven students is too few to show a leaderboard of five groups, and today's groups are a fixture the teacher cannot touch. In practice groups are the seating chart: static, decided by the teacher, and unrelated to who made which mistake.

## Solution

Thirteen lightweight classmates join the six full ones and Sam: a name, a confidence answer, a list of problems got wrong, and a group. The six existing classmates keep their full scripted attempts. The classroom holds the five groups per class; a teacher page lets them be rearranged by drag between colour columns. Five fixed colours chosen to read on a projector and to imply no order.

## Acceptance

- [x] Twenty students in the fixture; Sam's group is Sam, Jordan, Zara and Liam as today
- [x] Teacher groups page: five colour columns, drag a student between them, uneven group shows a warning, saved per class and surviving a reload
- [x] The teacher's live grid, mistakes, compare, report and whole-class setup show all twenty
- [x] The generated grouping still exists and is untouched
- [x] Unit tests for the group model and the seeded fixture; a browser check of a drag
- [x] Architecture note and root docs
