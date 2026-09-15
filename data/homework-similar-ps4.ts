import type { SimilarProblem } from "./homework";
import { tag } from "./types";

/**
 * Problem Set 4's similar problems for homework (ticket 294): one for each problem Sam ever got wrong on the set (Q1, Q2, Q7, Q8
 * and Q10, his handed-in record in `data/pset4/classmates.ts`). Problem Set 4 is Homework 2's, which Sam missed, so these are what
 * can carry into Homework 3 (`lib/homeworkList.ts`); every leftover has one, whether or not it survives the skill dedupe. Same
 * form as Problem Set 5's (`data/homework-similar-ps5.ts`): the original's exact TeX shape with only the numbers changed, the
 * original's stem (Q10's with its own numbers changed the same way, digit for digit), its skills step for step, and a named type.
 * Checked in `lib/homeworkList.test.ts`; none repeats a problem of any set, a similar problem, a diagnostic or Homework 3's ten.
 */
export const PS4_SIMILAR_PROBLEMS: SimilarProblem[] = [
  {
    problemId: "ps4-q1",
    stem: "Factorise",
    tex: "3x^2 + 5x - 2",
    type: "factorising a non-monic quadratic by the split",
    solution: [
      { tex: "ac = -6,\\quad 6 + (-1) = 5", label: "Found the split", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "3x^2 + 6x - x - 2", label: "Split the middle term", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "3x(x + 2) - 1(x + 2)", label: "Grouped", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "(3x - 1)(x + 2)", label: "Factorised", tags: [tag("algebra.expand-factor.nonmonic")] },
    ],
  },
  {
    problemId: "ps4-q2",
    stem: "Factorise",
    tex: "2x^2 + x - 15",
    type: "factorising a non-monic quadratic by the split",
    solution: [
      { tex: "ac = -30,\\quad 6 + (-5) = 1", label: "Found the split", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "2x^2 + 6x - 5x - 15", label: "Split the middle term", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "2x(x + 3) - 5(x + 3)", label: "Grouped", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "(2x - 5)(x + 3)", label: "Factorised", tags: [tag("algebra.expand-factor.nonmonic")] },
    ],
  },
  {
    problemId: "ps4-q7",
    stem: "Complete the square.",
    tex: "x^2 - 3x + 4",
    type: "completing the square with a fractional half",
    solution: [
      { tex: "x^2 - 3x + \\tfrac{9}{4} - \\tfrac{9}{4} + 4", label: "Added and took away (3/2)²", tags: [tag("algebra.expand-factor.binomial"), tag("algebra.number.fractions")] },
      { tex: "\\left(x - \\tfrac{3}{2}\\right)^2 - \\tfrac{9}{4} + 4", label: "Wrote the perfect square", tags: [tag("algebra.expand-factor.binomial"), tag("algebra.expand-factor.monic"), tag("algebra.number.fractions")] },
      { tex: "\\left(x - \\tfrac{3}{2}\\right)^2 + \\tfrac{7}{4}", label: "Collected the constants", tags: [tag("algebra.expand-factor.binomial"), tag("algebra.number.fractions")] },
    ],
  },
  {
    problemId: "ps4-q8",
    stem: "Write in the form $a(x + h)^2 + k$, and state the turning point.",
    tex: "3x^2 + 6x - 2",
    type: "turning-point form with a number in front of x²",
    solution: [
      { tex: "3(x^2 + 2x) - 2", label: "Took the 3 out of the x terms", tags: [tag("algebra.expand-factor.expand")] },
      { tex: "3(x^2 + 2x + 1) - 3 - 2", label: "Added 1 inside, took away 3 × 1", tags: [tag("algebra.expand-factor.binomial"), tag("algebra.expand-factor.expand")] },
      { tex: "3(x + 1)^2 - 5", label: "Turning-point form", tags: [tag("algebra.expand-factor.binomial"), tag("graphing.quadratics.features")] },
      { tex: "h = -1,\\; k = -5", label: "Read h and k", tags: [tag("graphing.quadratics.features")] },
      { tex: "\\text{turning point } (-1, -5)", label: "Turning point", tags: [tag("graphing.quadratics.features")] },
    ],
  },
  {
    problemId: "ps4-q10",
    stem: "A rectangle's length $l$ cm and width $w$ cm satisfy the following. Find its width.",
    tex: "l = 2w + 1,\\quad lw = 36",
    type: "a rectangle's width from its area",
    solution: [
      { tex: "\\text{width } w,\\; \\text{length } 2w + 1", label: "Named the lengths", tags: [tag("reasoning.interpret.worded")] },
      { tex: "w(2w + 1) = 36", label: "Area as an equation", tags: [tag("reasoning.interpret.worded"), tag("algebra.equations.quadratic")] },
      { tex: "2w^2 + w - 36 = 0", label: "Expanded, one side zero", tags: [tag("algebra.equations.quadratic"), tag("algebra.expand-factor.expand")] },
      { tex: "ac = -72,\\quad 9 + (-8) = 1", label: "Found the split", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "(2w + 9)(w - 4) = 0", label: "Factorised", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "w = -\\tfrac{9}{2} \\;\\text{or}\\; w = 4", label: "Null factor law", tags: [tag("functions.zeros.nfl"), tag("functions.zeros.zero-finding")] },
      { tex: "w > 0 \\Rightarrow w = 4", label: "A width is positive", tags: [tag("reasoning.justify.conclusions")] },
      { tex: "\\text{length } 2(4) + 1 = 9,\\; 4 \\times 9 = 36", label: "Checked the area", tags: [tag("reasoning.justify.conclusions")] },
      { tex: "\\text{The width is 4 cm}", label: "In context", tags: [tag("reasoning.justify.conclusions")] },
    ],
  },
];
