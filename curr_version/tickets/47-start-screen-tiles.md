# 47: Start screen as a grid of tiles

**What to build:** The student's start screen goes back to a grid: every problem in its own little square tile (label, stem, expression, a small figure where the problem has one), five across and two down so all ten sit on the iPad at once. No skill chips anywhere on the screen. "WARM UP" and "START" in all caps, in the bottom-right corner.

**Blocked by:** 44 (the rows this replaces).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Ticket 44's one-row-per-problem list read as lines of text, and its right-hand chip column filled half the width with skill words the student does not act on here. The user preferred the earlier grid of cards.

## Solution

Reuse `ProblemCard` on the start screen with two new switches: `chips={false}` (no skill words) and `compact` (tighter padding, smaller type, a 100 px figure) so a whole problem fits in a 208 px square. Ten `aspect-square` tiles in a five-column grid; the button row is pushed to the bottom of the stage with `mt-auto` and right-aligned, with `uppercase` on the labels. The chooser keeps the full card with chips.

## Acceptance

- [x] Ten square tiles, five across, none scrolling internally, on the 1180 × 820 stage
- [x] No skill chip or skill name anywhere on the start screen
- [x] "WARM UP" and "START" rendered in capitals, accent indigo, in the bottom-right corner; both still route as before
- [x] Warm-up chooser unchanged (chips, 20 px padding, selectable)
- [x] Browser check on the built app; architecture note and root docs
