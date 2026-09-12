# 156: The overlay's "Back to Qn →" button is the large size

**What to build:** On the isolated-practice overlay (the pad a student gets from "I need help" mid-set), the "Back to Qn →" button in the right column's footer is the large button size, so a student sees at a glance that going back to the question is an option. It is the same size as the "Back to Qn →" button that appears once the worked example is finished, and as "I need help" on the left.

**Blocked by:** nothing.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12), with a screenshot of the overlay's right column showing the small purple "Back to Q1 →" pill under an empty "Read as" panel: "make 'Back to Q1 ->' bigger so it's more obv to the student as an option".

## Solution

- `app/student/screens/PracticePrompt.tsx`: the overlay's `footer` button is `size="lg"` (15 px text, 24 px sides, 12 px top and bottom, 46.5 px tall), the size the `finished` button already used; before it was the default `md` (13.5 px text, 16 px sides, 8 px top and bottom, 36 px tall).
- Docs: this ticket, the architecture note, `ARCHITECTURE.md`.

## Acceptance

- [x] From the working stage, "I need help" → factorising: the overlay's footer button reads "Back to Q1 →" at 15 px with 24 px side padding, inside the right column's bottom-right corner (24 px from each edge); after the worked example every "Back to" button on the overlay is the same size; pressing it closes the overlay
- [x] vitest (432), eslint, tsc, `next build`, headless click-through (`back156.mjs`)
