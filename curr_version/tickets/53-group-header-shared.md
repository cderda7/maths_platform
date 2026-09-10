# 53: Group review header: the progress bar stays put on "the group got it"

**What to build:** On the student's group review, the group's progress bar and percentage that sit in the whiteboard's header also sit in the header of the debrief that follows a correct check ("the group got it"), at exactly the same pixel position, so nothing jumps when the screen changes.

**Blocked by:** 49 (the big bar this keeps in place), 41 (the debrief it now shows on).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The whiteboard header held `Q1 · x² − 5x + 6 = 0 · 1 of 6`, the 320 px bar, and the pen chip in a flex row with `justify-between`; the debrief header held `Q1 · x² − 5x + 6 = 0 · the group got it · you wrote it` and no bar at all. So the bar vanished on a correct check and came back on the next problem, and even had it been drawn on both, `justify-between` positions the middle item from the widths of its neighbours, so a different pen chip or a different percentage moved it.

## Solution

One `GroupHeader` for both screens: a three-column grid `minmax(0,1fr) auto minmax(0,1fr)` with the problem on the left, `GroupBar` in the middle and a right-hand slot. Equal outer columns centre the bar regardless of what stands beside it; `GroupBar`'s percentage gets a fixed 44 px width so the middle column never changes size ("0%" and "10%" used to differ by 10 px and shift the track by 5). The pen chip is the whiteboard's right slot; the "the group got it · you wrote it" pill is the debrief's, in the same place, because beside the equation it overran the left column at iPad width and wrapped the equation onto two lines.

## Acceptance

- [x] The debrief header shows the group's bar and percentage
- [x] Track and percentage have the same bounding rect on the whiteboard and the debrief (x 512, y 156, 320 × 20; the number at x 844, 44 wide)
- [x] The header row is the same height on both screens (39 px)
- [x] Build, lint, tsc, vitest; browser check on the built app; architecture note and root docs
