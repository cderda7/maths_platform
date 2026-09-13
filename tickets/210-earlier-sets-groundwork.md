# 210: Groundwork for four earlier sets: registration, shared checks, the class story sheet

**What to build:** Adding a finished set to the Classroom is one self-contained data folder plus one registration line, so four agents can each add a set without touching the same code. A shared test suite runs over every finished set (twenty students, every step tagged with a real leaf, every wrong problem with worked attempts, New skills named and tagged in the problems, Priya dark green in every category, the set's results matching the story sheet). A **class story sheet** fixes, for every student and every category, the colour on each of Problem Sets 1–6, so the four new sets agree with each other and with Sets 5 and 6.

**Blocked by:** 209.

**Status:** ready-for-agent

**Triage:** `ready-for-agent`

---

## Problem Statement

Four sets (211–214) are authored in parallel worktrees. Without a shared registry shape they collide on the registry, the evaluation index and the tests; without a shared story they contradict each other. The user (2026-09-13): students "have a level of consistency between assignments (obviously wnat variation, but don't want random jumping)": neighbouring results in a category move at most one step (red ↔ orange ↔ light green ↔ dark green). Existing habits carry: Jordan's unchecked factor pairs, Mia's non-monic factorising, Aiden scaling part of an expression, Grace right in one jump, the axis-for-height slip (Zara, Ethan, Isla, Ruby), Liam handing in little, Chloe missing on Set 6, Priya dark green throughout.

## Solution

- A finished-set module shape (fixture, pathway, Sam, classmates, evaluation table) and a registry that reads a list of them, newest first; the evaluation index built from the same list.
- The Set 5 integrity tests generalised to run over every registered finished set.
- `specs/class-story.md`: per student, per category, per set the status (and the one or two habits that produce it), Sets 5 and 6 read back from the real data; per set the topic, date, New skills, who is missing and the class's top gap. One-step rule checked by a test that reads the sheet.
- The ticket files for 211–214 point at the sheet's rows.

## Acceptance

- [ ] Set 5 registered through the new shape with no behaviour change
- [ ] Shared suite green on Set 5; a deliberately broken fixture fails it
- [ ] Story sheet complete for all 20 students × every category × Sets 1–6; its Sets 5 and 6 rows equal the real results (test); no neighbouring pair more than one step apart (test)
- [ ] vitest, eslint, tsc, next build
