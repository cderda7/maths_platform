import { A, ok, okc, T, wrong, type LineVerdict } from "../evaluation";
import type { LeafId } from "../taxonomy";

/**
 * Problem Set 3's scripted evaluation (ticket 213): every line any of the class wrote on the set, with its
 * verdict and tags, read through the same `evaluateLine` as every other set. A wrong line's `name` is the
 * teacher's name for the mistake; the same name on two problems is the same habit (a pair guessed and not
 * expanded back on Q5 and Q8, a pair that multiplies but does not add on Q5 and Q8, x² − 49 as (x − 7)² on Q4).
 */
const EXPAND: LeafId = "algebra.expand-factor.expand";
const MONIC: LeafId = "algebra.expand-factor.monic";
const NONMONIC: LeafId = "algebra.expand-factor.nonmonic";
const BINOM: LeafId = "algebra.expand-factor.binomial";
const FORMAL: LeafId = "reasoning.justify.formal";

/** The mistake names shared across problems. */
const GUESSED_PAIR = "pair guessed, not expanded back";
const PAIR_NOT_ADDING = "pair multiplies, doesn't add";
const SIGN_FLIPPED = "sign flipped writing the pair";
const CHECK_COPIED = "check copied from the question";

/** A wrong line that also skips a step a reader could not follow. */
const compound = (v: LineVerdict): LineVerdict => ({ ...v, compounds: true });

export const PS3_EVALUATION: Record<string, Record<string, LineVerdict>> = {
  "ps3-q1": {
    "x^2 - 7x + 4x - 28": ok(T(EXPAND), "Every term by every term"),
    "x^2 - 3x - 28": A(ok(T(EXPAND), "Collected like terms")),
    "x^2 - 7x + 4x + 28": wrong(
      T(EXPAND),
      "Every term by every term",
      "A positive times a negative is negative. The sign of each product comes from multiplying both signs, not from copying one of them.",
      "What is 4 × (−7)?",
      "4 × (−7) as +28",
    ),
    "x^2 - 3x + 28": A(ok(T(EXPAND), "Collected like terms", true)),
    "x^2 + 3x - 28": A(wrong(
      T(EXPAND),
      "Collected like terms",
      "The four terms were right. Collecting −7x and +4x gives the sign of the larger one.",
      "What is −7x + 4x?",
      "sign lost collecting like terms",
    )),
    "x^2 - 7x + 4x - 7": wrong(
      T(EXPAND),
      "Every term by every term",
      "Each term in the first bracket multiplies every term in the second. The 4 has two terms to multiply, not one.",
      "The 4 multiplied x. What does it do to the −7?",
      "the 4 on x only",
    ),
    "x^2 - 3x - 7": A(ok(T(EXPAND), "Collected like terms", true)),
  },
  "ps3-q2": {
    "(2x)^2 - 2(2x)(3) + 3^2": ok(T(BINOM), "Used (a − b)² = a² − 2ab + b²"),
    "4x^2 - 12x + 9": A(ok(T(EXPAND), "Simplified")),
    "(2x)^2 + (-3)^2": wrong(
      T(BINOM),
      "Squared the bracket",
      "A squared bracket is the bracket times itself, and multiplying it out makes a middle term. Squaring each term on its own loses it.",
      "Write (2x − 3)² as (2x − 3)(2x − 3) and expand. What is the x term?",
      "squared each term separately",
    ),
    "4x^2 + 9": A(ok(T(EXPAND), "Simplified", true)),
    "(2x)^2 - 3^2": wrong(
      T(BINOM),
      "Squared the bracket",
      "a² − b² is (a + b)(a − b), the difference of two squares. A perfect square (a − b)² has a middle term −2ab.",
      "Expand (2x − 3)(2x − 3). Does it come to 4x² − 9?",
      "square taken as difference",
    ),
    "4x^2 - 9": A(ok(T(EXPAND), "Simplified", true)),
    "(2x)^2 - 2(2x)(-3) + 3^2": wrong(
      T(BINOM),
      "Used (a − b)² = a² − 2ab + b²",
      "The identity's minus already carries the bracket's sign. Putting −3 in for b as well subtracts a negative, and the middle term comes out positive.",
      "In (a − b)², what is b when the bracket is (2x − 3)?",
      "the bracket's minus used twice",
    ),
    "(2x)^2 + 2(2x)(3) + 3^2": wrong(
      T(BINOM),
      "Used (a − b)² = a² − 2ab + b²",
      "The bracket is a difference, so the middle term of its square is subtracted. (a + b)² is the identity with a plus.",
      "Which identity fits (2x − 3)²: (a + b)² or (a − b)²?",
      "middle term's minus lost",
    ),
    "4x^2 + 12x + 9": A(ok(T(EXPAND), "Simplified", true)),
  },
  "ps3-q3": {
    "(3x)^2 - 5^2": ok(T(BINOM), "Used (a + b)(a − b) = a² − b²"),
    "9x^2 - 25": A(ok(T(EXPAND), "Simplified")),
    "3x^2 - 25": A(wrong(
      T(EXPAND),
      "Simplified",
      "A power applies to everything in its bracket. Squaring 3x squares the 3 as well as the x.",
      "What is (3x) × (3x)?",
      "(3x)² as 3x²",
    )),
  },
  "ps3-q4": {
    "x^2 - 7^2": ok(T(BINOM), "A difference of two squares"),
    "(x - 7)(x + 7)": A(ok(T(BINOM), "Factorised")),
    "(x - 7)^2": A(wrong(
      T(BINOM),
      "Factorised",
      "A difference of two squares factorises into one bracket with a plus and one with a minus. A perfect square expands with a middle term, and there is none here.",
      "Expand (x − 7)². Do you get x² − 49?",
      "difference of squares as square",
    )),
  },
  "ps3-q5": {
    "5 \\times (-3) = -15,\\; 5 + (-3) = 2": ok(T(MONIC), "Found the pair"),
    "(x + 5)(x - 3)": A(ok(T(MONIC), "Factorised")),
    "x^2 + 2x - 15 = (x + 5)(x - 3)": A(okc(T(MONIC), "Factorised in one line, the pair not shown")),
    "-15 \\times 1 = -15": ok(T(MONIC), "A pair for −15"),
    "(x - 15)(x + 1)": A(wrong(
      T(MONIC),
      "Factorised",
      "The pair has to multiply to −15 and add to 2. −15 and 1 multiply to −15 but add to −14.",
      "What do −15 and 1 add to? Which pair adds to 2?",
      PAIR_NOT_ADDING,
    )),
    "(x + 15)(x - 1)": A(wrong(
      T(MONIC),
      "Factorised",
      "A pair that multiplies to the constant can still give the wrong middle term. Nothing here was expanded back.",
      "Expand (x + 15)(x − 1). What x term do you get?",
      GUESSED_PAIR,
    )),
    "(x - 5)(x + 3)": A(wrong(
      T(MONIC),
      "Factorised",
      "The pair was right: 5 and −3. On the way into the brackets their signs swapped.",
      "Your pair is 5 and −3. Which bracket gets the −3?",
      SIGN_FLIPPED,
    )),
    "(x - 5)(x + 3) = x^2 + 2x - 15": A(wrong(
      T(EXPAND),
      "Expanded back to check",
      "The check wrote down the question rather than the expansion. Multiplied out, the brackets give a different middle term.",
      "Expand (x − 5)(x + 3) term by term. What is the x term?",
      CHECK_COPIED,
    )),
  },
  "ps3-q6": {
    "x^2 - 2(5)x + 5^2": ok(T(BINOM), "A perfect square"),
    "(x - 5)^2": A(ok(T(BINOM, MONIC), "Factorised")),
    "x^2 - 10x + 25 = (x - 5)^2": A(okc(T(BINOM, MONIC), "Factorised in one line, the square not shown")),
    "25 = 5^2": ok(T(BINOM), "Spotted 25 as a square"),
    "(x - 5)(x + 5)": A(wrong(
      T(BINOM),
      "Factorised",
      "(x − 5)(x + 5) is a difference of two squares: it has no x term. A square number at the end does not make the whole thing a difference of squares.",
      "Expand (x − 5)(x + 5). Where did −10x go?",
      "perfect square as difference",
    )),
    "(x + 5)^2": A(wrong(
      T(BINOM),
      "Factorised",
      "The middle term of a perfect square takes the sign inside the bracket. −10x needs a minus in the bracket.",
      "Expand (x + 5)². Is the x term −10x?",
      "the square's sign flipped",
    )),
    "x^2 - 10x + 25 = (x + 5)^2": A(compound(wrong(
      T(BINOM),
      "Factorised in one line",
      "Spotting a perfect square in one go skips the line that shows its middle term, and that is the line that holds the sign.",
      "Write x² − 10x + 25 as x² − 2(5)x + 5². What sign goes in the bracket?",
      "perfect square's sign rushed",
    ))),
  },
  "ps3-q7": {
    "3(x^2 - 4x - 12)": ok(T(EXPAND), "Took out the 3"),
    "(-6) \\times 2 = -12,\\; -6 + 2 = -4": ok(T(MONIC), "Found the pair"),
    "3(x - 6)(x + 2)": A(ok(T(MONIC), "Factorised fully")),
    "3x^2 - 12x - 36 = 3(x - 6)(x + 2)": A(okc(T(EXPAND, MONIC), "Factorised fully in one line, the factor and pair not shown")),
    "-3(x^2 - 4x - 12)": wrong(
      T(EXPAND),
      "Took out the common factor",
      "Taking out a negative factor changes the sign of every term left inside. Expanding back shows whether it did.",
      "Expand −3(x² − 4x − 12). Do you get 3x² − 12x − 36?",
      "negative factor, signs kept",
    ),
    "-3(x - 6)(x + 2)": A(ok(T(MONIC), "Factorised", true)),
    "3(x^2 + 4x - 12)": wrong(
      T(EXPAND),
      "Took out the 3",
      "Dividing each term by 3 keeps its sign: −12x ÷ 3 is −4x.",
      "What is −12x ÷ 3?",
      "sign lost taking out 3",
    ),
    "6 \\times (-2) = -12,\\; 6 + (-2) = 4": ok(T(MONIC), "Found the pair", true),
    "3(x + 6)(x - 2)": A(ok(T(MONIC), "Factorised", true)),
    "(x - 6)(x + 2)": A(wrong(
      T(EXPAND),
      "Factorised fully",
      "The 3 taken out at the start is part of the expression. Expanding (x − 6)(x + 2) back gives x² − 4x − 12, a third of the question.",
      "Expand your answer. Do you get 3x² − 12x − 36?",
      "common factor left off",
    )),
    "3(x^2 - 4x) - 36": A(wrong(
      T(EXPAND),
      "Took out the common factor",
      "A common factor comes out of every term. The −36 has a factor of 3 too, and the bracket left behind can still be factorised.",
      "Is −36 a multiple of 3? What is left inside the bracket if it comes out as well?",
      "3 out of two terms",
    )),
  },
  "ps3-q8": {
    "(-3) \\times (-8) = 24,\\; -3 + (-8) = -11": ok(T(MONIC), "Found the pair"),
    "(x - 3)(x - 8)": A(ok(T(MONIC), "Factorised")),
    "(x - 3)(x - 8) = x^2 - 11x + 24": A(ok(T(EXPAND), "Expanded back to check")),
    "x^2 - 11x + 24 = (x - 3)(x - 8)": A(okc(T(MONIC), "Factorised in one line, the pair and the check not shown")),
    "3 \\times 8 = 24,\\; 3 + 8 = 11": wrong(
      T(MONIC),
      "Found the pair",
      "The pair has to add to −11, not 11. Two negatives multiply to the same 24 and add to the negative.",
      "What pair multiplies to 24 and adds to −11?",
      "pair's signs swapped",
    ),
    "(x + 3)(x + 8)": A(ok(T(MONIC), "Factorised", true)),
    "2 \\times 12 = 24": ok(T(MONIC), "A pair for 24"),
    "(x - 2)(x - 12)": A(wrong(
      T(MONIC),
      "Factorised",
      "A pair that multiplies to the constant can still give the wrong middle term. The question asked for the expansion back, and it would have shown it.",
      "Expand (x − 2)(x − 12). Is the x term −11x?",
      GUESSED_PAIR,
    )),
    "-4 \\times (-6) = 24": ok(T(MONIC), "A pair for 24"),
    "(x - 4)(x - 6)": A(wrong(
      T(MONIC),
      "Factorised",
      "The pair has to multiply to 24 and add to −11. −4 and −6 multiply to 24 but add to −10.",
      "What do −4 and −6 add to? Which pair adds to −11?",
      PAIR_NOT_ADDING,
    )),
    "(x - 3)(x + 8)": A(wrong(
      T(MONIC),
      "Factorised",
      "The pair was right: −3 and −8. On the way into the brackets one of them lost its minus.",
      "Your pair is −3 and −8. What sign does the 8 have?",
      SIGN_FLIPPED,
    )),
    "(x - 3)(x + 8) = x^2 - 11x + 24": A(wrong(
      T(EXPAND),
      "Expanded back to check",
      "The check wrote down the question rather than the expansion. Multiplied out, the brackets give a different middle term and constant.",
      "Expand (x − 3)(x + 8) term by term. What do you get?",
      CHECK_COPIED,
    )),
  },
  "ps3-q9": {
    "ac = 6,\\quad 6 + 1 = 7": ok(T(NONMONIC), "Found the split"),
    "2x^2 + 6x + x + 3": ok(T(NONMONIC), "Split the middle term"),
    "2x(x + 3) + (x + 3)": ok(T(NONMONIC), "Grouped"),
    "(2x + 1)(x + 3)": A(ok(T(NONMONIC), "Factorised")),
    "2x^2 + 7x + 3 = (2x + 1)(x + 3)": A(okc(T(NONMONIC), "Factorised in one line, the split not shown")),
    "2x \\times x = 2x^2": ok(T(NONMONIC), "First terms"),
    "3 \\times 1 = 3": ok(T(NONMONIC), "Last terms"),
    "(2x + 3)(x + 1)": A(wrong(
      T(NONMONIC),
      "Factorised",
      "With a 2 in front of x², the first and last terms can be right while the middle term is wrong. Nothing here was expanded back.",
      "Expand (2x + 3)(x + 1). Do you get 7x?",
      "non-monic pair guessed",
    )),
    "(2x + 1)(x + 1) = 2x^2 + 3x + 1": ok(T(NONMONIC), "Tried a pair"),
    "(2x + 2)(x + 1) = 2x^2 + 4x + 2": ok(T(NONMONIC), "Tried a pair"),
    "(2x + 3)(x + 1) = 2x^2 + 5x + 3": ok(T(NONMONIC), "Tried a pair"),
    "2x^2 + 7x + 3 = (2x + 3)(x + 1)": A(wrong(
      T(NONMONIC),
      "Factorised",
      "The last try expanded to 5x, not 7x: close is not equal. The split (two numbers that multiply to ac and add to b) finds the pair without trying.",
      "Your own line says (2x + 3)(x + 1) is 2x² + 5x + 3. Is that the question?",
      "stopped at a close try",
    )),
  },
  "ps3-q10": {
    "(x + 3)^2 = x^2 + 6x + 9": ok(T(BINOM, FORMAL), "Expanded the first square"),
    "(x - 3)^2 = x^2 - 6x + 9": ok(T(BINOM, FORMAL), "Expanded the second square"),
    "(x^2 + 6x + 9) - (x^2 - 6x + 9)": ok(T(EXPAND, FORMAL), "Kept the second in brackets"),
    "= x^2 + 6x + 9 - x^2 + 6x - 9": ok(T(EXPAND, FORMAL), "Took every term away"),
    "= 12x": ok(T(EXPAND), "Collected like terms"),
    "\\text{so } (x + 3)^2 - (x - 3)^2 = 12x": A(ok(T(FORMAL), "Said what was shown")),
    "x^2 + 6x + 9 - x^2 - 6x + 9 = 12x": wrong(
      T(FORMAL, EXPAND),
      "Took every term away",
      "The minus in front of the bracket changes the sign of every term inside. As written the line comes to 18, so it does not show 12x.",
      "Collect your left-hand side. Is it 12x?",
      "12x claimed, signs not changed",
    ),
    "= x^2 + 6x + 9 - x^2 + 6x + 9": wrong(
      T(FORMAL, EXPAND),
      "Took every term away",
      "Two of the three signs changed. A show-that needs every line to hold, and this one comes to 12x + 18.",
      "What is −(+9)?",
      "one sign left unchanged",
    ),
    "\\text{so } x = 12": A(wrong(
      T(FORMAL),
      "Said what was shown",
      "The working showed the two sides are equal for every x. The last line should say that, not solve for x.",
      "What did the question ask you to show?",
      "last line solves for x",
    )),
    "(x + 3)^2 = x^2 + 9": wrong(
      T(BINOM),
      "Expanded the first square",
      "A squared bracket has a middle term, 2 × x × 3. Squaring each term on its own loses it.",
      "Write (x + 3)² as (x + 3)(x + 3) and expand.",
      "squared each term separately",
    ),
  },
};
