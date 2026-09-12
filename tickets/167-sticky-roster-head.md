# 167: The roster's column heads stay in view while the teacher scrolls

**What to build:** On the class view (`/teacher`) the roster's header row (Student, the category chips Algebra · Functions · Graphing · Communication · Reasoning · New skills, Confidence, Set) sticks to the top of the scrolling region, directly under the Edexia · Maths bar, so the category names read as a sub-header of the bar while the teacher scrolls to later students. Nothing about the row's look or its hover controls changes.

**Blocked by:** 165.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12), with a screenshot of the roster scrolled to Zara Haddad onward, the header row long gone: "as i scroll down in the table, i want 'algebra', etc. with category headers to remain visible as kind of a sub header to the Edexia Maths header. that way its visible when teacher scrolls to later students".

## Solution

- `app/teacher/TeacherLive.tsx`: every `th` of the roster's `thead` is `sticky top-0 z-20 bg-paper` with an inset bottom shadow for its line (`HEAD`); the header `tr` drops its `border-b`, which under `border-collapse` would stay behind with the table when the cells stick. The roster's `Card` is `overflow-clip` instead of `overflow-x-auto`: a scroll container would have been the heads' nearest scroller (the card, which never scrolls vertically), so they could never reach the frame's scroll region; `clip` still rounds the card's corners over the heads' paper and is not a scroller.
- Docs: this ticket, `architecture/167-sticky-roster-head.md`, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `README.md`.

## Acceptance

- [x] At rest the header row sits where it did, in the card under the title, the card's rounded corners intact
- [x] Scrolled, every head cell's top is the scroll region's top (the bar's bottom edge) at 1400 × 1000 and 1280 × 800; rows pass under on paper; the chips are hit-tested on top
- [x] Hovering a stuck head shows "see skills" / "full breakdown"; opening the column keeps the heads stuck; at the end of the roster the heads are still there
- [x] No sideways overflow at either laptop width (`npm run check:laptop`, 16 route/size checks)
- [x] vitest (454), eslint, tsc, `next build`; click-through `sticky167.mjs` (68 checks)
