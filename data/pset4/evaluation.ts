import { A, ok, okc, T, wrong, type LineVerdict } from "../evaluation";
import type { LeafId } from "../taxonomy";

/**
 * Problem Set 4's scripted evaluation (ticket 214): every line any of the class wrote on the set, with its
 * verdict and tags, in the shape of Problem Set 6's table (`data/evaluation.ts`) and read through the same
 * `evaluateLine`. A wrong line carries only the leaf of its slip (the Mistakes tab's chip reads the first);
 * a line that is right given a wrong line above is `builtOn`. The same name on two problems is the same
 * habit: a guessed non-monic pair (Q1, Q2, Q4), a square added and never taken away (Q6, Q8, Q9), half of
 * b with the wrong sign (Q6, Q7), a turning point's sign (Q8, Q9), a fraction flipped solving a factor (Q3, Q4).
 */
const QUAD: LeafId = "algebra.equations.quadratic";
const LIN: LeafId = "algebra.equations.linear";
const MONIC: LeafId = "algebra.expand-factor.monic";
const NONMONIC: LeafId = "algebra.expand-factor.nonmonic";
const EXPAND: LeafId = "algebra.expand-factor.expand";
const BINOM: LeafId = "algebra.expand-factor.binomial";
const FRAC: LeafId = "algebra.number.fractions";
const NFL: LeafId = "functions.zeros.nfl";
const ZERO: LeafId = "functions.zeros.zero-finding";
const FEAT: LeafId = "graphing.quadratics.features";
const WORDED: LeafId = "reasoning.interpret.worded";
const CONCL: LeafId = "reasoning.justify.conclusions";

/** The mistake names shared across problems. */
const GUESSED_PAIR = "guessed pair, not expanded back";
const SIGNS_SWAPPED = "signs swapped in the pair";
const FRACTION_FLIPPED = "fraction flipped solving a factor";
const ROOT_SIGN = "sign lost solving a factor";
const NOT_TAKEN_AWAY = "square added, never taken away";
const HALF_B_SIGN = "half of b, wrong sign";
const TP_SIGN = "turning point sign flipped";

const guessed = (product: string, got: string): LineVerdict =>
  A(wrong(
    T(NONMONIC),
    "Factorised",
    "With a number in front of x², a pair that multiplies to the constant can still give the wrong middle term. Nothing here was expanded back.",
    `Expand ${product}. Do you get ${got}?`,
    GUESSED_PAIR,
  ));

export const PS4_EVALUATION: Record<string, Record<string, LineVerdict>> = {
  "ps4-q1": {
    "ac = -4,\\quad 4 + (-1) = 3": ok(T(NONMONIC), "Found the split"),
    "2x^2 + 4x - x - 2": ok(T(NONMONIC), "Split the middle term"),
    "2x(x + 2) - 1(x + 2)": ok(T(NONMONIC), "Grouped"),
    "(2x - 1)(x + 2)": A(ok(T(NONMONIC), "Factorised")),
    "2x^2 + 3x - 2 = (2x - 1)(x + 2)": A(okc(T(NONMONIC), "Factorised in one line, the split not shown")),
    "(2x + 1)(x - 2)": A(wrong(
      T(NONMONIC),
      "Factorised",
      "The split was right, but its signs went into the wrong brackets. Expanding back shows the middle term's sign at once.",
      "Expand (2x + 1)(x − 2). Is the x term +3x or −3x?",
      SIGNS_SWAPPED,
    )),
    "(2x + 2)(x - 1)": guessed("(2x + 2)(x − 1)", "+3x"),
  },
  "ps4-q2": {
    "ac = -30,\\quad 6 + (-5) = 1": ok(T(NONMONIC), "Found the split"),
    "3x^2 + 6x - 5x - 10": ok(T(NONMONIC), "Split the middle term"),
    "3x(x + 2) - 5(x + 2)": ok(T(NONMONIC), "Grouped"),
    "(3x - 5)(x + 2)": A(ok(T(NONMONIC), "Factorised")),
    "3x^2 + x - 10 = (3x - 5)(x + 2)": A(okc(T(NONMONIC), "Factorised in one line, the split not shown")),
    "(3x + 5)(x - 2)": A(wrong(
      T(NONMONIC),
      "Factorised",
      "The split was right, but its signs went into the wrong brackets. Expanding back shows the middle term's sign at once.",
      "Expand (3x + 5)(x − 2). Is the x term +x or −x?",
      SIGNS_SWAPPED,
    )),
    "(3x + 2)(x - 5)": guessed("(3x + 2)(x − 5)", "+x"),
    "(3x - 2)(x + 5)": guessed("(3x − 2)(x + 5)", "+x"),
  },
  "ps4-q3": {
    "x - 4 = 0 \\;\\text{or}\\; 2x + 1 = 0": ok(T(NFL, ZERO), "Each factor zero"),
    "x = 4 \\;\\text{or}\\; 2x = -1": ok(T(LIN, ZERO), "Solved the first, rearranged the second"),
    "x = 4 \\;\\text{or}\\; x = -\\tfrac{1}{2}": A(ok(T(ZERO, FRAC), "Solutions")),
    "(x - 4)(2x + 1) = 0 \\Rightarrow x = 4, -\\tfrac{1}{2}": A(okc(T(NFL, ZERO, FRAC), "Solved in one line, each factor not set to zero")),
    "x + 4 = 0 \\;\\text{or}\\; 2x + 1 = 0": wrong(
      T(NFL),
      "Each factor zero",
      "The null factor law sets each factor to zero as it is printed. Changing a sign first makes a different product.",
      "Which factors are in (x − 4)(2x + 1)? Set each of those to zero.",
      "factor's sign flipped",
    ),
    "x = -4 \\;\\text{or}\\; 2x = -1": ok(T(LIN, ZERO), "Solved the first, rearranged the second", true),
    "x = -4 \\;\\text{or}\\; x = -2": A(wrong(
      T(FRAC),
      "Solutions",
      "Dividing both sides by 2 puts the 2 underneath. Turning the fraction over gives a number that doesn't make the factor zero.",
      "Put x = −2 into 2x + 1. Is it zero?",
      FRACTION_FLIPPED,
    )),
    "x = 4 \\;\\text{or}\\; x = -2": A(wrong(
      T(FRAC),
      "Solutions",
      "The factors were right. Solving 2x = −1 turned the fraction over; substituting the root back into its own factor is a one-line check.",
      "Solve 2x = −1 by dividing by 2. What is x?",
      FRACTION_FLIPPED,
    )),
  },
  "ps4-q4": {
    "ac = 6,\\quad -6 + (-1) = -7": ok(T(NONMONIC), "Found the split"),
    "2x^2 - 6x - x + 3 = 0": ok(T(NONMONIC), "Split the middle term"),
    "2x(x - 3) - 1(x - 3) = 0": ok(T(NONMONIC), "Grouped"),
    "(2x - 1)(x - 3) = 0": ok(T(NONMONIC), "Factorised"),
    "2x - 1 = 0 \\;\\text{or}\\; x - 3 = 0": ok(T(NFL, ZERO), "Each factor zero"),
    "x = \\tfrac{1}{2} \\;\\text{or}\\; x = 3": A(ok(T(ZERO, FRAC), "Solutions")),
    "2x^2 - 7x + 3 = (2x - 1)(x - 3)": okc(T(NONMONIC), "Factorised in one line, the split not shown"),
    "(2x - 3)(x - 1) = 0": wrong(
      T(NONMONIC),
      "Factorised",
      "With a 2 in front of x², a pair that multiplies to the constant can still give the wrong middle term. Nothing here was expanded back.",
      "Expand (2x − 3)(x − 1). Do you get −7x?",
      GUESSED_PAIR,
    ),
    "2x - 3 = 0 \\;\\text{or}\\; x - 1 = 0": ok(T(NFL, ZERO), "Each factor zero", true),
    "x = \\tfrac{3}{2} \\;\\text{or}\\; x = 1": A(ok(T(ZERO, FRAC), "Solutions", true)),
    "(2x - 1)(x + 3) = 0": wrong(
      T(NONMONIC),
      "Factorised",
      "The brackets multiply to −3, and the equation ends in +3. A guessed pair's signs have to be expanded back before they are solved.",
      "Expand (2x − 1)(x + 3). Do you get 2x² − 7x + 3?",
      GUESSED_PAIR,
    ),
    "2x - 1 = 0 \\;\\text{or}\\; x + 3 = 0": ok(T(NFL, ZERO), "Each factor zero", true),
    "x = -\\tfrac{1}{2} \\;\\text{or}\\; x = -3": A(wrong(
      T(ZERO),
      "Solutions",
      "Moving the 1 across changes its sign. Substituting each root back into its own factor is a one-line check.",
      "Put x = −½ into 2x − 1. Is it zero?",
      ROOT_SIGN,
    )),
    "x = -\\tfrac{1}{2} \\;\\text{or}\\; x = 3": A(wrong(
      T(ZERO),
      "Solutions",
      "The factors were right, but solving one of them didn't keep its sign. Substituting each root back into its own factor is a one-line check.",
      "Put x = −½ into 2x − 1. Is it zero?",
      ROOT_SIGN,
    )),
    "x = 2 \\;\\text{or}\\; x = 3": A(wrong(
      T(FRAC),
      "Solutions",
      "The factors were right. Solving the factor with a 2 on x turned the fraction over.",
      "Solve 2x − 1 = 0 one step at a time. What is x?",
      FRACTION_FLIPPED,
    )),
  },
  "ps4-q5": {
    "x^2 - 3x - 10 = 0": ok(T(QUAD, ZERO), "Made one side zero"),
    "(x - 5)(x + 2) = 0": ok(T(MONIC), "Factorised"),
    "x - 5 = 0 \\;\\text{or}\\; x + 2 = 0": ok(T(NFL, ZERO), "Each factor zero"),
    "x = 5 \\;\\text{or}\\; x = -2": A(ok(T(ZERO), "Solutions")),
    "x^2 - 3x + 10 = 0": wrong(
      T(QUAD),
      "Made one side zero",
      "Moving a term to the other side changes its sign. The 10 is on the right; on the left it is −10.",
      "Take 10 from both sides of x² − 3x = 10. What is left on the left?",
      "the 10's sign kept",
    ),
    "x^2 + 3x - 10 = 0": wrong(
      T(QUAD),
      "Made one side zero",
      "Only the 10 moves. A sign changed on a term that stayed where it was, so this is a different equation.",
      "Compare your line with x² − 3x = 10. Which term changed that shouldn't have?",
      "sign lost rearranging",
    ),
    "(x + 5)(x - 2) = 0": ok(T(MONIC), "Factorised", true),
    "x + 5 = 0 \\;\\text{or}\\; x - 2 = 0": ok(T(NFL, ZERO), "Each factor zero", true),
    "x = -5 \\;\\text{or}\\; x = 2": A(ok(T(ZERO), "Solutions", true)),
    "x(x - 3) = 10": ok(T(QUAD), "Took out x"),
    "x = 5": A(wrong(
      T(QUAD),
      "Solutions",
      "Factorising while the equation equals 10 leaves only guessing. A quadratic can have two solutions, and one side zero finds both.",
      "Make one side zero first. How many solutions do you get?",
      "one root, found by trying",
    )),
    "x = 10 \\;\\text{or}\\; x - 3 = 10": wrong(
      T(NFL),
      "Each factor zero",
      "A rule got used where it doesn't apply. The null factor law needs the product to equal zero.",
      "What does x(x − 3) equal here? Does the null factor law work for that?",
      "null factor law without zero",
    ),
    "x = 10 \\;\\text{or}\\; x = 13": A(ok(T(ZERO), "Solutions", true)),
    "x = 5 \\;\\text{or}\\; x = 2": A(wrong(
      T(ZERO),
      "Solutions",
      "A root makes its own factor zero, so its sign is the opposite of the one in the bracket.",
      "Put x = 2 into x + 2. Is it zero?",
      "root's sign copied from bracket",
    )),
    "(x - 10)(x + 1) = 0": wrong(
      T(MONIC),
      "Factorised",
      "A pair for x² − 3x − 10 has to multiply to −10 and add to −3. This pair only multiplies, and expanding back shows it.",
      "Expand (x − 10)(x + 1). Is the x term −3x?",
      "pair multiplies, doesn't add",
    ),
    "x - 10 = 0 \\;\\text{or}\\; x + 1 = 0": ok(T(NFL, ZERO), "Each factor zero", true),
    "x = 10 \\;\\text{or}\\; x = -1": A(ok(T(ZERO), "Solutions", true)),
  },
  "ps4-q6": {
    "x^2 + 6x + 9 - 9 + 2": ok(T(BINOM), "Added and took away 9"),
    "(x + 3)^2 - 9 + 2": ok(T(BINOM, MONIC), "Wrote the perfect square"),
    "(x + 3)^2 - 7": A(ok(T(BINOM), "Collected the constants")),
    "x^2 + 6x + 2 = (x + 3)^2 - 7": A(okc(T(BINOM, MONIC), "Completed the square in one line")),
    "x^2 + 6x + 9 + 2": wrong(
      T(BINOM),
      "Added 9",
      "Completing the square adds a number to make a perfect square. Whatever is added has to be taken away again, or the expression changes.",
      "Expand your answer back. Do you get x² + 6x + 2?",
      NOT_TAKEN_AWAY,
    ),
    "(x + 3)^2 + 2": A(ok(T(BINOM, MONIC), "Wrote the perfect square", true)),
    "x^2 + 6x + 2 = x^2 + 6x + 9 + 2": wrong(
      T(BINOM),
      "Added 9",
      "The two sides are no longer equal: 9 was added to one of them. Whatever is added to make the square has to be taken away again.",
      "Is x² + 6x + 2 equal to x² + 6x + 11?",
      NOT_TAKEN_AWAY,
    ),
    "x^2 + 6x + 2 = (x + 3)^2 + 2": A(wrong(
      T(BINOM),
      "Completed the square",
      "Completing the square adds a number to make a perfect square. Whatever is added has to be taken away again, or the expression changes.",
      "Expand (x + 3)² + 2. Do you get x² + 6x + 2?",
      NOT_TAKEN_AWAY,
    )),
    "(x + 3)^2 + 9 + 2": wrong(
      T(BINOM),
      "Wrote the perfect square",
      "The 9 inside the square was added to make it; outside, it has to come off. Its sign went the wrong way on the way out.",
      "(x + 3)² is x² + 6x + 9. What do you take away to get back to x² + 6x?",
      "the 9 added back",
    ),
    "(x + 3)^2 + 11": A(ok(T(BINOM), "Collected the constants", true)),
    "(x - 3)^2 - 9 + 2": wrong(
      T(BINOM),
      "Wrote the perfect square",
      "The number in the bracket is half of b, sign and all. A minus in the bracket makes a −6x when it is expanded.",
      "Expand (x − 3)². Is the middle term +6x?",
      HALF_B_SIGN,
    ),
    "(x - 3)^2 - 7": A(ok(T(BINOM), "Collected the constants", true)),
  },
  "ps4-q7": {
    "x^2 - 5x + \\tfrac{25}{4} - \\tfrac{25}{4} + 1": ok(T(BINOM, FRAC), "Added and took away (5/2)²"),
    "\\left(x - \\tfrac{5}{2}\\right)^2 - \\tfrac{25}{4} + 1": ok(T(BINOM, MONIC, FRAC), "Wrote the perfect square"),
    "\\left(x - \\tfrac{5}{2}\\right)^2 - \\tfrac{21}{4}": A(ok(T(BINOM, FRAC), "Collected the constants")),
    "x^2 - 5x + \\tfrac{25}{2} - \\tfrac{25}{2} + 1": wrong(
      T(FRAC),
      "Added and took away (5/2)²",
      "Squaring a fraction squares the top and the bottom. Squaring only the top leaves the wrong number to add and take away.",
      "What is (5/2)²? Square the 2 as well.",
      "(5/2)² taken as 25/2",
    ),
    "\\left(x - \\tfrac{5}{2}\\right)^2 - \\tfrac{25}{2} + 1": ok(T(BINOM, MONIC, FRAC), "Wrote the perfect square", true),
    "\\left(x - \\tfrac{5}{2}\\right)^2 - \\tfrac{23}{2}": A(ok(T(BINOM, FRAC), "Collected the constants", true)),
    "\\left(x + \\tfrac{5}{2}\\right)^2 - \\tfrac{25}{4} + 1": wrong(
      T(BINOM),
      "Wrote the perfect square",
      "The number in the bracket is half of b, sign and all. A plus in the bracket makes a +5x when it is expanded.",
      "Expand (x + 5/2)². Is the middle term −5x?",
      HALF_B_SIGN,
    ),
    "\\left(x + \\tfrac{5}{2}\\right)^2 - \\tfrac{21}{4}": A(ok(T(BINOM, FRAC), "Collected the constants", true)),
    "(x - 5)^2 - 25 + 1": wrong(
      T(FRAC),
      "Wrote the perfect square",
      "The bracket takes half of b. A whole b makes a −10x when the square is expanded, and the number taken away is four times too big.",
      "Expand (x − 5)². Is the middle term −5x? What is half of −5?",
      "b never halved",
    ),
    "(x - 5)^2 - 24": A(ok(T(BINOM), "Collected the constants", true)),
    "\\left(x - \\tfrac{5}{4}\\right)^2 - \\tfrac{25}{16} + 1": wrong(
      T(BINOM),
      "Wrote the perfect square",
      "Half of b was halved twice on the way into the bracket. Expanding the square shows a middle term half the size it should be.",
      "Expand (x − 5/4)². Is the middle term −5x?",
      "half of −5 as −5/4",
    ),
    "\\left(x - \\tfrac{5}{4}\\right)^2 - \\tfrac{9}{16}": A(ok(T(BINOM, FRAC), "Collected the constants", true)),
    "x^2 - 5x + \\tfrac{5}{4} - \\tfrac{5}{4} + 1": wrong(
      T(FRAC, BINOM),
      "Added and took away (5/2)²",
      "The number that makes a perfect square is half of b, squared. Squaring 5/2 squares the 5 as well as the 2.",
      "What is (5/2)²? Is it 5/4?",
      "(5/2)² taken as 5/4",
    ),
    "\\left(x - \\tfrac{5}{4}\\right)^2 - \\tfrac{1}{4}": A(wrong(
      T(FRAC),
      "Wrote the perfect square",
      "The bracket takes half of b once: the halves got lost between the square and the bracket. Expanding back shows a different middle term.",
      "Half of −5 is −5/2. What goes in the bracket?",
      "half of b halved again",
    )),
  },
  "ps4-q8": {
    "2(x^2 + 4x) - 3": ok(T(EXPAND), "Took the 2 out of the x terms"),
    "2(x^2 + 4x + 4) - 8 - 3": ok(T(BINOM, EXPAND), "Added 4 inside, took away 2 × 4"),
    "2(x + 2)^2 - 11": ok(T(BINOM, FEAT), "Turning-point form"),
    "h = -2,\\; k = -11": ok(T(FEAT), "Read h and k"),
    "\\text{turning point } (-2, -11)": A(ok(T(FEAT), "Turning point")),
    "2x^2 + 8x - 3 = 2(x + 2)^2 - 11": okc(T(BINOM, EXPAND), "Completed the square in one line"),
    "h = 2,\\; k = -11": wrong(
      T(FEAT),
      "Read h and k",
      "The form was right. Turning-point form is a(x − h)² + k: a plus inside the bracket means h itself is negative.",
      "Write x + 2 as x − h. What is h?",
      TP_SIGN,
    ),
    "\\text{turning point } (2, -11)": A(ok(T(FEAT), "Turning point", true)),
    "2(x^2 + 8x) - 3": wrong(
      T(EXPAND),
      "Took the 2 out of the x terms",
      "Taking a number out of a bracket divides every term inside by it, not just the first.",
      "Expand 2(x² + 8x). Do you get 2x² + 8x?",
      "2 out of 2x² only",
    ),
    "2(x^2 + 8x + 16) - 32 - 3": ok(T(BINOM, EXPAND), "Added 16 inside, took away 2 × 16", true),
    "2(x + 4)^2 - 35": ok(T(BINOM, FEAT), "Turning-point form", true),
    "h = -4,\\; k = -35": ok(T(FEAT), "Read h and k", true),
    "\\text{turning point } (-4, -35)": A(ok(T(FEAT), "Turning point", true)),
    "2(x^2 + 4x + 4) - 3": wrong(
      T(BINOM),
      "Added 4 inside",
      "The 4 added inside the bracket is multiplied by the 2 in front, so 8 was added. Whatever is added to make the square has to be taken away again.",
      "Expand 2(x² + 4x + 4) − 3. Do you get 2x² + 8x − 3?",
      NOT_TAKEN_AWAY,
    ),
    "2(x + 2)^2 - 3": ok(T(BINOM, FEAT), "Turning-point form", true),
    "h = -2,\\; k = -3": ok(T(FEAT), "Read h and k", true),
    "\\text{turning point } (-2, -3)": A(ok(T(FEAT), "Turning point", true)),
  },
  "ps4-q9": {
    "y = (x^2 - 4x + 4) - 4 + 7": ok(T(BINOM), "Added and took away 4"),
    "y = (x - 2)^2 + 3": ok(T(BINOM, MONIC, FEAT), "Turning-point form"),
    "\\text{turning point } (2, 3)": ok(T(FEAT), "Turning point"),
    "\\text{minimum value } 3 \\text{ when } x = 2": A(ok(T(FEAT), "Minimum value")),
    "\\text{turning point } (-2, 3)": wrong(
      T(FEAT),
      "Turning point",
      "The form was right. The turning point's x is the one that makes the bracket zero, so its sign is the opposite of the one printed.",
      "Which x makes (x − 2)² zero?",
      TP_SIGN,
    ),
    "\\text{minimum value } 3 \\text{ when } x = -2": A(ok(T(FEAT), "Minimum value", true)),
    "\\text{minimum value } 2": A(wrong(
      T(FEAT),
      "Minimum value",
      "The turning point's two numbers answer different questions: the first is where along, the second is the value there.",
      "In the turning point (2, 3), which number is the value of y?",
      "x given as the minimum",
    )),
    "\\text{minimum value } 7 \\text{ when } x = 2": A(wrong(
      T(FEAT),
      "Minimum value",
      "The value came off the line in the question, not the completed square. Only turning-point form shows the least value.",
      "Put x = 2 into (x − 2)² + 3. What is y?",
      "value read off wrong line",
    )),
    "y = (x^2 - 4x + 4) + 7": wrong(
      T(BINOM),
      "Added 4",
      "Completing the square adds a number to make a perfect square. Whatever is added has to be taken away again, or the rule changes.",
      "Expand your answer back. Do you get x² − 4x + 7?",
      NOT_TAKEN_AWAY,
    ),
    "y = (x - 2)^2 + 7": ok(T(BINOM, MONIC, FEAT), "Turning-point form", true),
    "\\text{turning point } (2, 7)": ok(T(FEAT), "Turning point", true),
  },
  "ps4-q10": {
    "\\text{width } w,\\; \\text{length } 2w + 3": ok(T(WORDED), "Named the lengths"),
    "w(2w + 3) = 35": ok(T(WORDED, QUAD), "Area as an equation"),
    "2w^2 + 3w - 35 = 0": ok(T(QUAD, EXPAND), "Expanded, one side zero"),
    "ac = -70,\\quad 10 + (-7) = 3": ok(T(NONMONIC), "Found the split"),
    "(2w - 7)(w + 5) = 0": ok(T(NONMONIC), "Factorised"),
    "w = \\tfrac{7}{2} \\;\\text{or}\\; w = -5": ok(T(NFL, ZERO), "Null factor law"),
    "w > 0 \\Rightarrow w = \\tfrac{7}{2}": ok(T(CONCL), "A width is positive"),
    "\\text{length } 2(3.5) + 3 = 10,\\; 3.5 \\times 10 = 35": ok(T(CONCL), "Checked the area"),
    "\\text{The width is 3.5 cm}": A(ok(T(CONCL), "In context")),
    "2w^2 + 3w - 35 = (2w - 7)(w + 5) = 0": okc(T(QUAD, NONMONIC), "Expanded and factorised in one line"),
    "w = \\tfrac{7}{2}": okc(T(NFL, ZERO, CONCL), "The positive solution only, the other not shown"),
    "\\text{length } 2(-5) + 3 = -7,\\; (-5)(-7) = 35": ok(T(CONCL), "Checked the second solution"),
    "\\text{The width is 3.5 cm or } -5 \\text{ cm}": A(wrong(
      T(CONCL),
      "In context",
      "Both solutions make the area 35, but only one of them can be a length. A check that passes on the numbers can still fail on the situation.",
      "Can a rectangle have a width of −5 cm?",
      "negative width kept",
    )),
    "\\text{The width is } -5 \\text{ cm}": A(wrong(
      T(CONCL),
      "In context",
      "The working found two solutions and the sentence gives the one a rectangle can't have. Reading the answer back against the question catches it.",
      "Can a rectangle have a width of −5 cm? Which solution is left?",
      "negative width given",
    )),
    "\\text{The width is 10 cm}": A(wrong(
      T(CONCL),
      "In context",
      "The working is right, but the sentence gives the other side. The question named w as the width and 2w + 3 as the length.",
      "Which of 3.5 and 10 is w?",
      "width and length swapped",
    )),
  },
};
