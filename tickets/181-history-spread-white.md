# 181: The history's five pills spread evenly under a white sheet that stops at New skills

**What to build:** On the class view's history mode (ticket 175) four changes to what opens over a widened pill. The five dated pills no longer huddle 2 px apart just above today's pill: they spread evenly from the sheet's top edge down to today's pill, the same space above the first, between each and below the last. The sheet is white (paper), not cream. It spans the category columns only, Algebra through New skills, leaving Confidence and Set clear (so the apron that carried it past the student's row top is gone: one rectangle from 2 px above the pills up to the cut). And every pill in the picture is one element: today's named pill is the roster's own StatusDot carrying a label, so it is exactly the category pill's height (13 px) and the five dated pills are the same StatusDot at the same height and the named pill's width.

**Blocked by:** 175, 177.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13), with a screenshot of Jordan's Algebra history: "change to make it evenly spaced from bottom to top of box. also change box color to white. also have it extend through new skills, not all the way through set. also the pill is shorter than the og category pill. make it the same height as the category pill & make all history pills that height as well".

## Solution

- `components/Tag.tsx`: `StatusDot` takes `label`; with one, the same span (still `h-[13px]`, still `border`, still `data-status` / `data-shape`) becomes `PILL_LABEL`: inline-grid, at least 56 px wide, growing to the text, 9 px semibold uppercase white (muted on a hollow pill), the width animating where `interpolate-size` is supported; `data-label` marks it.
- `app/teacher/TeacherLive.tsx`: a category cell renders one `StatusDot` either way, `label` set in history mode (and the half fill dropped there, the name replacing it), so nothing about the pill's height or place can differ from the plain pill: the old `HistoryPill` (a separate span with its own stack) is gone. `HistoryBlocker` now takes `stacks` (the open categories with their five points from `historyFor`) and draws both the sheet and the stacks: the sheet `bg-paper`, from the first category head's left to the last's right, from 2 px above today's pills to the cut (the cut rule unchanged: the midline of the nearest row pill at least `HISTORY_CLEAR_PX` above the five's least room, else the heads covered and the "due" line's midline); each stack an absolute column at its named pill's measured left and width, from the sheet's top to today's pill top, `flex-col justify-evenly items-stretch`, five `StatusDot`s labelled with their dates. The named pills are measured with the sheet (the ResizeObserver fires on mount, after their width has settled). `HISTORY_STACK_PX` (75) is now the least room the five need, which the sheet always rises past.
- Docs: this ticket, `architecture/181-history-spread-white.md`, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `README.md`.

## Acceptance

- [x] Today's named pill is the same element as a plain pill (`span[data-status][data-shape=pill]`, now with `data-label`), 13 px tall like every other row's pill; the five dated pills 13 px tall, the named pill's width and left
- [x] The five spread evenly: the gap from the sheet's top to Aug 31, between each pair, and from Sep 9 to today's pill all equal (Tomas at 1400: 5 gaps of about 15 px; the top rows over the "due" line about 12)
- [x] The sheet is white (`rgb(255, 255, 255)`), from Algebra's head to New skills' head (the Confidence column clear), from 2 px above the pills to the cut; no apron
- [x] The cut still lands on a pill midline with at least 6 px above the five's least room (Tomas cuts Jordan's, row 3 cuts row 1's, rows 1 and 2 cover the heads and rise to the "due" line); nothing moves; the drill and the exits as in ticket 175
- [x] vitest (500), eslint, tsc, `next build`, `check:laptop` (16); click-through `history181.mjs` (158 checks at 1400 × 1000 and 1280 × 800: ticket 177's run with the new geometry)
