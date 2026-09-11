# 76 · The fraction problem stays wrong after the individual review

Route: `/student` group review (Liam's Q7 turn, the stuck reveal, the Q7 debrief), `/student?stage=report`, `…?stage=history`.

## Files touched

| File | What it does |
|---|---|
| `data/recognition.ts` | `RECOGNITION_REWORK.q7` is a second slip: `x^2 + 6x + 8` (every term scaled, the third never put back), the pair, `(x + 2)(x + 4)` |
| `data/evaluation.ts` | Q7 learns `x^2 + 6x + 8` as a wrong line tagged fractions, label "Multiplied through by 3", with its clue and teacher note |
| `data/group-scripts.ts` | Liam's second Q7 attempt is the model solution (`solution("q7")`), no longer the rework path |
| `lib/evaluate.test.ts` | The rework path corrects every slip but Q7 (and Q4's deliberate guard slip); Q7's new first line is a fractions slip distinct from the handed-in one |
| `lib/groupReview.test.ts` | Liam's second go is the model solution; Sam's Q7 rework does not check correct |
| `lib/debrief.test.ts` | The demo's Q7 debrief asks for the student's own mistake |
| `lib/feedback.test.ts`, `lib/session.test.ts` | The post-rework sentence is "1 of your problems still contains a mistake. Double-check fractions." |
| `lib/report.test.ts` | Four right after individual review, Q7 wrong; the group column test uses the real fixture |
| `lib/versions.test.ts` | 15 changed rows (Q7 changes one line of three now) |

## How it connects

```
  RECOGNITION.q7            RECOGNITION_REWORK.q7          GROUP_SCRIPTS.q7
  x² + 6x + 8/3  (wrong)    x² + 6x + 8  (wrong, new)      [ SLIPS.q7 (Liam, wrong) ,
  the pair                  the pair                         solution("q7") (right) ]
  (x+2)(x+4)                (x+2)(x+4)                           │
        │                          │                             │
        ▼                          ▼                             ▼
  feedbackSummary("final") ─► "1 of your problems still contains a mistake…"  (notice after rework)
  earlierVersions(...)     ─► stuck reveal: You · Handed in ▌x²+6x+8/3▐ +2 · Reworked ▌x²+6x+8▐ +2
  debriefPrompt(q7)        ─► "own"  (neither own version is functional)
  markedVersions(q7)       ─► Handed in (red line 1) · Reworked (red line 1) · Group's rework (green)
  problemOutcome(q7)       ─► "group"  → report column "Correct after group review": Q7
```

Nothing in `app/` or `components/` changed: every screen already read these outcomes from the data.

## Verified by

vitest 310 passing; eslint and tsc clean; `next build`; headless Chrome on the built app (port 3141):
the "group review" skip, the run fast-forwarded to Liam's Q7 turn → wrong check after 9 s with two
hidden lines → "we're stuck" lists You with Handed in and Reworked, each one red line and "2 more
lines", the three peers' handed-in solutions → the debrief with three panes and "describe the
mistake you made" → marks: red on the first line of both own versions only → the report's columns
Q4 Q5 Q6 Q8 Q9 / Q1 Q2 Q3 Q10 / Q7 / None → history shows the reworked Q7. Screenshots of the reveal
and the marked debrief checked.
