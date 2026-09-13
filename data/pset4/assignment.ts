import { tag, type Assignment, type Pathway, type Problem } from "../types";

/**
 * Problem Set 4 — Non-monic factorising and completing the square (ticket 214): due Fri 4 Sep, finished
 * and reviewed. Ten hand-checked problems: non-monic factorising by the split and grouping (Q1, Q2),
 * the null factor law on a product already factorised and on one the student factorises (Q3, Q4),
 * making one side zero before factorising (Q5), completing the square with a whole and with a
 * fractional half of b (Q6, Q7), then with a leading coefficient and a turning point (Q8), a minimum
 * value (Q9), and a worded area problem that needs a non-monic factorisation and a sentence (Q10).
 *
 * The set's New skills are the binomial identity (a perfect square, (x + b/2)², written back and
 * forth) and the null factor law; on this set they count under New skills, not Algebra and Functions.
 * It is the first set to assess Functions and Graphing (the class story sheet, `data/story.ts`).
 *
 * Every model step is tagged with real leaves; a completed square's perfect-square line also carries
 * monic factorising (x² − 4x + 4 = (x − 2)², as on Problem Set 3's Q6) and the turning-point form
 * carries graph features. Ids are `ps4-q1` … `ps4-q10` so no table keyed by problem id collides with
 * another set's. Teacher-side only: nothing here reaches a student screen or a hint box.
 */
export const PS4_PROBLEMS: Problem[] = [
  {
    id: "ps4-q1",
    label: "Q1",
    difficulty: "simple familiar",
    stem: "Factorise",
    tex: "2x^2 + 3x - 2",
    solution: [
      { tex: "ac = -4,\\quad 4 + (-1) = 3", label: "Found the split", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "2x^2 + 4x - x - 2", label: "Split the middle term", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "2x(x + 2) - 1(x + 2)", label: "Grouped", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "(2x - 1)(x + 2)", label: "Factorised", tags: [tag("algebra.expand-factor.nonmonic")] },
    ],
  },
  {
    id: "ps4-q2",
    label: "Q2",
    difficulty: "simple familiar",
    stem: "Factorise",
    tex: "3x^2 + x - 10",
    solution: [
      { tex: "ac = -30,\\quad 6 + (-5) = 1", label: "Found the split", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "3x^2 + 6x - 5x - 10", label: "Split the middle term", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "3x(x + 2) - 5(x + 2)", label: "Grouped", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "(3x - 5)(x + 2)", label: "Factorised", tags: [tag("algebra.expand-factor.nonmonic")] },
    ],
  },
  {
    id: "ps4-q3",
    label: "Q3",
    difficulty: "simple familiar",
    stem: "Solve",
    tex: "(x - 4)(2x + 1) = 0",
    solution: [
      { tex: "x - 4 = 0 \\;\\text{or}\\; 2x + 1 = 0", label: "Each factor zero", tags: [tag("functions.zeros.nfl"), tag("functions.zeros.zero-finding")] },
      { tex: "x = 4 \\;\\text{or}\\; 2x = -1", label: "Solved the first, rearranged the second", tags: [tag("algebra.equations.linear"), tag("functions.zeros.zero-finding")] },
      { tex: "x = 4 \\;\\text{or}\\; x = -\\tfrac{1}{2}", label: "Solutions", tags: [tag("functions.zeros.zero-finding"), tag("algebra.number.fractions")] },
    ],
  },
  {
    id: "ps4-q4",
    label: "Q4",
    difficulty: "simple unfamiliar",
    stem: "Solve",
    tex: "2x^2 - 7x + 3 = 0",
    solution: [
      { tex: "ac = 6,\\quad -6 + (-1) = -7", label: "Found the split", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "2x^2 - 6x - x + 3 = 0", label: "Split the middle term", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "2x(x - 3) - 1(x - 3) = 0", label: "Grouped", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "(2x - 1)(x - 3) = 0", label: "Factorised", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "2x - 1 = 0 \\;\\text{or}\\; x - 3 = 0", label: "Each factor zero", tags: [tag("functions.zeros.nfl"), tag("functions.zeros.zero-finding")] },
      { tex: "x = \\tfrac{1}{2} \\;\\text{or}\\; x = 3", label: "Solutions", tags: [tag("functions.zeros.zero-finding"), tag("algebra.number.fractions")] },
    ],
  },
  {
    id: "ps4-q5",
    label: "Q5",
    difficulty: "simple unfamiliar",
    stem: "Solve",
    tex: "x^2 - 3x = 10",
    solution: [
      { tex: "x^2 - 3x - 10 = 0", label: "Made one side zero", tags: [tag("algebra.equations.quadratic"), tag("functions.zeros.zero-finding")] },
      { tex: "(x - 5)(x + 2) = 0", label: "Factorised", tags: [tag("algebra.expand-factor.monic")] },
      { tex: "x - 5 = 0 \\;\\text{or}\\; x + 2 = 0", label: "Each factor zero", tags: [tag("functions.zeros.nfl"), tag("functions.zeros.zero-finding")] },
      { tex: "x = 5 \\;\\text{or}\\; x = -2", label: "Solutions", tags: [tag("functions.zeros.zero-finding")] },
    ],
  },
  {
    id: "ps4-q6",
    label: "Q6",
    difficulty: "simple familiar",
    stem: "Complete the square.",
    tex: "x^2 + 6x + 2",
    solution: [
      { tex: "x^2 + 6x + 9 - 9 + 2", label: "Added and took away 9", tags: [tag("algebra.expand-factor.binomial")] },
      { tex: "(x + 3)^2 - 9 + 2", label: "Wrote the perfect square", tags: [tag("algebra.expand-factor.binomial"), tag("algebra.expand-factor.monic")] },
      { tex: "(x + 3)^2 - 7", label: "Collected the constants", tags: [tag("algebra.expand-factor.binomial")] },
    ],
  },
  {
    id: "ps4-q7",
    label: "Q7",
    difficulty: "complex familiar",
    stem: "Complete the square.",
    tex: "x^2 - 5x + 1",
    solution: [
      { tex: "x^2 - 5x + \\tfrac{25}{4} - \\tfrac{25}{4} + 1", label: "Added and took away (5/2)²", tags: [tag("algebra.expand-factor.binomial"), tag("algebra.number.fractions")] },
      { tex: "\\left(x - \\tfrac{5}{2}\\right)^2 - \\tfrac{25}{4} + 1", label: "Wrote the perfect square", tags: [tag("algebra.expand-factor.binomial"), tag("algebra.expand-factor.monic"), tag("algebra.number.fractions")] },
      { tex: "\\left(x - \\tfrac{5}{2}\\right)^2 - \\tfrac{21}{4}", label: "Collected the constants", tags: [tag("algebra.expand-factor.binomial"), tag("algebra.number.fractions")] },
    ],
  },
  {
    id: "ps4-q8",
    label: "Q8",
    difficulty: "complex familiar",
    stem: "Write in the form a(x + h)² + k, and state the turning point.",
    tex: "2x^2 + 8x - 3",
    solution: [
      { tex: "2(x^2 + 4x) - 3", label: "Took the 2 out of the x terms", tags: [tag("algebra.expand-factor.expand")] },
      { tex: "2(x^2 + 4x + 4) - 8 - 3", label: "Added 4 inside, took away 2 × 4", tags: [tag("algebra.expand-factor.binomial"), tag("algebra.expand-factor.expand")] },
      { tex: "2(x + 2)^2 - 11", label: "Turning-point form", tags: [tag("algebra.expand-factor.binomial"), tag("graphing.quadratics.features")] },
      { tex: "h = -2,\\; k = -11", label: "Read h and k", tags: [tag("graphing.quadratics.features")] },
      { tex: "\\text{turning point } (-2, -11)", label: "Turning point", tags: [tag("graphing.quadratics.features")] },
    ],
  },
  {
    id: "ps4-q9",
    label: "Q9",
    difficulty: "complex unfamiliar",
    stem: "By completing the square, find the minimum value of",
    tex: "y = x^2 - 4x + 7",
    solution: [
      { tex: "y = (x^2 - 4x + 4) - 4 + 7", label: "Added and took away 4", tags: [tag("algebra.expand-factor.binomial")] },
      { tex: "y = (x - 2)^2 + 3", label: "Turning-point form", tags: [tag("algebra.expand-factor.binomial"), tag("algebra.expand-factor.monic"), tag("graphing.quadratics.features")] },
      { tex: "\\text{turning point } (2, 3)", label: "Turning point", tags: [tag("graphing.quadratics.features")] },
      { tex: "\\text{minimum value } 3 \\text{ when } x = 2", label: "Minimum value", tags: [tag("graphing.quadratics.features")] },
    ],
  },
  {
    id: "ps4-q10",
    label: "Q10",
    difficulty: "complex unfamiliar",
    stem: "A rectangle's length is 3 cm more than twice its width, and its area is 35 cm². Find its width.",
    tex: "l = 2w + 3,\\quad lw = 35",
    answerAs: "sentence",
    solution: [
      { tex: "\\text{width } w,\\; \\text{length } 2w + 3", label: "Named the lengths", tags: [tag("reasoning.interpret.worded")] },
      { tex: "w(2w + 3) = 35", label: "Area as an equation", tags: [tag("reasoning.interpret.worded"), tag("algebra.equations.quadratic")] },
      { tex: "2w^2 + 3w - 35 = 0", label: "Expanded, one side zero", tags: [tag("algebra.equations.quadratic"), tag("algebra.expand-factor.expand")] },
      { tex: "ac = -70,\\quad 10 + (-7) = 3", label: "Found the split", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "(2w - 7)(w + 5) = 0", label: "Factorised", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "w = \\tfrac{7}{2} \\;\\text{or}\\; w = -5", label: "Null factor law", tags: [tag("functions.zeros.nfl"), tag("functions.zeros.zero-finding")] },
      { tex: "w > 0 \\Rightarrow w = \\tfrac{7}{2}", label: "A width is positive", tags: [tag("reasoning.justify.conclusions")] },
      { tex: "\\text{length } 2(3.5) + 3 = 10,\\; 3.5 \\times 10 = 35", label: "Checked the area", tags: [tag("reasoning.justify.conclusions")] },
      { tex: "\\text{The width is 3.5 cm}", label: "In context", tags: [tag("reasoning.justify.conclusions")] },
    ],
  },
];

export const PS4_ASSIGNMENT: Assignment = {
  id: "pset-4",
  title: "PROBLEM SET 4 — NON-MONIC FACTORISING AND COMPLETING THE SQUARE",
  className: "11 Methods",
  classCode: "11MAM2",
  teacher: "Ms Okafor",
  due: "Fri 4 Sep",
  unit: { number: 1, topic: "Topic 1", title: "Surds and quadratic functions" },
  goal: "Two new tools today. When there is a number in front of x², find the split and group: don't guess a pair, and expand your brackets back before you move on. Once a quadratic is factorised and equal to zero, the null factor law gives the solutions, and only then. Completing the square is the binomial identity run backwards: whatever you add to make the square, take away again. By the end you should be able to find a turning point and a minimum value without a graph.",
  problems: PS4_PROBLEMS,
  newSkills: ["algebra.expand-factor.binomial", "functions.zeros.nfl"],
};

/** Problem Set 4 ran individual working, then individual review, then group review; every stage is over. */
export const PS4_PATHWAY: Pathway = ["individual", "group"];
