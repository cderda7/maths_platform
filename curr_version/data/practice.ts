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
    hint: "Look for two numbers that multiply to the constant and add to the middle coefficient.",
    hintTerms: [
      { phrase: "constant", tex: ["12"] },
      { phrase: "middle coefficient", tex: ["7"] },
    ],
    followUp: {
      id: "w-monic-2",
      leaf: "algebra.expand-factor.monic",
      stem: "Factorise, then solve.",
      tex: "x^2 - 7x + 10 = 0",
      steps: [
        { tex: "(-2) \\times (-5) = 10,\\quad (-2) + (-5) = -7", label: "Found the pair", tags: [tag("algebra.expand-factor.monic")] },
        { tex: "(x - 2)(x - 5) = 0", label: "Factorised", tags: [tag("algebra.expand-factor.monic")] },
        { tex: "x = 2 \\;\\text{or}\\; x = 5", label: "Null factor law", tags: [tag("unit.u1.nfl")] },
      ],
      why: "Same move, negative pair: both numbers negative when the constant is positive and the middle term negative.",
      hint: "The constant is positive and the middle term negative, so both numbers are negative.",
      hintTerms: [
        { phrase: "constant", tex: ["10"] },
        { phrase: "middle term", tex: ["- 7x"] },
      ],
    },
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
    hint: "Multiply a by c, then split the middle term into two parts that add to b and multiply to ac.",
    hintTerms: [
      { phrase: "a", tex: ["3"] },
      { phrase: "b", tex: ["10"] },
      { phrase: "c", tex: ["8"] },
      { phrase: "ac", tex: ["3", "8"] },
      { phrase: "middle term", tex: ["10x"] },
    ],
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
    hint: "Every term in the first bracket meets every term in the second: four products.",
    hintTerms: [
      { phrase: "first bracket", tex: ["(x - 4)"] },
      { phrase: "second", tex: ["(x + 1)"] },
    ],
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
    hint: "Get everything onto one side first, so the other side is zero.",
    hintTerms: [
      { phrase: "one side", tex: ["x(x + 3)"] },
      { phrase: "other side", tex: ["10"] },
    ],
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
    hint: "Whatever you do to one side, do to the whole of the other side.",
    hintTerms: [
      { phrase: "one side", tex: ["\\dfrac{x^2}{3}"] },
      { phrase: "other side", tex: ["12"] },
    ],
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
    hint: "A product is zero only when one of its factors is zero.",
    hintTerms: [{ phrase: "factors", tex: ["(x - 2)", "(x + 5)"] }],
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
    hint: "Work out b² − 4ac and look only at its sign.",
    hintTerms: [
      { phrase: "b", tex: ["2"] },
      { phrase: "a", within: "4ac", tex: [], insert: { before: "x^2", tex: "1" } },
      { phrase: "c", within: "4ac", tex: ["5"] },
    ],
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
    hint: "The axis of symmetry sits halfway between the two intercepts.",
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
    hint: "Name the fact you are using, then say what it forces.",
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
    hint: "Say what the number means for the picture, in a sentence.",
    hintTerms: [{ phrase: "number", tex: ["-11"] }],
  },
  "graphing.quadratics.sketch": {
    id: "w-sketch",
    leaf: "graphing.quadratics.sketch",
    stem: "Sketch, marking every intercept and the turning point.",
    tex: "y = (x - 1)(x - 3)",
    steps: [
      { tex: "x = 1 \;\\text{or}\; x = 3", label: "x-intercepts", tags: [tag("functions.zeros.zero-finding")] },
      { tex: "y = (-1)(-3) = 3,\\quad (0, 3)", label: "y-intercept", tags: [tag("graphing.quadratics.features")] },
      { tex: "x = 2,\\quad y = (1)(-1) = -1,\\quad (2, -1)", label: "Turning point", tags: [tag("graphing.quadratics.features")] },
      { tex: "\\text{opens up through } (1,0),\\ (3,0),\\ (0,3),\\ \\text{min } (2,-1)", label: "Sketched", tags: [tag("graphing.quadratics.sketch")] },
    ],
    why: "A sketch is four facts placed on the axes: two intercepts, the y-intercept and the turning point.",
    hint: "Intercepts first, then the turning point halfway between them, then join with a smooth curve.",
    hintTerms: [{ phrase: "intercepts", tex: ["(x - 1)", "(x - 3)"] }],
  },
  "functions.notation.evaluate": {
    id: "w-evaluate",
    leaf: "functions.notation.evaluate",
    stem: "For f(x) = x² − 3x + 1, find",
    tex: "f(-2)",
    steps: [
      { tex: "f(-2) = (-2)^2 - 3(-2) + 1", label: "Substituted, brackets kept", tags: [tag("functions.notation.evaluate")] },
      { tex: "= 4 + 6 + 1 = 11", label: "Evaluated", tags: [tag("functions.notation.evaluate")] },
    ],
    why: "The brackets around a negative input are the whole skill.",
    hint: "Put brackets around the value before you substitute, especially a negative one.",
    hintTerms: [{ phrase: "value", tex: ["-2"] }],
  },
  "reasoning.interpret.worded": {
    id: "w-worded",
    leaf: "reasoning.interpret.worded",
    stem: "A ball's height after t seconds is h = 20t − 5t². When does it land?",
    tex: "h = 20t - 5t^2",
    steps: [
      { tex: "20t - 5t^2 = 0", label: "Landing means height zero", tags: [tag("reasoning.interpret.worded")] },
      { tex: "5t(4 - t) = 0", label: "Common factor", tags: [tag("algebra.expand-factor.monic")] },
      { tex: "t = 0 \;\\text{or}\; t = 4", label: "Null factor law", tags: [tag("unit.u1.nfl")] },
      { tex: "\\text{lands at } t = 4 \\text{ s}", label: "In context", tags: [tag("reasoning.justify.conclusions")] },
    ],
    why: "The words hide an equation. Find it, solve it, then answer the question that was asked.",
    hint: "Landing means the height is zero. Write that as an equation before anything else.",
    hintTerms: [{ phrase: "height", tex: ["h"] }],
  },
  "functions.zeros.zero-finding": {
    id: "w-zeros",
    leaf: "functions.zeros.zero-finding",
    stem: "Find the zeros of",
    tex: "f(x) = x^2 - 9",
    steps: [
      { tex: "x^2 - 9 = 0", label: "A zero is where the output is 0", tags: [tag("functions.zeros.zero-finding")] },
      { tex: "(x - 3)(x + 3) = 0", label: "Difference of two squares", tags: [tag("unit.u1.binomial")] },
      { tex: "x = 3 \;\\text{or}\; x = -3", label: "Null factor law", tags: [tag("unit.u1.nfl")] },
      { tex: "\\text{the graph meets the x-axis at } \\pm 3", label: "What a zero means", tags: [tag("functions.zeros.zero-finding")] },
    ],
    why: "A zero of a function and an x-intercept of its graph are the same fact, seen twice.",
    hint: "Set the rule equal to zero and solve. Each answer is where the graph crosses the x-axis.",
    hintTerms: [{ phrase: "rule", tex: ["x^2 - 9"] }],
  },
  "unit.u1.binomial": {
    id: "w-binomial",
    leaf: "unit.u1.binomial",
    stem: "Expand using the identity.",
    tex: "(x + 5)^2",
    steps: [
      { tex: "(a + b)^2 = a^2 + 2ab + b^2", label: "The identity", tags: [tag("unit.u1.binomial")] },
      { tex: "x^2 + 10x + 25", label: "Applied", tags: [tag("unit.u1.binomial"), tag("algebra.expand-factor.expand")] },
    ],
    why: "Square the first, double the product, square the last.",
    hint: "Square the first term, double the product of the two, square the last term.",
    hintTerms: [
      { phrase: "first term", tex: ["x"] },
      { phrase: "last term", tex: ["5"] },
    ],
  },
};

/** The default warm-up: what the chooser falls back to when nothing was selected or said. */
export const PRACTICE: PracticeProblem = PRACTICES["algebra.expand-factor.monic"]!;

/**
 * Leaves practice is never offered on: they name the whole task rather than one move, so a problem
 * "on just that" is as hard as the set. Practice is offered on moves only, never at this level.
 */
export const NOT_ISOLATED: readonly LeafId[] = ["algebra.equations.quadratic"];
export const isolatable = (leaf: LeafId) => !NOT_ISOLATED.includes(leaf) && !leaf.startsWith("communication.");

/** Everything the warm-up can serve: one short problem per leaf. */
export const WARMUP_BANK: PracticeProblem[] = Object.values(PRACTICES) as PracticeProblem[];
