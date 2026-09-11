# 120: The review step: difficulty, assessment, recommendations, pathway

**What to build:** Step two of a new assignment, replacing ticket 119's stub at `/teacher/assignments/create/review`. The typed draft comes back in its tiles with a difficulty label on each (simple familiar, simple unfamiliar, complex familiar, complex unfamiliar) and the count of each above the grid; a label is tapped to change it. "Assess set" runs a bar for five seconds and returns three recommendations matched to the set: change `x^2 + 5x + 6 = 0` to `x^2 - 5x + 6 = 0` (the class's sign slip), remove the repeat of Q3, add a problem set in a context (three alternatives, the ball first). Each is accepted or kept as is, reversibly, and the grid beneath follows. "Finalise set" opens the pathway screen: the unit focus to confirm above the review-pathway map, then Create.

**Blocked by:** 119 (the create screen and the draft), 19 (the map and the unit card).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11): "you'll be the second phase. assume you're getting from phase 1 a list of questions … YOUR JOB is to label them by problem difficult -- simple familiar, simple unfamiliar, complex familiar, complex unfamiliar. you will then have an 'assessing' screen -- just a load bar in the middle for 5 seconds while you artificially 'assess' the set. you'll then make a reccomendation for one problem. you'll get x**2 + 5x + 6. you'll make the recommendation to change the problem to x**2 - 5x + 6 = 0 … you'll then recommend removing 1 problem entirely & create a new problem … AFTER the problem set is finalized, the teacher will be prompted to select a review mode -- repurpose from this. like the exact same, i like that functionality. have it be its own separate screen after the problems have been finalized."

The interview settled: the draft is read from the classroom store, where the create screen leaves it; labels by matching each question's expression to the bank (a small heuristic for anything unknown), with a popover to relabel; the pills fade in one after another; the bar with three changing lines beneath it; recommendations matched by expression, not position, so a missing target hides its card; the removal's reason in the user's words ("this is Q3 again with the numbers changed. With Q3 being simple unfamiliar, if your students make a mistake here, it will be best to do a group diagnostic to address it & have spacing before they see this problem type again"); no QCAA 60-20-20 split ("that's only for final assessment, not necessarily practice"); the evidence line counts a class of twenty; reversible answers; reassessing clears them; decisions kept across reloads; the old screen kept; the bank's Q1 back on `x^2 - 5x + 6 = 0` whatever the teacher decides ("we're just gonna override & change back to -5x anyways").

## Solution

- `data/review.ts`: `DEMO_PASTE` (the ten questions, one per line in the editor's shorthand, Q1 as +5x and Q9 the repeat); `DRAFT_LABELS` for the two draft-only expressions; the three recommendations (`CHANGE_SIGNS`, `REMOVE_REPEAT`, `ADD_CONTEXT` with its three alternatives); `ASSESS_MS`, `ASSESS_LINES`, `ASSESS_BEAT_MS`.
- `lib/review.ts`: `normTex`, `bankMatch`, `heuristicLabel`, `defaultLabel`, `labelsOf`, `countByDifficulty`; `ReviewState` and `reviewFor` (a stored review is only shown over the draft it was made about, by `draftKey`); `recommendationsFor` (by expression); `applyReview` (the finalised set: a changed question keeps its place, a removed one goes, the addition comes last); `bankProblemsOf` and `inferUnitFromReviewed` for Create.
- `lib/classroom.ts`: `review` on the state and the `review/set` action; `questions` on `CreatedAssignment` and on `assignment/create`, so the assignment in force carries the finalised set as typed beside the bank ids the student side runs.
- `app/teacher/assignments/create/review/`: `page.tsx` (`?assess=<ms>` shortens the bar for the sweep), `ReviewAssignment.tsx` (the host: the step in the store, the assessing run local), `Steps.tsx` (the step line; earlier steps are Back, locked during the run), `QuestionGrid.tsx` (the tiles with their pills, the popover, the arrival animation, the Changed / Added foot line), `DifficultyStep.tsx`, `AssessingStep.tsx`, `RecommendationsStep.tsx`, `PathwayStep.tsx`. `ReviewStub.tsx` removed.
- `app/teacher/assignments/PathwayMap.tsx` (moved up from `new/`) and `app/teacher/assignments/UnitFocus.tsx` (extracted from the old screen), shared by both screens; the old screen at `/teacher/assignments/new` otherwise untouched.
- `app/globals.css`: `.label-in` (the pill's arrival) and `.assess-fill` (the bar).
- Tests: `lib/review.test.ts` (12). Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `ASSUMPTIONS.md`, `README.md`.

## Acceptance

- [x] The demo paste continues into the difficulty step: ten tiles, each labelled as the bank labels it (the +5x Q1 simple familiar, the repeat simple unfamiliar), pills arriving one after another, the counts 3 · 3 · 2 · 2, "Tap a label to change it."
- [x] Tapping a pill opens the four labels; a pick relabels and the counts follow; a press elsewhere or Escape closes it; a reload keeps the step and the relabel
- [x] Assess set: the bar in the middle, the three lines in turn, the recommendations about 5.4s later; the step line locked meanwhile; `?assess=300` runs it short
- [x] Three cards: Change Q1 (the swap in maths, the reason, "Last unit, 7 of 20 students…"), Remove Q9 (the question, the reason in the user's words), Add a problem (the ball, its label, Try another cycling garden → rocket → ball); Finalise off until all three are answered
- [x] Accept swaps Q1's maths and marks it Changed; Keep as is collapses the card; Undo reopens it; accepting the removal drops Q9 and renumbers; accepting the addition appends Q10 marked Added; a reload keeps the answers; Back then Assess set again clears them
- [x] Finalise: unit focus (Unit 1) above the map with the default pathway; picking whole-class extends the sentence; a reload keeps both; Confirm turns Create on; Create lands on the class view with ten bank ids, ten questions, the pathway and the unit in force, the draft and the review cleared, the tabs following the pathway
- [x] Equal square tiles, nothing overflowing, no sideways scroll, the pinned buttons clear of the reset pill, the popover inside the window; no difficulty pill on any student screen; the old screen still renders its unit focus and map
- [x] vitest (388), eslint, tsc, `next build`, headless run (`review.mjs`, 63 checks) with screenshots
