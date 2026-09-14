import { tag, type FigureId, type SolutionStep } from "./types";

/**
 * A problem's similar problem for homework (ticket 256): the same type as the original, with different numbers or a
 * different set-up, so a student sees it is the problem type that goes into their homework, not the same problem.
 *
 * The question is written in the original's exact shape: only the numbers differ, digit for digit (every digit the
 * same count, every sign and every symbol the same), so KaTeX sets both at the same width and the homework screen can
 * change the original into this one number by number while the rest of the expression stands still. The stem may
 * differ in any words (the set-up). The solution's steps carry the original's skills. All of it is checked in
 * `lib/homework.test.ts` with `lib/texEval.ts`; none of it repeats a live diagnostic's similar problem (ticket 240).
 */
export interface SimilarProblem {
  problemId: string;
  stem: string;
  tex: string;
  figure?: FigureId;
  /** What stays the same, named for the student under the changed question. */
  type: string;
  solution: SolutionStep[];
}

export const SIMILAR_PROBLEMS: SimilarProblem[] = [
  {
    problemId: "q1",
    stem: "Solve for x.",
    tex: "x^2 - 8x + 7 = 0",
    type: "solving a quadratic by factorising",
    solution: [
      { tex: "x^2 - 8x + 7 = 0", label: "Standard form", tags: [tag("algebra.equations.quadratic")] },
      { tex: "(x-1)(x-7) = 0", label: "Factorised", tags: [tag("algebra.expand-factor.monic")] },
      { tex: "x = 1 \\;\\text{or}\\; x = 7", label: "Null factor law", tags: [tag("functions.zeros.nfl"), tag("algebra.equations.quadratic")] },
    ],
  },
  {
    problemId: "q2",
    stem: "Solve for x.",
    tex: "2x^2 + 3x - 9 = 0",
    type: "solving a non-monic quadratic by factorising",
    solution: [
      { tex: "2x^2 + 3x - 9 = 0", label: "Standard form", tags: [tag("algebra.equations.quadratic")] },
      { tex: "ac = -18,\\quad 6 + (-3) = 3", label: "Found the split", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "2x^2 + 6x - 3x - 9 = 0", label: "Split the middle term", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "2x(x+3) - 3(x+3) = 0", label: "Grouped", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "(2x - 3)(x + 3) = 0", label: "Factorised", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "x = \\tfrac{3}{2} \\;\\text{or}\\; x = -3", label: "Null factor law", tags: [tag("functions.zeros.nfl"), tag("algebra.number.fractions")] },
    ],
  },
  {
    problemId: "q3",
    stem: "Find all values of x for which the following holds.",
    tex: "(x - 4)(x + 1) = 6",
    type: "expanding first, then solving by factorising",
    solution: [
      { tex: "(x - 4)(x + 1) = 6", label: "Copied the equation", tags: [tag("algebra.equations.quadratic")] },
      { tex: "x^2 - 3x - 4 = 6", label: "Expanded first", tags: [tag("algebra.expand-factor.expand")] },
      { tex: "x^2 - 3x - 10 = 0", label: "Rearranged to standard form", tags: [tag("algebra.equations.linear")] },
      { tex: "(x - 5)(x + 2) = 0", label: "Factorised", tags: [tag("algebra.expand-factor.monic")] },
      { tex: "x = 5 \\;\\text{or}\\; x = -2", label: "Null factor law", tags: [tag("functions.zeros.nfl"), tag("algebra.equations.quadratic")] },
    ],
  },
  {
    problemId: "q4",
    stem: "Solve, giving exact values.",
    tex: "2x^2 - 3x - 4 = 0",
    type: "exact solutions with the quadratic formula",
    solution: [
      { tex: "a = 2,\\; b = -3,\\; c = -4", label: "Identified a, b, c", tags: [tag("algebra.equations.quadratic")] },
      { tex: "b^2 - 4ac = 9 + 32 = 41", label: "Discriminant", tags: [tag("algebra.equations.discriminant")] },
      { tex: "x = \\dfrac{3 \\pm \\sqrt{41}}{4}", label: "Quadratic formula", tags: [tag("algebra.equations.quadratic"), tag("algebra.number.fractions")] },
    ],
  },
  {
    problemId: "q5",
    stem: "Find the x-intercepts and the turning point of the graph of",
    tex: "y = x^2 - 2x - 8",
    type: "a parabola's x-intercepts and turning point",
    solution: [
      { tex: "(x - 4)(x + 2) = 0", label: "Factorised", tags: [tag("algebra.expand-factor.monic")] },
      { tex: "x = 4 \\;\\text{or}\\; x = -2", label: "x-intercepts", tags: [tag("functions.zeros.nfl"), tag("functions.zeros.zero-finding")] },
      { tex: "x = \\tfrac{4 + (-2)}{2} = 1", label: "Axis of symmetry", tags: [tag("graphing.quadratics.features"), tag("algebra.number.fractions")] },
      { tex: "y = 1 - 2 - 8 = -9", label: "Height on the axis", tags: [tag("graphing.quadratics.features")] },
      { tex: "(1, -9)", label: "Turning point", tags: [tag("graphing.quadratics.features"), tag("graphing.quadratics.sketch")] },
    ],
  },
  {
    problemId: "q6",
    stem: "For which value of k does the graph of the following touch the x-axis exactly once?",
    tex: "y = x^2 + 4x + k",
    type: "the discriminant for a graph that touches once",
    solution: [
      { tex: "b^2 - 4ac = 16 - 4k", label: "Discriminant", tags: [tag("algebra.equations.discriminant")] },
      { tex: "16 - 4k = 0", label: "One root: discriminant zero", tags: [tag("algebra.equations.discriminant"), tag("functions.zeros.zero-finding")] },
      { tex: "k = 4", label: "Solved for k", tags: [tag("algebra.equations.linear")] },
    ],
  },
  {
    problemId: "q7",
    stem: "Factorise fully.",
    tex: "\\tfrac{1}{2}x^2 + 2x + \\tfrac{3}{2}",
    type: "taking out a fraction, then factorising",
    solution: [
      { tex: "\\tfrac{1}{2}(x^2 + 4x + 3)", label: "Took out the half", tags: [tag("algebra.number.fractions"), tag("algebra.expand-factor.nonmonic")] },
      { tex: "1 \\times 3 = 3,\\quad 1 + 3 = 4", label: "Found the pair", tags: [tag("algebra.expand-factor.nonmonic"), tag("algebra.expand-factor.monic")] },
      { tex: "\\tfrac{1}{2}(x + 1)(x + 3)", label: "Factorised", tags: [tag("algebra.expand-factor.nonmonic"), tag("algebra.expand-factor.binomial")] },
    ],
  },
  {
    problemId: "q8",
    stem: "The graph of the following is shown. Read off its x-intercepts and check them.",
    tex: "y = x^2 - 6x + 5",
    figure: "q8-similar-parabola",
    type: "reading x-intercepts off a graph and checking them",
    solution: [
      { tex: "x = 1 \\;\\text{or}\\; x = 5", label: "Read from the graph", tags: [tag("graphing.quadratics.features"), tag("functions.zeros.zero-finding")] },
      { tex: "1 - 6 + 5 = 0 \\;\\checkmark", label: "Checked by substitution", tags: [tag("functions.notation.evaluate"), tag("functions.zeros.zero-finding")] },
    ],
  },
  {
    problemId: "q9",
    stem: "A stone's height after travelling x metres is given below. Where does it land, and what is its greatest height?",
    tex: "h = -x^2 + 4x",
    type: "where a path lands and its greatest height",
    solution: [
      { tex: "-x(x - 4) = 0", label: "Height zero, factorised", tags: [tag("reasoning.interpret.worded"), tag("algebra.expand-factor.expand")] },
      { tex: "x = 0 \\;\\text{or}\\; x = 4", label: "Lands at x = 4", tags: [tag("functions.zeros.nfl"), tag("functions.zeros.zero-finding")] },
      { tex: "x = 2", label: "Axis of symmetry", tags: [tag("graphing.quadratics.features"), tag("graphing.quadratics.sketch")] },
      { tex: "h = -4 + 8 = 4", label: "Greatest height 4 m", tags: [tag("graphing.quadratics.features")] },
    ],
  },
  {
    problemId: "q10",
    stem: "Show that the following has no real solutions, and say what that means for the graph of y = x² + 3x + 4.",
    tex: "x^2 + 3x + 4 = 0",
    type: "showing no real solutions with the discriminant",
    solution: [
      { tex: "b^2 - 4ac = 9 - 16 = -7", label: "Discriminant", tags: [tag("algebra.equations.discriminant")] },
      { tex: "\\Delta < 0 \\Rightarrow \\text{no real solutions}", label: "Justified", tags: [tag("reasoning.justify.formal")] },
      { tex: "\\text{The graph never meets the x-axis}", label: "In context", tags: [tag("reasoning.justify.conclusions"), tag("graphing.quadratics.sketch")] },
    ],
  },
];

export const SIMILAR_MAP = Object.fromEntries(SIMILAR_PROBLEMS.map((s) => [s.problemId, s])) as Record<string, SimilarProblem>;
