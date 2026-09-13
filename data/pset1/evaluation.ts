import { A, ok, okc, T, wrong, type LineVerdict } from "../evaluation";
import type { LeafId } from "../taxonomy";

/**
 * Problem Set 1's scripted evaluation (ticket 211): every line any of the class wrote on the set, with its
 * verdict and tags, in the same shape as Problem Set 6's table (`data/evaluation.ts`) and read through the
 * same `evaluateLine`. A wrong line's `name` is the teacher's name for the mistake; the same name on two
 * problems is the same habit (a square taken out of the root without its root, on Q2, Q4 and Q5; a square
 * factor left under the root, on Q1 and Q6).
 *
 * A wrong line's first tag is its slip (`lib/mistakes.ts`). The surd slips carry surds alone, so they count
 * under New skills and make the set's top gap; the fraction, expansion and linear slips carry their Algebra
 * leaf alone, so they leave New skills untouched.
 */
const SURDS: LeafId = "algebra.number.surds";
const LIN: LeafId = "algebra.equations.linear";
const INDICES: LeafId = "algebra.number.indices";
const FRAC: LeafId = "algebra.number.fractions";
const EXPAND: LeafId = "algebra.expand-factor.expand";
const WORDED: LeafId = "reasoning.interpret.worded";
const CONCL: LeafId = "reasoning.justify.conclusions";

/** The mistake names shared across problems. */
const ROOT_NOT_TAKEN = "square out, root not taken";
const SQUARE_LEFT = "square factor left under root";

export const PS1_EVALUATION: Record<string, Record<string, LineVerdict>> = {
  "ps1-q1": {
    "\\sqrt{48} = \\sqrt{16 \\times 3}": ok(T(SURDS), "Largest square factor"),
    "\\sqrt{16 \\times 3} = 4\\sqrt{3}": A(ok(T(SURDS), "Took its root out")),
    "\\sqrt{48} = 4\\sqrt{3}": A(okc(T(SURDS), "Simplified in one jump, the square factor not shown")),
    "\\sqrt{48} = \\sqrt{4 \\times 12}": ok(T(SURDS), "A square factor"),
    "\\sqrt{4 \\times 12} = 2\\sqrt{12}": A(wrong(
      T(SURDS),
      "Took its root out",
      "A surd is simplified when no square factor is left under the root. 4 was a square factor, but not the largest one.",
      "Is there a square number that divides 12? What does that make √12?",
      SQUARE_LEFT,
    )),
    "\\sqrt{48} = \\sqrt{8 \\times 6}": ok(T(SURDS), "Split into factors"),
    "\\sqrt{8 \\times 6} = 2\\sqrt{2} \\times \\sqrt{6}": ok(T(SURDS), "Simplified √8"),
    "2\\sqrt{2} \\times \\sqrt{6} = 2\\sqrt{12}": A(wrong(
      T(SURDS),
      "Simplified",
      "Multiplying the roots back together made a new square factor. A surd is simplified only when nothing square is left under the root.",
      "12 = 4 × 3. What does 2√12 simplify to?",
      SQUARE_LEFT,
    )),
  },
  "ps1-q2": {
    "3\\sqrt{50} = 3\\sqrt{25 \\times 2}": ok(T(SURDS), "Largest square factor"),
    "3\\sqrt{25 \\times 2} = 3 \\times 5\\sqrt{2}": ok(T(SURDS), "Took its root out"),
    "3 \\times 5\\sqrt{2} = 15\\sqrt{2}": A(ok(T(SURDS), "Simplified")),
    "3\\sqrt{50} = 15\\sqrt{2}": A(okc(T(SURDS), "Simplified in one jump, the square factor not shown")),
    "3\\sqrt{50} = 3 \\times 25\\sqrt{2}": wrong(
      T(SURDS),
      "Took its root out",
      "What comes out from under a root is the square factor's root, not the square itself. Squaring what came out should give back what went in.",
      "√25 is what? Square your answer: do you get 25?",
      ROOT_NOT_TAKEN,
    ),
    "3\\sqrt{50} = 75\\sqrt{2}": A(ok(T(SURDS), "Simplified", true)),
  },
  "ps1-q3": {
    "\\sqrt{12} = 2\\sqrt{3},\\; \\sqrt{27} = 3\\sqrt{3}": ok(T(SURDS), "Simplified each surd"),
    "\\sqrt{12} + \\sqrt{27} = 2\\sqrt{3} + 3\\sqrt{3}": ok(T(SURDS), "Rewrote the sum"),
    "2\\sqrt{3} + 3\\sqrt{3} = 5\\sqrt{3}": A(ok(T(LIN, SURDS), "Collected like surds")),
    "\\sqrt{12} + \\sqrt{27} = \\sqrt{39}": A(wrong(
      T(SURDS),
      "Collected the surds",
      "Roots can be multiplied under one root, but not added under one. Only like surds collect, and these two only look alike once each is simplified.",
      "Simplify √12 and √27 on their own first. What do they have in common?",
      "added under one root",
    )),
  },
  "ps1-q4": {
    "2\\sqrt{18} = 2 \\times 3\\sqrt{2} = 6\\sqrt{2}": ok(T(SURDS), "Simplified 2√18"),
    "\\sqrt{8} = 2\\sqrt{2}": ok(T(SURDS), "Simplified √8"),
    "2\\sqrt{18} - \\sqrt{8} = 6\\sqrt{2} - 2\\sqrt{2}": ok(T(SURDS), "Rewrote the difference"),
    "6\\sqrt{2} - 2\\sqrt{2} = 4\\sqrt{2}": A(ok(T(LIN, SURDS), "Collected like surds")),
    "6\\sqrt{2} - 2\\sqrt{2} = 8\\sqrt{2}": A(wrong(
      T(SURDS),
      "Collected like surds",
      "Like surds collect like like terms, sign and all: 6 of something take away 2 of it. The subtraction became an addition on the way.",
      "What is 6a − 2a? So what is 6√2 − 2√2?",
      "sign lost collecting surds",
    )),
    "2\\sqrt{18} - \\sqrt{8} = 6\\sqrt{2} + 2\\sqrt{2}": wrong(
      T(SURDS),
      "Rewrote the difference",
      "Each surd was simplified right, but the sign between them didn't come across. The operation in the question stays with the term it belongs to.",
      "Look at the sign in front of √8 in the question. Is it still there?",
      "sign changed rewriting",
    ),
    "6\\sqrt{2} + 2\\sqrt{2} = 8\\sqrt{2}": A(ok(T(LIN, SURDS), "Collected like surds", true)),
    "\\sqrt{8} = 4\\sqrt{2}": wrong(
      T(SURDS),
      "Simplified √8",
      "What comes out from under a root is the square factor's root, not the square itself. Squaring what came out should give back what went in.",
      "8 = 4 × 2. What is √4?",
      ROOT_NOT_TAKEN,
    ),
    "2\\sqrt{18} - \\sqrt{8} = 6\\sqrt{2} - 4\\sqrt{2}": ok(T(SURDS), "Rewrote the difference", true),
    "6\\sqrt{2} - 4\\sqrt{2} = 2\\sqrt{2}": A(ok(T(LIN, SURDS), "Collected like surds", true)),
  },
  "ps1-q5": {
    "\\sqrt{6} \\times \\sqrt{10} = \\sqrt{60}": ok(T(INDICES, SURDS), "Multiplied under one root"),
    "\\sqrt{60} = \\sqrt{4 \\times 15}": ok(T(SURDS), "Largest square factor"),
    "\\sqrt{4 \\times 15} = 2\\sqrt{15}": A(ok(T(SURDS), "Took its root out")),
    "\\sqrt{4 \\times 15} = 4\\sqrt{15}": A(wrong(
      T(SURDS),
      "Took its root out",
      "What comes out from under a root is the square factor's root, not the square itself. Squaring what came out should give back what went in.",
      "Square 4√15. Do you get 60?",
      ROOT_NOT_TAKEN,
    )),
  },
  "ps1-q6": {
    "2\\sqrt{3} \\times 5\\sqrt{6} = 2 \\times 5 \\times \\sqrt{3 \\times 6}": ok(T(INDICES), "Numbers together, roots together"),
    "2 \\times 5 \\times \\sqrt{3 \\times 6} = 10\\sqrt{18}": ok(T(INDICES, SURDS), "Multiplied"),
    "10\\sqrt{18} = 10 \\times 3\\sqrt{2}": ok(T(SURDS), "Simplified √18"),
    "10 \\times 3\\sqrt{2} = 30\\sqrt{2}": A(ok(T(SURDS), "Simplified")),
    "2\\sqrt{3} \\times 5\\sqrt{6} = 10\\sqrt{18}": A(wrong(
      T(SURDS),
      "Simplified",
      "The multiplying was right. A surd is simplified only when no square factor is left under the root, and 18 still has one.",
      "Which square number divides 18? What does 10√18 become?",
      SQUARE_LEFT,
    )),
  },
  "ps1-q7": {
    "6\\sqrt{10} \\div 2\\sqrt{5} = \\dfrac{6\\sqrt{10}}{2\\sqrt{5}}": ok(T(FRAC), "Wrote it as a fraction"),
    "\\dfrac{6\\sqrt{10}}{2\\sqrt{5}} = \\dfrac{6}{2} \\times \\sqrt{\\dfrac{10}{5}}": ok(T(FRAC, SURDS), "Numbers by numbers, roots by roots"),
    "\\dfrac{6}{2} \\times \\sqrt{\\dfrac{10}{5}} = 3\\sqrt{2}": A(ok(T(FRAC, SURDS), "Simplified")),
    "\\dfrac{6\\sqrt{10}}{2\\sqrt{5}} = 3\\sqrt{10}": A(wrong(
      T(FRAC),
      "Simplified",
      "Everything on the bottom of a fraction divides the top. The 2 was divided out, but the √5 beside it was dropped instead.",
      "Multiply your answer by 2√5. Do you get back 6√10?",
      "the bottom's surd dropped",
    )),
    "6\\sqrt{10} \\div 2\\sqrt{5} = \\dfrac{2\\sqrt{5}}{6\\sqrt{10}}": wrong(
      T(FRAC),
      "Wrote it as a fraction",
      "The number you divide by goes on the bottom. This fraction is the division the other way round, so every line after it answers a different question.",
      "In 6√10 ÷ 2√5, which one is being shared out?",
      "fraction turned upside down",
    ),
    "\\dfrac{2\\sqrt{5}}{6\\sqrt{10}} = \\dfrac{1}{3\\sqrt{2}}": A(ok(T(FRAC, SURDS), "Simplified", true)),
  },
  "ps1-q8": {
    "\\sqrt{2}(3 + \\sqrt{8}) = \\sqrt{2} \\times 3 + \\sqrt{2} \\times \\sqrt{8}": ok(T(EXPAND), "√2 into both terms"),
    "\\sqrt{2} \\times 3 + \\sqrt{2} \\times \\sqrt{8} = 3\\sqrt{2} + \\sqrt{16}": ok(T(EXPAND, SURDS), "Multiplied each term"),
    "3\\sqrt{2} + \\sqrt{16} = 3\\sqrt{2} + 4": A(ok(T(SURDS, EXPAND), "Simplified √16")),
    "\\sqrt{2}(3 + \\sqrt{8}) = \\sqrt{2} \\times 3 + \\sqrt{8}": wrong(
      T(EXPAND),
      "√2 into both terms",
      "The number in front of a bracket multiplies every term inside it, not just the first. A surd in front works the same way.",
      "√2 multiplied the 3. What happens to √8?",
      "√2 on first term only",
    ),
    "\\sqrt{2} \\times 3 + \\sqrt{8} = 3\\sqrt{2} + 2\\sqrt{2}": ok(T(EXPAND, SURDS), "Multiplied each term", true),
    "3\\sqrt{2} + 2\\sqrt{2} = 5\\sqrt{2}": A(ok(T(EXPAND, SURDS), "Collected like surds", true)),
  },
  "ps1-q9": {
    "\\sqrt{75} = 5\\sqrt{3},\\; \\sqrt{12} = 2\\sqrt{3}": ok(T(SURDS), "Simplified each surd"),
    "x\\sqrt{3} = 5\\sqrt{3} - 2\\sqrt{3}": ok(T(SURDS, LIN), "Rewrote the right side"),
    "x\\sqrt{3} = 3\\sqrt{3}": ok(T(LIN, SURDS), "Collected like surds"),
    "x = \\dfrac{3\\sqrt{3}}{\\sqrt{3}}": ok(T(LIN, FRAC), "Divided both sides by √3"),
    "x = 3": A(ok(T(FRAC, SURDS), "Solved")),
    "x\\sqrt{3} = \\sqrt{75} - \\sqrt{12} \\Rightarrow x = 3": A(okc(T(SURDS, LIN), "Solved in one line, the surds not simplified on the page")),
    "x = \\dfrac{\\sqrt{3}}{3\\sqrt{3}}": wrong(
      T(LIN),
      "Divided both sides by √3",
      "To leave x on its own, both sides are divided by what multiplies x. Here the division went the other way round.",
      "√3 multiplies x. What do you divide 3√3 by?",
      "divided the wrong way round",
    ),
    "x = \\dfrac{1}{3}": A(ok(T(FRAC), "Solved", true)),
  },
  "ps1-q10": {
    "s^2 = 72": ok(T(WORDED), "Area as the side squared"),
    "s = \\sqrt{72} = \\sqrt{36 \\times 2} = 6\\sqrt{2}": ok(T(WORDED, SURDS), "Side length"),
    "d^2 = s^2 + s^2 = 72 + 72 = 144": ok(T(WORDED), "Pythagoras on the diagonal"),
    "d = \\sqrt{144} = 12": ok(T(SURDS), "Diagonal"),
    "\\text{Side } 6\\sqrt{2}\\text{ cm, diagonal } 12\\text{ cm}": A(ok(T(CONCL), "In context")),
    "d = \\sqrt{s^2 + s^2} = \\sqrt{72 + 72}": ok(T(WORDED), "Pythagoras on the diagonal"),
    "\\sqrt{72 + 72} = \\sqrt{72} + \\sqrt{72} = 12\\sqrt{2}": wrong(
      T(SURDS),
      "Diagonal",
      "The root of a sum is not the sum of the roots. Add under the root first, then take the root of the total.",
      "What is 72 + 72? Take the root of that.",
      "root of a sum split",
    ),
    "\\text{Side } 6\\sqrt{2}\\text{ cm, diagonal } 12\\sqrt{2}\\text{ cm}": A(ok(T(CONCL), "In context", true)),
  },
};
