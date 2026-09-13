# 217: Six sets end to end, and the docs

**What to build:** The Classroom holds Problem Sets 1–5 under Past and Set 6 live, and everything that reads across sets agrees: every history stack on Set 6 is real where the sets exist, dated and linked, one step at a time; every set's New skills column holds its own skills; every tab on every set opens with twenty students' work. README and ARCHITECTURE describe the six-set Classroom.

**Blocked by:** 211, 212, 213, 214, 215, 216.

**Status:** ready-for-agent

**Triage:** `ready-for-agent`

---

## Problem Statement

Closes the six-set work (208–217). The pieces land from parallel worktrees; this ticket checks the whole as a teacher sees it and fixes whatever does not line up.

## Solution

- A click-through across all six sets: Classroom order, pinning and scroll; each set's Class View, drill, history (several students, every category), links between sets; Mistakes, Groups, board and class review on each; the live demo on Set 6 from Create to the end.
- README, ARCHITECTURE, decision log and future features brought up to date.

## Acceptance

- [ ] Set 6's history for every student and category: real pills for every set that assessed it, simulated only before 25 Aug, no jump (test and click-through)
- [ ] Every set's New skills per the agreed list
- [ ] vitest, eslint, tsc, next build, check:laptop, sweep:hint-boxes; the click-through above
