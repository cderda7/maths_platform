# 121: The create screen opens prefilled with the demo set

**What to build:** When the classroom store holds no draft (first visit, or after Reset demo), the create screen seeds one: the title "Roots of a quadratic — Set 3" and the demo teacher's ten questions in the editor's own shorthand, from a shared fixture `data/draft-seed.ts` that the review step (ticket 120) pastes from too. The teacher lands mid-creation with the tiles filled. A draft the teacher has emptied stays empty. Genuine from-nothing creation is a next-round concern.

**Blocked by:** 119.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), on the blank first load of ticket 119's screen: "bruh idk what happened but i don't want this blank view -- i want it prefilled for now, & for genuine assignment creation to be a next round concern. add to F_F".

The blank ghost was ticket 119's interviewed design. The phase-2 session (ticket 120) had meanwhile written the demo paste as its fixture: the bank's ten with Q1 as `x^2 + 5x + 6 = 0` and the ball problem's slot a repeat of Q3's shape, the two lines its recommendations act on.

## Solution

- `data/draft-seed.ts`: `DEMO_PASTE_LINES` (the ten typed lines), `DEMO_PASTE` (joined, for a paste), `DEMO_DRAFT_TITLE`. One fixture for both tickets; the review step's copy on its branch should import from here.
- `app/teacher/assignments/create/CreateAssignment.tsx`: `storedOrSeed()` returns the store's draft or the seed; the editor's first state comes from it, and the save effect writes the seed to the store on mount. An emptied draft (`questions: []`) is a draft, not a missing one, so it stays empty; `reset` clears the draft, so Reset demo reseeds.
- `lib/mathInput.test.ts`: every seeded line except the two deliberate differences parses to the bank's stem and expression (braces, spacing and `tfrac` aside).
- Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md` (prefilled for now; from-nothing creation next round), `README.md`.

## Acceptance

- [x] First load with nothing in the store: the title filled, ten tiles (Q1 `x² + 5x + 6 = 0`, Q9 `(x+1)(x−4) = 6`) and the Q11 ghost, Continue on, the seed in the store at once
- [x] A draft emptied by the teacher loads as the single ghost; a cleared store (Reset demo) reseeds
- [x] Every other check of ticket 119's click-through unchanged (typing, Enter, Shift+Enter, paste, remove, undo, reload, Continue, the stub, the old screen, the long set)
- [x] vitest (377), eslint, `next build`, headless run (`create.mjs`, 35 checks) with the seeded screenshot
