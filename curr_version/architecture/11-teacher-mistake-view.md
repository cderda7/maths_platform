# 11 · Teacher mistake view

Route: `/teacher/mistakes` (Mistakes tab). Problems first, then the students who slipped on each;
a row expands inline to their working with the slip in red.

## Files touched

| File | What it does |
|---|---|
| `data/classmates.ts` | `attempts[problemId]`: each classmate's recognised working on the problems they got wrong (shared wrong paths: guessed factor pair on Q2, null factor law on Q3, divided by a not 2a on Q4) |
| `data/evaluation.ts` | Adds the Q4 wrong pattern (denominator a instead of 2a) with its clue and note |
| `lib/mistakes.ts` | `mistakesByProblem(session)`: per problem, rows for the demo student (live, from the session's feedback) and every classmate whose wrong set includes it (from fixture attempts), all evaluated through the same table; problems with no rows are dropped |
| `lib/mistakes.test.ts` | Q1 → Sam; Q2 → Sam, Jordan, Liam; Q3 → Sam, Tomas, Zara, Liam; Q4 → Tomas; every row has a red step and no unknown lines; without a session only classmates appear |
| `app/teacher/mistakes/page.tsx` → `TeacherMistakes.tsx` | One card per problem (label, difficulty, equation, count, slipped subskills); student rows with a live badge on the demo student; click-to-expand, one open at a time, showing the transcription with red rows and notes, "sound, given the line above" on consequences |
| `app/teacher/TeacherChrome.tsx` | Mistakes tab |

## How it connects

```
 session (live) ──▶ feedbackFor ──▶ Sam's rows (problems with a slip)   ┐
 CLASSMATES[].wrong + attempts ──▶ evaluateLine per fixture line         ├──▶ mistakesByProblem ──▶ TeacherMistakes
                                                                         ┘        by problem → by student → expand inline
 Same EVALUATION table behind the student's feedback (06), the teacher's mistake view (11) and the before/after (15).
```

## Verified by

vitest (46 tests), `tsc --noEmit`, `npm run lint`, `npm run build`, and a two-tab CDP run with
the student on the feedback deep link: the teacher view lists Q1 (1), Q2 (3), Q3 (4), Q4 (1) rows;
clicking Sam on Q2 expands four lines with exactly one red row; clicking Tomas on Q3 closes the
first and opens his. Screenshot at 1440×1000.
