# 240: Each problem's live diagnostic is a stack of step questions on a similar problem, wrong answers taken from the class's real slips

**What to build:** The Mistakes view's live-diagnostic flyout stops offering the problem itself. Beside each Set 6 problem it offers a vertical stack of step questions, all fully expanded, each asking one step of a *similar* problem (same type and difficulty, new numbers). Each wrong option is the analogue of a slip a student really made on the original. The "make your own" tab is removed. This ticket is the questions and their stack. Sending keeps today's one-question behaviour until 241.

**Blocked by:** 137, 194.

**Status:** todo

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-14), with a screenshot of Q1's flyout offering "Which of these is a factorisation of x² − 5x + 6?", the same expression as the problem: "currently, diagnostic question is exact same as og question. want to change to being a SIMILAR problem getting at the same misconceptions identified in the og problem". Their example was x² − 7x + 12 with (x − 4)(x − 3), (x + 4)(x + 3), (x − 6)(x − 2) and one more.

Worked through in a grilling session, then refined: "let's talk through how to do more atomic diagnostic … a question on 'which 2 numbers add to _ & multiply to _?' & 'given that −3 × −4 = 12 & −3 + −4 = −7, what is the factorized form of ___' & then 'given that (x−3)(x−4) is the factorized form of ___, what are the zeroes?' … we can just eliminate the whole answer thing. just offer the subskills for the teacher to understand WHERE & WHY students went wrong — if they want to understand full student working, they can look at their solution to the og problem."

All ten Set 6 diagnostics currently repeat their problem's expression (`data/diagnostic.ts` against `data/assignment.ts`).

## Agreed rules

1. **Similar, never the same.** One similar problem per original problem: same type, same difficulty, new numbers. Every step question for that problem uses it, including the conceptual ones (Q6, Q10).
2. **One question per step.** The steps are the model solution's lines in `data/assignment.ts` that involve thinking. Skip lines that only restate ("Standard form", "Copied the equation"). Add an unwritten thinking step where a class slip lives: Q1's model goes straight to "Factorised", so it gains "Find the pair". Problems have as many steps as they need.
3. **Each step is isolated.** A step's stem gives the correct result of every earlier step ("Given that −3 × −4 = 12 and −3 + −4 = −7, which is the factorised form of x² − 7x + 12?"). A wrong answer can then only come from that step.
4. **Wrong options mirror real slips.** Each distractor is the analogue, on the new numbers, of a wrong line a student actually wrote on the original at that step. An imperfect analogue is fine. For example, the user accepted "something that multiplies to −12 instead of 12" as the analogue of a sum-right, sign-wrong pair. When a step has fewer than three real slips, fill the rest with common slips for that step. Never attribute a slip to a student who did not make it.
5. **Labels stay general.** Each distractor keeps a slip label of five words or fewer ("signs flipped in the pair"), never a student's name.
6. **Classmate picks come from real work.** On a step, a classmate whose original work has that step's slip picks its analogue. A classmate who got that step right, or has not reached the problem, picks the correct option (a few common-slip picks among students who have not reached the problem are fine). Chloe (`done: 0`) answers like a student who has not reached the problem. Sam answers for real.

## The real slips (source for rule 4 and 6)

From `lib/mistakes.ts` over `data/classmates.ts` and `data/evaluation.ts`, end state. Re-check each against the code before authoring, because the existing `picks` are wrong in several places (Chloe picks on six problems with no work, Liam on Q5 and Q9 which he never reached, Mia on Q1 and Q7 where she did not slip that way).

| Problem | Slip (wrong line on the original) | Students |
|---|---|---|
| Q1 | `(x + 2)(x + 3)`: signs flipped in the pair | Ethan, Sam |
| Q1 | `(x − 1)(x − 6)`: product right, sum wrong | Liam, Oliver |
| Q2 | `(2x + 4)(x − 1)`: pair not expanded back | Jordan, Liam, Mia, Oliver, Sofia, Sam |
| Q2 | `x = −½ or x = −4`: sign lost solving a factor | Finn |
| Q3 | `x − 3 = 6 or x + 2 = 6`: null factor law without zero | Tomas, Zara, Liam, Noah, Oliver, Sam |
| Q3 | `x² + x − 6 = 6`: sign slip expanding | Harper |
| Q4 | `(5 ± √37)/3`: divided by a, not 2a | Tomas, Ethan, Finn, Sofia |
| Q4 | `(−5 ± √37)/6`: −b copied as −5 | Isla |
| Q5 | `x = −5 or x = 1`: signs of the pair flipped | Tomas |
| Q5 | `(2, −5)`: height taken from the wrong line | Harper, Ruby, Finn |
| Q6 | `36 − 4k > 0`: one root read as Δ > 0 | Amelia |
| Q7 | `x² + 6x + 8/3`: constant not scaled | Tomas, Aiden, Mia, Isla, Oliver, Sofia, Sam |
| Q7 | `x² + 6x + 8`: third lost | Amelia, Zara, Ethan, Finn |
| Q7 | `1 × 8 = 8, 1 + 8 = 9`: wrong pair | Jordan, Lucas, Ruby |
| Q8 | none (all three distractors per step are common slips) | none |
| Q9 | `h = 6`: axis given as height | Zara, Ruby, Ethan, Harper |
| Q9 | `−x(x + 6) = 0`: sign left in the bracket | Mia |
| Q10 | `crosses the x-axis twice`: negative read as two roots | Amelia, Isla |
| Q10 | `Δ < 0 ⇒ two real solutions`: negative read as two solutions | Lucas, Sam |

## Solution

- `data/diagnostic.ts`: replace the one-question-per-problem list with, per problem, a similar problem and an ordered list of steps. Each step is a `Diagnostic` (stem, tex, four options with slip labels, correct, picks) plus a short step name for the teacher ("Find the pair", "Factorise", "Find the zeros"). Step names are teacher-side only. Q1's steps on x² − 7x + 12:
  1. Which two numbers add to −7 and multiply to 12? The correct option is −3 and −4. Distractors: the analogue of Ethan's slip (3 and 4), the analogue of Liam's (−6 and −2: product right, sum wrong), and one common slip.
  2. Given that −3 × −4 = 12 and −3 + −4 = −7, which is the factorised form of x² − 7x + 12? The correct option is (x − 3)(x − 4). Distractors: (x + 3)(x + 4), (x − 6)(x − 2), and a pair multiplying to −12.
  3. Given that (x − 3)(x − 4) is the factorised form of x² − 7x + 12, what are the zeros? The correct option is x = 3 or x = 4. Distractors are common slips (for example, the signs of the factors read straight off, x = −3 or x = −4).

  Positions of the correct option vary across steps.
- `lib/diagnostic.ts`: `diagnosticFor(problemId)` becomes `stepsFor(problemId)`. `customQuestion`, `writtenPick` and the written-question branches go, with their tests. `classmatePick` reads the step's picks.
- `app/teacher/DiagnosticPush.tsx`: the flyout drops the example / make your own control and renders the step questions stacked vertically, every one fully expanded (question and option grid). Each is headed by its step name and how many students slipped at that step on the original ("2 slipped here", "0 slipped here"). The flyout grows down over blank space and the page scrolls with it, with no inner scroll box. It still closes when the pointer leaves. Until 241, each step has its own **send to class**, and a sent step's grid becomes its result as today.
- Class view card, board and student modal render whichever step was sent, unchanged.
- `FUTURE_FEATURES.md`: "make your own" diagnostic questions (removed 2026-09-14 in favour of step questions); step diagnostics for sets made through Create, whose problems have no class slips yet and still fall back to one fixed question.

## Acceptance

- [ ] Unit: no step's tex equals or contains its problem's expression; every problem has at least two steps; every step has four options with exactly one correct.
- [ ] Unit, maths: every factorised option expands to its stated quadratic (or visibly does not, for a distractor); every pair option's sum and product match or miss as its label says; every zeros / intercepts / formula option is checked numerically against the similar problem.
- [ ] Unit, slips: every classmate who picks a distractor has the matching slip on the original in `lib/mistakes.ts`, and every classmate with a slip at a step picks its analogue there. Chloe picks no distractor tied to a real slip.
- [ ] Unit: each step's "given that" stem states the correct result of the previous step.
- [ ] Click-through at 1280×800 and 1440×900 on a production build: every problem's flyout shows its steps stacked and expanded in solution order, with no make-your-own control. Slip counts equal the table above. No maths wider than its cell or split across lines. The flyout stays inside the viewport horizontally, grows down, and never resizes the problem card. Sending one step still works end to end on the card, the board and Sam's iPad.
- [ ] vitest, eslint, tsc, next build, check:laptop, sweep:hint-boxes
