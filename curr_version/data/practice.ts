import type { PracticeProblem, SubskillId } from "./types";

/**
 * One short, isolated practice problem per prerequisite subskill. Offered before the set
 * (factorising, the one three of the four problems lean on), by the escalation prompt, and by
 * the "I need help" picker. Hand-checked.
 */
export const PRACTICES: Record<Exclude<SubskillId, "roots">, PracticeProblem> = {
  factoring: {
    id: "w-factoring",
    subskill: "factoring",
    stem: "Factorise, then solve.",
    tex: "x^2 + 7x + 12 = 0",
    steps: [
      { tex: "3 \\times 4 = 12,\\quad 3 + 4 = 7", label: "Found the pair", subskill: "factoring" },
      { tex: "(x + 3)(x + 4) = 0", label: "Factorised", subskill: "factoring" },
      { tex: "x^2 + 4x + 3x + 12 \\;\\checkmark", label: "Expanded back to check", subskill: "expansion" },
      { tex: "x = -3 \\;\\text{or}\\; x = -4", label: "Null factor law", subskill: "roots" },
    ],
    why: "Three of the four problems lean on factorising. Two minutes here makes them quicker.",
  },
  algebra: {
    id: "w-algebra",
    subskill: "algebra",
    stem: "Rearrange into standard form.",
    tex: "x(x + 3) = 10",
    steps: [
      { tex: "x^2 + 3x = 10", label: "Expanded the left side", subskill: "expansion" },
      { tex: "x^2 + 3x - 10 = 0", label: "Everything to one side", subskill: "algebra" },
      { tex: "a = 1,\\; b = 3,\\; c = -10", label: "Read off a, b, c", subskill: "algebra" },
    ],
    why: "A product only tells you about its factors when it equals zero. Getting to standard form first is the habit.",
  },
  fractions: {
    id: "w-fractions",
    subskill: "fractions",
    stem: "Solve, leaving the answer exact.",
    tex: "\\dfrac{x^2}{3} = 12",
    steps: [
      { tex: "x^2 = 36", label: "Multiplied both sides by 3", subskill: "fractions" },
      { tex: "x = \\pm 6", label: "Square root, both signs", subskill: "roots" },
    ],
    why: "Clearing a denominator on both sides, and keeping both signs of a root, are the two moves Q4 leans on.",
  },
  expansion: {
    id: "w-expansion",
    subskill: "expansion",
    stem: "Expand and simplify.",
    tex: "(x - 4)(x + 1)",
    steps: [
      { tex: "x^2 + x - 4x - 4", label: "Four products", subskill: "expansion" },
      { tex: "x^2 - 3x - 4", label: "Collected like terms", subskill: "algebra" },
    ],
    why: "Expanding back is the quickest check on a factorisation. It takes one line.",
  },
  graphing: {
    id: "w-graphing",
    subskill: "graphing",
    stem: "Where does this parabola cross the x-axis?",
    tex: "y = x^2 - 2x - 8",
    steps: [
      { tex: "x^2 - 2x - 8 = 0", label: "Crossings are where y = 0", subskill: "graphing" },
      { tex: "(x - 4)(x + 2) = 0", label: "Factorised", subskill: "factoring" },
      { tex: "x = 4 \\;\\text{or}\\; x = -2", label: "Null factor law", subskill: "roots" },
    ],
    why: "The roots are the x-intercepts. Reading the graph and solving the equation are the same question.",
  },
};

/** The warm-up offered before the set starts. */
export const PRACTICE = PRACTICES.factoring;
