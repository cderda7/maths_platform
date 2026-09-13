# 239: A new set's pathway starts on individual working, and each review stage says what it is on hover

**What to build:** On Create's pathway step, the review-pathway map starts with only "individual working" filled in (no review stage picked, the sentence reads "individual working → done"). Hovering or focusing individual review, group review or class review shows one short grey line beside the pill saying what the stage is.

**Blocked by:** 197, 201.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-14), with a screenshot of the map: "change the default in review pathway to just having 'individual working' colored in. when teacher hovers over indiv review, group review, or class review like in this first stage, a description shows up to the right of the pill in grey text. first, make proposals for the descriptions. they should be short". Offered three wordings per stage, they took:

- individual review: *students find and fix their own mistakes*
- group review: *groups compare answers and fix mistakes together*
- class review: *you lead the class through anonymous examples on the board*

They also agreed that the default changes on Create only (the demo with no created set keeps individual → group review, so its screens still run), and that the line shows only while nothing sits to the right of the hovered pill, so it never runs into a later column's arrows.

## Solution

- `lib/pathway.ts`: `NEW_SET_PATHWAY = []` beside the demo's `DEFAULT_PATHWAY`, and `STAGE_DESCRIPTION` with the three agreed lines.
- `lib/review.ts`: `initialReview` and `reviewFor` start a new set on `NEW_SET_PATHWAY`.
- `app/teacher/assignments/PathwayMap.tsx`: each stage pill in the last column sits in a `relative` wrapper that shows `Description` on mouse enter or focus and hides it on leave or blur. The line is absolutely placed (nothing reflows): beside the pill, 16 px off, vertically centred, wrapping within the map's width; when fewer than 200 px are left on the right (class review in the third column, after individual → group), it sits 8 px under the pill instead, where that column is empty. Room is the map's `offsetWidth` less the column's right edge, pure geometry from the fixed pill and arrow widths.

## Acceptance

- [x] Unit: a new set's review starts on `[]` while `DEFAULT_PATHWAY` stays individual → group (`lib/review.test.ts`); the three descriptions (`lib/pathway.test.ts`)
- [x] Click-through `hover239.mjs` (146 checks at 1280×800 and 1440×900, real mouse moves): the step opens with only individual working dark, "individual working → done", no Confirm groups, no line; hovering each first-column stage shows its line alone, grey 13 px, 16 px beside the pill, centred, on one line, inside the card, clear of every pill and arrow, nothing moving; leaving hides it; keyboard focus shows it and blur hides it; with individual review picked the first column shows nothing and the second column's lines sit beside, inside the card; with individual → group the second column shows nothing and class review's line sits under its pill, inside the card, above the sentence, nothing moving; individual → class shows the line beside class review; no sideways scroll
- [x] vitest 755, eslint, tsc, next build
