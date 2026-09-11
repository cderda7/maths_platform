# 116 · The handed-in screen counts incomplete problems above the mistakes

Route: `/student?stage=feedback` (the individual review after handing in), and the notice after the second hand-in.

## Files touched

| File | What it does |
|---|---|
| `data/evaluation.ts` | `LineVerdict.answer?: boolean`, set with `A(...)` on the lines that state what each problem asked for, right or wrong (22 lines across Q1 to Q10). |
| `lib/feedback.ts` | `progressOf` (not attempted, unfinished, finished: the first hand-in and the rework read together, and the sentence typed under a worded problem's working counts as its answer), `incompleteProblems`, `incompleteHead`; `FeedbackSummary.incomplete` and `.incompleteHead`; `summaryParts(…, outstanding)` names the first submission while anything is incomplete; the final version skips problems blank at the first hand-in. |
| `lib/feedback.test.ts` | Answer lines in every model solution; the scripted run's progress; a thin hand-in; counting down on the rework pad; a wrong step while finishing; singular forms. |
| `app/student/screens/FeedbackScreen.tsx` | The incomplete card above the summary card (only when the count is above zero); three-state row labels with `data-progress`. |

## How it connects

```
 data/evaluation.ts                      lib/session.ts
   EVALUATION[q][tex].answer = true         session.lines[q]   (first hand-in)
   (the roots, k, the factorised form,      session.rework[q]  (the rework pad)
    the turning point, the height,                │
    the sentence about the graph)                 │
        │                                         │
        ▼                                         ▼
 lib/feedback.ts ──────────────────────────────────────────────────────────────
   progressOf(session, q)      any line, either version, with answer,
                               or session.answers[q] typed (114)    → "finished"
                               lines but no answer                  → "unfinished"
                               nothing anywhere                     → "not-attempted"
   incompleteProblems(session) ─▶ incompleteHead(n) ─▶ "2 problems are incomplete." | null
   feedbackSummary(session, "original")  count from session.lines only
        └─ summaryParts(count, leaves, "original", outstanding = incomplete > 0)
              outstanding: "No mistakes in your first submission." /
                           "N problems in your first submission contain a mistake."
              otherwise:   "Every problem held." / "N of your problems contain a mistake."
   feedbackSummary(session, "final")     rework of problems with lines at hand-in;
        │                                a problem blank at hand-in is skipped
        │
        ├──────────────────────────────┐
        ▼                              ▼
 FeedbackScreen.tsx               session.ts  rework/done, group-start
   [data-incomplete] card           notice = feedbackSummary(s, "final").sentence
   [data-summary] card + chips      ("Every problem holds now." after a slip made
   rows: [data-progress]             while finishing a problem blank at hand-in)
     not attempted | unfinished | N lines
```

The incomplete box and the rows read the same `progressOf`, so they agree at every moment: writing an answer line on the rework pad turns a row from "unfinished" to "N lines" and takes one off the count in the same render. The mistakes box never reads the rework, so finishing a problem badly leaves it, its chips and the hand-in notice alone; the guard (`lib/guard.ts`) is unchanged and cannot fire on a problem that was blank at hand-in.

## Verified by

vitest (362), eslint, `next build`; a headless click-through (`incomplete.mjs`, port 3151) of a thin hand-in (one line on Q2, confirmed through the hand-in check), finishing Q1, Q3 and Q4 on the rework pad (Q4 with the script's wrong line), the notice after Hand in, the scripted run with Q10 reworked, and the strong run; screenshots of each state; the two cards measured the same width and fill, 8px apart, the first 16px under the heading.
