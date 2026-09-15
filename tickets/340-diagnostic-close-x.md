# 340: A × closes the live diagnostic box

**What to build:** a × in the top-right corner of the open live diagnostic, so the teacher can click out of it.

**Blocked by:** none.

**Status:** done

---

## Problem Statement

User request 2026-09-15, with a screenshot of the split's diagnostic over Where students are: "add an x to top right corner of live diagnostic box so i can click out". The box closed on Escape, a press outside, or pressing the Live diagnostic button again, but nothing on the box itself said how to leave.

## Solution

- `FlyoutClose` in `app/teacher/DiagnosticPush.tsx`: a 32 px round × in the card's top-right corner, absolutely placed so nothing in the card moves, pressing it closes the flyout (`setFlyoutOpen(problemId, false)`).
- On the split's overlay (`DiagnosticOverlay`, ticket 315) it is centred on the header row (Live diagnostic, the label, the question), which gains right padding so a long question never runs under it.
- The same × on the sibling flyout beside a card (`DiagnosticPush`, after working), centred on its chip.

## Acceptance

- [x] vitest 2113, eslint, tsc, next build
- [x] Click-through `click340.mjs` 22/22 at 1280×800 and 1440×900 against a production build: on the split the × sits in the card's corner, level with the header (within 0.4 px), clear of the question; a real mouse press closes it and Live diagnostic reopens it; after working, the flyout beside Q1 shows the × level with its chip (within 0.2 px), stays open with the pointer over it, and closes on its press; screenshots checked
