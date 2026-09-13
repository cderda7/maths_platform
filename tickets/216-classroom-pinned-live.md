# 216: The Classroom pins its heading and the Live card; Past scrolls

**What to build:** On the Edexia Classroom, the eyebrow, the "Edexia Classroom" title, New assignment, the LIVE label and the live set's card stay exactly where they are now while the teacher scrolls; only the Past list scrolls, beneath them, newest set first. Before Create there is no live card and only the heading is pinned. All past sets are listed; scrolling to the oldest is fine.

**Blocked by:** 208.

**Status:** ready-for-agent

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13): "all 5 show under past, ordered most recent to oldest. if scroll is needed to see oldest PSet, that's fine. OH but treat Live as a header -- so even once teacher scrolls, PSet 6 live is visible as fixed 'header' -- like in the positon it is now", with a screenshot of today's Classroom (Live card under the title, Past below). The teacher chrome is zoomed; the laptop is 1280 wide.

## Solution

- The Classroom page lays out a fixed top region (heading and Live section) and a scrolling Past region; nothing in the top region moves or resizes when Past scrolls; the Past cards pass under a clean edge, not through the Live card.
- Sort Past by date, newest first.

## Acceptance

- [ ] With a short viewport and many past sets, scrolling moves only Past; the heading and Live card's rects are unchanged before and after (click-through asserts geometry)
- [ ] Before Create: heading pinned, Past scrolls, no empty Live gap
- [ ] 1280 and 1440, no horizontal scroll, the Live card at its current position
- [ ] vitest, eslint, tsc, next build, check:laptop
