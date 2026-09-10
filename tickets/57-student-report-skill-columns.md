# 57: Student report: the skills laid out as the teacher's class-view row

**What to build:** The "Your report" skills card matches the teacher's class view: one column per category with its chip over its dot, and under every dot at once the groups beneath it (the skills for New skills), each group's dot on its category dot's line. Nothing is collapsed and no outline has to be clicked open. As on the teacher's grid, a group opens its skills and a skill the student's work beneath the columns; skills read by their student names and carry no difficulty tags.

**Blocked by:** 46 (class view polish: the column layout being matched).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The student's report showed the skills as an outline: six category rows, each collapsed until clicked, then its groups indented beneath it, then a group's skills. The teacher sees the same student as one row of the class grid, a chip and a dot per category and every category's groups open side by side. The user wants the student's card to look exactly like that row and not to offer the collapsed outline at all.

## Solution

A new `SkillColumns` component draws the row: a header of category chips (the teacher's chip styling, flex-centred so the wide Communication chip spills evenly rather than under its neighbour), a row of category dots with the "Unit 1" label beside the flat category's dot, and beneath them the teacher's own `RowDrill` in `groups` mode, fed the measured dot positions so every tree's dots sit on its category dot's line. `RowDrill`, `SkillTree` and `WorkPanel` gain a `student` flag: skills by `studentLeafName` ("factorising", not "monic factorising") and no `DifficultyTag`. `ReportScreen` swaps `HierarchyDrill` for `SkillColumns`; the card is `shrink-0` (an `overflow-hidden` card shrank as a flex child and clipped an opened skill's work). A work line wraps its blame chip onto a second row when the card is narrow.

## Acceptance

- [x] The report card: ALGEBRA · FUNCTIONS · GRAPHING · COMMUNICATION · REASONING · NEW SKILLS chips over six dots, "UNIT 1" beside the last dot
- [x] Every category's groups shown at once beneath its dot, dot centres aligned to the pixel; no category has to be clicked
- [x] A group click opens its skills by their student names; a skill click shows the work beneath, no difficulty tag anywhere
- [x] vitest, eslint, tsc, `next build`; headless-Chrome check of the built app; architecture note and root docs
