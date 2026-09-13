import { A, ok, okc, T, wrong, type LineVerdict } from "../evaluation";
import type { LeafId } from "../taxonomy";

/**
 * Problem Set 2's scripted evaluation (ticket 212): every line any of the class wrote on the set, with its
 * verdict and tags, in the same shape as Problem Set 6's table (`data/evaluation.ts`) and read through the
 * same `evaluateLine`. A wrong line's first tag is the slip the Mistakes tab clusters on; its `name` is the
 * teacher's name for the mistake, and the same name on two problems is the same habit (a fraction turned
 * over on Q5 and Q6, the root moved onto the top on Q5 and Q6, the conjugate multiplied on the bottom only
 * on Q7 and Q8, a denominator dropped on Q9).
 */
const EXPAND: LeafId = "algebra.expand-factor.expand";
const BINOM: LeafId = "algebra.expand-factor.binomial";
const FRAC: LeafId = "algebra.number.fractions";
const SURDS: LeafId = "algebra.number.surds";
const WORDED: LeafId = "reasoning.interpret.worded";
const CONCL: LeafId = "reasoning.justify.conclusions";

/** The mistake names shared across problems. */
const TURNED_OVER = "fraction turned over";
const TOP_NOT_BOTTOM = "rationalised the top, not bottom";
const BOTTOM_ONLY = "conjugate on the bottom only";
const MIDDLE_GUESSED = "middle terms guessed";

export const PS2_EVALUATION: Record<string, Record<string, LineVerdict>> = {
  "ps2-q1": {
    "\\sqrt{3} \\times 2\\sqrt{3} - \\sqrt{3} \\times 1": ok(T(EXPAND), "Multiplied √3 into both terms"),
    "6 - \\sqrt{3}": A(ok(T(SURDS, EXPAND), "Simplified")),
    "\\sqrt{3} \\times 2\\sqrt{3} - 1": wrong(
      T(EXPAND),
      "Multiplied √3 into both terms",
      "The number in front of a bracket multiplies every term inside it, the last one as much as the first.",
      "The √3 multiplied 2√3. What does it do to the −1?",
      "√3 on first term only",
    ),
    "6 - 1 = 5": A(ok(T(SURDS), "Simplified", true)),
    "\\sqrt{3} \\times 2\\sqrt{3} + \\sqrt{3} \\times 1": wrong(
      T(EXPAND),
      "Multiplied √3 into both terms",
      "A term's sign travels with it into the product. A positive times a negative is negative.",
      "What is √3 × (−1)?",
      "the minus not multiplied through",
    ),
    "6 + \\sqrt{3}": A(ok(T(SURDS, EXPAND), "Simplified", true)),
  },
  "ps2-q2": {
    "6 - 2\\sqrt{5} + 3\\sqrt{5} - 5": ok(T(EXPAND, SURDS), "Expanded, four terms"),
    "1 + \\sqrt{5}": A(ok(T(SURDS, EXPAND), "Collected like terms")),
    "6 - 2\\sqrt{5} + 3\\sqrt{5} + 5": wrong(
      T(SURDS, EXPAND),
      "Expanded, four terms",
      "A root times itself gives the number under it, and the signs multiply as they would for any number.",
      "What is √5 × (−√5)?",
      "√5 × (−√5) as +5",
    ),
    "11 + \\sqrt{5}": A(ok(T(SURDS, EXPAND), "Collected like terms", true)),
    "6 + 2\\sqrt{5} + 3\\sqrt{5} - 5": wrong(
      T(EXPAND),
      "Expanded, four terms",
      "Each of the four products takes its sign from both the terms it multiplies, not from the bracket the first one sits in.",
      "What is 2 × (−√5)?",
      "product's sign from the bracket",
    ),
    "1 + 5\\sqrt{5}": A(ok(T(SURDS, EXPAND), "Collected like terms", true)),
    "6 - \\sqrt{5} - 5": wrong(
      T(EXPAND),
      "Expanded, four terms",
      "Two brackets of two terms make four products. Writing all four before collecting shows what the middle comes to.",
      "Write out 2 × (−√5) and √5 × 3. What do they add to?",
      MIDDLE_GUESSED,
    ),
    "1 - \\sqrt{5}": A(ok(T(SURDS, EXPAND), "Collected like terms", true)),
    "6 - 5": wrong(
      T(EXPAND),
      "Expanded, four terms",
      "Two brackets of two terms make four products: first, outer, inner, last. Two of them are missing here.",
      "You multiplied 2 × 3 and √5 × (−√5). Which two products are left?",
      "only two of four terms",
    ),
    "1": A(ok(T(EXPAND), "Collected like terms", true)),
  },
  "ps2-q3": {
    "(\\sqrt{7})^2 + 2(\\sqrt{7})(2) + 2^2": ok(T(BINOM), "Perfect square"),
    "7 + 4\\sqrt{7} + 4": ok(T(BINOM, SURDS), "Squared the root"),
    "11 + 4\\sqrt{7}": A(ok(T(SURDS), "Simplified")),
    "7 + 2\\sqrt{7} + 4": wrong(
      T(BINOM),
      "Squared the root",
      "The middle term of (a + b)² is 2ab: the product of the two terms, then doubled. Writing the bracket out twice shows both copies.",
      "Here a = √7 and b = 2. What is 2ab?",
      "middle term not doubled",
    ),
    "11 + 2\\sqrt{7}": A(ok(T(SURDS), "Simplified", true)),
    "(\\sqrt{7})^2 + 2^2": wrong(
      T(BINOM),
      "Perfect square",
      "A squared bracket is the bracket times itself, and that makes a middle term. Squaring each term on its own loses it.",
      "Write (√7 + 2)² as (√7 + 2)(√7 + 2) and expand. How many terms do you get?",
      "squared each term separately",
    ),
    "7 + 4 = 11": A(ok(T(SURDS), "Simplified", true)),
  },
  "ps2-q4": {
    "3^2 - (\\sqrt{2})^2": ok(T(BINOM), "Difference of two squares"),
    "9 - 2 = 7": A(ok(T(SURDS), "Simplified")),
    "3^2 + (\\sqrt{2})^2": wrong(
      T(BINOM),
      "Difference of two squares",
      "(a − b)(a + b) is a difference: the middle terms cancel and the last one is subtracted. Its name says the sign.",
      "Expand (3 − √2)(3 + √2) term by term. What is the last product?",
      "difference of squares added",
    ),
    "9 + 2 = 11": A(ok(T(SURDS), "Simplified", true)),
  },
  "ps2-q5": {
    "\\dfrac{6}{\\sqrt{3}} \\times \\dfrac{\\sqrt{3}}{\\sqrt{3}}": ok(T(SURDS, FRAC), "Multiplied by √3 over √3"),
    "\\dfrac{6\\sqrt{3}}{3}": ok(T(SURDS, FRAC), "Denominator rational"),
    "2\\sqrt{3}": A(ok(T(FRAC), "Cancelled")),
    "\\dfrac{\\sqrt{3}}{2}": A(wrong(
      T(FRAC),
      "Cancelled",
      "Cancelling divides the top and the bottom by the same number. The 6 on top divided by 3 leaves 2 on top.",
      "What is 6 ÷ 3, and where does it stay?",
      TURNED_OVER,
    )),
    "\\dfrac{6\\sqrt{3}}{\\sqrt{3}}": wrong(
      T(SURDS, FRAC),
      "Multiplied by √3 over √3",
      "Rationalising multiplies the top and the bottom by the same root, so the fraction keeps its value and the root leaves the bottom.",
      "Which part of the fraction still has a root in it?",
      TOP_NOT_BOTTOM,
    ),
    "6": A(ok(T(FRAC), "Cancelled", true)),
    "\\dfrac{6}{\\sqrt{3}} = 2\\sqrt{3}": A(okc(T(SURDS, FRAC), "Rationalised in one line, the √3 over √3 not shown")),
  },
  "ps2-q6": {
    "\\dfrac{\\sqrt{2}}{2\\sqrt{5}} \\times \\dfrac{\\sqrt{5}}{\\sqrt{5}}": ok(T(SURDS, FRAC), "Multiplied by √5 over √5"),
    "\\dfrac{\\sqrt{10}}{10}": A(ok(T(SURDS, FRAC), "Denominator rational")),
    "\\dfrac{2\\sqrt{5}}{\\sqrt{2}} \\times \\dfrac{\\sqrt{2}}{\\sqrt{2}}": wrong(
      T(FRAC),
      "Multiplied by √5 over √5",
      "Rationalising changes how a fraction is written, never which way up it is. The √2 starts on top and stays there.",
      "Compare your first fraction with the question. Is it the same way up?",
      TURNED_OVER,
    ),
    "\\dfrac{2\\sqrt{10}}{2}": ok(T(SURDS, FRAC), "Denominator rational", true),
    "\\sqrt{10}": A(ok(T(FRAC), "Cancelled", true)),
    "\\dfrac{\\sqrt{2}}{2\\sqrt{5}} \\times \\dfrac{\\sqrt{2}}{\\sqrt{2}}": wrong(
      T(SURDS, FRAC),
      "Multiplied by √5 over √5",
      "Rationalising clears the root from the denominator, so the multiplier is the root that is on the bottom.",
      "Which root is in the denominator? Multiply by that one over itself.",
      TOP_NOT_BOTTOM,
    ),
    "\\dfrac{2}{2\\sqrt{10}}": ok(T(SURDS, FRAC), "Multiplied out", true),
    "\\dfrac{1}{\\sqrt{10}}": A(ok(T(FRAC), "Cancelled", true)),
    "\\dfrac{\\sqrt{2}}{2\\sqrt{5}} = \\dfrac{\\sqrt{10}}{10}": A(okc(T(SURDS, FRAC), "Rationalised in one line, the √5 over √5 not shown")),
  },
  "ps2-q7": {
    "\\dfrac{4}{\\sqrt{5} - 1} \\times \\dfrac{\\sqrt{5} + 1}{\\sqrt{5} + 1}": ok(T(BINOM, FRAC), "Multiplied by the conjugate"),
    "\\dfrac{4(\\sqrt{5} + 1)}{5 - 1}": ok(T(BINOM, SURDS), "Difference of two squares below"),
    "\\sqrt{5} + 1": A(ok(T(FRAC), "Cancelled the 4")),
    "\\dfrac{4}{\\sqrt{5} - 1} \\times \\dfrac{\\sqrt{5} - 1}{\\sqrt{5} - 1}": wrong(
      T(BINOM),
      "Multiplied by the conjugate",
      "The root only clears when the bottom becomes a difference of two squares, and that needs the same two terms with the sign between them changed.",
      "Expand (√5 − 1)(√5 − 1). Is there still a root in it?",
      "same bracket, not the conjugate",
    ),
    "\\dfrac{4(\\sqrt{5} - 1)}{5 - 1}": wrong(
      T(BINOM),
      "Difference of two squares below",
      "(a − b)(a − b) is a perfect square, with a middle term. Only (a − b)(a + b) comes to a² − b².",
      "Expand (√5 − 1)² term by term. What is the middle term?",
      "square taken as difference",
    ),
    "\\sqrt{5} - 1": A(ok(T(FRAC), "Cancelled the 4", true)),
    "\\dfrac{4}{(\\sqrt{5} - 1)(\\sqrt{5} + 1)}": wrong(
      T(BINOM, FRAC),
      "Multiplied by the conjugate",
      "Multiplying only the bottom changes the fraction's value. Rationalising multiplies the top and the bottom by the conjugate, so it is multiplying by one.",
      "What did the top get multiplied by?",
      BOTTOM_ONLY,
    ),
    "\\dfrac{4}{4} = 1": A(ok(T(FRAC), "Cancelled", true)),
    "\\dfrac{4\\sqrt{5} + 4}{4}": A(wrong(
      T(SURDS, FRAC),
      "Cancelled the 4",
      "A rationalised answer is finished when nothing more cancels. Every term on top shares a factor with the bottom here.",
      "Take 4 out of the top. What cancels?",
      "answer not cancelled",
    )),
    "\\dfrac{4}{\\sqrt{5} - 1} = \\sqrt{5} + 1": A(okc(T(BINOM, SURDS, FRAC), "Rationalised in one line, the conjugate not shown")),
  },
  "ps2-q8": {
    "\\dfrac{\\sqrt{3} + 1}{\\sqrt{3} - 1} \\times \\dfrac{\\sqrt{3} + 1}{\\sqrt{3} + 1}": ok(T(BINOM, FRAC), "Multiplied by the conjugate"),
    "\\dfrac{3 + \\sqrt{3} + \\sqrt{3} + 1}{3 - 1}": ok(T(EXPAND, BINOM, SURDS), "Expanded the top, difference of squares below"),
    "\\dfrac{4 + 2\\sqrt{3}}{2}": ok(T(SURDS), "Collected the surds"),
    "2 + \\sqrt{3}": A(ok(T(FRAC), "Divided every term by 2")),
    "\\dfrac{\\sqrt{3} + 1}{(\\sqrt{3} - 1)(\\sqrt{3} + 1)}": wrong(
      T(BINOM, FRAC),
      "Multiplied by the conjugate",
      "Multiplying only the bottom changes the fraction's value. Rationalising multiplies the top and the bottom by the conjugate, so it is multiplying by one.",
      "What did the top get multiplied by?",
      BOTTOM_ONLY,
    ),
    "\\dfrac{\\sqrt{3} + 1}{2}": A(ok(T(FRAC, SURDS), "Simplified", true)),
    "\\dfrac{(\\sqrt{3} + 1)^2}{3 - 1}": okc(T(BINOM, FRAC), "Multiplied by the conjugate and the bottom in one line"),
    "\\dfrac{3 + \\sqrt{3} + 1}{2}": wrong(
      T(EXPAND),
      "Expanded the top",
      "(√3 + 1)² is (√3 + 1)(√3 + 1): four products. Writing them all out keeps the second √3.",
      "Expand (√3 + 1)(√3 + 1) term by term. How many √3 terms are there?",
      "a term dropped expanding",
    ),
    "\\dfrac{4 + \\sqrt{3}}{2}": A(ok(T(SURDS, FRAC), "Collected", true)),
  },
  "ps2-q9": {
    "\\dfrac{(2 - \\sqrt{3}) + (2 + \\sqrt{3})}{(2 + \\sqrt{3})(2 - \\sqrt{3})}": ok(T(FRAC), "Common denominator"),
    "\\dfrac{4}{4 - 3}": ok(T(BINOM, SURDS), "Difference of two squares below"),
    "4": A(ok(T(FRAC), "Simplified")),
    "\\dfrac{(2 - \\sqrt{3}) + (2 + \\sqrt{3})}{2 + \\sqrt{3}}": wrong(
      T(FRAC),
      "Common denominator",
      "Both tops were scaled for a common denominator, but the bottom kept only one of the two. The common denominator is the product of both.",
      "What did you multiply each fraction's bottom by?",
      "a denominator dropped",
    ),
    "\\dfrac{4}{2 + \\sqrt{3}}": ok(T(FRAC), "Collected the top", true),
    "\\dfrac{4(2 - \\sqrt{3})}{4 - 3}": ok(T(BINOM, SURDS), "Rationalised", true),
    "8 - 4\\sqrt{3}": A(ok(T(SURDS), "Simplified", true)),
    "\\dfrac{1 + (2 + \\sqrt{3})}{(2 + \\sqrt{3})(2 - \\sqrt{3})}": wrong(
      T(FRAC),
      "Common denominator",
      "Over a common denominator each top is multiplied by whatever its own bottom was. One of the tops was left as it was.",
      "The first fraction's bottom was multiplied by (2 − √3). What happens to its top?",
      "one numerator not scaled",
    ),
    "\\dfrac{3 + \\sqrt{3}}{4 - 3}": ok(T(BINOM, SURDS), "Difference of two squares below", true),
    "3 + \\sqrt{3}": A(ok(T(FRAC), "Simplified", true)),
  },
  "ps2-q10": {
    "A = (3 + \\sqrt{2})(3 - \\sqrt{2}) = 9 - 2 = 7": ok(T(WORDED, BINOM), "Area"),
    "d^2 = (3 + \\sqrt{2})^2 + (3 - \\sqrt{2})^2": ok(T(WORDED, SURDS), "Pythagoras on the diagonal"),
    "d^2 = (11 + 6\\sqrt{2}) + (11 - 6\\sqrt{2}) = 22": ok(T(WORDED, BINOM, SURDS), "Squared both sides"),
    "d = \\sqrt{22}": ok(T(WORDED, SURDS), "Diagonal"),
    "\\text{Area } 7 \\text{ cm}^2 \\text{, diagonal } \\sqrt{22} \\text{ cm}": A(ok(T(CONCL, WORDED), "In context")),
    "\\text{Area } 7 \\text{ cm}^2": A(wrong(
      T(WORDED),
      "In context",
      "The question asks for two things. The working found both, but the sentence answers only one of them.",
      "Read the question again. What else did it ask for?",
      "the diagonal left out",
    )),
    "\\text{Area } \\sqrt{22} \\text{ cm}^2 \\text{, diagonal } 7 \\text{ cm}": A(wrong(
      T(WORDED),
      "In context",
      "The working is right, but the sentence puts each result against the other's name. Reading each line's letter back says which is which.",
      "Which line did A = 7 come from, and which d?",
      "area and diagonal swapped",
    )),
    "\\text{Area } 7 \\text{ cm}^2 \\text{ and } \\sqrt{22} \\text{ cm}": A(wrong(
      T(WORDED),
      "In context",
      "The sentence has both numbers but names only one. A reader can't tell what the √22 cm measures.",
      "What is the √22 cm the length of?",
      "the diagonal not named",
    )),
  },
};
