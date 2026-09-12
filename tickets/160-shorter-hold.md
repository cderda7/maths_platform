# 160: The press-and-hold that starts a drag is 150 ms, not 300

**What to build:** The hold that lifts a question for dragging (ticket 150) fires after 150 ms instead of 300 ms, on every screen that reorders (the create screen, the review's difficulty grid, the class review setup's example cards). A click is still a click.

**Blocked by:** 150.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12), after trying ticket 150: "lessen the click & drag time. you wait too long before recognizing it as a 'click & hold to drag'."

## Solution

- `lib/reorder.ts`: `HOLD_MS` 150 (was 300), with the reasoning in its comment: above a click's press-to-release (about 80–120 ms), so a click never lifts, and short enough that the lift reads as immediate. Every screen reads the one constant through `useReorder`, so nothing else changes.
- `lib/reorder.test.ts`: `HOLD_MS` pinned to the 120–200 ms band.
- The click-through (`reorder150.mjs`) now holds 200 ms before every drag (was 450) and still clicks in 80 ms, so it proves the shorter threshold both ways.
- Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`.

## Acceptance

- [x] Every hold-drag in the click-through lifts after a 200 ms press; every 80 ms click edits and moves nothing; a press that moves first never lifts
- [x] vitest, eslint, tsc, `next build`, headless run (`reorder150.mjs`, 46 checks, twice)
