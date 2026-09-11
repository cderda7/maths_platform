# 120 · The review step: difficulty, assessment, recommendations, pathway

Route: `/teacher/assignments/create/review` (step two of a new assignment; ticket 119's stub replaced). `?assess=<ms>` shortens the assessing bar.

## Files touched

| File | What it does |
|---|---|
| `data/review.ts` | The fixtures: `DRAFT_LABELS` (the two draft-only expressions' labels), the three recommendations (`CHANGE_SIGNS` with its `to`, `REMOVE_REPEAT`, `ADD_CONTEXT` with three `options`), `RECOMMENDATIONS`, `ASSESS_MS` (5000), `ASSESS_LINES` (three lines with when each takes over), `ASSESS_BEAT_MS`. The draft itself is ticket 121's `data/draft-seed`. |
| `lib/review.ts` | Pure logic. `normTex` and `bankMatch` (a typed expression against the bank's, spacing, braces and `\tfrac` ignored). Labels: `defaultLabel` (bank → draft fixture → `heuristicLabel`), `labelsOf` (the teacher's overrides on top), `countByDifficulty`. `ReviewState` (step, `forDraft`, labels, answers, addition, pathway, unit, confirmed), `draftKey`, `initialReview`, `reviewFor` (a stored review is shown only over the draft it was made about; relabels and pathway survive). `recommendationsFor` (by expression; a change or removal needs its target, the addition always applies), `allAnswered`, `additionOption`, `applyReview` (the finalised `ReviewedQuestion[]`), `bankProblemsOf`, `inferUnitFromReviewed`. |
| `lib/classroom.ts` | `review?: ReviewState` on the state, the `review/set` action; `questions?: ReviewedQuestion[]` on `CreatedAssignment` and `assignment/create`. |
| `app/teacher/assignments/create/review/page.tsx` | Reads `?assess`, hands `assessMs` to the screen. |
| `…/review/ReviewAssignment.tsx` | The host. Reads the draft and the review from the store (`reviewFor`); `set(patch)` writes the review back. `assessing` is local state: Assess set clears the answers and starts the run; `assessed` (stable, reads the store afresh) moves the step to recommendations. `create` dispatches `assignment/create` with the bank ids, the pathway, the unit and the finalised questions, clears the draft and the review, routes to `/teacher`. Renders the heading, `Steps`, and the step. |
| `…/review/Steps.tsx` | The step line: Questions · Difficulty · Assessment · Pathway; the current in ink, earlier ones tappable as Back (Questions links to the create screen), later ones muted; `locked` during the run. |
| `…/review/QuestionGrid.tsx` | The tiles (the stub's grid) with a `DifficultyTag` top right; with `onLabel` the pill opens the four labels stacked beneath it (a pick, a press elsewhere or Escape closes it); `animate` fades the pills in one after another (`.label-in`, 90ms apart); a changed or added question says so at the foot of its tile. |
| `…/review/DifficultyStep.tsx` | The counts strip (a numeral and the pill, for each of the four), "Tap a label to change it.", the grid, Back (to the create screen) and Assess set pinned bottom right. |
| `…/review/AssessingStep.tsx` | The bar (`.assess-fill`, duration inline) and the line beneath it, timers from `ASSESS_LINES`; `onDone` after the run plus the beat. |
| `…/review/RecommendationsStep.tsx` | Three cards in a row: title, the swap in maths / the target question / the proposed question with its label and Try another, the reason, the evidence, Accept and Keep as is; answered, a one-line outcome with Undo. The grid beneath shows `applyReview`'s set. Back and Finalise set pinned. |
| `…/review/PathwayStep.tsx` | `UnitFocus` above the `PathwayMap` card; Back and Create pinned, Create on once confirmed. |
| `app/teacher/assignments/PathwayMap.tsx` | Moved up from `new/`, unchanged, shared by both screens. |
| `app/teacher/assignments/UnitFocus.tsx` | Extracted from the old screen: inferred unit, Confirm, the note and Reassess; the caller owns the reassessed unit and the confirmation. |
| `app/teacher/assignments/new/NewAssignment.tsx` | Imports the two shared components; otherwise as it was. |
| `app/globals.css` | `label-rise` / `.label-in`, `assess-grow` / `.assess-fill`. |
| `lib/review.test.ts` | Matching, labels (bank, fixture, heuristic, override), the review state and its draft, the recommendations (matched, reordered, missing), applying them (accept, keep, Try another), the created assignment. |

## How it connects

```
 /teacher/assignments/create ──Continue──▶ /teacher/assignments/create/review          classroom store
 (ticket 119/121: the draft)               ReviewAssignment                              ┌─────────────────────────────┐
                                           │ draft ◀────────────────────────────────────│ draft { title, questions }  │
                                           │ review = reviewFor(questions, stored) ◀────│ review { step, forDraft,    │
                                           │ set(patch) ──review/set──────────────────▶ │   labels, answers, addition,│
                                           │                                            │   pathway, unit, confirmed }│
   Steps: QUESTIONS — DIFFICULTY — ASSESSMENT — PATHWAY                                 │ assignment { problemIds,    │
                                                                                        │   pathway, unit, questions }│
 ┌ step "difficulty" ──────────────────┐   ┌ assessing (local) ─────────┐               └─────────────▲───────────────┘
 │ 3 [simple familiar] 3 [simple unf.] │   │      ━━━━━━━━━━━━━━━━━━━━  │                             │ assignment/create
 │ Q1 [simple familiar]  Q2 [..] …     │   │  Checking coverage against │               ┌ step "pathway" ───────────┐
 │  pill ▶ popover: 4 labels ──set({labels})│ Unit 1                    │               │ UnitFocus  Unit 1 [Confirm]│
 │                    [Back] [Assess set]──▶ ASSESS_MS + beat ──▶ assessed()            │ PathwayMap  … → done       │
 └─────────────────────────────────────┘   └────────────────────────────┘               │        [Back] [Create] ────┼──▶ /teacher
                                                              │ set({step:"recommendations"})└───────────────────────────┘
 ┌ step "recommendations" ───────────────────────────────────▼──────────────────────────┐            ▲ set({step:"pathway"})
 │ recommendationsFor(questions)  ── by normTex(q.tex), never by position ──            │            │
 │ ┌ Change Q1 ──────────┐ ┌ Remove Q9 ─────────┐ ┌ Add a problem ─────────────┐        │            │
 │ │ x²+5x+6=0 → x²−5x+6=0│ │ (x+1)(x−4)=6       │ │ ball / garden / rocket      │        │            │
 │ │ reason · evidence    │ │ reason (Carson's)  │ │ [complex unfamiliar] Try another     │            │
 │ │ [Accept] Keep as is  │ │ [Accept] Keep as is│ │ [Accept] Keep as is         │        │            │
 │ └──────────┬───────────┘ └─────────┬──────────┘ └──────────────┬─────────────┘        │            │
 │            └── set({answers}) ─────┴──────────────────────────┘   answered ▶ "Accepted · … Undo" │
 │ QuestionGrid(applyReview(questions, review)):  Q1 CHANGED … Q9 gone … Q10 ADDED         │            │
 │                                                          [Back] [Finalise set] ──────────┼────────────┘
 └───────────────────────────────────────────────────────────────────────────────────────┘

 lib/review: labels                         lib/review: applyReview
 q.tex ─normTex─▶ bankMatch ─▶ bank difficulty      typed q ─ change accepted & target ─▶ rec.to   (origin "changed")
              └▶ DRAFT_LABELS[key]                          ─ remove accepted & target ─▶ dropped
              └▶ heuristicLabel(stem, tex)                  ─ else ─▶ as typed, labels[q.id]  (origin "typed")
 overrides[q.id] wins over all three               add accepted ─▶ options[addition mod 3] appended (origin "added")
                                                   bankProblemsOf(final) ─▶ problemIds (bank order) · inferUnitFromReviewed
```

## Verified by

vitest (389), eslint, tsc, `next build`; a headless run (`review.mjs`, port 3171/9471) that clears the store, reads the empty state, lands on the seeded create screen and continues, checks the ten labels, the pills arriving and settling, the counts, equal square tiles, no overflow, no sideways scroll, the pinned buttons clear of the reset pill; relabels Q2 through the popover (the counts following; a press elsewhere and Escape closing it); reloads onto the same step; runs the bar at full speed (the three lines by 1.3s and 2.9s, the recommendations 5.5s after the press, the step line locked); checks the three cards' content; accepts the change (Q1 swapped and marked), keeps then undoes then accepts the removal (Q9 gone, renumbered), cycles Try another three times, accepts the addition (Q10 marked, labelled), Finalise on; reloads with the answers intact; steps back through the step line; reassesses (answers cleared); finalises; checks the pathway step, extends the pathway, reloads, confirms, creates and reads the assignment in force (ten bank ids, ten questions, the pathway, the unit, the title), the draft and review cleared, the tabs following the pathway; checks no difficulty pill on the student's overview and the old screen intact; eight screenshots.
