# 44: Start screen simplified

**What to build:** The student's start screen loses its left panel (the "Covers" category pills and the "Leans on" skill chips). The space goes to the problems: every problem is one row (label, stem with its expression inline, a small figure where the problem has one, its skill chips on the right) so all ten fit on the iPad without scrolling. "warm up" and "start" become the accent indigo with white text and sit beside the title.

**Blocked by:** 28 (the chooser is where the set's skills are now laid out).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The start screen carried two skill lists the student does not act on, and the problem cards beside them showed five of ten problems. The student should size up the set at a glance.

## Solution

Drop the panel. One row per problem across the full width; the chips on each row remain the only skill words. Buttons in the accent variant every other student action already uses.

## Acceptance

- [x] No "Covers" or "Leans on" on the start screen
- [x] All ten problems visible at once on the 1180 × 820 stage (list does not scroll)
- [x] "warm up" and "start" in accent indigo with white text; both still route as before
- [x] Warm-up chooser unchanged (still uses `ProblemCard`)
- [x] Browser check on the built app; architecture note and root docs
