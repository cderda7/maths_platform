# 195: The Mistakes tab's stage group ends on the problem cards' right edge

**What to build:** On the live set's Mistakes tab, the title row's stage group (the stage pill "indiv working", "18/20 done", "force submit") sits at the right of the row, its right edge on the problem cards' right edge, not straight after the title.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13, screenshot of `/teacher/a/pset-2/mistakes`): "move indiv working, 18/20 done, & force submit to be right justified wrt the mistake boxes".

## Solution

- `app/teacher/TeacherMistakes.tsx`: the title row mirrors a problem row. A `flex-1` box holds the title and the stage group `justify-between`; after it, on a live set, the diagnostic column's width is held by the Live diagnostic chip's unseen footprint (`ml-5`, the row's `gap-4`, as in the problem rows). So the group ends exactly where every card ends, at any window width.
- `app/teacher/DiagnosticPush.tsx`: the chip's label is a `ChipLabel` component and its unseen footprint is exported as `DiagnosticFootprint`, used both where an open flyout holds the chip's place and in the title row.
- A finished set has neither the stage group nor the diagnostic column; its title row is unchanged.

**Judgment call:** with the group pinned right, the countdown that replaces "force submit" (e.g. "handing in 1:00 · Cancel") is wider than the button, so for its one minute the pill and count shift left. Holding the countdown's width all the time was built and dropped: it left a visible gap between "18/20 done" and "force submit" in the normal state.

## Acceptance

- [x] At 1280, 1400, 1512 and 1000 px: every card's right edge at one x, "force submit"'s and the group's right edge on it (< 1 px)
- [x] Pill, count and button on one row, the count-to-button gap equal to the pill-to-count gap, the group clear of the title and centred on it
- [x] Force submit: the countdown ends on the card edge, on one row, clear of the title; Cancel brings the button back in place
- [x] Finished set (pset-1): no stage group, no diagnostic column, no horizontal scroll
- [x] vitest 568, eslint, tsc, next build; click-through `stage195.mjs` (49 checks)
