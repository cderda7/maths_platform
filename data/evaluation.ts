import type { LeafId } from "./taxonomy";
import { tag, type Tag } from "./types";

/**
 * Scripted evaluation for the demo problems. Every line the pad can "read" (the scripted run,
 * the rework path, the model solution, and the classmates' scripted slips) is listed with a
 * verdict and its taxonomy tags. This is not a maths engine: a line the table doesn't know is
 * "unclear", which is the honest state for an evaluator that can't follow a line.
 */
export interface LineVerdict {
  /** ok: the step holds. wrong: the step doesn't. */
  verdict: "ok" | "wrong";
  tags: Tag[];
  /** What the step does, in the student's terms. */
  label: string;
  /** Right *given* a wrong line above. Shown without blame and never counted as a mistake. */
  builtOn?: boolean;
  /** The authored line skips a step a reader could not follow. Set per line, never inferred. */
  compounds?: boolean;
  /** For wrong lines: the pattern-level clue used in review ("detective work"), never the location. */
  clue?: string;
  /** For wrong lines: the note shown in teacher views. */
  note?: string;
  /**
   * The line states what the problem asked for (the roots, the value of k, the factorised form,
   * the turning point, the greatest height, the sentence about the graph), right or wrong. A
   * problem with one of these among its lines is finished; without one it is incomplete,
   * however much working it has (`lib/feedback.ts`, `progressOf`).
   */
  answer?: boolean;
}

const T = (...leaves: LeafId[]): Tag[] => leaves.map((l) => tag(l));
const ok = (tags: Tag[], label: string, builtOn = false): LineVerdict => ({ verdict: "ok", tags, label, builtOn });
const okc = (tags: Tag[], label: string): LineVerdict => ({ verdict: "ok", tags, label, compounds: true });
const wrong = (tags: Tag[], label: string, clue: string, note: string): LineVerdict => ({ verdict: "wrong", tags, label, clue, note });
/** Marks a verdict as an answer line: the problem is finished once this is among its lines. */
const A = (v: LineVerdict): LineVerdict => ({ ...v, answer: true });

const QUAD: LeafId = "algebra.equations.quadratic";
const LIN: LeafId = "algebra.equations.linear";
const MONIC: LeafId = "algebra.expand-factor.monic";
const NONMONIC: LeafId = "algebra.expand-factor.nonmonic";
const EXPAND: LeafId = "algebra.expand-factor.expand";
const FRAC: LeafId = "algebra.number.fractions";
const NFL: LeafId = "unit.u1.nfl";
const DISC: LeafId = "unit.u1.discriminant";
const BINOM: LeafId = "unit.u1.binomial";
const ZERO: LeafId = "functions.zeros.zero-finding";
const EVAL: LeafId = "functions.notation.evaluate";
const FEAT: LeafId = "graphing.quadratics.features";
const SKETCH: LeafId = "graphing.quadratics.sketch";
const WORDED: LeafId = "reasoning.interpret.worded";
const FORMAL: LeafId = "reasoning.justify.formal";
const CONCL: LeafId = "reasoning.justify.conclusions";

export const EVALUATION: Record<string, Record<string, LineVerdict>> = {
  q1: {
    "x^2 - 5x + 6 = 0": ok(T(QUAD), "Standard form"),
    "(x-2)(x-3) = 0": ok(T(MONIC), "Factorised"),
    "(x - 2)(x - 3) = 0": ok(T(MONIC), "Factorised"),
    "x = 2 \\;\\text{or}\\; x = 3": A(ok(T(NFL, QUAD), "Null factor law")),
    "(x + 2)(x + 3) = 0": wrong(
      T(MONIC),
      "Factorised",
      "Somewhere a pair of signs doesn't survive the trip back. Expanding a factorisation is a one-line check.",
      "Expand this back: what sign does the x term come out with?",
    ),
    "x = 2, 3": A(okc(T(NFL), "Roots read off, the null factor law not shown")),
    "x = -2 \\;\\text{or}\\; x = -3": A(ok(T(NFL, QUAD), "Null factor law", true)),
    "(x - 1)(x - 6) = 0": wrong(
      T(MONIC),
      "Factorised",
      "A pair can multiply to the right constant and still add to the wrong middle term. Expanding back would catch it in one line.",
      "1 and 6 multiply to 6 but add to 7. Which pair adds to 5?",
    ),
    "x = 1 \\;\\text{or}\\; x = 6": A(ok(T(NFL, QUAD), "Null factor law", true)),
  },
  q2: {
    "2x^2 + 7x - 4 = 0": ok(T(QUAD), "Standard form"),
    "ac = -8,\\quad 8 + (-1) = 7": ok(T(NONMONIC), "Found the split"),
    "2x^2 + 8x - x - 4 = 0": ok(T(NONMONIC), "Split the middle term"),
    "2x(x+4) - 1(x+4) = 0": ok(T(NONMONIC), "Grouped"),
    "(2x - 1)(x + 4) = 0": ok(T(NONMONIC), "Factorised"),
    "x = \\tfrac{1}{2} \\;\\text{or}\\; x = -4": A(ok(T(NFL, FRAC), "Null factor law")),
    "2x^2 + 7x - 4 = (2x - 1)(x + 4)": okc(T(NONMONIC), "Factorised in one line, the split not shown"),
    "(2x + 4)(x - 1) = 0": wrong(
      T(NONMONIC),
      "Factorised",
      "When the x² term has a coefficient, a guessed pair can look right and still not multiply out. Something here didn't get expanded back.",
      "Try expanding this back. What do you get for the x term?",
    ),
    "2x + 4 = 0 \\;\\text{or}\\; x - 1 = 0": ok(T(NFL), "Null factor law", true),
    "x = -2 \\;\\text{or}\\; x = 1": A(ok(T(LIN), "Solved each factor", true)),
    "x = -\\tfrac{1}{2} \\;\\text{or}\\; x = -4": A(wrong(
      T(LIN),
      "Solved each factor",
      "The factors were right, but solving one of them didn't keep its sign. Substituting each root back into its own factor is a one-line check.",
      "Put x = −½ into 2x − 1. Does it come out as zero?",
    )),
  },
  q3: {
    "(x - 3)(x + 2) = 6": ok(T(QUAD), "Copied the equation"),
    "x^2 - x - 6 = 6": ok(T(EXPAND), "Expanded first"),
    "x^2 - x - 12 = 0": ok(T(LIN), "Rearranged to standard form"),
    "(x - 4)(x + 3) = 0": ok(T(MONIC), "Factorised"),
    "x = 4 \\;\\text{or}\\; x = -3": A(ok(T(NFL, QUAD), "Null factor law")),
    "x^2 - x - 12 = 0 \\Rightarrow x = 4, -3": A(okc(T(MONIC, NFL), "Factorised and solved in one line")),
    "x - 3 = 6 \\;\\text{or}\\; x + 2 = 6": wrong(
      T(NFL),
      "Split the product",
      "A rule got used somewhere it doesn't apply. Check what each rule needs to be true before it can be used.",
      "The null factor law needs the product to equal zero. What does this one equal?",
    ),
    "x = 9 \\;\\text{or}\\; x = 4": A(ok(T(LIN), "Solved each part", true)),
    "x^2 + x - 6 = 6": wrong(
      T(EXPAND),
      "Expanded first",
      "Expanding two brackets collects two x terms, and one sign in that collection didn't survive. Multiplying out again, term by term, shows which.",
      "−3x + 2x: what does that come to?",
    ),
    "x^2 + x - 12 = 0": ok(T(LIN), "Rearranged to standard form", true),
    "(x + 4)(x - 3) = 0": ok(T(MONIC), "Factorised", true),
    "x = -4 \\;\\text{or}\\; x = 3": A(ok(T(NFL, QUAD), "Null factor law", true)),
  },
  q4: {
    "a = 3,\\; b = -5,\\; c = -1": ok(T(QUAD), "Identified a, b, c"),
    "b^2 - 4ac = 25 + 12 = 37": ok(T(DISC), "Discriminant"),
    "x = \\dfrac{5 \\pm \\sqrt{37}}{6}": A(ok(T(QUAD, FRAC), "Quadratic formula")),
    "x = \\dfrac{5 \\pm \\sqrt{37}}{3}": A(wrong(
      T(QUAD),
      "Quadratic formula",
      "The formula has a denominator that depends on a. Somewhere a coefficient didn't make it into that denominator.",
      "What is the denominator of the quadratic formula? Check it against a = 3.",
    )),
    "x = \\dfrac{-5 \\pm \\sqrt{37}}{6}": A(wrong(
      T(QUAD),
      "Quadratic formula",
      "The formula starts with −b. When b is already negative, that minus still has to act on it.",
      "b = −5, so what is −b?",
    )),
  },
  q5: {
    "(x - 5)(x + 1) = 0": ok(T(MONIC), "Factorised"),
    "x = 5 \\;\\text{or}\\; x = -1": ok(T(NFL, ZERO), "x-intercepts"),
    "x = \\tfrac{5 + (-1)}{2} = 2": ok(T(FEAT, FRAC), "Axis of symmetry"),
    "y = 4 - 8 - 5 = -9": ok(T(FEAT), "Height on the axis"),
    "(2, -9)": A(ok(T(FEAT, SKETCH), "Turning point")),
    "x = -5 \\;\\text{or}\\; x = 1": wrong(
      T(QUAD),
      "x-intercepts",
      "Reading a root off a factor flips a sign somewhere. Substituting the root back into the factor is a one-line check.",
      "Put x = −5 into (x − 5). Does it come out as zero?",
    ),
    "x = \\tfrac{-5 + 1}{2} = -2": ok(T(FEAT), "Axis of symmetry", true),
    "(2, -5)": A(wrong(
      T(FEAT),
      "Turning point",
      "The turning point's x is right but its y came from the wrong line. The y-value is the function evaluated at that x, not the constant term.",
      "Substitute x = 2 into y = x² − 4x − 5. What is y?",
    )),
  },
  q6: {
    "b^2 - 4ac = 36 - 4k": ok(T(DISC), "Discriminant"),
    "36 - 4k = 0": ok(T(DISC, ZERO), "One root: discriminant zero"),
    "k = 9": A(ok(T(LIN), "Solved for k")),
    "36 - 4k > 0": wrong(
      T(DISC),
      "Discriminant condition",
      "Touching once and crossing twice are different pictures. Which one does the discriminant's sign describe here?",
      "A graph that touches the x-axis once has how many roots? What does that make the discriminant?",
    ),
    "k < 9": A(ok(T(LIN), "Solved the inequality", true)),
  },
  q7: {
    "\\tfrac{1}{3}(x^2 + 6x + 8)": ok(T(FRAC, NONMONIC), "Took out the third"),
    "2 \\times 4 = 8,\\quad 2 + 4 = 6": ok(T(NONMONIC, MONIC), "Found the pair"),
    "\\tfrac{1}{3}(x + 2)(x + 4)": A(ok(T(NONMONIC, BINOM), "Factorised")),
    "x^2 + 6x + \\tfrac{8}{3}": wrong(
      T(FRAC),
      "Cleared the fraction",
      "Whatever you do to one term you do to every term. One of them didn't get the same treatment.",
      "You multiplied by 3. Did every term get multiplied by 3?",
    ),
    "x^2 + 6x + 8": wrong(
      T(FRAC),
      "Multiplied through by 3",
      "Multiplying an expression by 3 makes a different expression. Whatever you scale by has to come back out at the end.",
      "You multiplied every term by 3 this time. Where did the 3 go?",
    ),
    "(x + 2)(x + 4)": A(ok(T(NONMONIC), "Factorised", true)),
    "1 \\times 8 = 8,\\quad 1 + 8 = 9": wrong(
      T(MONIC),
      "Found the pair",
      "The pair has two jobs at once: multiply to the constant and add to the middle term. One of those jobs got skipped.",
      "1 and 8 multiply to 8 but add to 9. Which pair adds to 6?",
    ),
    "\\tfrac{1}{3}(x + 1)(x + 8)": A(ok(T(NONMONIC, BINOM), "Factorised", true)),
  },
  q8: {
    "x = 1 \\;\\text{or}\\; x = 3": A(ok(T(FEAT, ZERO), "Read from the graph")),
    "1 - 4 + 3 = 0 \\;\\checkmark": ok(T(EVAL, ZERO), "Checked by substitution"),
    "x = -1 \\;\\text{or}\\; x = -3": A(wrong(
      T(FEAT),
      "Read from the graph",
      "The crossings were read on the wrong side of the axis. Check the sign of each intercept against the picture.",
      "Where does the curve actually cross? Look at the axis labels.",
    )),
  },
  q9: {
    "-x(x - 6) = 0": ok(T(WORDED, EXPAND), "Height zero, factorised"),
    "x = 0 \\;\\text{or}\\; x = 6": ok(T(NFL, ZERO), "Lands at x = 6"),
    "x = 3": ok(T(FEAT, SKETCH), "Axis of symmetry"),
    "\\text{turning point at } x = 3": okc(T(FEAT, SKETCH), "Axis of symmetry, height not shown"),
    "h = -9 + 18 = 9": A(ok(T(FEAT), "Greatest height 9 m")),
    "h = 6": A(wrong(
      T(FEAT),
      "Greatest height",
      "The greatest height is the function's value at the axis of symmetry, not the axis itself.",
      "Substitute x = 3 into h = −x² + 6x. What is h?",
    )),
    "-x(x + 6) = 0": wrong(
      T(EXPAND),
      "Height zero, factorised",
      "Taking a negative factor out of two terms changes the sign of what is left behind. Expanding back shows whether it did.",
      "Expand −x(x + 6). Do you get −x² + 6x?",
    ),
    "x = 0 \\;\\text{or}\\; x = -6": ok(T(NFL, ZERO), "Lands at x = −6", true),
    "x = -3": ok(T(FEAT, SKETCH), "Axis of symmetry", true),
    "h = 9": A(ok(T(FEAT), "Greatest height 9 m", true)),
  },
  q10: {
    "b^2 - 4ac = 16 - 20 = -4": ok(T(DISC), "Discriminant"),
    "\\Delta < 0 \\Rightarrow \\text{no real solutions}": ok(T(FORMAL), "Justified"),
    "\\text{The graph never meets the x-axis}": A(ok(T(CONCL, SKETCH), "In context")),
    "\\Delta < 0 \\Rightarrow \\text{two real solutions}": wrong(
      T(FORMAL),
      "Justified",
      "The sign of the discriminant and the number of solutions are linked one way, not the other. Which sign goes with which count?",
      "A negative discriminant means what about the square root in the formula?",
    ),
    "\\text{The graph crosses the x-axis twice}": A(wrong(
      T(CONCL),
      "In context",
      "A conclusion about the graph has to follow from the number of real solutions. Check the link.",
      "No real solutions means no x-intercepts. What does the graph do instead?",
    )),
    "\\text{So the graph crosses the x-axis at two points}": A(ok(T(CONCL, SKETCH), "In context", true)),
  },
};

/**
 * Curated "standout" steps: correct steps worth noticing. `when` says which run kind they apply
 * to: a strong run's standouts are the novel moves; a weak run's are the harder steps that held.
 */
export const STANDOUT: Record<string, Record<string, { when: "strong" | "weak" | "both"; why: string }>> = {
  q2: {
    "ac = -8,\\quad 8 + (-1) = 7": { when: "strong", why: "You wrote the split down instead of guessing a pair. That's the move most people skip." },
    "2x + 4 = 0 \\;\\text{or}\\; x - 1 = 0": { when: "weak", why: "The null factor law applied cleanly to your factors. The method held even where the factors didn't." },
  },
  q3: {
    "x^2 - x - 6 = 6": { when: "strong", why: "You expanded first instead of taking the bait of a product that isn't zero." },
  },
  q4: {
    "b^2 - 4ac = 25 + 12 = 37": { when: "both", why: "Two negatives handled cleanly: −4 × 3 × (−1) came out as +12." },
    "x = \\dfrac{5 \\pm \\sqrt{37}}{6}": { when: "weak", why: "Left √37 exact rather than rounding. That's what \"exact values\" asks for." },
  },
  q5: {
    "x = \\tfrac{5 + (-1)}{2} = 2": { when: "strong", why: "Axis of symmetry straight from the roots, no formula needed." },
  },
  q6: {
    "36 - 4k = 0": { when: "strong", why: "Translated “touches once” into “discriminant is zero” in one line." },
  },
  q8: {
    "1 - 4 + 3 = 0 \\;\\checkmark": { when: "both", why: "Checked a graph read by substitution. One line, and the read is certain." },
  },
  q10: {
    "\\text{The graph never meets the x-axis}": { when: "strong", why: "Said what the algebra means for the picture." },
  },
};
