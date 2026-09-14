# 240: Each problem's live diagnostic is a stack of step questions on a similar problem, wrong answers taken from the class's real slips

## Files touched

| File | What it does |
| --- | --- |
| `data/diagnostic.ts` | `PROBLEM_DIAGNOSTICS`: per Problem Set 6 problem, a similar problem and its steps in solution order (33 steps). A `DiagnosticStep` is a `Diagnostic` plus a teacher-side `name`; a distractor may carry `slip`, the wrong line on the original it mirrors; `picks` names only common-slip picks by students who have not reached the problem. `FALLBACK_STEP` for a problem with no steps (a set made through Create). `DIAGNOSTIC_MAP` by id. The one-question `DIAGNOSTICS` list is gone. |
| `lib/diagnostic.ts` | `stepsFor(problemId)` (was `diagnosticFor`), `slippedAt(step, rows)` (the "n slipped here" count from the mistake view's rows), `classmatePick` reads the classmate's own work (`attempts`) against each option's `slip`, then `picks`, else correct. `runFor(c, questionId)`. `customQuestion`, `writtenPick`, `pushBelongsTo` removed. |
| `lib/stem.ts` | `stemParts(stem, tex)`: a stem with inline `$…$` maths plus its expression, split into words and maths, the "?" and trailing punctuation kept with the maths. |
| `components/DiagnosticStem.tsx` | Renders `stemParts`, each maths piece nowrap with its punctuation. Used by the flyout, `DiagnosticResults` (class card, flyout result, board) and the iPad modal. |
| `lib/texEval.ts` | A small TeX evaluator for the tests (numbers, x, k, implicit products, powers, `\frac`, `\sqrt`, `\pm`): expands factorisations, checks pairs, substitutes roots. |
| `app/teacher/DiagnosticPush.tsx` | The flyout: no tabs; every step stacked and expanded, headed `n · STEP NAME` and `n slipped here` (red when above 0), its own send to class, a sent step's grid becoming its live result; an unhoverable 64 px spacer under the card so the page scrolls a tall flyout clear of the corner controls. Takes `rows` instead of `example`. |
| `app/teacher/TeacherMistakes.tsx` | Passes each problem's rows to `DiagnosticPush`. |
| `app/student/screens/DiagnosticModal.tsx` | Stem through `DiagnosticStem`; options in a `FitText` so a long option scales inside its button. |
| `components/DiagnosticResults.tsx`, `app/teacher/DiagnosticCard.tsx`, `lib/board.ts`, `app/student/StudentApp.tsx`, `lib/classroom.ts` | The run carries only `questionId` (no written question travels with a push). |
| `lib/diagnostic.test.ts`, `lib/stem.test.ts` | Shape, similar-not-same, labels, given-that stems, the maths of every option, slip ties against `mistakesByProblem`, per-step slip counts, the runs and board. |

## How it connects

```
 data/classmates.ts  (attempts: the wrong lines)          lib/session.ts (Sam's live hand-in)
        │                                                        │
        ▼                                                        ▼
 lib/mistakes.ts  mistakesByProblem ──► rows per problem ──► app/teacher/TeacherMistakes.tsx
                                                                 │ rows, problemId
 data/diagnostic.ts ◄240                                         ▼
   PROBLEM_DIAGNOSTICS                              app/teacher/DiagnosticPush.tsx ◄240
   ┌ q1 · similar x²−7x+12 ─────────────┐             ┌─ flyout (no scroll box) ─────────┐
   │ step "Find the pair"   options a–d  │  stepsFor   │ 1 · FIND THE PAIR   4 slipped here│◄ slippedAt(step, rows)
   │   b: slip "(x − 1)(x − 6) = 0" ─────┼──────────►  │   stem · 2×2 grid · send to class │
   │ step "Factorise" …                  │             │ 2 · FACTORISE       4 slipped here│
   │ step "Find the zeros" …             │             │ 3 · FIND THE ZEROS  0 slipped here│
   └─────────────────────────────────────┘             └───────────────┬──────────────────┘
        │ DIAGNOSTIC_MAP                                             │ diagnostic/push { questionId }
        ▼                                                            ▼
 lib/diagnostic.ts ◄240                                   lib/classroom.ts  DiagnosticRun { questionId, pushedAt, answer?, board? }
   questionFor(id) · classmatePick(step, i):                         │
     own wrong line == option.slip ► that option                     ├──► app/teacher/DiagnosticCard.tsx  (class card)
     else picks (not reached)      ► common slip                     ├──► lib/board.ts ► app/board/SmartBoard.tsx
     else                          ► correct                         └──► app/student/StudentApp.tsx ► screens/DiagnosticModal.tsx
   tally(run, now) ─────────────────────────────────────────────────────► DiagnosticResults (counts)
        │
 lib/stem.ts stemParts ◄240 ──► components/DiagnosticStem.tsx ◄240 ──► flyout · DiagnosticResults · DiagnosticModal
 lib/texEval.ts ◄240 ──► lib/diagnostic.test.ts (every option's maths checked)
```

Tickets 241 (a paced chain of steps) and 242 (who picked each option, repeated-slip marks) build on the step ids,
the step `name`, and each distractor's `slip` (a student repeated their slip when their own wrong line equals the
option's `slip`).
