import type { SimilarProblem } from "./homework";
import { tag } from "./types";

/**
 * Problem Set 3's similar problems for homework (ticket 294): one for each problem Sam ever got wrong on the set (Q8, his
 * handed-in record in `data/pset3/classmates.ts`). Problem Set 3 is Homework 2's, which Sam missed, so these are what can carry
 * into Homework 3 (`lib/homeworkList.ts`); every leftover has one, whether or not it survives the skill dedupe, so none is ever
 * silently left out. Same form as Problem Set 5's (`data/homework-similar-ps5.ts`): the original's exact TeX shape with only the
 * numbers changed, the original's stem, its skills step for step, and a named type. Checked in `lib/homeworkList.test.ts`.
 */
export const PS3_SIMILAR_PROBLEMS: SimilarProblem[] = [
  {
    problemId: "ps3-q8",
    stem: "Factorise, then expand your answer back to check it.",
    tex: "x^2 - 10x + 21",
    type: "factorising a monic quadratic and expanding back to check",
    solution: [
      { tex: "(-3) \\times (-7) = 21,\\; -3 + (-7) = -10", label: "Found the pair", tags: [tag("algebra.expand-factor.monic")] },
      { tex: "(x - 3)(x - 7)", label: "Factorised", tags: [tag("algebra.expand-factor.monic")] },
      { tex: "(x - 3)(x - 7) = x^2 - 10x + 21", label: "Expanded back to check", tags: [tag("algebra.expand-factor.expand")] },
    ],
  },
];
