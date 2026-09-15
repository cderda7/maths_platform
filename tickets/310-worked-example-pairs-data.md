# 310: Q* and Q** for every Problem Set 6 question, and a completion problem for every practice skill

**What to build:** the questions the worked example-problem pair runs on. For each of Problem Set 6's ten questions, two whole questions like it (Q*, the worked example; Q**, the one the student finishes). For each of the 15 practice skills, a completion problem that sits between today's practice problem (now the worked example) and its follow-up (now the problem done alone). Data and tests only; no screen changes.

**Blocked by:** none (can start immediately).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

An outside review: a worked example behind a help menu is a reference document, not an instructional structure. The unit of instruction is example → minimally different problem, and studying an example only teaches when the student does something with it. The strongest-evidenced version is faded guidance: a full example, then the same method with the last steps blank for the student to write, then a problem alone.

The user (2026-09-15) agreed and set the shape:

- **Help from a set question:** Q → Q* (a whole different question, fully worked) → Q** (another whole different question, the student writes the missing lines) → back to Q. "Whole question", not an isolated skill: the student sees the method inside a question like the one they are stuck on, so the jump back to Q is small.
- **The warm-up** (no Q yet): the same three steps on the skill itself: worked example → completion problem → a problem alone.
- The user is fine without checking the questions: "go for it".

## Acceptance

- [x] Every Problem Set 6 question (Q1–Q10, `data/assignment.ts`) has a Q* and a Q**: the same stem and the same deep structure (same kind of question, same number of steps in the same order, same skills tagged step for step), each changing one or two surface things (a coefficient, a sign, the context's numbers). Q* and Q** differ from each other and from Q, and none repeats a problem anywhere else in the app (the practice bank, the diagnostics' similar problems, the homework problems)
- [x] Every step of Q* and Q** carries its TeX, a label and the skill tags, like Q's own `solution` steps, so the lines left blank in Q** can be read from the tags of the skill the student names (`HelpPicker`)
- [x] Every point of Q** that can be blank has a hint (a move, never the answer) and the help chat's `approaches` where Q offers a choice of ways in
- [x] Every one of the 15 practice skills (`PRACTICES` in `data/practice.ts`) has a completion problem on the same leaf: the same working as its worked example with one thing changed, its own hints for every point. Today's problem becomes the worked example and today's `followUp` becomes the problem done alone; nothing a student sees changes in this ticket
- [x] The rule for which lines are blank is data-driven and written down once: in Q**, the steps tagged with the named skill; when every step carries it (the warm-up's single-skill problems), the last two steps (the last one for a two-step problem)
- [x] Every maths fact hand-checked and held by `lib/*.test.ts`: every factorisation expands back, every pair's sum and product, every root substituted, every discriminant and turning point recomputed, every step a true consequence of the one before
- [x] Every TeX string typesets in KaTeX without error and on one line (the "maths never splits" rule); TeX backslashes doubled in TS strings (see project testing pitfalls)
- [x] The types live beside `PracticeProblem` in `data/types.ts`; the data in a new file (for example `data/pairs.ts`), not in `data/assignment.ts`
- [x] vitest, eslint, tsc, next build
- [x] Ticket docs: architecture note `architecture/310.md`, the ARCHITECTURE row, a DECISION_LOG entry for the data shape

## Notes

- Keep Q's difficulty. Q2 is non-monic with a negative constant, so Q* and Q** are non-monic with a negative constant.
- A figure-based question (sketching) keeps the same kind of figure.
- Screens come in tickets 312 (help from a set question) and 313 (the warm-up).

## Solution

- `data/types.ts`: the pair's shape beside `PracticeProblem`, with the three-step routes written once in a comment. `WorkedQuestion` (Q*) is a `Problem`; `CompletionQuestion` (Q**) is a `Problem` plus `hints` (one per point, `at` counting lines of `solution`) and `approaches` where Q has a real choice; `QuestionPair` is `{ problemId, worked, completion }`. `FigureId` gains `q8-star-parabola` and `q8-star-star-parabola`.
- `data/pairs.ts` (new): `QUESTION_PAIRS` (and `PAIR_MAP`), Q* and Q** for Q1–Q10, and `COMPLETIONS`, one completion problem per practice skill keyed exactly as `PRACTICES` (a `PracticeProblem`, id `<practice id>-completion`, no follow-up).
  - Each Q*/Q** keeps Q's stem (Q10's quadratic in the stem changes with the expression), difficulty, answer form and kind of figure, as many steps with Q's skill tags step for step and Q's labels but for their numbers, and changes one or two numbers: Q1 x² − 9x + 14 / x² − 9x + 18; Q2 2x² + 11x − 6 / 2x² + 7x − 15 (non-monic, negative constant, a fraction root); Q3 (x − 2)(x + 3) = 14 / (x − 5)(x + 2) = 8; Q4 2x² − 5x − 1 / 3x² − 7x − 1; Q5 y = x² − 4x − 21 / y = x² − 6x − 27; Q6 y = x² + 10x + k / y = x² + 12x + k; Q7 ⅓x² + 3x + 8/3 / ⅓x² + 4x + 35/3; Q8 y = x² − 5x + 4 / y = x² − 8x + 15, each with its own graph; Q9 h = −x² + 10x / h = −x² + 12x; Q10 x² + 6x + 10 / x² + 4x + 7.
  - Completion problems: monic x² + 9x + 20 = 0; non-monic 3x² + 11x + 6; expand (x − 3)(x + 7); rearranging x(x + 5) = 6; fractions x/8 + x/4 − 3 = 3/2; null factor law (x − 6)(x + 1) = 0; discriminant x² + 4x + 9 = 0; turning point y = x² − 2x − 24; formal x² − 8x + 16 = 0; conclusions Δ = −19 (y = x² + x + 5); sketch y = (x − 2)(x − 6); evaluate f(−4) for the same f; worded h = 25t − 5t²; zeros f(x) = x² − 16; binomial (x + 7)².
- `lib/pairs.ts` (new): `blankSteps(steps, leaf)`, the one rule for which lines are blank (the steps tagged with the named skill; when every step or no step carries it, the last two, or the last one of a two-step working); `pairFor(problemId)`; `warmupSteps(leaf)` → `{ worked, completion, alone }` (the practice problem, its completion problem, its follow-up).
- `components/Figure.tsx`: the two new parabolas, and `PARABOLAS` (every figure's spec by id, exported so the tests hold each graph to its question). `Figure` reads the map; the two existing graphs draw exactly as before. No screen shows the new ones yet.
- No screen changes.

## Verification

- `lib/pairs.test.ts`, 57 tests: shape (ids, labels, stem, difficulty, answer form, figure kind, step count, tags and labels step for step, Q ≠ Q* ≠ Q**); every maths fact by `lib/texEval.ts` (every factorisation is the same function as the question, every pair's sum and product, every split line's ac, every root substituted, every discriminant and its parts, every axis and height recomputed and the point read back, Q6's k making a perfect square, Q9's top higher than its neighbours, every fraction line with the one root 12); the Q8 graphs draw the question's own parabola with dots on its roots inside the 300 × 190 frame (and a headless screenshot of all four graphs looked at); nothing repeats, as written and as a function (163 problems across the sets, practices, similar problems, diagnostics and homework); the blank rule on examples, on every Q** for every skill the help picker offers (at least one line to write and one shown, each blank with its hint) and on every completion problem (listed); every hint phrase and fragment found, lighting a hint word changes no spacing at rest or lit, walking each working line by line gives the hint written for each point; every TeX string, lit hint wrapping and approach `$` piece typesets in KaTeX with no line break; every blank reads under ticket 311's `checkStep` (right against itself, and unspaced, and wrong with a digit changed).
- A mutation run (four facts changed by hand) failed five tests; restored.
- vitest 1934 (98 files, on main with tickets 311, 314 and 321), eslint, tsc, next build.

## Judgement calls

- **On the warm-up's completion step, the blank lines follow the ticket's tag rule, not "the last two lines".** The ticket's rule assumes warm-up problems carry their skill on every step; most do not. So a student warming up on fractions writes five of the seven lines (from writing 3 over 2 to 3x = 36, the lines tagged fractions), on monic the pair, the sum and the factors (not the check or the null factor law), and on expanding the four products only (the collected line is shown). The alternative, the last two lines everywhere, would have a monic student write the expand-back check and the null factor law, never the factorising they named. The full list per skill is in `lib/pairs.test.ts`.
- **On the Q10 question the student finishes, and the conclusions completion problem, a student who names the conclusions skill writes the sentence "The graph never meets the x-axis".** Ticket 311 checks words by their words, so another wording is marked wrong. In FUTURE_FEATURES (ticket 311's "Judging a sentence").
- **The questions finished on Q7 and Q8 have no approaches** (one way in each: take out the fraction then find the pair; read the graph then substitute). Q* carries no hints: it is read, not written.
- **The finished questions' hints cover every point of the working, not only the lines that can be blank,** so a later ticket can change the blank rule without new hints.
