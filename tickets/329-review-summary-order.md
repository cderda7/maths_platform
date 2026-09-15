# 329: Individual review: mistakes box first, skills on their own line

**What to build:** on Sam's individual review ("How it held up"), the mistakes box sits above the incomplete box, and inside it "Double-check" stands on its own line with the skill chips starting on the line below.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Carson, 2026-09-15, over a screenshot of the review screen (the incomplete box above the mistakes box; "Double-check" and the factorising chip sharing a line, the other two chips wrapping under it):

- "have the skills (factorising, ...) start on a new line from double-check. also, put 5 problems in... card above 2 problems are incomplete card"

## Acceptance

- [x] "5 problems in your first submission contain a mistake." box first, "2 problems are incomplete." box 8 px below it; with nothing incomplete the mistakes box keeps its place under the heading
- [x] "Double-check" alone on its line; the skill chips start on the next line, left-aligned with it, wrapping as they need inside the card
- [x] Nothing else on the screen moves or changes (problem list, Hand in, the right side)

## Verification

- eslint, tsc, vitest 2049, next build
- `click329.mjs` 18/18 against a production build at 1440×900 and 1280×800 (skip to indiv review; box order in the DOM and on screen, the 8 px gap, the label alone, the first chip below and aligned with it, all three chips inside the card; screenshots checked)
