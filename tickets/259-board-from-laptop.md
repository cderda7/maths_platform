# 259: The board is launched from the teacher's laptop

**What to build:** To be designed. Today the demo treats the smartboard as a third device with its own link; in a classroom the board is the laptop's second display, launched from the teacher side.

**Built as ticket 333** (2026-09-15): grilled and built under the next free number so the tickets read in order. The design and acceptance are in `tickets/333-board-from-laptop.md`.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Planning conversation (2026-09-14). The user: "we need to think through like how the board projection actually gets launched from the teacher side, bc rn i treat it like a separate 3rd device when that's not true — it would be launched from the laptop." Assumed for now: the laptop extends the display to the projector, never mirrors (ASSUMPTIONS.md). Offered options (a Present button that opens the board fullscreen on the second screen; a window the teacher drags; grill first) — the user chose to grill it first.

## Open for grilling

- The control and where it lives (class review setup, the live view header, both).
- What the board shows before class review, and whether it is opened at the start of the lesson or on demand.
- What the laptop shows while presenting, and what happens when the projector disconnects (spec v3 story 73 keeps the freeze).
- How the demo's landing page and `/split` present it.
