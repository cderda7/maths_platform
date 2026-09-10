# 39: The whole class enters group review together

**What to build:** After a student hands in their corrections they wait for the class: "waiting for the class · 14 of 20 handed in". Group review starts on its own the moment everyone is in; the teacher's force ends the wait for everyone. There is no such gate between submission and individual review. For the demo the count climbs on a short scripted timeline.

**Blocked by:** 36 (the count needs the class of twenty).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Today a student moves to group review the moment they hand in. A race between groups is meaningless if one group starts minutes ahead.

## Solution

A class-level readiness state: who has handed in corrections. The student's screen after hand-in shows the count and nothing else. When the count reaches the class size, or the teacher forces, every student's group review begins at once.

## Acceptance

- [x] Waiting screen with the count after corrections are handed in
- [x] Automatic start when everyone is in; the teacher's force starts it early for all
- [x] Individual review is still entered per student, as today
- [x] Demo: the count climbs on a scripted timeline; the skip-to strip lands on the waiting screen and on the start
- [x] Unit tests for the readiness rule; browser check; architecture note and root docs
