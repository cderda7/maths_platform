import { tag, type Assignment, type Problem, type UnitRef } from "./types";

/**
 * The demo assignment: ten problems on the roots of a quadratic and what its graph shows, hand-
 * checked, every step tagged with taxonomy leaves. The set is shaped so a scripted run can slip
 * on monic factorising (Q1) then non-monic (Q2), which trips the expand-and-factor group's
 * practice prompt; misuse the null factor law (Q3); finish Q4–Q6 and Q8 correctly; slip on
 * fractions (Q7); skip a step in Q9 (communication); and misread a negative discriminant in Q10
 * (reasoning). Six of the seven categories light up; Stats does not appear.
 */
export const PROBLEMS: Problem[] = [
  {
    id: "q1",
    label: "Q1",
    difficulty: "simple familiar",
    stem: "Solve for x.",
    tex: "x^2 - 5x + 6 = 0",
    solution: [
      { tex: "x^2 - 5x + 6 = 0", label: "Standard form", tags: [tag("algebra.equations.quadratic")] },
      { tex: "(x-2)(x-3) = 0", label: "Factorised", tags: [tag("algebra.expand-factor.monic")] },
      { tex: "x = 2 \\;\\text{or}\\; x = 3", label: "Null factor law", tags: [tag("unit.u1.nfl"), tag("algebra.equations.quadratic")] },
    ],
  },
  {
    id: "q2",
    label: "Q2",
    difficulty: "simple familiar",
    stem: "Solve for x.",
    tex: "2x^2 + 7x - 4 = 0",
    solution: [
      { tex: "2x^2 + 7x - 4 = 0", label: "Standard form", tags: [tag("algebra.equations.quadratic")] },
      { tex: "ac = -8,\\quad 8 + (-1) = 7", label: "Found the split", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "2x^2 + 8x - x - 4 = 0", label: "Split the middle term", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "2x(x+4) - 1(x+4) = 0", label: "Grouped", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "(2x - 1)(x + 4) = 0", label: "Factorised", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "x = \\tfrac{1}{2} \\;\\text{or}\\; x = -4", label: "Null factor law", tags: [tag("unit.u1.nfl"), tag("algebra.number.fractions")] },
    ],
  },
  {
    id: "q3",
    label: "Q3",
    difficulty: "simple unfamiliar",
    stem: "Find all values of x for which the following holds.",
    tex: "(x - 3)(x + 2) = 6",
    solution: [
      { tex: "(x - 3)(x + 2) = 6", label: "Copied the equation", tags: [tag("algebra.equations.quadratic")] },
      { tex: "x^2 - x - 6 = 6", label: "Expanded first", tags: [tag("algebra.expand-factor.expand")] },
      { tex: "x^2 - x - 12 = 0", label: "Rearranged to standard form", tags: [tag("algebra.equations.linear")] },
      { tex: "(x - 4)(x + 3) = 0", label: "Factorised", tags: [tag("algebra.expand-factor.monic")] },
      { tex: "x = 4 \\;\\text{or}\\; x = -3", label: "Null factor law", tags: [tag("unit.u1.nfl"), tag("algebra.equations.quadratic")] },
    ],
  },
  {
    id: "q4",
    label: "Q4",
    difficulty: "complex familiar",
    stem: "Solve, giving exact values.",
    tex: "3x^2 - 5x - 1 = 0",
    solution: [
      { tex: "a = 3,\\; b = -5,\\; c = -1", label: "Identified a, b, c", tags: [tag("algebra.equations.quadratic")] },
      { tex: "b^2 - 4ac = 25 + 12 = 37", label: "Discriminant", tags: [tag("unit.u1.discriminant")] },
      { tex: "x = \\dfrac{5 \\pm \\sqrt{37}}{6}", label: "Quadratic formula", tags: [tag("algebra.equations.quadratic"), tag("algebra.number.fractions")] },
    ],
  },
  {
    id: "q5",
    label: "Q5",
    difficulty: "simple unfamiliar",
    stem: "Find the x-intercepts and the turning point of the graph of",
    tex: "y = x^2 - 4x - 5",
    solution: [
      { tex: "(x - 5)(x + 1) = 0", label: "Factorised", tags: [tag("algebra.expand-factor.monic")] },
      { tex: "x = 5 \\;\\text{or}\\; x = -1", label: "x-intercepts", tags: [tag("unit.u1.nfl"), tag("functions.zeros.zero-finding")] },
      { tex: "x = \\tfrac{5 + (-1)}{2} = 2", label: "Axis of symmetry", tags: [tag("graphing.quadratics.features"), tag("algebra.number.fractions")] },
      { tex: "y = 4 - 8 - 5 = -9", label: "Height on the axis", tags: [tag("graphing.quadratics.features")] },
      { tex: "(2, -9)", label: "Turning point", tags: [tag("graphing.quadratics.features"), tag("graphing.quadratics.sketch")] },
    ],
  },
  {
    id: "q6",
    label: "Q6",
    difficulty: "complex unfamiliar",
    stem: "For which value of k does the graph of the following touch the x-axis exactly once?",
    tex: "y = x^2 + 6x + k",
    solution: [
      { tex: "b^2 - 4ac = 36 - 4k", label: "Discriminant", tags: [tag("unit.u1.discriminant")] },
      { tex: "36 - 4k = 0", label: "One root: discriminant zero", tags: [tag("unit.u1.discriminant"), tag("functions.zeros.zero-finding")] },
      { tex: "k = 9", label: "Solved for k", tags: [tag("algebra.equations.linear")] },
    ],
  },
  {
    id: "q7",
    label: "Q7",
    difficulty: "complex familiar",
    stem: "Factorise fully.",
    tex: "\\tfrac{1}{3}x^2 + 2x + \\tfrac{8}{3}",
    solution: [
      { tex: "\\tfrac{1}{3}(x^2 + 6x + 8)", label: "Took out the third", tags: [tag("algebra.number.fractions"), tag("algebra.expand-factor.nonmonic")] },
      { tex: "2 \\times 4 = 8,\\quad 2 + 4 = 6", label: "Found the pair", tags: [tag("algebra.expand-factor.nonmonic"), tag("algebra.expand-factor.monic")] },
      { tex: "\\tfrac{1}{3}(x + 2)(x + 4)", label: "Factorised", tags: [tag("algebra.expand-factor.nonmonic"), tag("unit.u1.binomial")] },
    ],
  },
  {
    id: "q8",
    label: "Q8",
    difficulty: "simple familiar",
    stem: "The graph of the following is shown. Read off its x-intercepts and check them.",
    tex: "y = x^2 - 4x + 3",
    figure: "q8-parabola",
    solution: [
      { tex: "x = 1 \\;\\text{or}\\; x = 3", label: "Read from the graph", tags: [tag("graphing.quadratics.features"), tag("functions.zeros.zero-finding")] },
      { tex: "1 - 4 + 3 = 0 \\;\\checkmark", label: "Checked by substitution", tags: [tag("functions.notation.evaluate"), tag("functions.zeros.zero-finding")] },
    ],
  },
  {
    id: "q9",
    label: "Q9",
    difficulty: "complex unfamiliar",
    stem: "A ball's height after travelling x metres is given below. Where does it land, and what is its greatest height?",
    tex: "h = -x^2 + 6x",
    solution: [
      { tex: "-x(x - 6) = 0", label: "Height zero, factorised", tags: [tag("reasoning.interpret.worded"), tag("algebra.expand-factor.expand")] },
      { tex: "x = 0 \\;\\text{or}\\; x = 6", label: "Lands at x = 6", tags: [tag("unit.u1.nfl"), tag("functions.zeros.zero-finding")] },
      { tex: "x = 3", label: "Axis of symmetry", tags: [tag("graphing.quadratics.features"), tag("graphing.quadratics.sketch")] },
      { tex: "h = -9 + 18 = 9", label: "Greatest height 9 m", tags: [tag("graphing.quadratics.features")] },
    ],
  },
  {
    id: "q10",
    label: "Q10",
    difficulty: "complex unfamiliar",
    stem: "Show that the following has no real solutions, and say what that means for the graph of y = x² + 4x + 5.",
    tex: "x^2 + 4x + 5 = 0",
    solution: [
      { tex: "b^2 - 4ac = 16 - 20 = -4", label: "Discriminant", tags: [tag("unit.u1.discriminant")] },
      { tex: "\\Delta < 0 \\Rightarrow \\text{no real solutions}", label: "Justified", tags: [tag("reasoning.justify.formal")] },
      { tex: "\\text{The graph never meets the x-axis}", label: "In context", tags: [tag("reasoning.justify.conclusions"), tag("graphing.quadratics.sketch")] },
    ],
  },
];

export const PROBLEM_MAP = Object.fromEntries(PROBLEMS.map((p) => [p.id, p])) as Record<string, Problem>;

export const unitLabel = (u: UnitRef) => `Unit ${u.number} · ${u.topic} · ${u.title}`;

export const ASSIGNMENT: Assignment = {
  id: "set-3",
  title: "ROOTS OF A QUADRATIC — SET 3",
  className: "11 Methods B",
  teacher: "Ms Okafor",
  due: "Thu 10 Sep",
  unit: { number: 1, topic: "Topic 2", title: "Functions and graphs" },
  intro: "Ten problems on finding where a quadratic crosses the x-axis, and what its graph shows.",
  problems: PROBLEMS,
};

/** The one student the demo follows. */
export const DEMO_STUDENT = { id: "sam", name: "Sam Okonkwo", initials: "SO" };
