# 49: Group review header: no colour label, names in the group colour, a big progress bar

**What to build:** On the student's group review screen, drop the "sky" colour chip from the header. Instead, the groupmates' name chips take the group colour themselves: sky border, sky-soft fill, instead of white. The group's progress bar gets much bigger, taller and wider, with a larger percentage beside it.

**Blocked by:** 42 (the bar and the colour chip this changes).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Ticket 42 put a small "● sky" chip before Q1 to say which group the student is in, and a 140 × 8 px bar for the group's progress. The user wants no colour label anywhere; the colour should be worn by the student names, and the bar should be large enough to read at a glance.

## Solution

Remove the colour chip. Each non-holder name chip in the `Group` list gets `borderColor: GROUP_HEX[colour].fill` and `backgroundColor: GROUP_HEX[colour].soft`, ink text; the pen-holder chip stays ink-on-dark so the pen is still visible. `GroupBar` grows to 320 × 20 px with a 16 px medium percentage in ink.

## Acceptance

- [x] No group colour word or dot anywhere on the student's group review screen
- [x] Jordan, Zara and Liam chips: sky border, sky-soft background; the holder chip unchanged
- [x] Bar 320 × 20 px, percentage 16 px
- [x] Browser check on the built app; architecture note and root docs
