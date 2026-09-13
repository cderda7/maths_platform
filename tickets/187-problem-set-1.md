# 187: Problem Set 1 — Features of a parabola, finished, with all twenty students' work

**What to build:** A second, past assignment the teacher can open from the Classroom: "Problem Set 1 — Features of a parabola", due Thu 3 Sep, pathway individual → individual review → group review, every stage complete. Ten problems on the three forms of a quadratic (standard, turning-point, factorised): intercepts, axis of symmetry, turning point, sketching, converting between forms. Every one of the twenty students has full data at the same depth as Problem Set 2 (confidence answer, answered count, wrong problems, mistake notes, worked attempts for each wrong problem, clarification, group status); Sam's answers are fixed and finished. Liam O'Connell did not submit (missing). Its Class, Mistakes and Groups tabs all work (Groups is its frozen copy). The class's gaps in Set 1 foreshadow Set 2 (e.g. Mia's non-monic factorising slows her intercepts here and her roots in Set 2; Jordan's unchecked factor pairs). On Problem Set 2's Class View, each student's newest history pill per skill is that student's real Problem Set 1 result; the four older pills stay generated, dated before Set 1.

**Blocked by:** 185.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13): "let's actually just do 1 prev assignment. so PSet 1 already there, finalized ; PSet 2 is this assignment -- the one to be created & done with the class -- also do all 20 students, Sam should have answers as well, & have … some other student having not submitted PSet 1"; review stages complete; topic A "Features of a parabola" (same syllabus part and skill tags as roots, so the columns line up and a gap can carry across sets); history option A; "no i trust it just go for it" (no content review before writing).

Facts (2026-09-13): categories are derived from the set's problems (`categoriesTouched()` in `lib/hierarchy.ts`); history pills are generated in `lib/history.ts` (`HISTORY_DATES`, `MIXES`, `ALL_SECURE_STUDENT = "priya"`); mistakes come from `lib/mistakes.ts` over classmates' `wrong`/`attempts`/`notes` and `SLIPS`; classmate data per problem id in `data/classmates.ts`. All 20 students are fully authored (the `light()` helper is only a constructor).

## Solution

- `data/pset1/` (problems with model solutions tagged from `data/taxonomy.ts`, classmates' Set 1 results, slips) registered in the assignment registry with stage "finished".
- Mistakes, Class and report code take the assignment's data instead of module constants.
- `lib/history.ts`: the newest past point per student/category comes from Problem Set 1's evidence; older points dated before 3 Sep.
- TeX: doubled backslashes; if any Set 1 TeX reaches a hint-box screen run the hint sweep (it should not: Set 1 is teacher-side only).

## Acceptance

- [x] Classroom shows Problem Set 1 under Past with a computed top gap; clicking lands on Class
- [x] Class View: 19 submitted rows with dots, Liam missing, pathway all complete
- [x] Mistakes: ten problems, correct/skipped counts, clusters with names; every name opens real work
- [x] Groups tab shows its frozen groups
- [x] Set 2's history: newest pill equals Set 1's status for that student and skill (test)
- [x] vitest (new tests for Set 1 data integrity: 20 students, every wrong problem has attempts, tags exist), eslint, tsc, next build, check:laptop
