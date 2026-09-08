# 06 · Feedback layers on submission

Route: `/student?stage=feedback` (the scripted run, handed in). "Finish the set" on Q4 lands here.

## Files touched

| File | What it does |
|---|---|
| `data/evaluation.ts` | Adds `STANDOUT[problemId][tex]`: the curated blue steps, each marked `strong` / `weak` / `both` with the one-line reason shown |
| `lib/feedback.ts` | `runKind(session)` (any step that didn't hold → weak) and `feedbackFor(session)`: per problem the lines with verdicts, the standout reason where the run kind matches, the subskills that slipped, the detective-work clue (from the first wrong line's verdict), and whether the problem is clean |
| `lib/feedback.test.ts` | Scripted run is weak, model solution strong; reds are exactly Q1/Q2/Q3's slips; weak standouts vs strong standouts differ; clues only on problems with a slip and never name a line; star toggles |
| `lib/session.ts` | `stars[]` + `star/toggle`; `scriptedSession()` plays the whole scripted run through the reducer (Q2 prompt taken) so deep links from `feedback` onward carry a real run |
| `app/student/screens/FeedbackScreen.tsx` | Problem list with red/blue/star markers and legend; the selected problem's transcription with red rows (note in red), blue rows (reason in blue), "built on the line above" notes; detective-work card; star card on a clean problem; "Rework on your own →" |
| `app/student/StudentApp.tsx` | Feedback stage wired; placeholder for rework (ticket 07) |

## How it connects

```
 session.lines[problem] ──▶ feedbackFor(session)
                               │  evaluateLine → verdict (ok / wrong / unclear, builtOn, note, clue)
                               │  runKind(session) → strong | weak
                               │  STANDOUT[problem][tex].when matches run kind → blue + reason
                               ▼
                        ProblemFeedback[] { lines, slips, clue, clean }
                               │
             ┌─────────────────┼─────────────────────────────┐
             ▼                 ▼                             ▼
   FeedbackScreen (06)   ReworkScreen (07: clue only)   teacher mistake view (11: red rows)

 star/toggle ──▶ session.stars ──▶ final report (09) and teacher report (10)
```

## Verified by

vitest (33 tests), `tsc --noEmit`, `npm run lint`, `npm run build`, and a CDP run on the deep
link: Q1 shows one red row with its note, a built-on note, and the clue card; Q2 shows red, a
blue standout and the clue; Q4 shows two blue rows and the star card; starring flips the button
and marks Q4 in the list; "Rework on your own" moves to the rework stage.
