import type { LeafId } from "./taxonomy";
import { tag, type PracticeProblem } from "./types";

/**
 * One short, isolated practice problem per leaf that can be a detected mistake in this set
 * (a test enforces the coverage), plus a couple of extras the help picker can offer. Hand-checked.
 */
export const PRACTICES: Partial<Record<LeafId, PracticeProblem>> = {
  "algebra.expand-factor.monic": {
    id: "w-monic",
    leaf: "algebra.expand-factor.monic",
    stem: "Factorise, then solve.",
    tex: "x^2 + 7x + 12 = 0",
    steps: [
      { tex: "3 \\times 4 = 12,\\quad 3 + 4 = 7", label: "Found the pair", tags: [tag("algebra.expand-factor.monic")] },
      { tex: "(x + 3)(x + 4) = 0", label: "Factorised", tags: [tag("algebra.expand-factor.monic")] },
      { tex: "x^2 + 4x + 3x + 12 \\;\\checkmark", label: "Expanded back to check", tags: [tag("algebra.expand-factor.expand")] },
      { tex: "x = -3 \\;\\text{or}\\; x = -4", label: "Null factor law", tags: [tag("unit.u1.nfl")] },
    ],
    why: "Most of this set leans on factorising. Two minutes here makes it quicker.",
  },
  "algebra.expand-factor.nonmonic": {
    id: "w-nonmonic",
    leaf: "algebra.expand-factor.nonmonic",
    stem: "Factorise.",
    tex: "3x^2 + 10x + 8",
    steps: [
      { tex: "ac = 24,\\quad 6 + 4 = 10", label: "Found the split", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "3x^2 + 6x + 4x + 8", label: "Split the middle term", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "3x(x + 2) + 4(x + 2)", label: "Grouped", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "(3x + 4)(x + 2)", label: "Factorised", tags: [tag("algebra.expand-factor.nonmonic")] },
    ],
    why: "When the x² term has a coefficient, the split is the move that replaces guessing.",
  },
  "algebra.expand-factor.expand": {
    id: "w-expand",
    leaf: "algebra.expand-factor.expand",
    stem: "Expand and simplify.",
    tex: "(x - 4)(x + 1)",
    steps: [
      { tex: "x^2 + x - 4x - 4", label: "Four products", tags: [tag("algebra.expand-factor.expand")] },
      { tex: "x^2 - 3x - 4", label: "Collected like terms", tags: [tag("algebra.equations.linear")] },
    ],
    why: "Expanding back is the quickest check on a factorisation. It takes one line.",
  },
  "algebra.equations.linear": {
    id: "w-linear",
    leaf: "algebra.equations.linear",
    stem: "Rearrange into standard form.",
    tex: "x(x + 3) = 10",
    steps: [
      { tex: "x^2 + 3x = 10", label: "Expanded the left side", tags: [tag("algebra.expand-factor.expand")] },
      { tex: "x^2 + 3x - 10 = 0", label: "Everything to one side", tags: [tag("algebra.equations.linear")] },
    ],
    why: "A product only tells you about its factors when it equals zero. Getting to standard form first is the habit.",
  },
  "algebra.equations.quadratic": {
    id: "w-quadratic",
    leaf: "algebra.equations.quadratic",
    stem: "Solve exactly.",
    tex: "2x^2 - 3x - 1 = 0",
    steps: [
      { tex: "a = 2,\\; b = -3,\\; c = -1", label: "Read off a, b, c", tags: [tag("algebra.equations.quadratic")] },
      { tex: "b^2 - 4ac = 9 + 8 = 17", label: "Discriminant", tags: [tag("unit.u1.discriminant")] },
      { tex: "x = \\dfrac{3 \\pm \\sqrt{17}}{4}", label: "Formula, denominator 2a", tags: [tag("algebra.equations.quadratic")] },
    ],
    why: "The denominator is 2a, and the roots read off a factor (x − r) are r, not −r.",
  },
  "algebra.number.fractions": {
    id: "w-fractions",
    leaf: "algebra.number.fractions",
    stem: "Solve, leaving the answer exact.",
    tex: "\\dfrac{x^2}{3} = 12",
    steps: [
      { tex: "x^2 = 36", label: "Multiplied both sides by 3", tags: [tag("algebra.number.fractions")] },
      { tex: "x = \\pm 6", label: "Square root, both signs", tags: [tag("algebra.equations.quadratic")] },
    ],
    why: "Whatever you do to one term you do to every term, on both sides.",
  },
  "unit.u1.nfl": {
    id: "w-nfl",
    leaf: "unit.u1.nfl",
    stem: "Solve.",
    tex: "(x - 2)(x + 5) = 0",
    steps: [
      { tex: "x - 2 = 0 \\;\\text{or}\\; x + 5 = 0", label: "Product is zero, so a factor is", tags: [tag("unit.u1.nfl")] },
      { tex: "x = 2 \\;\\text{or}\\; x = -5", label: "Solved each", tags: [tag("algebra.equations.linear")] },
    ],
    why: "The null factor law only works when the product equals zero. That is the whole rule.",
  },
  "unit.u1.discriminant": {
    id: "w-discriminant",
    leaf: "unit.u1.discriminant",
    stem: "How many real roots?",
    tex: "x^2 + 2x + 5 = 0",
    steps: [
      { tex: "b^2 - 4ac = 4 - 20 = -16", label: "Discriminant", tags: [tag("unit.u1.discriminant")] },
      { tex: "\\Delta < 0 \\Rightarrow \\text{none}", label: "Negative: no real roots", tags: [tag("unit.u1.discriminant")] },
    ],
    why: "Positive: two roots. Zero: one. Negative: none. The sign is the whole story.",
  },
  "graphing.quadratics.features": {
    id: "w-features",
    leaf: "graphing.quadratics.features",
    stem: "Find the turning point of",
    tex: "y = x^2 - 2x - 8",
    steps: [
      { tex: "(x - 4)(x + 2) = 0 \\Rightarrow x = 4 \\;\\text{or}\\; x = -2", label: "Intercepts", tags: [tag("functions.zeros.zero-finding")] },
      { tex: "x = \\tfrac{4 + (-2)}{2} = 1", label: "Axis of symmetry", tags: [tag("graphing.quadratics.features")] },
      { tex: "y = 1 - 2 - 8 = -9,\\quad (1, -9)", label: "Turning point", tags: [tag("graphing.quadratics.features")] },
    ],
    why: "The axis of symmetry is halfway between the intercepts; the turning point's height is the function there.",
  },
  "reasoning.justify.formal": {
    id: "w-formal",
    leaf: "reasoning.justify.formal",
    stem: "Show that this has exactly one real solution.",
    tex: "x^2 - 6x + 9 = 0",
    steps: [
      { tex: "b^2 - 4ac = 36 - 36 = 0", label: "Discriminant", tags: [tag("unit.u1.discriminant")] },
      { tex: "\\Delta = 0 \\Rightarrow \\text{exactly one real solution}", label: "Justified", tags: [tag("reasoning.justify.formal")] },
    ],
    why: "A justification names the fact and draws the one conclusion it allows.",
  },
  "reasoning.justify.conclusions": {
    id: "w-conclusions",
    leaf: "reasoning.justify.conclusions",
    stem: "The discriminant of y = x² + x + 3 is −11. What does the graph do?",
    tex: "\\Delta = -11",
    steps: [
      { tex: "\\Delta < 0 \\Rightarrow \\text{no real roots}", label: "Justified", tags: [tag("reasoning.justify.formal")] },
      { tex: "\\text{The graph never meets the x-axis}", label: "In context", tags: [tag("reasoning.justify.conclusions")] },
    ],
    why: "Finish the sentence: say what the algebra means for the picture.",
  },
};

/** The warm-up offered before the set starts. */
export const PRACTICE: PracticeProblem = PRACTICES["algebra.expand-factor.monic"]!;
