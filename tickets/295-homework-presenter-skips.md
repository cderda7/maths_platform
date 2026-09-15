# 295: Presenter shortcuts for homework

**What to build:** the presenter's skip list gains "send homework" (Homework 3 sent, in Sam's Future panel) and "homework open" (the PS6 lesson over, Homework 3 in To do), shown only once the teacher has pressed +Homework in this demo.

**Blocked by:** 292.

**Status:** ready-for-agent

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-15): "yep great. but only have the skip to hw stuff show up if teacher starts creating HW."

## Decisions

- "Started creating" = +Homework pressed at least once in this demo; the shortcuts stay from then on; Reset demo clears them.
- "send homework" sends Homework 3 with the generated draft and default due date Mon 14 Sep without walking Create; "homework open" also ends the PS6 lesson as the teacher's end would.
- Existing skips unchanged.

## Acceptance

- [ ] No homework shortcuts on a fresh demo; they appear after +Homework in any tab; Reset hides them
- [ ] Each lands exactly where the real flow lands (Future panel; To do card, cells, HW2 note)
- [ ] vitest, eslint, tsc, next build, check:laptop; click-through
- [ ] Ticket docs, architecture note, ARCHITECTURE, decision log, future features
