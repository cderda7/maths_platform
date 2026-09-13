import { A, ok, okc, T, wrong, type LineVerdict } from "../evaluation";
import type { LeafId } from "../taxonomy";

/**
 * Problem Set 5's scripted evaluation (ticket 187): every line any of the class wrote on the set,
 * with its verdict and tags, in the same shape as Problem Set 6's table (`data/evaluation.ts`) and
 * read through the same `evaluateLine`. A wrong line's `name` is the teacher's name for the
 * mistake; the same name on two problems is the same habit (a guessed non-monic pair on Q4 and
 * Q8, a turning point's sign on Q2, Q3 and Q6).
 */
const QUAD: LeafId = "algebra.equations.quadratic";
const LIN: LeafId = "algebra.equations.linear";
const MONIC: LeafId = "algebra.expand-factor.monic";
const NONMONIC: LeafId = "algebra.expand-factor.nonmonic";
const EXPAND: LeafId = "algebra.expand-factor.expand";
const FRAC: LeafId = "algebra.number.fractions";
const NFL: LeafId = "functions.zeros.nfl";
const BINOM: LeafId = "algebra.expand-factor.binomial";
const ZERO: LeafId = "functions.zeros.zero-finding";
const EVAL: LeafId = "functions.notation.evaluate";
const FEAT: LeafId = "graphing.quadratics.features";
const SKETCH: LeafId = "graphing.quadratics.sketch";
const WORDED: LeafId = "reasoning.interpret.worded";
const CONCL: LeafId = "reasoning.justify.conclusions";

/** The mistake names shared across problems. */
const GUESSED_PAIR = "guessed pair, not expanded back";
const TP_SIGN = "turning point sign flipped";

export const PS5_EVALUATION: Record<string, Record<string, LineVerdict>> = {
  "ps5-q1": {
    "x = 0:\\; y = (-2)(6) = -12": ok(T(EVAL, FEAT), "y-intercept"),
    "x - 2 = 0 \\;\\text{or}\\; x + 6 = 0": ok(T(NFL, ZERO), "Each factor zero"),
    "x = 2 \\;\\text{or}\\; x = -6": A(ok(T(LIN, ZERO), "x-intercepts")),
    "x + 2 = 0 \\;\\text{or}\\; x - 6 = 0": wrong(
      T(NFL),
      "Each factor zero",
      "The null factor law sets each factor of the product to zero as it is printed. Changing the signs first makes a different product.",
      "Which factors are in (x − 2)(x + 6)? Set each of those to zero.",
      "intercepts with signs flipped",
    ),
    "x = -2 \\;\\text{or}\\; x = 6": A(ok(T(LIN, ZERO), "x-intercepts", true)),
    "y = -12,\\; x = 2, -6": A(okc(T(NFL, FEAT), "Intercepts in one line, the working not shown")),
  },
  "ps5-q2": {
    "h = -3,\\; k = -8": ok(T(FEAT), "Read h and k"),
    "\\text{turning point } (-3, -8)": A(ok(T(FEAT, SKETCH), "Turning point")),
    "\\text{axis of symmetry } x = -3": A(ok(T(FEAT), "Axis of symmetry")),
    "h = 3,\\; k = -8": wrong(
      T(FEAT),
      "Read h and k",
      "Turning-point form is a(x − h)² + k. A plus inside the bracket means h itself is negative.",
      "Write x + 3 as x − h. What is h?",
      TP_SIGN,
    ),
    "\\text{turning point } (3, -8)": A(ok(T(FEAT, SKETCH), "Turning point", true)),
    "\\text{axis of symmetry } x = 3": A(ok(T(FEAT), "Axis of symmetry", true)),
    "(-3, -8),\\; x = -3": A(okc(T(FEAT, SKETCH), "Turning point and axis in one line, h and k not shown")),
  },
  "ps5-q3": {
    "\\text{turning point } (4, 9)": ok(T(FEAT), "Turning point"),
    "y = -(0 - 4)^2 + 9": ok(T(EVAL), "Substituted x = 0"),
    "y = -16 + 9 = -7": A(ok(T(EVAL, FEAT), "y-intercept")),
    "\\text{turning point } (-4, 9)": wrong(
      T(FEAT),
      "Turning point",
      "The number inside the bracket is subtracted from x. The turning point's x makes the bracket zero.",
      "Which x makes (x − 4) zero?",
      TP_SIGN,
    ),
  },
  "ps5-q4": {
    "3x^2 - 10x - 8 = 0": ok(T(QUAD), "Set y to zero"),
    "ac = -24,\\quad -12 + 2 = -10": ok(T(NONMONIC), "Found the split"),
    "3x^2 - 12x + 2x - 8 = 0": ok(T(NONMONIC), "Split the middle term"),
    "3x(x - 4) + 2(x - 4) = 0": ok(T(NONMONIC), "Grouped"),
    "(3x + 2)(x - 4) = 0": ok(T(NONMONIC), "Factorised"),
    "x = -\\tfrac{2}{3} \\;\\text{or}\\; x = 4": A(ok(T(NFL, ZERO, FRAC), "x-intercepts")),
    "3x^2 - 10x - 8 = (3x + 2)(x - 4)": okc(T(NONMONIC), "Factorised in one line, the split not shown"),
    "(3x - 4)(x + 2) = 0": wrong(
      T(NONMONIC),
      "Factorised",
      "With a 3 in front of x², a pair that multiplies to the constant can still give the wrong middle term. Nothing here was expanded back.",
      "Expand (3x − 4)(x + 2). What x term do you get?",
      GUESSED_PAIR,
    ),
    "x = \\tfrac{4}{3} \\;\\text{or}\\; x = -2": A(ok(T(NFL, ZERO), "x-intercepts", true)),
    "(3x - 2)(x + 4) = 0": wrong(
      T(NONMONIC),
      "Factorised",
      "The split was right, but the signs went to the wrong brackets on the way into the factors. Expanding back shows the middle term's sign at once.",
      "Expand (3x − 2)(x + 4). Is the x term −10x or +10x?",
      "signs swapped in the pair",
    ),
    "x = \\tfrac{2}{3} \\;\\text{or}\\; x = -4": A(ok(T(NFL, ZERO), "x-intercepts", true)),
    "x = -\\tfrac{3}{2} \\;\\text{or}\\; x = 4": A(wrong(
      T(FRAC),
      "x-intercepts",
      "The factors were right. Solving the factor with a coefficient on x turned the fraction over. Substituting the root back into its own factor is a one-line check.",
      "Solve 3x + 2 = 0 one step at a time. What is x?",
      "fraction flipped solving a factor",
    )),
  },
  "ps5-q5": {
    "x = -\\dfrac{b}{2a} = -\\dfrac{6}{2} = -3": ok(T(FEAT, FRAC), "Axis of symmetry"),
    "y = (-3)^2 + 6(-3) + 5 = -4": ok(T(EVAL), "Height on the axis"),
    "\\text{turning point } (-3, -4)": A(ok(T(FEAT, SKETCH), "Turning point")),
    "x = \\dfrac{6}{2} = 3": wrong(
      T(FEAT),
      "Axis of symmetry",
      "The axis formula starts with a minus. With every coefficient positive, the turning point has to sit left of the y-axis.",
      "The formula is x = −b/2a. Where did the minus go?",
      "axis without the minus",
    ),
    "y = 3^2 + 6(3) + 5 = 32": ok(T(EVAL), "Height on the axis", true),
    "\\text{turning point } (3, 32)": A(ok(T(FEAT, SKETCH), "Turning point", true)),
    "y = -9 - 18 + 5 = -22": wrong(
      T(EVAL),
      "Height on the axis",
      "Squaring a negative number gives a positive one. A bracket around the −3 before squaring keeps the sign honest.",
      "What is (−3)²?",
      "(−3)² taken as −9",
    ),
    "\\text{turning point } (-3, -22)": A(ok(T(FEAT, SKETCH), "Turning point", true)),
  },
  "ps5-q6": {
    "y = (x^2 - 8x + 16) - 16 + 10": ok(T(BINOM, QUAD), "Added and took away 16"),
    "y = (x - 4)^2 - 6": ok(T(BINOM), "Turning-point form"),
    "\\text{turning point } (4, -6)": A(ok(T(FEAT), "Turning point")),
    "x^2 - 8x + 10 = (x - 4)^2 - 6": okc(T(BINOM), "Completed the square in one line"),
    "y = (x^2 - 8x + 16) + 10": wrong(
      T(BINOM),
      "Completed the square",
      "Completing the square adds a number to make a perfect square. Whatever is added has to be taken away again, or the rule changes.",
      "Expand your answer back. Do you get x² − 8x + 10?",
      "16 added, never taken away",
    ),
    "y = (x - 4)^2 + 10": ok(T(BINOM), "Turning-point form", true),
    "\\text{turning point } (4, 10)": A(ok(T(FEAT), "Turning point", true)),
    "\\text{turning point } (-4, -6)": A(wrong(
      T(FEAT),
      "Turning point",
      "The form was right. Reading h off it lost the sign: the turning point's x makes the bracket zero.",
      "Which x makes (x − 4)² zero?",
      TP_SIGN,
    )),
  },
  "ps5-q7": {
    "y = 2(x^2 - 6x + 9) - 5": ok(T(BINOM), "Expanded the square"),
    "y = 2x^2 - 12x + 18 - 5": ok(T(EXPAND), "Distributed the 2"),
    "y = 2x^2 - 12x + 13": ok(T(EXPAND), "Standard form"),
    "y\\text{-intercept } (0, 13)": A(ok(T(FEAT), "y-intercept")),
    "y = 2(x^2 + 9) - 5": wrong(
      T(BINOM),
      "Expanded the square",
      "A squared bracket is the bracket times itself, and that makes a middle term. Squaring each term on its own loses it.",
      "Write (x − 3)² as (x − 3)(x − 3) and expand. What is the middle term?",
      "squared each term separately",
    ),
    "y = 2x^2 + 18 - 5": ok(T(EXPAND), "Distributed the 2", true),
    "y = 2x^2 + 13": ok(T(EXPAND), "Standard form", true),
    "y = 2x^2 - 6x + 9 - 5": wrong(
      T(EXPAND),
      "Distributed the 2",
      "The number in front of a bracket multiplies every term inside it, not just the first.",
      "The 2 multiplied x². What happens to −6x and 9?",
      "the 2 on x² only",
    ),
    "y = 2x^2 - 6x + 4": ok(T(EXPAND), "Standard form", true),
    "y\\text{-intercept } (0, 4)": A(ok(T(FEAT), "y-intercept", true)),
  },
  "ps5-q8": {
    "ac = -6,\\quad 6 + (-1) = 5": ok(T(NONMONIC), "Found the split"),
    "y = (2x - 1)(x + 3)": ok(T(NONMONIC), "Factorised"),
    "x = \\tfrac{1}{2} \\;\\text{or}\\; x = -3": A(ok(T(NFL, ZERO, FRAC), "x-intercepts")),
    "x = \\dfrac{\\tfrac{1}{2} + (-3)}{2} = -\\tfrac{5}{4}": A(ok(T(FEAT, FRAC), "Axis of symmetry")),
    "y = (2x + 1)(x - 3)": wrong(
      T(NONMONIC),
      "Factorised",
      "With a 2 in front of x², a pair that multiplies to the constant can still give the wrong middle term. Nothing here was expanded back.",
      "Expand (2x + 1)(x − 3). Do you get +5x?",
      GUESSED_PAIR,
    ),
    "x = -\\tfrac{1}{2} \\;\\text{or}\\; x = 3": A(ok(T(NFL, ZERO), "x-intercepts", true)),
    "x = \\dfrac{-\\tfrac{1}{2} + 3}{2} = \\tfrac{5}{4}": A(ok(T(FEAT, FRAC), "Axis of symmetry", true)),
    "y = (2x + 3)(x - 1)": wrong(
      T(NONMONIC),
      "Factorised",
      "With a 2 in front of x², a pair that multiplies to the constant can still give the wrong middle term. Nothing here was expanded back.",
      "Expand (2x + 3)(x − 1). What x term do you get?",
      GUESSED_PAIR,
    ),
    "x = -\\tfrac{3}{2} \\;\\text{or}\\; x = 1": A(ok(T(NFL, ZERO), "x-intercepts", true)),
    "x = \\dfrac{-\\tfrac{3}{2} + 1}{2} = -\\tfrac{1}{4}": A(ok(T(FEAT, FRAC), "Axis of symmetry", true)),
    "x = \\dfrac{\\tfrac{1}{2} + (-3)}{2} = -\\tfrac{5}{2}": A(wrong(
      T(FRAC),
      "Axis of symmetry",
      "The axis sits halfway between the intercepts: their sum, then halved. The halving got lost in the fraction.",
      "½ + (−3) is −5/2. What is half of that?",
      "roots' sum never halved",
    )),
  },
  "ps5-q9": {
    "a = -1 < 0 \\Rightarrow \\text{concave down}": ok(T(SKETCH), "Shape"),
    "y\\text{-intercept } (0, 8)": ok(T(FEAT), "y-intercept"),
    "-(x^2 - 2x - 8) = -(x - 4)(x + 2) = 0": ok(T(EXPAND, MONIC), "Took out −1, factorised"),
    "x = 4 \\;\\text{or}\\; x = -2": ok(T(NFL, ZERO), "x-intercepts"),
    "x = 1,\\; y = -1 + 2 + 8 = 9": ok(T(FEAT, EVAL), "Height on the axis"),
    "\\text{maximum turning point } (1, 9)": A(ok(T(FEAT, SKETCH), "Turning point")),
    "a = -1 < 0 \\Rightarrow \\text{concave up}": wrong(
      T(SKETCH),
      "Shape",
      "The sign of a decides which way the parabola opens. Picture y = −x²: does it open up or down?",
      "a is negative. Does the graph have a highest point or a lowest point?",
      "negative a, concave up",
    ),
    "\\text{minimum turning point } (1, 9)": A(ok(T(FEAT, SKETCH), "Turning point", true)),
    "-(x^2 + 2x - 8) = -(x + 4)(x - 2) = 0": wrong(
      T(EXPAND),
      "Took out −1, factorised",
      "Taking −1 out of a sum changes the sign of every term left inside. Expanding back shows whether it did.",
      "Expand −(x² + 2x − 8). Do you get −x² + 2x + 8?",
      "sign left behind in bracket",
    ),
    "x = -4 \\;\\text{or}\\; x = 2": ok(T(NFL, ZERO), "x-intercepts", true),
    "-(x^2 - 2x - 8) = -(x - 8)(x + 1) = 0": wrong(
      T(MONIC),
      "Took out −1, factorised",
      "A pair for x² − 2x − 8 has to multiply to −8 and add to −2. A pair that only multiplies gives the wrong middle term, and expanding back shows it.",
      "Expand (x − 8)(x + 1). Is the x term −2x?",
      "pair multiplies, doesn't add",
    ),
    "x = 8 \\;\\text{or}\\; x = -1": ok(T(NFL, ZERO), "x-intercepts", true),
    "x = -1,\\; y = -1 - 2 + 8 = 5": ok(T(FEAT, EVAL), "Height on the axis", true),
    "\\text{maximum turning point } (-1, 5)": A(ok(T(FEAT, SKETCH), "Turning point", true)),
  },
  "ps5-q10": {
    "\\text{turning point } (2, 1)": ok(T(WORDED, FEAT), "Read the turning point"),
    "-\\tfrac{1}{4}(x - 2)^2 + 1 = 0": ok(T(WORDED, ZERO), "Height zero"),
    "(x - 2)^2 = 4": ok(T(LIN, FRAC), "Rearranged"),
    "x - 2 = \\pm 2": ok(T(QUAD), "Square root, both signs"),
    "x = 0 \\;\\text{or}\\; x = 4": ok(T(ZERO), "Solved"),
    "\\text{The water reaches 1 m and lands 4 m from the nozzle}": A(ok(T(CONCL), "In context")),
    "x = 4": okc(T(ZERO), "Landing point, the working not shown"),
    "\\text{The water reaches 1 m and lands 0 m from the nozzle}": A(wrong(
      T(CONCL),
      "In context",
      "Both solutions are where the height is zero, but only one of them is where the water comes down. The other is where it leaves.",
      "The nozzle is at x = 0. Which solution is where the water lands?",
      "landed at the nozzle",
    )),
    "\\text{The water reaches 2 m and lands 4 m from the nozzle}": A(wrong(
      T(FEAT),
      "In context",
      "The turning point's two numbers answer different questions: the first is how far along, the second how high.",
      "In the turning point (2, 1), which number is the height?",
      "axis given as the height",
    )),
  },
};
