# 201: Once a stage is picked, only its arrow stays

**What to build:** On the create screen's review pathway map, once a column has a pick, the arrows to the other options in that column are removed (not faded). The faded option boxes stay.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13, screenshot of the map after ticket 197 with "individual working → group review → class review" picked): "once a path is selected, don't just grey out the arrows -- just take them away. keep the faded grey boxes tho".

## Solution

- `app/teacher/assignments/PathwayMap.tsx`: `Arrows` draws nothing for an option that isn't the column's pick once the column has one. Before a pick every option still gets a muted arrow; the picked one is ink. Unpicked boxes keep `opacity-35` and stay tappable. The draw-order sort from 197 is gone, since arrows no longer overlap once a pick exists.

## Acceptance

- [x] For all eight pathways, at 1280 and 1400: an unpicked column shows one muted arrow per option; a picked column shows only the arrow to the pick, in ink, at full strength, leaving the picked node's middle and landing on the pick's middle; every option box still shows with its siblings faded; the sentence matches; no horizontal scroll
- [x] vitest 569, eslint, next build; click-through `arrows201.mjs` (304 checks)
