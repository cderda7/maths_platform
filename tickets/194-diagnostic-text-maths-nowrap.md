# 194: The Live diagnostic flyout reads at the page's size; typeset maths never splits across lines

**What to build:** The mistake view's Live diagnostic flyout sets its text at the size of the problem cards beside it (question 17 px, options 16 px, tabs, send, waiting band and board links 15 px, the own-question form 16 px), in a wider panel that may lie over the next problem's chip. Across the whole app, a KaTeX expression is never broken across two lines.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13, a screenshot of `/teacher/a/pset-2/mistakes` with Q7's flyout open, its question reading "What is left after taking the third out of ⅓x² + / 2x + 8/3?" in ~10 px on screen): "make the text bigger throughout. ensure that a latex equation never splits lines -- make this a rule throughout. also, i'm fine with a diagnostic question box being so large that it blocks the next diagnostic question banner. just want current question readable".

## Solution

- `app/globals.css`: `.katex { white-space: nowrap }`. KaTeX 0.18 sets each run between relations and binary operators as its own `.katex-base` inline box, and a line may break between those boxes; nowrap keeps the expression whole, so it moves to the next line as one piece.
- `app/teacher/DiagnosticPush.tsx`: the flyout is 460 px wide (was 380). Tabs 15 px; the example question 17 px with its `?` held to the maths; option chips 16 px with 12 px letters; send is the large button; the waiting band and board links 15 px; the own-question inputs 16 px, the correct-answer circles 32 px, and each option's preview 16 px in a `FitText` (scales down instead of truncating).
- `components/DiagnosticResults.tsx`: a `size="panel"` for the flyout's results (question 17 px, options 16 px, counts and misconceptions 14 px). Class View's side card (`size="card"`) and the board keep their sizes.

## Acceptance

- [x] No KaTeX expression on any route sits on two lines: `wrap194.mjs` over 13 teacher routes, all 14 student stages, Problem Set 2's pages and every flyout, at 1280, 1440 and 400 wide (before: Q3, Q5 and Q7's flyout questions split at every width, nine Problem Set 1 headers at 400; after: none)
- [x] Every flyout on Problem Set 2, both tabs and Q7's result: no split maths, inside the viewport, the question at 17 px and no text under 12 px, at 1280, 1440 and 1512 (`flyout194.mjs`, 177 checks)
- [x] vitest 568, eslint, tsc, next build, `check:laptop` 30, `sweep:hint-boxes` 30

## Not done

- At 400 wide (not a teacher target) seven of Problem Set 2's mistake headers now end 7–26 px past their card's clip instead of wrapping (see FUTURE_FEATURES).
