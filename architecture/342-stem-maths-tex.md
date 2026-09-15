# 342: A stem's maths is TeX, said once

## Files touched

| File | What it does |
| --- | --- |
| `components/StemWords.tsx` | New. A stem's words with its `$…$` maths set in KaTeX (unbroken, punctuation kept with it) and hyphens unbroken; moved out of `ProblemQuestion`. |
| `components/ProblemQuestion.tsx` | Imports `StemWords` instead of its private copy. |
| `app/student/screens/WorkingScreen.tsx`, `FeedbackScreen.tsx`, `PracticeSteps.tsx`, `FrozenScreen.tsx` | Sam's question stems through `StemWords`. |
| `app/board/SmartBoard.tsx` | The class review slide's stem through `StemWords`. |
| `components/PracticePad.tsx`, `ProblemCard.tsx`, `PracticeCard.tsx` | Practice and problem card stems through `StemWords`. |
| `components/HomeworkFlight.tsx` | The changing stem's runs set through `StemWords`; no glue. |
| `lib/homework.ts` | `stemWords` (a `$…$` piece is one word) under `wordDiff`; `glueRuns`/`glueStem` removed; `sameTypeLine` ignores changes inside maths. |
| `data/assignment.ts`, `pairs.ts`, `homework.ts`, `practice.ts`, `homework-similar-ps4.ts`, `pset1/2/4/assignment.ts`, `draft-seed.ts`, `diagnostic.ts` | Stems without text maths or repeated expressions; inline maths as `$…$`. |
| `lib/stemMaths.test.ts` | New guard over every `stem:` in `data/`. |
| `lib/homework.test.ts`, `homeworkList.test.ts`, `mathInput.test.ts`, `pairs.test.ts`, `diagnostic.test.ts` | Follow the new stems. |

## How it connects

```
 data/**/*.ts   stem: "For $f(x) = x^2 - 3x + 1$, find"   tex: "f(-2)"
       │              words + inline TeX, said once          the expression
       │                                                          │
       │   lib/stemMaths.test.ts ◄342 guards every stem:          │
       │     no ² √ − = + outside $…$, no side of $…$ = a side of tex
       ▼                                                          ▼
 components/StemWords.tsx ◄342 ── components/Math.tsx (KaTeX) ◄───┘
   "$…$" → <M/> + punctuation, unbroken; hyphens unbroken
       │
       ├─▶ components/ProblemQuestion.tsx ─▶ teacher Mistakes, reports, split, homework screen
       ├─▶ app/student/screens/ Working · Feedback · PracticeSteps · Frozen   (Sam's iPad)
       ├─▶ app/board/SmartBoard.tsx                                          (the board)
       ├─▶ components/ PracticePad · ProblemCard · PracticeCard
       └─▶ components/HomeworkFlight.tsx ◄── lib/homework.ts ◄342
                                              stemWords: "$…$" is one word
                                              wordDiff(from, to) → runs
                                              (glueRuns / glueStem removed)

 components/DiagnosticStem.tsx ── MathProse (unchanged) reads data/diagnostic.ts ◄342 stems
```
