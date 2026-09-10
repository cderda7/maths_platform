# 38: The smartboard surface

**What to build:** A third surface beside the iPad and the laptop: the smartboard, at its own route with its own home-page card, opened once at the start of the lesson and left on the projector. It is blank during student submission and individual review, shows the whole-class board during whole-class review (the teacher's page keeps only the controls), and holds a placeholder for the end of group review that ticket 42 fills with the final standings.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

**Triage:** `ready-for-agent`

---

## Problem Statement

There is no projected surface today except the whole-class board, which lives under the teacher's routes. The room needs one screen that is always on and never shows a control.

## Solution

One route that reads the classroom state and the pathway and decides what to show per stage. No buttons on it. The teacher's laptop keeps a small "the board is showing …" indicator and the whole-class controls (previous, mode, marks, next, end, the teacher's pad).

## Acceptance

- [ ] Board route and home card; nothing interactive on the route
- [ ] Blank with nothing student-specific during submission and individual review
- [ ] Whole-class review projected on the board; the teacher's page keeps the controls and the pad, and the mirror to students still works
- [ ] A "holding" state after group review ends, until the teacher advances
- [ ] The teacher's live view shows what the board is showing
- [ ] Browser check across the stages with the skip-to strip; architecture note and root docs
