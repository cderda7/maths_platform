import type { SimilarProblem } from "./homework";
import { tag } from "./types";

/**
 * Problem Set 5's similar problems for homework (ticket 293): one for each problem Sam ever got wrong on the set (Q4, Q6 and
 * Q9, his handed-in record in `data/pset5/classmates.ts`), in the same form as Problem Set 6's (`SIMILAR_PROBLEMS` in
 * `data/homework.ts`): the question in its original's exact TeX shape with only the numbers changed, digit for digit, the
 * original's stem, the original's skills on every step, and a named type. Checked in `lib/homeworkList.test.ts` with
 * `lib/texEval.ts`; none repeats a problem of any set, Problem Set 6's similar problems or Homework 3's ten.
 *
 * Kept apart from the story (`data/story.ts`) and from the set's own fixture: these belong to the homework, not to the set.
 * Ticket 294 adds Problem Sets 3 and 4's beside them.
 */
export const PS5_SIMILAR_PROBLEMS: SimilarProblem[] = [
  {
    problemId: "ps5-q4",
    stem: "Find the x-intercepts of the graph of",
    tex: "y = 2x^2 - 11x - 6",
    type: "x-intercepts of a non-monic quadratic by factorising",
    solution: [
      { tex: "ac = -12,\\quad -12 + 1 = -11", label: "Found the split", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "2x^2 - 12x + x - 6 = 0", label: "Split the middle term", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "2x(x - 6) + (x - 6) = 0", label: "Grouped", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "(2x + 1)(x - 6) = 0", label: "Factorised", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "x = -\\tfrac{1}{2} \\;\\text{or}\\; x = 6", label: "x-intercepts", tags: [tag("functions.zeros.nfl"), tag("functions.zeros.zero-finding"), tag("algebra.number.fractions")] },
    ],
  },
  {
    problemId: "ps5-q6",
    stem: "Complete the square to write the rule in turning-point form, and state the turning point.",
    tex: "y = x^2 - 6x + 11",
    type: "completing the square for the turning point",
    solution: [
      { tex: "y = (x^2 - 6x + 9) - 9 + 11", label: "Added and took away 9", tags: [tag("algebra.expand-factor.binomial"), tag("algebra.equations.quadratic")] },
      { tex: "y = (x - 3)^2 + 2", label: "Turning-point form", tags: [tag("algebra.expand-factor.binomial")] },
      { tex: "\\text{turning point } (3, 2)", label: "Turning point", tags: [tag("graphing.quadratics.features")] },
    ],
  },
  {
    problemId: "ps5-q9",
    stem: "Before sketching the graph of the following, find its shape, its intercepts and its turning point.",
    tex: "y = -x^2 + 6x + 7",
    type: "a parabola's shape, intercepts and turning point",
    solution: [
      { tex: "a = -1 < 0 \\Rightarrow \\text{concave down}", label: "Shape", tags: [tag("graphing.quadratics.sketch")] },
      { tex: "y\\text{-intercept } (0, 7)", label: "y-intercept", tags: [tag("graphing.quadratics.features")] },
      { tex: "-(x^2 - 6x - 7) = -(x - 7)(x + 1) = 0", label: "Took out −1, factorised", tags: [tag("algebra.expand-factor.expand"), tag("algebra.expand-factor.monic")] },
      { tex: "x = 7 \\;\\text{or}\\; x = -1", label: "x-intercepts", tags: [tag("functions.zeros.nfl"), tag("functions.zeros.zero-finding")] },
      { tex: "x = 3,\\; y = -9 + 18 + 7 = 16", label: "Height on the axis", tags: [tag("graphing.quadratics.features"), tag("functions.notation.evaluate")] },
      { tex: "\\text{maximum turning point } (3, 16)", label: "Turning point", tags: [tag("graphing.quadratics.features"), tag("graphing.quadratics.sketch")] },
    ],
  },
];
