# 293: The homework screen

**What to build:** pressing the open Homework card (or its HW cell) opens a read-only list of Sam's Homework 3: first his own problems from the week's sets, then the teacher's 10.

**Blocked by:** 292.

**Status:** ready-for-agent

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-15): "add 'Homework' to 'to do'. this should be the list of problem mistakes from the PSet that get added to the HW bank -- custom to each student", "have students do their custom probs before doing the teacher's 10", and on grouping: "just grouping by the set it came from will be clear enough".

## Decisions

- Heading "Homework 3 · due Mon 14 Sep"; a back control to the Classroom.
- **"From your mistakes"** first, grouped under each set's name, newest set first; then **"Everyone"**: the teacher's 10.
- Own problems = every problem **ever wrong** on the covered sets (ticket 256's `everWrong`, read from the story records for PS5 and Sam's session for PS6), each shown as its **similar problem** (same type, different numbers), never the original. Write similar problems for Sam's PS5 mistakes here (PS6's exist).
- Each problem shows its stem + expression (the teacher screens' whole-question look); a figure as a small thumbnail.
- No done/undone marks, no answering, no difficulty tags. Only Homework 3 opens.
- FUTURE_FEATURES: reading back a finished homework; answering homework.

## Acceptance

- [ ] Card and cell both open the same screen; back returns to the Classroom
- [ ] Sam's list: his PS6 then PS5 ever-wrong problems as similar problems, then the 10; matches the homework folder animation's PS6 problems
- [ ] Every maths expression fits, never splits; no horizontal scroll; no difficulty tags
- [ ] Unit tests for the list's contents and order
- [ ] vitest, eslint, tsc, next build, check:laptop; click-through on the iPad
- [ ] Ticket docs, architecture note, ARCHITECTURE, decision log, future features
