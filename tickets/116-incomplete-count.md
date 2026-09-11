# 116: The handed-in screen counts incomplete problems in a box above the mistakes

**What to build:** On the handed-in screen ("How it held up"), a student who handed in with problems unfinished no longer reads "Every problem held." Two soft boxes stack under the heading: "2 problems are incomplete." (reading the rework pad too, so it counts down as problems are finished there and goes away at zero) and, below it, the detective sentence as before but naming the first submission while anything is outstanding: "No mistakes in your first submission." / "2 problems in your first submission contain a mistake." with the double-check chips. A problem is incomplete until one of its lines, in the first hand-in or the rework, is an answer line for that problem, right or wrong. The rows read "not attempted", "unfinished" or "N lines" the same way, so they always agree with the count. A wrong step made while finishing a problem that was blank at hand-in changes nothing: not the mistakes box, not the chips, not the hand-in notice. Hand in stays enabled with work outstanding.

**Blocked by:** 07 (individual review), 111 (the worded problems' final answer).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), with a screenshot of the handed-in screen after a thin hand-in (Q2 with one line, the rest not attempted) reading "Every problem held.": "student gets 'every problem held' for incomplete work. you're correct in that they haven't made a mistake. but say instead 'x problems are incomplete' … have two of those purple boxes. first, '2 problems are incomplete.' — this one will dynamically resolve itself, so as a problem gets finished, it moves to '1 problem is incomplete.' if the student made an error on that problem, do NOT update mistakes to add one … then in second purple box vertically aligned below it, have the view that we normally did".

Grilled and settled (2026-09-11): incomplete means no answer line reached, not merely blank (so Q2 with one line of working counts); the incomplete box hides at zero; the mistakes box always shows and says "in your first submission" while anything is outstanding, reverting to today's copy when nothing is; the incomplete count reads original or rework, the mistakes count the original only; the hand-in notice agrees with the box; a wrong answer counts as finished; rows are three-state and read the rework; Hand in stays enabled.

## Solution

- `data/evaluation.ts`: `LineVerdict.answer?: boolean`, set (`A(...)`) on the lines that state what each problem asked for: the roots (Q1, Q2, Q3, Q8), the exact solutions (Q4), the turning point (Q5), the value of k (Q6), the factorised form (Q7), the greatest height (Q9), the sentence about the graph (Q10). Right and wrong answer lines alike, including the built-on ones.
- `lib/feedback.ts`: `progressOf(session, id)` ("not-attempted" | "unfinished" | "finished", reading the first hand-in and the rework together; a non-blank sentence typed under a worded problem's working, ticket 114's `session.answers`, is its answer too), `incompleteProblems`, `incompleteHead(n)` ("1 problem is incomplete." / "N problems are incomplete." / null). `FeedbackSummary` gains `incomplete` and `incompleteHead`. `summaryParts` takes `outstanding`: the original version's clause becomes "No mistakes in your first submission." / "1 problem in your first submission contains a mistake." / "N problems in your first submission contain a mistake."; the final version keeps "still". `feedbackSummary("final")` skips problems blank at the first hand-in, so the post-rework notice never counts a slip made while finishing one; a problem with correct working at hand-in that the rework breaks is still the guard's case and still counts under a forced hand-in.
- `app/student/screens/FeedbackScreen.tsx`: the incomplete card (`data-incomplete`, shown only when the count is above zero) above the summary card, 8px apart, the summary card keeping its 16px under the heading when alone; rows carry `data-progress` and read "not attempted", "unfinished" or "N lines" (the first hand-in's count, or the rework's for a problem blank at hand-in).
- `lib/feedback.test.ts`: every model solution reaches an answer line; the scripted run finishes Q1 to Q8 and stops short on Q9 and Q10 (2 incomplete, "5 problems in your first submission contain a mistake."); a thin hand-in (10 incomplete, "No mistakes in your first submission."); finishing on the rework pad counts the box down to nothing and the copy reverts; a wrong step while finishing a blank problem changes neither box nor the notice; a typed sentence finishes Q9; singular forms.

## Acceptance

- [x] `/student?stage=working`, one line on Q2, Hand in from Q10: "10 problems are incomplete." above "No mistakes in your first submission.", no chips; Q1 "not attempted", Q2 "unfinished"; the boxes the same width and fill, 8px apart, the first 16px under the heading; Hand in inside the window
- [x] Q1 on the rework pad: one line keeps "10 … incomplete." and the row "unfinished"; the answer line makes "9 problems are incomplete." and the row "2 lines"; Q3's four lines make 8
- [x] Q4 finished with the rework script's wrong formula line: "7 problems are incomplete.", the mistakes box and chips unchanged, no guard banner; Hand in enabled; the notice after it reads "Every problem holds now."
- [x] `/student?stage=feedback` (the scripted run): "2 problems are incomplete." above "5 problems in your first submission contain a mistake." with three chips; Q9 and Q10 "unfinished"; Q10 reworked to its sentence reads "1 problem is incomplete."
- [x] `/student?stage=feedback&run=strong`: one box, "Every problem held.", 16px under the heading as before
- [x] vitest (362), eslint, `next build`, the headless click-through (`incomplete.mjs`, through ticket 115's hand-in check) with screenshots; architecture note, root docs, decision log, future features

## Judgment calls to know about

- The scripted demo run now shows "2 problems are incomplete." on the handed-in screen, because its Q9 and Q10 end at working with no final answer (ticket 111 already treats them so). Reworking Q10 brings it to 1; Q9 has no rework script, so the demo's box never reaches zero. To change that, mark Q9's "turning point at x = 3" line as an answer in `data/evaluation.ts`.
- A problem is finished if any of its lines is an answer line, not only the latest: a check written after the answer (Q8's substitution) does not undo it.
