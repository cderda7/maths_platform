# 223: A problem a group could not solve shows up for the teacher and on the report

**What to build:** Once a group closes a problem unsolved (ticket 222), the teacher sees it: the class view's group review card says so under the group's bar ("Q7 not solved after 4 tries"), and on class review setup Q7's example options carry a "not solved in group review" badge where "fixed in group review" would be. The student's report says the group did not solve it rather than a bare "Incorrect".

**Blocked by:** 222.

**Status:** todo

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13) agreed that the teacher should find out while the problem is still live ("the teacher's class view flags 'Group 2 · Q7 unresolved after 4 tries'"), that class review picks it up, and that the report should not just read "Incorrect". Today nothing on the teacher's side distinguishes a problem a group could not solve from one it never reached.

## Acceptance

- [ ] During and after group review, the demo group's row on the class view's group card names Q7 as not solved, with the number of tries
- [ ] Class review setup: Q7's examples from the demo group's mistakes carry "not solved in group review"; the problem rows are unchanged
- [ ] The student's report tile for Q7 says it was not solved in group review
- [ ] vitest, eslint, tsc, next build, browser click-through on both sides
