# 113: The confidence list fits the window with factorising open

**What to build:** The "How confident are you?" screen keeps everything on screen, no scrolling, when factorising's two kinds are open under it. The spacing is tightened across the screen (the page's top and bottom inset, the gap under the heading, the three answer rows, the seven skill rows, the two kind rows and the gap above Submit) so the expanded list has room.

**Blocked by:** 112.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), with a screenshot of the screen as it was: "so the og view is great bc nothings hidden & student doesn't need to scroll. reformat the original so there's a bit more room, so that when monic & nonmonic open up in factorization, the expansion stays within the window".

Measured at the iPad size: with factorising open the list overflowed its box by 80px (the two kind rows are 70px, and the list was already 10px over when closed, the picker's bottom edge clipped by the scroll box).

## Solution

- `app/student/screens/ConfidenceScreen.tsx`, spacing only: page `py-9` → `py-6`; heading `mt-3` → `mt-2`; list `mt-7` → `mt-5`; answer rows `py-4` → `py-3`; skill rows `py-2.5` → `py-2`; kind rows `py-1.5` → `py-1`; the Submit area `pt-6` → `pt-4`. About 104px freed.

## Acceptance

- [x] Closed: the list's scroll height equals its box (was 10px over); open: equal too (was 80px over); Submit at the same place in both states, 40px under the open list
- [x] vitest (347), eslint, `next build`, headless measurement (`fit.mjs`) with a screenshot; architecture note, root docs, future features
