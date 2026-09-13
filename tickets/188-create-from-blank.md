# 188: Create starts blank, one pulsing button generates Problem Set 2, and Create makes it live

**What to build:** "+ New assignment" on the Classroom opens the create screen empty: a greyed, inert title placeholder, an empty greyed goal box, and one ghost Q1 tile (not clickable or typable), just to show what starting from scratch looks like. Centred over the tile grid, a pulsing "Generate simulated assignment" button. Pressing it fills the title "Problem Set 2 — Roots of a quadratic", the goal, and Q1–Q10 (today's seeded draft), and the button goes away; Continue appears only then. The review step's Pathway section, when the pathway includes group review, shows "Confirm groups": the class default groups pre-filled, students movable by drag (the Groups page's interaction); moves apply to this assignment only, nothing blocks Continue/Create. Create adds Problem Set 2 to the registry as live with those frozen groups, records its start time, and lands the teacher on Problem Set 2 (Mistakes, per ticket 185). Reset demo returns to a Classroom holding only Problem Set 1. Presenter skips past creation make Problem Set 2 exist.

**Blocked by:** 185.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13): "when they go to CREATE an assignment, I want this to be the default they pop into. for rn, it'll be the fixed assignment creation. have the screen just be blank to start, with a button pulsing in the middle 'generate simulated assignment' that then populates this"; round 1 Q8 "B but don't need Q1 tile clickable/typable, but just to show what it would look like to actually start from scratch"; round 2 Q6 A (groups confirm inside Pathway), Q7 as described; Q4 C "& nothing blocks the continue button"; round 3 Q4 (skips/reset).

Facts: `CreateAssignment.tsx` seeds from `data/draft-seed.ts` when no draft; Continue saves `draft/set` then `/teacher/assignments/create/review` (`ReviewAssignment.tsx`: Difficulty, Assessing, Recommendations, Pathway); Create dispatches `assignment/create`. The typed/upload/PDF/Fix paths (tickets 170–173) stay in the code but are unreachable from the blank start; log that in FUTURE_FEATURES. Memory: no preselected choice for students, no confirm gates on the primary action.

## Solution

- A `generated` flag on the draft: absent → blank start with the pulse button; set → today's screen.
- Confirm-groups block in the Pathway section, reusing the Groups page's drag and chip components.
- `assignment/create` writes a registry entry `{ id: "pset-2", startedAt, groups }`.
- ResetDemo and `lib/demo.ts` skips aware of the registry.

## Acceptance

- [x] Blank start: inert title/goal/Q1 ghost, pulsing button centred on the grid; no Continue
- [x] Generate fills title, goal, Q1–Q10; Continue appears
- [x] Pathway with group review shows Confirm groups; a move changes this assignment's groups only, not `/teacher/groups`
- [x] Create → Classroom has Problem Set 2 live; the teacher lands on its Mistakes
- [x] Reset → only Problem Set 1; a skip past creation → Problem Set 2 exists
- [x] vitest, eslint, tsc, next build, check:laptop; click-through of the whole create flow
