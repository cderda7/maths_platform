# 310: Q* and Q** for every Problem Set 6 question, and a completion problem for every practice skill

## Files touched

| File | What it does |
| --- | --- |
| `data/types.ts` | The pair's vocabulary beside `PracticeProblem`: `WorkedQuestion` (Q*, a `Problem`), `CompletionQuestion` (Q**, a `Problem` with `hints` and `approaches`), `QuestionPair`; the two routes and the blank rule written once in a comment. `FigureId` gains the Q8* and Q8** graphs. |
| `data/pairs.ts` (new) | `QUESTION_PAIRS` / `PAIR_MAP`: Q* and Q** for Q1–Q10. `COMPLETIONS`: one completion problem per practice skill, keyed as `PRACTICES`. |
| `lib/pairs.ts` (new) | `blankSteps(steps, leaf)`: which lines the student writes. `pairFor(problemId)`, `warmupSteps(leaf)` → `{ worked, completion, alone }`. |
| `components/Figure.tsx` | Two new parabola specs and `PARABOLAS`, every figure by id; `Figure` reads the map (the two existing graphs unchanged). |
| `lib/pairs.test.ts` (new) | Shape, every maths fact, no repeats (as text and as a function), the blank rule, hints, KaTeX, and every blank read by ticket 311's `checkStep`. |

## How it connects

```
 data/assignment.ts  PROBLEMS Q1–Q10 ──(problemId, stem, difficulty, figure kind, tags step for step)──┐
                                                                                                     ▼
 data/practice.ts  PRACTICES[leaf] ───────────(leaf, steps' tags, hints' points, approaches)──▶ data/pairs.ts ◄310
        │  (worked example)                                                                  QUESTION_PAIRS  { problemId, worked: Q*, completion: Q** }
        │  .followUp (problem alone)                                                         COMPLETIONS[leaf]  (completion problem)
        │                                                                                         │
        │                          components/Figure.tsx  PARABOLAS["q8-star…"] ◄310 ◄── figure ────┤
        ▼                                                                                         ▼
 lib/pairs.ts ◄310   warmupSteps(leaf) = { worked: PRACTICES[leaf], completion: COMPLETIONS[leaf], alone: followUp }
                     pairFor(problemId) = { worked: Q*, completion: Q** }
                     blankSteps(steps, leaf) ── steps tagged with leaf; all or none tagged → last two (last one of two)
        │
        ├──▶ ticket 312  I need help on Q: HelpPicker leaf ─▶ Q* worked ─▶ Q** with blankSteps(Q**.solution, leaf) blank ─▶ back on Q
        ├──▶ ticket 313  warm-up per skill: worked ─▶ completion with blankSteps(c.steps, c.leaf) blank ─▶ alone
        │
        ├──▶ lib/hint.ts  pickHint / stalledHint / termTex  on { steps: Q**.solution, hints: Q**.hints }  (unchanged)
        └──▶ lib/stepCheck.ts (311)  checkStep(blank step, written line) → right / wrong (misconception) / unreadable

 lib/pairs.test.ts ◄310 ── lib/texEval.ts (facts) · lib/hint.ts (hints) · katex (typesetting) · lib/stepCheck.ts (every blank reads)
                        └─ every other problem in the app (sets, practices, similar problems, diagnostics, homework): no repeats
```
