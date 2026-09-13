import { tag, type Assignment, type Pathway, type Problem } from "../types";

/**
 * Problem Set 3 — Expanding and factorising (ticket 213): due Tue 1 Sep, finished and reviewed. Ten
 * problems both ways round: distributive expansion, the perfect square and the difference of two squares
 * as identities (expanding, then recognising them to factorise), monic factorising by the pair, a common
 * factor first, one simple non-monic, expanding back to check, and a short "show that" built from the
 * identities. Hand-checked; the outline is the class story sheet's (`data/story.ts`).
 *
 * Tagging: a line that applies (a ± b)² or (a + b)(a − b) is the binomial identity (the set's New skill);
 * the line that simplifies what it produced is expansion. Ids are `ps3-q1` … `ps3-q10` (labels Q1 … Q10).
 * Teacher-side only: nothing here reaches a student screen or a hint box.
 */
export const PS3_PROBLEMS: Problem[] = [
  {
    id: "ps3-q1",
    label: "Q1",
    difficulty: "simple familiar",
    stem: "Expand and simplify.",
    tex: "(x + 4)(x - 7)",
    solution: [
      { tex: "x^2 - 7x + 4x - 28", label: "Every term by every term", tags: [tag("algebra.expand-factor.expand")] },
      { tex: "x^2 - 3x - 28", label: "Collected like terms", tags: [tag("algebra.expand-factor.expand")] },
    ],
  },
  {
    id: "ps3-q2",
    label: "Q2",
    difficulty: "simple familiar",
    stem: "Expand and simplify.",
    tex: "(2x - 3)^2",
    solution: [
      { tex: "(2x)^2 - 2(2x)(3) + 3^2", label: "Used (a − b)² = a² − 2ab + b²", tags: [tag("algebra.expand-factor.binomial")] },
      { tex: "4x^2 - 12x + 9", label: "Simplified", tags: [tag("algebra.expand-factor.expand")] },
    ],
  },
  {
    id: "ps3-q3",
    label: "Q3",
    difficulty: "simple familiar",
    stem: "Expand and simplify.",
    tex: "(3x + 5)(3x - 5)",
    solution: [
      { tex: "(3x)^2 - 5^2", label: "Used (a + b)(a − b) = a² − b²", tags: [tag("algebra.expand-factor.binomial")] },
      { tex: "9x^2 - 25", label: "Simplified", tags: [tag("algebra.expand-factor.expand")] },
    ],
  },
  {
    id: "ps3-q4",
    label: "Q4",
    difficulty: "simple familiar",
    stem: "Factorise.",
    tex: "x^2 - 49",
    solution: [
      { tex: "x^2 - 7^2", label: "A difference of two squares", tags: [tag("algebra.expand-factor.binomial")] },
      { tex: "(x - 7)(x + 7)", label: "Factorised", tags: [tag("algebra.expand-factor.binomial")] },
    ],
  },
  {
    id: "ps3-q5",
    label: "Q5",
    difficulty: "simple familiar",
    stem: "Factorise.",
    tex: "x^2 + 2x - 15",
    solution: [
      { tex: "5 \\times (-3) = -15,\\; 5 + (-3) = 2", label: "Found the pair", tags: [tag("algebra.expand-factor.monic")] },
      { tex: "(x + 5)(x - 3)", label: "Factorised", tags: [tag("algebra.expand-factor.monic")] },
    ],
  },
  {
    id: "ps3-q6",
    label: "Q6",
    difficulty: "simple unfamiliar",
    stem: "Factorise.",
    tex: "x^2 - 10x + 25",
    solution: [
      { tex: "x^2 - 2(5)x + 5^2", label: "A perfect square", tags: [tag("algebra.expand-factor.binomial")] },
      { tex: "(x - 5)^2", label: "Factorised", tags: [tag("algebra.expand-factor.binomial"), tag("algebra.expand-factor.monic")] },
    ],
  },
  {
    id: "ps3-q7",
    label: "Q7",
    difficulty: "complex familiar",
    stem: "Factorise fully, taking out the common factor first.",
    tex: "3x^2 - 12x - 36",
    solution: [
      { tex: "3(x^2 - 4x - 12)", label: "Took out the 3", tags: [tag("algebra.expand-factor.expand")] },
      { tex: "(-6) \\times 2 = -12,\\; -6 + 2 = -4", label: "Found the pair", tags: [tag("algebra.expand-factor.monic")] },
      { tex: "3(x - 6)(x + 2)", label: "Factorised fully", tags: [tag("algebra.expand-factor.monic")] },
    ],
  },
  {
    id: "ps3-q8",
    label: "Q8",
    difficulty: "simple familiar",
    stem: "Factorise, then expand your answer back to check it.",
    tex: "x^2 - 11x + 24",
    solution: [
      { tex: "(-3) \\times (-8) = 24,\\; -3 + (-8) = -11", label: "Found the pair", tags: [tag("algebra.expand-factor.monic")] },
      { tex: "(x - 3)(x - 8)", label: "Factorised", tags: [tag("algebra.expand-factor.monic")] },
      { tex: "(x - 3)(x - 8) = x^2 - 11x + 24", label: "Expanded back to check", tags: [tag("algebra.expand-factor.expand")] },
    ],
  },
  {
    id: "ps3-q9",
    label: "Q9",
    difficulty: "complex familiar",
    stem: "Factorise.",
    tex: "2x^2 + 7x + 3",
    solution: [
      { tex: "ac = 6,\\quad 6 + 1 = 7", label: "Found the split", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "2x^2 + 6x + x + 3", label: "Split the middle term", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "2x(x + 3) + (x + 3)", label: "Grouped", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "(2x + 1)(x + 3)", label: "Factorised", tags: [tag("algebra.expand-factor.nonmonic")] },
    ],
  },
  {
    id: "ps3-q10",
    label: "Q10",
    difficulty: "complex unfamiliar",
    stem: "Show that",
    tex: "(x + 3)^2 - (x - 3)^2 = 12x",
    solution: [
      { tex: "(x + 3)^2 = x^2 + 6x + 9", label: "Expanded the first square", tags: [tag("algebra.expand-factor.binomial"), tag("reasoning.justify.formal")] },
      { tex: "(x - 3)^2 = x^2 - 6x + 9", label: "Expanded the second square", tags: [tag("algebra.expand-factor.binomial"), tag("reasoning.justify.formal")] },
      { tex: "(x^2 + 6x + 9) - (x^2 - 6x + 9)", label: "Kept the second in brackets", tags: [tag("algebra.expand-factor.expand"), tag("reasoning.justify.formal")] },
      { tex: "= x^2 + 6x + 9 - x^2 + 6x - 9", label: "Took every term away", tags: [tag("algebra.expand-factor.expand"), tag("reasoning.justify.formal")] },
      { tex: "= 12x", label: "Collected like terms", tags: [tag("algebra.expand-factor.expand")] },
      { tex: "\\text{so } (x + 3)^2 - (x - 3)^2 = 12x", label: "Said what was shown", tags: [tag("reasoning.justify.formal")] },
    ],
  },
];

export const PS3_ASSIGNMENT: Assignment = {
  id: "pset-3",
  title: "PROBLEM SET 3 — EXPANDING AND FACTORISING",
  className: "11 Methods",
  classCode: "11MAM2",
  teacher: "Ms Okafor",
  due: "Tue 1 Sep",
  unit: { number: 1, topic: "Topic 1", title: "Surds and quadratic functions" },
  goal: "Expanding and factorising are the same move in opposite directions, and the perfect square and the difference of two squares are the two shortcuts worth knowing by sight. By Tuesday I want you to expand any pair of brackets without dropping a term or a sign, spot a perfect square and a difference of squares, and factorise a quadratic by its pair. Then expand your answer back. A factorisation you have checked is one you never lose marks on.",
  problems: PS3_PROBLEMS,
  newSkills: ["algebra.expand-factor.binomial"],
};

/** Problem Set 3 ran individual working, then individual review, then group review; every stage is over. */
export const PS3_PATHWAY: Pathway = ["individual", "group"];
