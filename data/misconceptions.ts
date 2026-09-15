/**
 * The misconception taxonomy (ticket 299): what a student believed or did when a line went wrong, named once and
 * counted everywhere. Every wrong line of every evaluation table points at one entry here (`LineVerdict.misconception`), and
 * so does every diagnostic distractor (`DiagnosticOption.misconception`, ticket 302),
 * so the same misconception reads the same on every problem, every set and every class, and a count of it is a count of
 * one thing: "product right, sum wrong" on PS3 Q5 and on PS6 Q1 is one misconception, two times.
 *
 * Ids are permanent. A name can be reworded (every screen follows), an entry's `about` can be sharpened, but an id is
 * never renamed, reused or split: counts gathered under it would silently change meaning. A misconception that turns out
 * to be two gets two new ids and the old one retired, never deleted. The skill taxonomy (`data/taxonomy.ts`) says what a
 * step exercises; this one says how it went wrong, and the two are independent (a root or vertex sign wrong happens on
 * zeros, on turning points and on intercepts). See DECISION_LOG.md, 2026-09-15 (misconception taxonomy).
 */
export const MISCONCEPTION_VERSION = "methods-misconceptions-1";

type MisconceptionDef = {
  /** The teacher's name for it, five words or fewer: the label on every screen. */
  name: string;
  /** What a line under this id shows, precise enough to sort a new wrong line into it or out of it. */
  about: string;
};

const m = (name: string, about: string): MisconceptionDef => ({ name, about });

export const MISCONCEPTIONS = {
  // Factorising
  "pair-sum-wrong": m("product right, sum wrong", "A factor pair that multiplies to the constant but does not add to the middle coefficient."),
  "brackets-dont-expand": m("brackets don't expand back", "Brackets that expand to a different quadratic from the one given, with no expansion back in the working."),
  "check-wrong": m("expansion check wrong", "An expand-back check whose stated result is not what the brackets expand to."),
  "pair-product-wrong": m("sum right, product wrong", "A factor pair that adds to the middle coefficient but does not multiply to the constant."),
  "pair-signs-swapped": m("signs swapped in the pair", "The right numbers in the brackets with their signs swapped or flipped, so the middle term comes out with the wrong sign."),
  "factor-missing": m("factor missing from answer", "An expression multiplied through, or a common factor taken out, and that factor missing from the final answer."),
  // Signs
  "root-vertex-sign": m("root or vertex sign wrong", "A zero, intercept or turning point with the sign of the number in its bracket: x − 4 = 0 as x = −4, (x + 2)² as h = 2."),
  "minus-not-distributed": m("minus not carried through", "A negative multiplied, taken out or subtracted from a bracket that changes some terms' signs and leaves others."),
  "product-sign": m("sign of a product wrong", "A product or power of signed terms given the wrong sign: 4 × (−7) as +28, (−3)² as −9."),
  "collecting-sign": m("sign lost collecting terms", "Like terms collected with a sign dropped: −3x + 2x as +x, 6√2 − 2√2 as 8√2."),
  "rearranging-sign": m("sign wrong rearranging", "A term rewritten or moved to the other side with the wrong sign."),
  "term-lost-rearranging": m("term lost rearranging", "A term dropped moving an equation into standard form."),
  "solving-sign": m("sign lost solving for x", "A linear factor solved to the right size of answer with the wrong sign: 2x − 1 = 0 as x = −½."),
  // Distributing and powers
  "partial-distribution": m("applied to some terms only", "A multiplier, divisor or scale applied to some of the terms it acts on and not the rest."),
  "power-on-part": m("power on part, not all", "A power applied to one part of a product or quotient: (3x)² as 3x², (5/2)² as 25/2."),
  "squared-termwise": m("squared term by term", "A bracket squared by squaring each term, the middle term missing: (a + b)² as a² + b²."),
  "middle-not-doubled": m("middle term not doubled", "A perfect square expanded with one ab where there are two."),
  "square-sign": m("perfect square sign wrong", "A perfect square written or expanded with the sign in its bracket or on its middle term wrong."),
  "square-vs-difference": m("square and difference mixed", "A perfect square and a difference of two squares taken for each other, either way round."),
  // Fractions and surds
  "wrong-inverse": m("wrong operation to undo", "A step undone with the wrong inverse operation: subtracting or multiplying where it should divide."),
  "divided-wrong-way": m("divided the wrong way round", "A division or fraction turned over: a ÷ b written b/a, 2x = −1 solved as x = −2."),
  "denominator-dropped": m("part of the bottom dropped", "A denominator, or a factor of it, lost while simplifying or combining fractions."),
  "not-cancelled": m("answer not cancelled", "A fraction left with a common factor top and bottom."),
  "root-not-taken": m("square out, root not taken", "A square factor brought out of the root as itself: √(4 × 15) as 4√15."),
  "square-left-in-root": m("square factor left in root", "A surd left with a square factor still under the root."),
  "roots-added": m("roots added like numbers", "Roots joined or split over a sum: √12 + √27 as √39, √(72 + 72) as √72 + √72."),
  "rationalise-wrong-factor": m("wrong factor to rationalise", "A denominator multiplied by something that leaves the root in it, or the top rationalised instead of the bottom."),
  // Quadratics
  "coefficients-wrong": m("a, b or c wrong", "The coefficients a, b and c taken from a quadratic with a sign dropped or two swapped."),
  "nfl-without-zero": m("null factor law without zero", "The null factor law applied to a product that equals something other than zero."),
  "root-missing": m("second root missing", "A quadratic answered with one of its two roots, the other missing."),
  "formula-2a": m("divided by a, not 2a", "The quadratic formula's denominator taken as a."),
  "minus-b-dropped": m("−b's minus dropped", "The minus in −b (in the formula or in x = −b/2a) lost or not applied to a negative b."),
  "square-not-balanced": m("square added, not taken away", "Completing the square by adding a number without taking the same number away."),
  "halving-wrong": m("halving step wrong", "The halving in completing the square or the axis of symmetry skipped, doubled or signed wrong."),
  "discriminant-formula": m("discriminant formula wrong", "The discriminant b² − 4ac evaluated with part of its formula wrong: b not squared, 4ac taken as 2ac or ac."),
  "discriminant-root-count": m("wrong root count from Δ", "The discriminant's sign paired with the wrong number of roots."),
  // Graphs
  "wrong-feature": m("wrong feature given", "One value of a graph or equation given for another: the y-intercept, turning point, axis, landing or a coefficient where a different one was asked."),
  "substitution-wrong": m("value substituted wrong", "A value put into an expression with a power or coefficient lost: x² as x, 6x as 6, 3² as 6."),
  "x-for-y": m("x given where y asked", "A point's x-coordinate given as a height, value or minimum."),
  "vertex-y-wrong": m("y-value wrong at the vertex", "The turning point's height or minimum value given as a number that is not the function at its x."),
  "concavity-sign": m("concave up with negative a", "A negative leading coefficient read as a graph that opens upwards."),
  "graph-signs": m("roots' signs wrong from graph", "Intercepts from a graph given with their signs flipped."),
  // Reasoning
  "context-not-checked": m("answer doesn't fit context", "A conclusion the situation rules out: a negative length, a landing at the start, crossings the algebra denies."),
  "question-not-answered": m("not what the question asked", "A final statement that misses, mislabels or swaps what the question asked for."),
} as const satisfies Record<string, MisconceptionDef>;

export type MisconceptionId = keyof typeof MISCONCEPTIONS;

export const MISCONCEPTION_IDS = Object.keys(MISCONCEPTIONS) as MisconceptionId[];

export const misconceptionName = (id: MisconceptionId): string => MISCONCEPTIONS[id].name;

export const isMisconceptionId = (id: string): id is MisconceptionId => Object.hasOwn(MISCONCEPTIONS, id);
