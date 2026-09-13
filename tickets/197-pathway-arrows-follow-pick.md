# 197: The pathway map's arrows leave the stage actually picked

**What to build:** On the create screen's review pathway map, the arrows into each column start at the node picked in the column before it and curve to every option in the column, instead of one horizontal arrow at the top row.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13, screenshot of the pathway step with "individual working → group review" picked): "ensure that the arrows go to the correct pathway, instead of just being horizontal". With group review picked in the second row, the only arrow into "class review" sat on the top row, so it read as individual review → class review.

## Solution

- `lib/pathway.ts`: `mapColumns(pathway)` returns the map's columns after "individual working", each with its options and `from`, the row of the stage picked in the column to its left (row 0 for the first column). Replaces the loop that lived in the component.
- `app/teacher/assignments/PathwayMap.tsx`: every node is one fixed height (42 px) with a 12 px row gap, so the arrows are pure geometry. Between columns an `Arrows` SVG (72 px wide) draws one curve per option from the picked node's middle to that option's middle, with a chevron head. Before a pick every arrow is muted ink; after a pick, the arrow to the pick is ink and the siblings' arrows fade with their nodes. The picked arrow is drawn last so it stays on top where the curves leave the node together.
- `lib/pathway.test.ts`: `mapColumns` over the pathways that exercise every `from`.

## Acceptance

- [x] For all eight pathways, at 1280 and 1400: one arrow per option, every arrow leaves the picked node's vertical middle and lands on its option's middle, arrows sit between the columns, the picked arrow is ink and its siblings faded, labels on one line at 42 px, the sentence matches, no horizontal scroll
- [x] vitest, eslint, next build; click-through `arrows197.mjs` (272 checks)
