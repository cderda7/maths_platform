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
    hint: "Multiply a by c, then split the middle term into two parts that add to b.",
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
    hint: "Write down a, b and c before anything else, signs included.",
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
  },
};

/** The default warm-up: what the chooser falls back to when nothing was selected or said. */
export const PRACTICE: PracticeProblem = PRACTICES["algebra.expand-factor.monic"]!;

/**
 * Composite warm-ups: one problem that exercises several of the set's skills at once, so a
 * student who names three worries gets one problem, not three. Simulated stand-ins for a problem
 * bank (see FUTURE_FEATURES). `leaf` is the headline skill; what a problem covers is read from
 * its steps' tags.
 */
export const COMPOSITE_WARMUPS: PracticeProblem[] = [
  {
    id: "w-rational-zero",
    leaf: "algebra.number.fractions",
    stem: "Solve. Check the denominator is not zero at your answers.",
    tex: "\\dfrac{x^2 - 5x + 6}{2x^2 + 7x - 4} = 0",
    steps: [
      { tex: "x^2 - 5x + 6 = 0", label: "A fraction is zero when its numerator is", tags: [tag("algebra.number.fractions")] },
      { tex: "(x - 2)(x - 3) = 0", label: "Factorised the numerator", tags: [tag("algebra.expand-factor.monic")] },
      { tex: "x = 2 \\;\\text{or}\\; x = 3", label: "Null factor law", tags: [tag("unit.u1.nfl"), tag("algebra.equations.quadratic")] },
      { tex: "2x^2 + 7x - 4 = (2x - 1)(x + 4)", label: "Factorised the denominator", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "\\text{neither is } 0 \\text{ at } x = 2, 3 \\;\\checkmark", label: "Denominator checked", tags: [tag("algebra.number.fractions")] },
    ],
    why: "Factorising twice, a fraction, and the null factor law in one problem.",
    hint: "A fraction equals zero only when its top is zero. Factorise the top first, then make sure the bottom is not zero there.",
    followUp: {
      id: "w-rational-zero-2",
      leaf: "algebra.number.fractions",
      stem: "Solve. Check the denominator is not zero at your answers.",
      tex: "\\dfrac{x^2 + 7x + 12}{3x^2 + 10x + 8} = 0",
      steps: [
        { tex: "x^2 + 7x + 12 = 0", label: "Numerator is zero", tags: [tag("algebra.number.fractions")] },
        { tex: "(x + 3)(x + 4) = 0", label: "Factorised the numerator", tags: [tag("algebra.expand-factor.monic")] },
        { tex: "x = -3 \\;\\text{or}\\; x = -4", label: "Null factor law", tags: [tag("unit.u1.nfl"), tag("algebra.equations.quadratic")] },
        { tex: "3x^2 + 10x + 8 = (3x + 4)(x + 2)", label: "Factorised the denominator", tags: [tag("algebra.expand-factor.nonmonic")] },
        { tex: "\\text{neither is } 0 \\text{ at } x = -3, -4 \\;\\checkmark", label: "Denominator checked", tags: [tag("algebra.number.fractions")] },
      ],
      why: "Same shape, both pairs positive.",
      hint: "Top first: which two numbers multiply to 12 and add to 7? Then check the bottom at each answer.",
    },
  },
  {
    id: "w-fraction-nonmonic",
    leaf: "algebra.expand-factor.nonmonic",
    stem: "Solve exactly.",
    tex: "\\dfrac{2x^2}{3} + \\dfrac{7x}{3} = \\dfrac{4}{3}",
    steps: [
      { tex: "2x^2 + 7x = 4", label: "Multiplied every term by 3", tags: [tag("algebra.number.fractions")] },
      { tex: "2x^2 + 7x - 4 = 0", label: "Standard form", tags: [tag("algebra.equations.linear"), tag("algebra.equations.quadratic")] },
      { tex: "ac = -8,\\quad 8 + (-1) = 7", label: "Found the split", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "(2x - 1)(x + 4) = 0", label: "Factorised", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "x = \\tfrac{1}{2} \\;\\text{or}\\; x = -4", label: "Null factor law", tags: [tag("unit.u1.nfl"), tag("algebra.number.fractions")] },
    ],
    why: "Clearing fractions, then a non-monic factorisation.",
    hint: "Every term has the same denominator. Multiply the whole equation by it first, then get everything to one side.",
    followUp: {
      id: "w-fraction-nonmonic-2",
      leaf: "algebra.expand-factor.nonmonic",
      stem: "Solve exactly.",
      tex: "\\dfrac{3x^2}{2} + 5x = -4",
      steps: [
        { tex: "3x^2 + 10x = -8", label: "Multiplied every term by 2", tags: [tag("algebra.number.fractions")] },
        { tex: "3x^2 + 10x + 8 = 0", label: "Standard form", tags: [tag("algebra.equations.linear"), tag("algebra.equations.quadratic")] },
        { tex: "ac = 24,\\quad 6 + 4 = 10", label: "Found the split", tags: [tag("algebra.expand-factor.nonmonic")] },
        { tex: "(3x + 4)(x + 2) = 0", label: "Factorised", tags: [tag("algebra.expand-factor.nonmonic")] },
        { tex: "x = -\\tfrac{4}{3} \\;\\text{or}\\; x = -2", label: "Null factor law", tags: [tag("unit.u1.nfl"), tag("algebra.number.fractions")] },
      ],
      why: "Only one fraction this time, and the right side is not zero yet.",
      hint: "Multiply every term, including the −4, by 2. Then bring the −8 across.",
    },
  },
  {
    id: "w-fraction-discriminant",
    leaf: "unit.u1.discriminant",
    stem: "For which values of k does the following have exactly one real root?",
    tex: "\\dfrac{x^2}{2} + kx + 2 = 0",
    steps: [
      { tex: "x^2 + 2kx + 4 = 0", label: "Multiplied every term by 2", tags: [tag("algebra.number.fractions")] },
      { tex: "a = 1,\\; b = 2k,\\; c = 4", label: "Read off a, b, c", tags: [tag("algebra.equations.quadratic")] },
      { tex: "b^2 - 4ac = 4k^2 - 16", label: "Discriminant", tags: [tag("unit.u1.discriminant")] },
      { tex: "4k^2 - 16 = 0 \\Rightarrow k = \\pm 2", label: "One root means Δ = 0", tags: [tag("unit.u1.discriminant"), tag("reasoning.justify.formal")] },
    ],
    why: "A fraction to clear, then the discriminant with a parameter in it.",
    hint: "Clear the fraction, then write the discriminant in terms of k. One root means it equals zero.",
    followUp: {
      id: "w-fraction-discriminant-2",
      leaf: "unit.u1.discriminant",
      stem: "For which values of k does the following have no real roots?",
      tex: "\\dfrac{x^2}{3} + 2x + k = 0",
      steps: [
        { tex: "x^2 + 6x + 3k = 0", label: "Multiplied every term by 3", tags: [tag("algebra.number.fractions")] },
        { tex: "a = 1,\\; b = 6,\\; c = 3k", label: "Read off a, b, c", tags: [tag("algebra.equations.quadratic")] },
        { tex: "b^2 - 4ac = 36 - 12k", label: "Discriminant", tags: [tag("unit.u1.discriminant")] },
        { tex: "36 - 12k < 0 \\Rightarrow k > 3", label: "No roots means Δ < 0", tags: [tag("unit.u1.discriminant"), tag("reasoning.justify.formal")] },
      ],
      why: "Same idea with the inequality the other way.",
      hint: "No real roots means the discriminant is negative. Write it in terms of k and solve the inequality.",
    },
  },
];

/** Everything the warm-up chooser can serve: the composites first, then one problem per leaf. */
export const WARMUP_BANK: PracticeProblem[] = [...COMPOSITE_WARMUPS, ...(Object.values(PRACTICES) as PracticeProblem[])];
