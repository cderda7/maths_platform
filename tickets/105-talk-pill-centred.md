# 105: "Talk it through" is centred in the hint card

**What to build:** The "Talk it through" pill on the latest hint card sits centred under the hint text, not on the card's left edge.

**Blocked by:** 99 (the pill).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), with hint 2 open on the fractions warm-up: "center talk it through in the purple hint 2 box".

Ticket 99 placed the pill as an inline element after the paragraph, so it sat flush left under the text.

## Solution

- `components/HintCard.tsx`: the pill is wrapped in a `flex justify-center` row (the `mt-3` moves to the row); the pill's own classes are unchanged.

## Acceptance

- [x] Hint 1 on the fractions warm-up: the pill's centre is the card's centre (259.5px both, 0px off); the same on hint 2 after a line is written, hint 1 collapsed above it
- [x] Only the latest hint carries the pill; the air above (12px) and below (17px) the pill is as before
- [x] vitest (339), eslint, tsc, `next build`, headless measurement (`centre.mjs`); architecture note, root docs, future features
