# 45: The teacher pane scales with its height

**What to build:** In `/split`, the teacher pane shrinks with the pane the way the student iPad does. Dragging the student/teacher divider down, or making the window short, scales the teacher's laptop page down to fit the pane's height instead of leaving it full size and cropped.

**Blocked by:** 35 (the split view).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The student pane's design has a height (the iPad stage), so `frameFor` fits it by width and height and a short pane shows a smaller iPad. The teacher's design had a width only, on the grounds that the page scrolls, so a short pane showed the top-left corner of a full-size class view: a huge title and the first two rows. The presenter could not size up the teacher's screen beside the student's.

## Solution

Give the teacher's design a laptop height, 1280 × 800, and keep its `fill` fit. A pane shorter than that scales the page down to fit; the page centres itself in the spare width (its own `max-w`), as the iPad stage centres the device; a pane at least the laptop's size takes the page at full size, filling the pane and scrolling as before.

## Acceptance

- [x] Stacked, student over teacher: both panes at about the same scale by default; a short teacher pane shows a small whole laptop page, not a cropped corner
- [x] Teacher alone in a big window unchanged: scale 1, filling the pane, scrolling
- [x] Side by side on a laptop window unchanged: fitted by width
- [x] Tests for the teacher's design and its frame; browser check on the built app; architecture note and root docs
