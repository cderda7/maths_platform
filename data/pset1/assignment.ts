import { tag, type Assignment, type Pathway, type Problem } from "../types";

/**
 * Problem Set 1 — Features of a parabola (ticket 187): the class's previous set, due Thu 3 Sep,
 * finished and reviewed. Ten problems on the three forms of a quadratic (standard
 * y = ax² + bx + c, turning-point y = a(x − h)² + k, factorised y = a(x − x₁)(x − x₂)): read the
 * feature a form hands over for free, compute the ones it does not, and move between forms when the
 * one you have is not the one you need. Hand-checked; every step tagged with the same taxonomy leaves
 * as Problem Set 2, so the class view's columns line up across the two sets and a gap here can be
 * followed there.
 *
 * Ids are `ps1-q1` … `ps1-q10` (labels Q1 … Q10): every table keyed by problem id (the evaluation
 * table, the diagnostics) is shared with Problem Set 2's `q1` … `q10`, so the ids must not collide.
 * Teacher-side only: nothing here reaches a student screen or a hint box.
 */
export const PS1_PROBLEMS: Problem[] = [
  {
    id: "ps1-q1",
    label: "Q1",
    difficulty: "simple familiar",
    stem: "Write down the y-intercept and the x-intercepts of the graph of",
    tex: "y = (x - 2)(x + 6)",
    solution: [
      { tex: "x = 0:\\; y = (-2)(6) = -12", label: "y-intercept", tags: [tag("functions.notation.evaluate"), tag("graphing.quadratics.features")] },
      { tex: "x - 2 = 0 \\;\\text{or}\\; x + 6 = 0", label: "Each factor zero", tags: [tag("unit.u1.nfl"), tag("functions.zeros.zero-finding")] },
      { tex: "x = 2 \\;\\text{or}\\; x = -6", label: "x-intercepts", tags: [tag("algebra.equations.linear"), tag("functions.zeros.zero-finding")] },
    ],
  },
  {
    id: "ps1-q2",
    label: "Q2",
    difficulty: "simple familiar",
    stem: "Write down the turning point and the axis of symmetry of the graph of",
    tex: "y = 2(x + 3)^2 - 8",
    solution: [
      { tex: "h = -3,\\; k = -8", label: "Read h and k", tags: [tag("graphing.quadratics.features")] },
      { tex: "\\text{turning point } (-3, -8)", label: "Turning point", tags: [tag("graphing.quadratics.features"), tag("graphing.quadratics.sketch")] },
      { tex: "\\text{axis of symmetry } x = -3", label: "Axis of symmetry", tags: [tag("graphing.quadratics.features")] },
    ],
  },
  {
    id: "ps1-q3",
    label: "Q3",
    difficulty: "simple familiar",
    stem: "Find the turning point and the y-intercept of the graph of",
    tex: "y = -(x - 4)^2 + 9",
    solution: [
      { tex: "\\text{turning point } (4, 9)", label: "Turning point", tags: [tag("graphing.quadratics.features")] },
      { tex: "y = -(0 - 4)^2 + 9", label: "Substituted x = 0", tags: [tag("functions.notation.evaluate")] },
      { tex: "y = -16 + 9 = -7", label: "y-intercept", tags: [tag("functions.notation.evaluate"), tag("graphing.quadratics.features")] },
    ],
  },
  {
    id: "ps1-q4",
    label: "Q4",
    difficulty: "simple unfamiliar",
    stem: "Find the x-intercepts of the graph of",
    tex: "y = 3x^2 - 10x - 8",
    solution: [
      { tex: "ac = -24,\\quad -12 + 2 = -10", label: "Found the split", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "3x^2 - 12x + 2x - 8 = 0", label: "Split the middle term", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "3x(x - 4) + 2(x - 4) = 0", label: "Grouped", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "(3x + 2)(x - 4) = 0", label: "Factorised", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "x = -\\tfrac{2}{3} \\;\\text{or}\\; x = 4", label: "x-intercepts", tags: [tag("unit.u1.nfl"), tag("functions.zeros.zero-finding"), tag("algebra.number.fractions")] },
    ],
  },
  {
    id: "ps1-q5",
    label: "Q5",
    difficulty: "simple familiar",
    stem: "Find the axis of symmetry and the turning point of the graph of",
    tex: "y = x^2 + 6x + 5",
    solution: [
      { tex: "x = -\\dfrac{b}{2a} = -\\dfrac{6}{2} = -3", label: "Axis of symmetry", tags: [tag("graphing.quadratics.features"), tag("algebra.number.fractions")] },
      { tex: "y = (-3)^2 + 6(-3) + 5 = -4", label: "Height on the axis", tags: [tag("functions.notation.evaluate")] },
      { tex: "\\text{turning point } (-3, -4)", label: "Turning point", tags: [tag("graphing.quadratics.features"), tag("graphing.quadratics.sketch")] },
    ],
  },
  {
    id: "ps1-q6",
    label: "Q6",
    difficulty: "complex familiar",
    stem: "Complete the square to write the rule in turning-point form, and state the turning point.",
    tex: "y = x^2 - 8x + 10",
    solution: [
      { tex: "y = (x^2 - 8x + 16) - 16 + 10", label: "Added and took away 16", tags: [tag("unit.u1.binomial"), tag("algebra.equations.quadratic")] },
      { tex: "y = (x - 4)^2 - 6", label: "Turning-point form", tags: [tag("unit.u1.binomial")] },
      { tex: "\\text{turning point } (4, -6)", label: "Turning point", tags: [tag("graphing.quadratics.features")] },
    ],
  },
  {
    id: "ps1-q7",
    label: "Q7",
    difficulty: "simple unfamiliar",
    stem: "Expand into standard form, and state the y-intercept.",
    tex: "y = 2(x - 3)^2 - 5",
    solution: [
      { tex: "y = 2(x^2 - 6x + 9) - 5", label: "Expanded the square", tags: [tag("unit.u1.binomial")] },
      { tex: "y = 2x^2 - 12x + 18 - 5", label: "Distributed the 2", tags: [tag("algebra.expand-factor.expand")] },
      { tex: "y = 2x^2 - 12x + 13", label: "Standard form", tags: [tag("algebra.expand-factor.expand")] },
      { tex: "y\\text{-intercept } (0, 13)", label: "y-intercept", tags: [tag("graphing.quadratics.features")] },
    ],
  },
  {
    id: "ps1-q8",
    label: "Q8",
    difficulty: "complex familiar",
    stem: "Write in factorised form, then give the x-intercepts and the axis of symmetry.",
    tex: "y = 2x^2 + 5x - 3",
    solution: [
      { tex: "ac = -6,\\quad 6 + (-1) = 5", label: "Found the split", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "y = (2x - 1)(x + 3)", label: "Factorised", tags: [tag("algebra.expand-factor.nonmonic")] },
      { tex: "x = \\tfrac{1}{2} \\;\\text{or}\\; x = -3", label: "x-intercepts", tags: [tag("unit.u1.nfl"), tag("functions.zeros.zero-finding"), tag("algebra.number.fractions")] },
      { tex: "x = \\dfrac{\\tfrac{1}{2} + (-3)}{2} = -\\tfrac{5}{4}", label: "Axis of symmetry", tags: [tag("graphing.quadratics.features"), tag("algebra.number.fractions")] },
    ],
  },
  {
    id: "ps1-q9",
    label: "Q9",
    difficulty: "complex unfamiliar",
    stem: "Before sketching the graph of the following, find its shape, its intercepts and its turning point.",
    tex: "y = -x^2 + 2x + 8",
    solution: [
      { tex: "a = -1 < 0 \\Rightarrow \\text{concave down}", label: "Shape", tags: [tag("graphing.quadratics.sketch")] },
      { tex: "y\\text{-intercept } (0, 8)", label: "y-intercept", tags: [tag("graphing.quadratics.features")] },
      { tex: "-(x^2 - 2x - 8) = -(x - 4)(x + 2) = 0", label: "Took out −1, factorised", tags: [tag("algebra.expand-factor.expand"), tag("algebra.expand-factor.monic")] },
      { tex: "x = 4 \\;\\text{or}\\; x = -2", label: "x-intercepts", tags: [tag("unit.u1.nfl"), tag("functions.zeros.zero-finding")] },
      { tex: "x = 1,\\; y = -1 + 2 + 8 = 9", label: "Height on the axis", tags: [tag("graphing.quadratics.features"), tag("functions.notation.evaluate")] },
      { tex: "\\text{maximum turning point } (1, 9)", label: "Turning point", tags: [tag("graphing.quadratics.features"), tag("graphing.quadratics.sketch")] },
    ],
  },
  {
    id: "ps1-q10",
    label: "Q10",
    difficulty: "complex unfamiliar",
    stem: "A fountain's jet follows the path below, where h is the height in metres of the water x metres from the nozzle. How high does the water reach, and how far from the nozzle does it land?",
    tex: "h = -\\tfrac{1}{4}(x - 2)^2 + 1",
    answerAs: "sentence",
    solution: [
      { tex: "\\text{turning point } (2, 1)", label: "Read the turning point", tags: [tag("reasoning.interpret.worded"), tag("graphing.quadratics.features")] },
      { tex: "-\\tfrac{1}{4}(x - 2)^2 + 1 = 0", label: "Height zero", tags: [tag("reasoning.interpret.worded"), tag("functions.zeros.zero-finding")] },
      { tex: "(x - 2)^2 = 4", label: "Rearranged", tags: [tag("algebra.equations.linear"), tag("algebra.number.fractions")] },
      { tex: "x - 2 = \\pm 2", label: "Square root, both signs", tags: [tag("algebra.equations.quadratic")] },
      { tex: "x = 0 \\;\\text{or}\\; x = 4", label: "Solved", tags: [tag("functions.zeros.zero-finding")] },
      { tex: "\\text{The water reaches 1 m and lands 4 m from the nozzle}", label: "In context", tags: [tag("reasoning.justify.conclusions")] },
    ],
  },
];

export const PS1_ASSIGNMENT: Assignment = {
  id: "pset-1",
  title: "PROBLEM SET 1 — FEATURES OF A PARABOLA",
  className: "11 Methods",
  classCode: "11MAM2",
  teacher: "Ms Okafor",
  due: "Thu 3 Sep",
  unit: { number: 1, topic: "Topic 1", title: "Surds and quadratic functions" },
  goal: "Every quadratic can be written three ways, and each way hands you something for free: standard form the y-intercept, turning-point form the turning point, factorised form the x-intercepts. By Thursday I want you to know which form gives you which feature, and to move to the form you need when it isn't the one you were given. Sketch as you go. A rough picture catches a wrong sign before I do.",
  problems: PS1_PROBLEMS,
};

/** Problem Set 1 ran individual working, then individual review, then group review; every stage is over. */
export const PS1_PATHWAY: Pathway = ["individual", "group"];
