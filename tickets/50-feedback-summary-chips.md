# 50: Feedback summary chips and level column labels

**What to build:** On the individual review ("How it held up"), the detective sentence's skill names become dark purple bubbles with white text. On the right, "WHAT YOU SUBMITTED", the pad's label and "READ AS" sit on one horizontal line, and the pad's label reads "IF NEEDED, CORRECT IT HERE".

**Blocked by:** 21 (the screen this polishes).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The summary read "5 of your problems contain a mistake. Double-check factorising, non-monic factorising and null factor law." as one run of prose, so the skills to look at did not stand out from the count. The pad's "CORRECT IT HERE" eyebrow sat 34 px lower than the two eyebrows either side of it (the pad section's own 24 px inset plus a header row centred on the taller Undo / Clear buttons), and its wording read as an instruction to correct every problem.

## Solution

`feedbackSummary` now also returns the count clause (`head`) and the capped hint leaves (`hint`) beside the joined `sentence`, which the group-stage notice and the tests keep using. The screen renders the head as prose and the hint as "Double-check" followed by one `LeafChip` per leaf in `accent-deep` with white text. `PadSection` gains `padded={false}` (no inset when it sits in a grid beside other columns) and its header row is top-anchored with the buttons pulled up to centre on the eyebrow, so the eyebrow's top edge is the row's top edge on every screen that uses the pad.

## Acceptance

- [x] Summary card: the count clause as prose, then "Double-check" and the skills as dark purple, white-text bubbles
- [x] "What you submitted", "If needed, correct it here" and "Read as" eyebrows at the same y on the 1180 × 820 stage
- [x] The pad's label reads "If needed, correct it here"
- [x] Working screen's pad header unchanged in look (eyebrow and Undo still centred on each other)
- [x] Group-stage notice still one plain sentence; vitest, eslint, tsc, build clean; architecture note and root docs
