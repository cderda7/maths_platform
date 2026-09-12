# 140 · A box left of each problem's label counts the class who got it right

Route: `/teacher/mistakes`.

## Files touched

| File | What it does |
|---|---|
| `lib/mistakes.ts` | `rightCount(problem, index, session, me?)`: classmates who reached the problem and are not wrong on it, plus the live student when his hand-in on it is clean and finished (`liveRight`). `ProblemMistakes.right`; `CLASS_SIZE` re-exported. |
| `lib/mistakes.test.ts` | Every problem's count against the fixture rule, with and without Sam; Q1 fifteen, Q7 two, Q4 twelve live; Q9 unchanged by Sam (unfinished); Q8 countable. |
| `app/teacher/mistakes/TeacherMistakes.tsx` | The box (`data-right`) first in the header's left group, before the label; its `title` splits the class into right, wrong (the rows) and unfinished. |
| `FUTURE_FEATURES.md` | Marking right-but-inefficient answers; this ticket's deferrals. |

## How it connects

```
 CLASSMATES (done, wrong)          session ──► feedbackFor ──► clean      progressOf ──► finished
        │                                          │                          │
        ▼                                          ▼                          ▼
 index < done && !wrong.includes(pid)      liveRight(session, me) = clean && finished
        │                                          │
        └──────────────► rightCount(problem, index, session, me) ◄────────────┘
                                   │
                                   ▼
 mistakesByProblem(session) ─► { problem, rows, right }        (rows = the wrong, as before)
                                   │
                                   ▼
 TeacherMistakes header:  [ 15/20 right ]  Q1  x² − 5x + 6 = 0   expand        simple familiar
                             ▲ data-right="q1:15"
                             title: "15 of 20 got it right · 3 wrong · 2 didn't finish it"
                                                      (20 − right − rows.length)
```

## Verified by

vitest, eslint, tsc, `next build`; headless click-through `right140.mjs`: at 1800 and 1280 px every problem carries the box, its text is `n/20 right` with the expected n (Q1 15, Q7 2, Q9 8; with Sam's hand-in Q4 12, Q5 12, Q6 15, Q9 still 8), it sits left of the label with the header's gap (12.8 px at the 0.8 zoom), centred on the row and shorter than the label, the row is its padding around the label or maths (not the box), the maths is still right of the label, the tooltip's numbers add to twenty, and opening Q1 changes neither the box nor the row's height.
