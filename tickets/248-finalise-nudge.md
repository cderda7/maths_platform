# 248: A press on the waiting Finalise set rings the unanswered recommendations, and Keep as is reads as a choice

**What to build:** On Create's assessment step, "Finalise set" waits until every recommendation card has an answer. A press on it while it waits sends one purple ring out from each card still unanswered (the pathway step's Create nudge, ticket 246), instead of doing nothing. "Keep as is" gets an ink edge so it reads as a pill beside Accept, not a dismiss link.

**Blocked by:** 246.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-14): "during assignment review, if teacher clicks on the greyed out 'finalize set' before the change screen, do a single purple pulse around the unselcted tiles", then "also make keep as is more clear as option. add black border to the pill". Finalise was a `disabled` button, so a press gave no hint of what was missing; Keep as is was a ghost button, plain text next to the ink Accept pill.

## Solution

- `RecommendationsStep.tsx`: Finalise is `aria-disabled` at 40% (the look it had) but takes the press; while not every card is answered a press scrolls the cards into view and bumps a `nudge` counter. Each unanswered card mounts a `.ring-once` span keyed on `nudge`, so each press plays the ring again; an answered card has none.
- Keep as is: the ghost button with an inset 1 px ink ring and ink text. A ring, not a border, so the pill stays Accept's height.

## Acceptance

- [x] Click-through `click248.mjs` (30 checks) at 1280×800 and 1440×900: Keep as is has the ink edge and ink text at Accept's height; the waiting Finalise is at 40% and not `disabled`; no ring before a press; with one card kept, a press stays on the step and rings exactly the two unanswered cards (`hint-ring`), a second press replays it; cards don't move; with every card answered Finalise is at full opacity, no card rings, and it moves to the pathway step; no sideways scroll
- [x] vitest 792, eslint, tsc, next build, check:laptop 62
