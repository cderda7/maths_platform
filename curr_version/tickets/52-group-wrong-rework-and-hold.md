# 52: Group review: Liam's Q7 checks wrong first; the hold is ten seconds; the ring fits the button

**What to build:** Three things on the student's group review. (1) The demo shows the group's rework being wrong on the problem the presenter is likely looking at: Liam's scripted Q7 turn now writes the class's common slip first (the fraction cleared from two of the three terms), checks wrong, and after the usual pause writes the correct rework. (2) The debrief's hold before Next drops from twenty seconds to ten, and its hint reads "take a moment to reflect". (3) The ring that fills around Next during the hold no longer draws as a circle overlapping the pill button: it is a pill sized to the button.

**Blocked by:** 40 (the scripted turns), 41 (the debrief and its hold).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The presenter reached Q7 (Liam's turn) and never saw a wrong check, because the only wrong checks in the demo were Q3 (Jordan) and Q9 (Sam's own). The hold felt long at twenty seconds and its hint read as if the marks were the point. The ring around Next used a square `viewBox` stretched over a wide button; `xMidYMid meet` kept it a circle, so it sat over the middle of the pill and looked like a glitch.

## Solution

- `GROUP_SCRIPTS.q7` becomes `[SLIPS.q7, RECOGNITION_REWORK.q7]`: a wrong first attempt, no "we're stuck". `turnScript` already schedules the pause and second attempt; nothing else changes.
- `HOLD_MS` 20 000 → 10 000; `PEER_DEBRIEF_MS` 26 000 → 16 000 so a peer who holds the next pen still waits roughly one debrief.
- `HoldRing` in `GroupDebrief.tsx`: measures its child with a `ResizeObserver` and draws the two `<rect>`s in pixels, 4 px outside the button, `rx` half the height.

## Acceptance

- [x] On Q7 the "Not yet · read as" panel appears with the first line red and "2 more lines", then Liam's second attempt checks correct and the debrief opens
- [x] Hint reads "take a moment to reflect"; Next enables ten seconds after "show me the marks"
- [x] The ring is a pill hugging Next (and "finish"), filling clockwise over the hold
- [x] Unit tests for the Q7 script and the ten-second hold; browser check; architecture note and root docs
