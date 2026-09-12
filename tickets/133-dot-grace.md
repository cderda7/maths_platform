# 133: The drill's dots count as markers, and the grace is one second

**What to build:** The class grid's row buttons (**see dot skills** / **close**, **student report**) treat the group and skill dot chips in an open drill the way they treat the category pills (tickets 128, 131): the pointer over a dot chip hides the buttons, and leaving one starts the grace clock, so hopping dot to dot, or pill to dot, never shows them. The grace itself drops from two seconds to one.

**Blocked by:** 131.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12), with a crop of an open drill under a pill (the "process & rigor" / "showing complete working" chips) and the buttons showing beside the name: "same idea with individual dots -- same functionality as pill to pill. also make the delay a bit less - half of what you have it currently".

## Solution

- `app/teacher/TeacherLive.tsx`: `PILL_GRACE_MS` 2000 → 1000. A `MARKER` selector (`[data-dot], [data-node]`: the row's pill buttons and the drill's node buttons from `HierarchyDrill`). The per-pill `onPointerEnter` / `onPointerLeave` props are gone; instead each student's `tbody` (`RowGroup`) takes `onPointerOver` / `onPointerOut`, and `markerOver` / `markerOut` act only when the event crosses a marker's boundary (the target is inside a marker and the related target is not inside the same one), so moving between a node's dot and its label is neither an enter nor a leave. Delegation means the drill's nodes count without threading handlers through the shared `HierarchyDrill`.
- The row-actions div adds `group-has-[[data-node]:hover]/row:invisible` beside the `[data-dot]` rule for the instant hide.
- Nothing changes in `HierarchyDrill` or on the report pages.

## Acceptance

- [x] Pill then name: hidden at 0.6 s, visible by 1.3 s
- [x] Drill open: on a dot chip hidden; resting on its label 1.3 s still hidden (same marker); off it 0.6 s hidden; a second chip 0.6 s later restarts the clock; 1.3 s after the last, visible in the drill row and on the name
- [x] Clicking a dot chip: hidden while on it, visible 1.3 s after leaving
- [x] vitest (395), eslint, tsc, `next build`, headless click-through (`dots.mjs`, 16 checks) with crops
