# 158: In individual review the pad reads a line for every problem, and finishing Q9 counts the incomplete box down

**What to build:** On the individual review screen ("How it held up"), writing on the correction pad "reads" a line for every problem, not only the five with a scripted correction. Q9, the problem the scripted run stopped short on, reads the one line it was missing (`h = -9 + 18 = 9`), so a single burst finishes it: the "2 problems are incomplete." box becomes "1 problem is incomplete.", the Q9 row's "unfinished" becomes "3 lines", and the mistakes box is untouched (it reads the first submission). Problems that held and have no scripted correction (Q5, Q6, Q8) read their own working again, so the pad always answers the pen.

**Blocked by:** nothing.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12), with a screenshot of the review screen on Q9 showing four strokes on the pad and the "Read as" column still on its placeholder: "the 'read as' feature isn't simulating in individual review. please fix. want to show how the incomplete problem update happens".

Reproduced headless against the unmodified build: on Q9 a burst of strokes reveals nothing, the incomplete box stays at two, and Q5, Q6 and Q8 read nothing either; Q10 reads its three lines and finishes. The cause is data, not the pad: `RECOGNITION_REWORK` had entries for Q1, Q2, Q3, Q4, Q7 and Q10 only, and `FeedbackScreen` fed `nextLine` an empty script for every other problem.

## Solution

- `data/recognition.ts`: `RECOGNITION_REWORK.q9 = ["h = -9 + 18 = 9"]`, the greatest height that the scripted run skipped (an existing answer line of Q9's marking table, so `progressOf` reads it as finished and the guard does not trip); a new `reworkScript(problemId)` that falls back to the first hand-in's script (`RECOGNITION`) for a problem with no scripted correction.
- `app/student/screens/FeedbackScreen.tsx`: the burst handler reads `reworkScript(cur.id)` instead of `RECOGNITION_REWORK[cur.id] ?? []`.
- `lib/session.ts`: `reworkedSession` (the deep-linked run past the rework) is unchanged in behaviour; its comment now says why Q9 is left alone there (its first hand-in held, so the existing `originalCorrect` skip covers it), and the existing test that lists its rework keys still holds.
- Tests: `lib/feedback.test.ts` +1 (Q9's script is the one line; one burst finishes it and the box counts down; Q10 then clears the box; Q5/Q6/Q8 re-read their working without tripping the guard; the deep-linked run still has Q9 unfinished).
- Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`.

## Acceptance

- [x] `/student?stage=feedback`, Q9: the box reads "2 problems are incomplete.", the row "unfinished"; one burst on the pad reads `h = -9 + 18 = 9`, the row reads "3 lines", the box "1 problem is incomplete.", no guard banner; Undo withdraws the line and both revert; drawing again re-reads it; the mistakes box still reads "5 problems in your first submission contain a mistake."
- [x] Q5, Q6, Q8: one burst reads the first line of that problem's own working, no guard banner
- [x] Q10: three bursts read its three lines, the row reads "2 lines", and the incomplete box is gone
- [x] vitest (433), eslint, tsc, `next build`, headless click-through (`rework158.mjs`)
