# 123: No Confirm on the review step's unit focus

**What to build:** On the pathway step (ticket 120), the Unit focus card loses its Confirm button and Create is on from the moment the step opens. The inferred unit stands; "Not quite? describe the focus" and Reassess stay, so the teacher can still correct it.

**Blocked by:** 120.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12), with the card's screenshot: "don't do the confirm thing -- messes up workflow. leave the option to clarify though".

## Solution

- `app/teacher/assignments/UnitFocus.tsx`: `onConfirm` and `confirmed` are optional; without `onConfirm` there is no button. The old screen still passes them.
- `app/teacher/assignments/create/review/PathwayStep.tsx`: no Confirm; Create never disabled; Reassess writes the unit alone.
- `app/teacher/assignments/create/review/ReviewAssignment.tsx`: Create needs only a draft.
- `lib/review.ts`: `confirmed` gone from `ReviewState` and `initialReview`.
- `README.md`: the pathway line. Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `FUTURE_FEATURES.md`. Memory: no confirm gates in the teacher flows.

## Acceptance

- [x] The pathway step opens with Unit 1, no Confirm, the note and Reassess present, Create on
- [x] "rates of change" + Reassess reads Unit 3; a reload keeps it; "quadratics and their graphs" + Reassess reads Unit 1 again
- [x] Create lands on the class view with the unit in force; the old screen still confirms
- [x] vitest (390), eslint, tsc, `next build`, headless run (`review.mjs`)
