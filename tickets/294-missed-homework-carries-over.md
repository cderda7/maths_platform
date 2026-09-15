# 294: HW2's leftovers join Homework 3, without duplicates

**What to build:** Sam's missed Homework 2 own problems (from Problem Sets 3 and 4) appear in Homework 3 under their sets, and a skill that appears twice among his own problems keeps only the newer set's problem.

**Blocked by:** 293.

**Status:** ready-for-agent

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-15): "in creating new HW, remove duplicates. they're already penalized by the missing assignment; having them double up on problems will be double penalization", and on what carries over (only the student's own problems, not the teacher's 10): "PERFECT great nuance -- add the concern about student gap with 10 missed HW questions to F_F".

## Decisions

- A missed homework's undone **own** problems join the next homework; the teacher's 10 from the missed homework do not. Sam did none of HW2, so every PS3 and PS4 ever-wrong problem carries.
- **Duplicate = same taxonomy skill**, among the student's own problems only (never against the teacher's 10). The newer set's problem stays.
- Tag each problem that can reach homework with its taxonomy skill; write similar problems for every PS3 and PS4 problem that survives.
- The list groups carried problems under their own set's name (no "from HW2" marker), newest set first.
- FUTURE_FEATURES: the gap left by a missed homework's teacher problems never being done.

## Acceptance

- [ ] Unit tests: carry-over of own problems only, dedupe by skill keeps the newer, teacher's 10 untouched
- [ ] Sam's Homework 3 lists PS6, PS5, PS4, PS3 groups (empty groups omitted) then Everyone; no skill twice among his own
- [ ] Every similar problem's TeX shape matches its original (ticket 256's test)
- [ ] vitest, eslint, tsc, next build, check:laptop; click-through on the iPad
- [ ] Ticket docs, architecture note, ARCHITECTURE, decision log, future features
