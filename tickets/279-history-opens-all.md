# 279: "see history" opens every category's earlier results at once

**What to build:** On a set's Class View, pressing "see history" on a student's row stands the earlier results above every category pill that has any, instead of widening the pills and waiting for the teacher to press each category pill to open its column. A pill still hides or shows its own stack; "close history" and one Escape close it all; the way back from a history pill's report reopens every stack.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-14): "want 'see history' to auto pop up all columns, instead of teacher then having to click into category pill to show indiv column".

## Solution

- `historyCategories(set, student, columns)` in `lib/setHistory.ts`: the shown categories with at least one earlier result, in column order. "see history" opens history mode with exactly those open.
- A category pill in history mode still toggles its own stack (a category nothing earlier assessed opens none, as before).
- Escape: the stacks and the mode now open together, so one press closes both (ticket 247's separate "stacks first" press is gone).
- The way back from a history pill's report (`?history=<student>`) opens every stack too. The `open=<category>` query only restored the one stack clicked into; it is removed from the pill link, the return link, the page and `ClassViewInit`.

## Acceptance

- [x] Unit: `historyCategories` equals the categories with earlier results for every student on PS6; all of Mia's; none on the first set or for an unknown student; the two hrefs without `open`
- [x] Click-through at 1280×800 and 1440×900 (`click279.mjs`, 1250 checks): all twenty students on PS6, PS5 and PS4 — every category with earlier results stands, each with its count, stacks side by side and never over a neighbour, the sheet drawn only when a stack stands, no sideways scroll, close history clears everything; a pill hides and reshows only its own stack; one Escape closes it all; a pill's report returns to every stack standing with the query dropped
- [x] vitest, eslint, tsc, next build, check:laptop
