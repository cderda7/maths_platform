import type { CategoryId, LeafId } from "./taxonomy";
import type { Pathway } from "./types";

/**
 * The class story sheet (ticket 210): for every set in the Classroom (Problem Sets 1–6) and every one of
 * the twenty students, the status each category reads on that set and the pattern behind every result short
 * of secure, with the problems that carry it. It is the contract the four earlier sets (tickets 211–214)
 * are authored against, so they agree with each other and with Sets 5 and 6, and a student's history
 * never jumps: neighbouring results in a category (skipping sets that did not assess it and sets the
 * student has nothing on) move at most one step, gap ↔ developing ↔ solid ↔ secure.
 *
 * This file is the single source. `specs/class-story.md` is generated from it (`npm run story:sheet`) and a
 * test fails when the two differ. `data/story.test.ts` checks the sheet (complete, one step, Sets 5 and 6
 * equal to the real data); `data/finishedSets.test.ts` checks every registered finished set equals its row.
 */

/** A result a set can give a category: the four colours of the Class View. */
export type StoryStatus = "gap" | "developing" | "solid" | "secure";

/** A pattern behind a result: what the student does, and the problems (by number, Q1 = 1) in that set where it shows. */
export interface Pattern {
  text: string;
  problems: readonly number[];
}

/**
 * One student × category × set:
 * - a result with its patterns (one or two for anything short of secure, none for secure);
 * - `unseen`: the set assesses the category but the student has nothing on it (missing, or never reached those problems);
 * - `absent`: the student was away for the set (ticket 250; `DEMO_ABSENCES`), every category it assesses alike;
 * - `none`: the set does not assess the category (the "—" in the sheet);
 * - `live`: Sam on Problem Set 6, whose row is his live session.
 */
export type StoryCell = { status: StoryStatus; patterns: readonly Pattern[] } | { status: "unseen" | "absent" | "none" | "live"; patterns: readonly [] };

/** The categories the six sets assess, in the Class View's order. */
export const STORY_CATEGORIES = ["algebra", "functions", "graphing", "communication", "reasoning", "new"] as const satisfies readonly CategoryId[];
export type StoryCategory = (typeof STORY_CATEGORIES)[number];

/** A problem of a set not yet authored: what it asks, and the leaves its model solution must carry. */
export interface OutlineProblem {
  about: string;
  leaves: readonly LeafId[];
}

export interface StorySet {
  /** 1 … 6. */
  n: number;
  id: string;
  name: string;
  /** As on the card: "Tue 25 Aug". */
  due: string;
  topic: string;
  newSkills: readonly LeafId[];
  pathway: Pathway;
  /** The categories the set assesses (`categoriesTouched`), in order. */
  categories: readonly StoryCategory[];
  /** Ten problems for a set still to be authored (their model solutions carry at least these leaves); null for an authored set. */
  outline: readonly OutlineProblem[] | null;
  /** The Classroom card's top gap, as it reads: the leaves' short names. */
  topGap: string;
  /** Where the set's data lives. */
  source: string;
}

const SURDS: LeafId = "algebra.number.surds";
const FRAC: LeafId = "algebra.number.fractions";
const INDICES: LeafId = "algebra.number.indices";
const LIN: LeafId = "algebra.equations.linear";
const QUAD: LeafId = "algebra.equations.quadratic";
const EXPAND: LeafId = "algebra.expand-factor.expand";
const MONIC: LeafId = "algebra.expand-factor.monic";
const NONMONIC: LeafId = "algebra.expand-factor.nonmonic";
const BINOM: LeafId = "algebra.expand-factor.binomial";
const DISC: LeafId = "algebra.equations.discriminant";
const NFL: LeafId = "functions.zeros.nfl";
const ZERO: LeafId = "functions.zeros.zero-finding";
const FEAT: LeafId = "graphing.quadratics.features";
const WORDED: LeafId = "reasoning.interpret.worded";
const CONCL: LeafId = "reasoning.justify.conclusions";
const FORMAL: LeafId = "reasoning.justify.formal";

const q = (about: string, ...leaves: LeafId[]): OutlineProblem => ({ about, leaves });
const EARLY: readonly StoryCategory[] = ["algebra", "communication", "reasoning", "new"];
const ALL: readonly StoryCategory[] = STORY_CATEGORIES;

export const STORY_SETS: readonly StorySet[] = [
  {
    n: 1,
    id: "pset-1",
    name: "Problem Set 1 — Surds",
    due: "Tue 25 Aug",
    topic: "Simplifying surds and operating with them: simplify, collect like surds, multiply and divide, leave answers exact, a short worded problem.",
    newSkills: [SURDS],
    pathway: ["individual", "group", "whole-class"],
    categories: EARLY,
    outline: [
      q("Simplify √48.", SURDS),
      q("Simplify 3√50.", SURDS),
      q("Simplify and collect: √12 + √27.", SURDS, LIN),
      q("Simplify and collect: 2√18 − √8.", SURDS, LIN),
      q("Multiply and simplify: √6 × √10.", SURDS, INDICES),
      q("Multiply and simplify: 2√3 × 5√6.", SURDS, INDICES),
      q("Divide and simplify: 6√10 ÷ 2√5.", SURDS, FRAC),
      q("Expand and simplify: √2(3 + √8).", SURDS, EXPAND),
      q("Solve, leaving the answer exact: √3 x = √75 − √12.", SURDS, LIN, FRAC),
      q("A square tile has area 72 cm². Find its side length and its diagonal, exactly.", WORDED, SURDS, CONCL),
    ],
    topGap: "surds",
    source: "ticket 211, data/pset1/",
  },
  {
    n: 2,
    id: "pset-2",
    name: "Problem Set 2 — Rationalising and expanding with surds",
    due: "Fri 28 Aug",
    topic: "Expanding brackets with surds, perfect squares and (a + b)(a − b) with surds, rationalising single-term and binomial denominators with the conjugate, a geometric problem left exact.",
    newSkills: [SURDS, BINOM],
    pathway: ["individual", "group"],
    categories: EARLY,
    outline: [
      q("Expand and simplify √3(2√3 − 1).", SURDS, EXPAND),
      q("Expand and simplify (2 + √5)(3 − √5).", SURDS, EXPAND),
      q("Expand (√7 + 2)².", BINOM, SURDS),
      q("Expand (3 − √2)(3 + √2).", BINOM, SURDS),
      q("Rationalise 6/√3.", SURDS, FRAC),
      q("Rationalise √2/(2√5).", SURDS, FRAC),
      q("Rationalise 4/(√5 − 1).", BINOM, SURDS, FRAC),
      q("Rationalise (√3 + 1)/(√3 − 1).", BINOM, SURDS, FRAC, EXPAND),
      q("Simplify 1/(2 + √3) + 1/(2 − √3).", BINOM, FRAC),
      q("A rectangle is (3 + √2) cm by (3 − √2) cm. Find its area and the length of its diagonal, exactly.", WORDED, BINOM, SURDS, CONCL),
    ],
    topGap: "binomial identity",
    source: "ticket 212, data/pset2/",
  },
  {
    n: 3,
    id: "pset-3",
    name: "Problem Set 3 — Expanding and factorising",
    due: "Tue 1 Sep",
    topic: "Distributive expansion, perfect squares and the difference of two squares both ways, monic factorising by the pair, common factors first, a first simple non-monic, expanding back to check.",
    newSkills: [BINOM],
    pathway: ["individual", "group", "whole-class"],
    categories: EARLY,
    outline: [
      q("Expand (x + 4)(x − 7).", EXPAND),
      q("Expand (2x − 3)².", BINOM),
      q("Expand (3x + 5)(3x − 5).", BINOM),
      q("Factorise x² − 49.", BINOM),
      q("Factorise x² + 2x − 15.", MONIC),
      q("Factorise x² − 10x + 25.", BINOM, MONIC),
      q("Factorise 3x² − 12x − 36, taking the common factor out first.", EXPAND, MONIC),
      q("Factorise x² − 11x + 24.", MONIC),
      q("Factorise 2x² + 7x + 3.", NONMONIC),
      q("Show that (x + 3)² − (x − 3)² = 12x.", FORMAL, BINOM, EXPAND),
    ],
    topGap: "binomial identity",
    source: "ticket 213, data/pset3/",
  },
  {
    n: 4,
    id: "pset-4",
    name: "Problem Set 4 — Non-monic factorising and completing the square",
    due: "Fri 4 Sep",
    topic: "Non-monic factorising by the split and grouping, solving factorised equations with the null factor law, completing the square (monic, then with a leading coefficient), a worded problem.",
    newSkills: [BINOM, NFL],
    pathway: ["individual", "group"],
    categories: ALL,
    outline: [
      q("Factorise 2x² + 3x − 2.", NONMONIC),
      q("Factorise 3x² + x − 10.", NONMONIC),
      q("Solve (x − 4)(2x + 1) = 0.", NFL, ZERO, FRAC),
      q("Solve 2x² − 7x + 3 = 0.", NONMONIC, NFL, ZERO, FRAC),
      q("Solve x² − 3x = 10.", QUAD, MONIC, NFL, ZERO),
      q("Complete the square: x² + 6x + 2.", BINOM),
      q("Complete the square: x² − 5x + 1.", BINOM, FRAC),
      q("Write 2x² + 8x − 3 in the form a(x + h)² + k and state the turning point.", BINOM, EXPAND, FEAT),
      q("Find the minimum value of x² − 4x + 7 by completing the square.", BINOM, FEAT),
      q("A rectangle's length is 3 cm more than twice its width and its area is 35 cm². Find its width.", WORDED, QUAD, NONMONIC, NFL, CONCL),
    ],
    topGap: "non-monic factorising",
    source: "ticket 214, data/pset4/",
  },
  {
    n: 5,
    id: "pset-5",
    name: "Problem Set 5 — Features of a parabola",
    due: "Mon 7 Sep",
    topic: "The three forms of a quadratic: read the feature each form hands over, compute the others, move between forms.",
    newSkills: [NFL, BINOM],
    pathway: ["individual", "group"],
    categories: ALL,
    outline: null,
    topGap: "graph features",
    source: "data/pset5/ (ticket 187)",
  },
  {
    n: 6,
    id: "pset-6",
    name: "Problem Set 6 — Roots of a quadratic",
    due: "Thu 10 Sep",
    topic: "Solving quadratics by factorising and the formula, the discriminant, roots and the graph.",
    newSkills: [DISC, NFL],
    pathway: ["individual", "group", "whole-class"],
    categories: ALL,
    outline: null,
    topGap: "fractions",
    source: "data/assignment.ts, data/classmates.ts (the live set; rows are the classmates' end state)",
  },
];

/* ---------- the cells ---------- */

const h = (text: string, ...problems: number[]): Pattern => ({ text, problems });
const sec: StoryCell = { status: "secure", patterns: [] };
const sol = (...patterns: Pattern[]): StoryCell => ({ status: "solid", patterns });
const dev = (...patterns: Pattern[]): StoryCell => ({ status: "developing", patterns });
const gap = (...patterns: Pattern[]): StoryCell => ({ status: "gap", patterns });
const un: StoryCell = { status: "unseen", patterns: [] };
const ab: StoryCell = { status: "absent", patterns: [] };
const na: StoryCell = { status: "none", patterns: [] };
const live: StoryCell = { status: "live", patterns: [] };

type Six = readonly [StoryCell, StoryCell, StoryCell, StoryCell, StoryCell, StoryCell];

export interface StoryRow {
  /** Problems handed in on Sets 1–6, in order (0: missing, or absent when the set's cells say so); null for Sam on Set 6, which is live. */
  done: readonly [number, number, number, number, number, number | null];
  /** The student's arc in a sentence. */
  arc: string;
  cells: Record<StoryCategory, Six>;
}

const S6: Six = [sec, sec, sec, sec, sec, sec];
/** Functions and graphing first appear on Set 4. */
const LATE_SECURE: Six = [na, na, na, sec, sec, sec];

/** Every student, Sam first, then the class order (`CLASSMATES`). */
export const STORY: Readonly<Record<string, StoryRow>> = {
  sam: {
    done: [10, 10, 10, 10, 10, null],
    arc: "One sign pattern across five topics: a minus belongs to the term that follows it, and in his working it moves to another term (brackets, a surd bracket, a factor pair, a turning point, a conjugate, half of b). His other lines are right.",
    cells: {
      algebra: [sec, sol(h("a sign lost multiplying out a surd bracket", 2)), sol(h("the signs of a factor pair swapped, not expanded back", 8)), dev(h("right split, the signs put into the wrong brackets", 1, 2)), dev(h("right split, signs in the wrong brackets", 4)), live],
      functions: [na, na, na, sec, sec, live],
      graphing: [na, na, na, sol(h("turning point read with the sign flipped", 8)), dev(h("turning point read with the sign flipped", 6), h("negative a read as concave up", 9)), live],
      communication: [sec, sec, sec, sec, sec, live],
      reasoning: [sec, sec, sec, sec, sec, live],
      new: [sec, sol(h("the conjugate's sign copied from the denominator", 7)), sec, sol(h("half of b taken with the wrong sign completing the square", 7)), sec, live],
    },
  },
  priya: {
    done: [10, 10, 10, 10, 10, 10],
    arc: "Secure in every category on every set.",
    cells: { algebra: S6, functions: LATE_SECURE, graphing: LATE_SECURE, communication: S6, reasoning: S6, new: S6 },
  },
  jordan: {
    done: [10, 10, 9, 8, 8, 7],
    arc: "Writes brackets from numbers that multiply to the constant without expanding back; it starts on Set 3's pairs, is a gap by the non-monic sets, and begins to lift on Set 6. From Set 3 on he does not reach the worded problem.",
    cells: {
      algebra: [sec, sol(h("a bracket expanded without checking the middle terms", 2)), dev(h("a factor pair that multiplies to the constant, not checked by expanding", 8, 9)), gap(h("non-monic pairs not expanded back to check", 1, 2, 4)), gap(h("non-monic pairs not expanded back to check", 4, 8)), dev(h("non-monic factors not checked by expanding", 2), h("a pair that multiplies to 8 but adds to 9", 7))],
      functions: LATE_SECURE,
      graphing: LATE_SECURE,
      communication: S6,
      reasoning: [sec, sec, un, un, un, un],
      new: [sec, sec, sol(h("a perfect square factorised as a difference of squares, not checked", 6)), sec, sec, sec],
    },
  },
  amelia: {
    done: [10, 10, 10, 10, 10, 10],
    arc: "Something added or cleared is not taken back (the square's constant, the third), and her closing sentence does not follow from her own working, which slides from solid to a gap as the worded problems get harder.",
    cells: {
      algebra: [dev(h("cancelled the numbers but not the surds when dividing", 7)), dev(h("a denominator dropped adding the two fractions", 9)), sol(h("a common factor taken out and not put back in the answer", 7)), sol(h("half of b squared as a whole number over 2", 7)), sol(h("sum of the intercepts never halved", 8)), dev(h("multiplied through by 3 and never took it back out", 7))],
      functions: LATE_SECURE,
      graphing: LATE_SECURE,
      communication: S6,
      reasoning: [sec, sol(h("the area found, the sentence about the diagonal left out", 10)), dev(h("the last line doesn't say what was shown", 10)), dev(h("the negative width kept in the answer sentence", 10)), gap(h("the landing given as the nozzle's zero", 10)), gap(h("said the graph crosses twice", 10))],
      new: [sol(h("√12 + √27 collected before simplifying", 3)), dev(h("multiplied only the denominator by the conjugate", 7, 8)), dev(h("(2x − 3)² expanded without the middle term", 2)), dev(h("added 9 to complete the square, never took it away", 6)), dev(h("added 16 to complete the square, never took it away", 6)), dev(h("read “touches once” as discriminant > 0", 6))],
    },
  },
  tomas: {
    done: [9, 8, 10, 9, 7, 7],
    arc: "Turns fractions over and copies the sign printed in a bracket. A gap in algebra from Set 3 on; on most sets his work ends before the worded problem.",
    cells: {
      algebra: [dev(h("the fraction turned over dividing surds", 7)), dev(h("the fraction turned over rationalising", 5, 6)), gap(h("signs in the second bracket copied, not multiplied", 1), h("a negative common factor's sign lost", 7)), gap(h("solved 2x + 1 = 0 as x = −2", 3), h("fractions lost in half of b", 7)), gap(h("solved 3x + 2 = 0 as −3/2", 4)), gap(h("divided by a, not 2a", 4), h("scaled two of three terms", 7))],
      functions: [na, na, na, sol(h("a root's sign copied from its bracket", 5)), sec, sec],
      graphing: [na, na, na, sol(h("the minimum's x read with the sign flipped", 9)), sol(h("h read as +3 from (x + 3)", 2), h("axis of symmetry without the minus", 5)), sec],
      communication: S6,
      reasoning: [un, un, sol(h("both squares expanded, the subtraction's signs not shown", 10)), un, un, un],
      new: [sol(h("a sign lost collecting 2√18 − √8", 4)), dev(h("multiplied by the same bracket, not its conjugate", 7)), dev(h("the middle term's sign copied from the bracket", 2)), gap(h("factors set to zero with their signs flipped", 3), h("half of b taken with the wrong sign", 6)), gap(h("intercepts read off the factors with the signs flipped", 1)), dev(h("null factor law on a product that isn't 0", 3))],
    },
  },
  zara: {
    done: [10, 10, 10, 10, 10, 10],
    arc: "Gives the axis where the height is asked (from Set 4's minimum value on), and adds to complete the square without taking it away.",
    cells: {
      algebra: [sec, sol(h("a common denominator found, one numerator not scaled", 9)), sec, sol(h("half of −5 squared as 25/2", 7)), sol(h("solved 3x + 2 = 0 as −3/2", 4)), dev(h("multiplied through by 3 and never took it back out", 7))],
      functions: LATE_SECURE,
      graphing: [na, na, na, sol(h("the minimum value given as the x of the turning point", 9)), sol(h("axis given as the height", 10)), sol(h("axis given as the height", 9))],
      communication: S6,
      reasoning: S6,
      new: [sec, sol(h("(√7 + 2)² with 2√7 for the middle term", 3)), sol(h("x² − 49 factorised as (x − 7)²", 4)), dev(h("added the square to complete it, never took it away", 6, 8, 9)), dev(h("added 16 to complete the square, never took it away", 6)), sol(h("null factor law on a product that isn't 0", 3))],
    },
  },
  liam: {
    done: [5, 5, 5, 5, 5, 4],
    arc: "Hands in about half and does not reach the last problems: five on every finished set, four on Set 6 with a fifth started. Writes brackets and pairs without expanding back to check.",
    cells: {
      algebra: [un, dev(h("only two of the four terms expanded", 2)), gap(h("a factor pair not expanded back to check", 5)), gap(h("non-monic pairs not expanded back to check", 1, 2)), gap(h("non-monic pairs not expanded back to check", 4)), gap(h("a factor pair not expanded back to check", 1, 2))],
      functions: [na, na, na, un, sec, un],
      graphing: [na, na, na, un, sec, un],
      communication: [sec, sec, sec, sec, sec, sec],
      reasoning: [un, un, un, un, un, un],
      new: [dev(h("√50 written as 25√2", 2)), gap(h("(√7 + 2)² squared term by term", 3)), dev(h("(2x − 3)² squared term by term", 2)), un, gap(h("intercepts read off the factors with the signs flipped", 1)), gap(h("null factor law on a product that isn't 0", 3))],
    },
  },
  aiden: {
    done: [10, 10, 10, 10, 10, 10],
    arc: "Right almost everywhere; scales part of an expression and leaves the rest, on every set.",
    cells: {
      algebra: [dev(h("√2 multiplied into the first term only", 8)), dev(h("√3 multiplied into the first term only", 1)), dev(h("the common factor divided out of the first two terms only", 7)), dev(h("the 2 taken out of 2x² only", 8)), dev(h("the 2 multiplied x² and nothing else", 7)), dev(h("scaled two of three terms", 7))],
      functions: LATE_SECURE,
      graphing: LATE_SECURE,
      communication: S6,
      reasoning: S6,
      new: S6,
    },
  },
  mia: {
    done: [10, 10, 10, 10, 10, 10],
    arc: "With a number in front of x² she writes brackets in turn without expanding back. Secure on surds, a gap from the non-monic set on.",
    cells: {
      algebra: [sec, sol(h("a denominator dropped adding fractions", 9)), dev(h("brackets tried in turn, none expanded back", 9)), gap(h("non-monic pairs not expanded back to check", 1, 4)), gap(h("non-monic pairs not expanded back to check", 4, 8)), gap(h("a factor pair never expanded back", 2), h("took −x out and left the sign behind", 9))],
      functions: [na, na, na, sol(h("solved 2x − 1 = 0 as x = −1/2", 4)), sec, sec],
      graphing: LATE_SECURE,
      communication: S6,
      reasoning: S6,
      new: [sec, sec, sol(h("x² − 49 written as (x − 7)²", 4)), sol(h("half of b squared without its sign", 6)), sec, sec],
    },
  },
  noah: {
    done: [10, 10, 10, 10, 10, 9],
    arc: "Secure outside New skills, where he squares a bracket term by term on every set that asks for one.",
    cells: {
      algebra: S6,
      functions: LATE_SECURE,
      graphing: LATE_SECURE,
      communication: S6,
      reasoning: S6,
      new: [sec, sol(h("(√7 + 2)² squared term by term", 3)), dev(h("(2x − 3)² squared term by term", 2)), sol(h("the square completed, its constant not taken away", 6)), dev(h("(x − 3)² squared term by term", 7)), sol(h("null factor law on a product that isn't 0", 3))],
    },
  },
  chloe: {
    done: [10, 10, 10, 10, 10, 0],
    arc: "Writes a pair without checking it, and loses a negative's sign: a root rearranged, (−3)² taken as −9. Hands in every set she sits; away for Set 6, where she is the class's absent student.",
    cells: {
      algebra: [sec, sol(h("a denominator dropped adding fractions", 9)), sol(h("a factor pair written without checking", 8)), dev(h("a non-monic pair not expanded back to check", 2), h("halves lost completing the square", 7)), dev(h("non-monic pair not expanded back to check", 4), h("sum of the intercepts never halved", 8)), ab],
      functions: [na, na, na, sol(h("a root's sign lost rearranging", 5)), sol(h("(−3)² taken as −9", 5)), ab],
      graphing: [na, na, na, sec, sec, ab],
      communication: [sec, sec, sec, sec, sec, ab],
      reasoning: [sec, sec, sec, sec, sec, ab],
      new: [sol(h("√48 simplified to 2√12 and left there", 1), h("√60 taken as 4√15, the 4 not rooted", 5)), sol(h("the conjugate multiplied on the bottom only", 8)), sec, sec, sec, ab],
    },
  },
  ethan: {
    done: [10, 10, 10, 10, 10, 8],
    arc: "Leaves steps unwritten, most on the last problems: the axis given as the height, working written in one line.",
    cells: {
      algebra: [sec, sol(h("a term dropped expanding", 8)), sol(h("a factor pair written without checking the middle", 8)), dev(h("a non-monic pair not expanded back to check", 2), h("factorised before making the equation equal zero", 5)), sol(h("non-monic pair not expanded back to check", 8)), dev(h("divided by a, not 2a", 4), h("multiplied through by 3 and never took it back out", 7))],
      functions: [na, na, na, sol(h("a root's sign lost", 4)), sol(h("(−3)² taken as −9, the axis not shown", 5)), sec],
      graphing: [na, na, na, dev(h("the minimum value given as the x, the working not shown", 9)), sol(h("axis given as the height, the working not shown", 10)), sol(h("axis given as the height, a step skipped", 9))],
      communication: [sol(h("steps not shown on the exact answer", 9)), sol(h("the rationalising done in one line", 8)), sol(h("the square completed in one line", 6)), dev(h("steps not shown completing the square and in the worded problem", 8, 10)), sol(h("the landing written straight down, the working not shown", 10)), sol(h("the height given in one line", 9))],
      reasoning: S6,
      new: [sec, sec, sol(h("a perfect square's middle term with the wrong sign", 6)), sol(h("half of −5 taken as −5/4", 7)), sec, sec],
    },
  },
  isla: {
    done: [10, 10, 10, 10, 10, 10],
    arc: "Copies a sign from the bracket instead of working it out, and her closing sentence says something her working does not, a gap from the non-monic set on.",
    cells: {
      algebra: [sec, sol(h("the product's sign copied from the bracket", 2)), dev(h("signs in the second bracket copied, not multiplied", 1), h("the common factor's sign left behind", 7)), dev(h("x² − 3x = 10 rearranged with the 10's sign copied", 5)), dev(h("took −1 out and left the signs inside behind", 9)), dev(h("−b written as −5", 4), h("scaled two of three terms", 7))],
      functions: LATE_SECURE,
      graphing: [na, na, na, sol(h("the turning point's sign copied from the bracket", 8)), sol(h("axis of symmetry without the minus", 5)), sec],
      communication: S6,
      reasoning: [sec, sol(h("the sentence gives the area where the diagonal was asked", 10)), dev(h("the working shown, the last line doesn't say what it shows", 10)), gap(h("the negative width given in the sentence", 10)), gap(h("the landing given as the nozzle's zero", 10)), gap(h("said the graph crosses twice", 10))],
      new: [sol(h("a sign copied subtracting like surds", 4)), sec, sec, sec, sec, sec],
    },
  },
  lucas: {
    done: [10, 10, 10, 10, 10, 10],
    arc: "Reads a number as the wrong feature: the turning point's sign, which way a sign moves the graph, what his result says in context. Graphing lifts to secure by Set 6; reasoning slides to a gap.",
    cells: {
      algebra: [sec, sol(h("a sign lost expanding (2 + √5)(3 − √5)", 2)), sol(h("a pair that multiplies to 24 but adds to 10", 8)), dev(h("x² − 3x = 10 rearranged with a sign lost", 5)), dev(h("took −1 out and left the signs inside behind", 9)), dev(h("a pair that multiplies to 8 but adds to 9", 7))],
      functions: LATE_SECURE,
      graphing: [na, na, na, dev(h("the turning point read with the sign flipped", 8, 9)), sol(h("turning point read with the sign flipped", 2, 3)), sec],
      communication: S6,
      reasoning: [sec, sol(h("the diagonal stated without saying which length it is", 10)), sol(h("the identity shown, one line's sign not justified", 10)), dev(h("width and length swapped in the sentence", 10)), gap(h("the landing given as the nozzle's zero", 10)), gap(h("negative discriminant, two solutions", 10))],
      new: S6,
    },
  },
  grace: {
    done: [8, 7, 9, 6, 7, 4],
    arc: "Right every time, several steps to a line; starts later than the class, so does not reach the last problems. Communication is developing on every set.",
    cells: {
      algebra: S6,
      functions: [na, na, na, sec, sec, un],
      graphing: [na, na, na, un, sec, un],
      communication: [sol(h("simplified in one line, the square factor not shown", 1, 2)), dev(h("rationalised in one line", 5, 6, 7)), dev(h("factorised in one line, the pair not shown", 5, 8)), dev(h("solved in one line", 3, 4)), dev(h("right every time, with steps left out a reader needs", 1, 2)), dev(h("right every time, with steps left out a reader needs", 1, 2))],
      reasoning: [un, un, un, un, un, un],
      new: S6,
    },
  },
  harper: {
    done: [10, 10, 10, 10, 10, 6],
    arc: "Signs and heights: a sign lost in an expansion, a height read from the wrong line, a square completed in one line. Algebra and graphing drift down to gaps by Set 6.",
    cells: {
      algebra: [sec, sol(h("the minus not multiplied through the bracket", 1)), dev(h("a sign lost in the expansion", 1), h("the common factor's sign lost", 7)), dev(h("a sign lost rearranging x² − 3x = 10", 5)), dev(h("the 2 multiplied x² and nothing else", 7)), gap(h("a sign lost in the expansion", 3))],
      functions: LATE_SECURE,
      graphing: [na, na, na, sol(h("the minimum value read off the wrong line", 9)), dev(h("negative a read as concave up", 9), h("axis given as the height, the working not shown", 10)), gap(h("turning point's height from the wrong line", 5), h("axis given as the height, the working not shown", 9))],
      communication: [sec, sec, sol(h("the perfect square written in one line", 6)), sol(h("the square completed in one line", 8)), sol(h("the landing written straight down", 10)), sol(h("the height given in one line", 9))],
      reasoning: S6,
      new: [sec, sol(h("(√7 + 2)² with the middle term's 2 lost", 3)), sol(h("(2x − 3)²'s middle term sign lost", 2)), sec, sec, sec],
    },
  },
  oliver: {
    done: [10, 10, 9, 8, 9, 7],
    arc: "Writes pairs without expanding back, squares a bracket term by term, and uses the null factor law on a product that isn't zero from Set 4 on. Algebra is a gap on the factorising sets and lifts on Set 6.",
    cells: {
      algebra: [sec, sol(h("the middle term written without multiplying it out", 2)), dev(h("factor pairs written without expanding back", 5, 8)), gap(h("non-monic pairs not expanded back to check", 1, 2)), gap(h("non-monic pairs not expanded back to check", 4, 8)), dev(h("factor pairs not expanded back", 1, 2), h("scaled two of three terms", 7))],
      functions: LATE_SECURE,
      graphing: LATE_SECURE,
      communication: S6,
      reasoning: [sec, sec, un, un, un, un],
      new: [sol(h("√8 simplified as 4√2", 4), h("√(72 + 72) split into √72 + √72", 10)), sol(h("(3 − √2)(3 + √2) taken as 9 + 2", 4)), dev(h("(2x − 3)² squared term by term", 2)), dev(h("null factor law on x(x − 3) = 10, a product that isn't 0", 5)), dev(h("(x − 3)² squared term by term", 7)), dev(h("null factor law on a product that isn't 0", 3))],
    },
  },
  ruby: {
    done: [10, 10, 10, 10, 10, 10],
    arc: "Takes a pair that multiplies without checking it adds, and reads the height off the wrong part of the turning point; algebra dips to a gap on Set 5 and recovers.",
    cells: {
      algebra: [sec, sol(h("a common denominator's numerator not scaled", 9)), dev(h("a pair that multiplies to −15 but doesn't add to 2", 5, 8)), dev(h("a pair that multiplies but doesn't add, never expanded back", 4, 5)), gap(h("a pair that multiplies to −8 but doesn't add to −2", 9)), dev(h("a pair that multiplies to 8 but adds to 9", 7))],
      functions: [na, na, na, sec, sol(h("(−3)² taken as −9", 5)), sec],
      graphing: [na, na, na, sol(h("the minimum value given as the x of the turning point", 9)), sol(h("axis given as the height", 10)), dev(h("turning point's height from the wrong line", 5), h("axis given as the height", 9))],
      communication: S6,
      reasoning: S6,
      new: [sol(h("a square factor left under the root", 1, 6)), sec, sec, sec, sec, sec],
    },
  },
  finn: {
    done: [10, 10, 10, 10, 10, 10],
    arc: "Right factors, then a sign or a fraction flipped solving them; a turning point read with its sign flipped. Algebra slides one step at a time to a gap on Set 6.",
    cells: {
      algebra: [sol(h("divided the wrong way round solving for x", 9)), sol(h("the fraction turned over rationalising", 6)), dev(h("a factor's sign flipped writing the pair", 8)), dev(h("solved 2x + 1 = 0 as x = −2", 3, 4)), dev(h("solved 3x + 2 = 0 as −3/2", 4), h("sum of the intercepts never halved", 8)), gap(h("divided by a, not 2a", 4), h("sign lost solving 2x − 1 = 0", 2))],
      functions: LATE_SECURE,
      graphing: [na, na, na, sol(h("turning point read with the sign flipped", 8)), sol(h("turning point read with the sign flipped", 6)), sol(h("turning point's height from the wrong line", 5))],
      communication: S6,
      reasoning: S6,
      new: S6,
    },
  },
  sofia: {
    done: [10, 10, 10, 10, 10, 10],
    arc: "Fractions and halves lost or turned over, and non-monic pairs not expanded back. Algebra developing on the surd sets, a gap from Set 4 on.",
    cells: {
      algebra: [dev(h("the fraction left upside down dividing surds", 7)), dev(h("rationalised the top instead of the bottom", 5, 6)), dev(h("a non-monic pair not checked", 9)), gap(h("halves lost completing the square", 7), h("a non-monic pair not checked", 2)), gap(h("non-monic pairs not expanded back to check", 4, 8)), gap(h("denominator a, not 2a", 4), h("scaled two of three terms", 7))],
      functions: LATE_SECURE,
      graphing: LATE_SECURE,
      communication: S6,
      reasoning: S6,
      new: [sec, sol(h("the conjugate's fraction left unsimplified", 7)), sec, sol(h("(5/2)² taken as 5/4 completing the square", 7)), sec, sec],
    },
  },
};

/* ---------- the review part (tickets 244, 281) ---------- */

/**
 * Where review left a problem a student brought to their group (ticket 278: one they got wrong, left incomplete or did not
 * attempt): fixed on their own rework (`individual`), solved by their seating group (`group`), or still wrong (`wrong`,
 * their group's own last try on it unsolved).
 */
export type ReviewOutcome = "individual" | "group" | "wrong";

/** One problem (by number, Q1 = 1): its outcome and the reasoning, checked against the student's real work. */
export interface ReviewCase {
  q: number;
  outcome: ReviewOutcome;
  why: string;
}

/** One set's review: each student's group problems in order; a student with none (or Sam on the live set, or a student away) has no entry. */
export type StoryReview = Readonly<Record<string, readonly ReviewCase[]>>;

const own = (q: number, why: string): ReviewCase => ({ q, outcome: "individual", why });
const grp = (q: number, why: string): ReviewCase => ({ q, outcome: "group", why });
const kept = (q: number, why: string): ReviewCase => ({ q, outcome: "wrong", why });

/**
 * The review part: for Problem Sets 1–6 (index 0–5), every student's group problems and where review left each, with the
 * reasoning checked against the student's real work. The rules, settled with the user on 2026-09-14 (ticket 281;
 * `lib/reviewRule.ts` applies them literally and the tests hold this sheet to them):
 * - a **one-off** slip (the mistake on that one problem of the set, the sheet's pattern naming only it, no gap in its
 *   category) is fixed on the student's own rework;
 * - everything else is the group's: a **repeated** slip, a **pattern** (a gap in the slip's category on the set), a
 *   problem left **incomplete** or **not attempted**. The group solves it when a member at the table had it right first
 *   time, a pattern included; a problem nobody at the table had right stays unsolved, on the group's own last try;
 * - at most once a set, the **exception**: a problem nobody had right that the group solves because one member's first
 *   submission went wrong on a single line and the hint after the second wrong check named it (Set 6's Q9 at sky);
 * - on every set one or two groups meet the set's hardest problem with nobody at the table able to do it (violet's Q10 on
 *   Set 1, mint's Q10 on Sets 2–4 and 6, mint's Q9 and Q10 on Set 5), and the demo group's Set 6 run is its script.
 * The records (`data/psetN/review.ts`, `data/classmates-review.ts`) equal it: `data/finishedSets.test.ts`, `data/story.test.ts`.
 */
export const STORY_REVIEW: readonly StoryReview[] = [
  // Problem Set 1
  {
    amelia: [
      own(3, "One-off: √12 + √27 collected before simplifying, on Q3 alone. Found on the second submission."),
      own(7, "One-off: cancelled the numbers but not the surds when dividing, on Q7 alone. Found on the second submission."),
    ],
    tomas: [
      own(4, "One-off: a sign lost collecting 2√18 − √8, on Q4 alone. Found on the second submission."),
      own(7, "One-off: the fraction turned over dividing surds, on Q7 alone. Found on the second submission."),
      grp(10, "Not attempted. Priya, Amelia and Aiden had Q10 right, and the group's rework holds."),
    ],
    liam: [
      own(2, "One-off: √50 written as 25√2, on Q2 alone. Found on the second submission."),
      own(3, "One-off: √12 and √27 added under one root, on Q3 alone. Found on the second submission."),
      own(4, "One-off: the subtraction collected as an addition, on Q4 alone. Found on the second submission."),
      grp(6, "Not attempted. Sam, Jordan and Zara had Q6 right, and the group's rework holds."),
      grp(7, "Not attempted. Sam, Jordan and Zara had Q7 right, and the group's rework holds."),
      grp(8, "Not attempted. Sam, Jordan and Zara had Q8 right, and the group's rework holds."),
      grp(9, "Not attempted. Sam, Jordan and Zara had Q9 right, and the group's rework holds."),
      grp(10, "Not attempted. Sam, Jordan and Zara had Q10 right, and the group's rework holds."),
    ],
    aiden: [
      own(8, "One-off: √2 multiplied into the first term only, on Q8 alone. Found on the second submission."),
    ],
    chloe: [
      own(1, "One-off: √48 simplified to 2√12 and left there, on Q1 alone. Found on the second submission."),
      own(5, "One-off: √60 taken as 4√15, the 4 not rooted, on Q5 alone. Found on the second submission."),
    ],
    isla: [
      own(4, "One-off: a sign copied subtracting like surds, on Q4 alone. Found on the second submission."),
    ],
    grace: [
      grp(9, "Not attempted. Isla, Lucas and Harper had Q9 right, and the group's rework holds."),
      grp(10, "Not attempted. Isla, Lucas and Harper had Q10 right, and the group's rework holds."),
    ],
    oliver: [
      own(4, "One-off: √8 simplified as 4√2, on Q4 alone. Found on the second submission."),
      own(10, "One-off: √(72 + 72) split into √72 + √72, on Q10 alone. Found on the second submission."),
    ],
    ruby: [
      grp(1, "Repeated: a square factor left under the root (Q1, Q6, Q10). Oliver, Finn and Sofia had Q1 right, and the group's rework holds."),
      grp(6, "Repeated: a square factor left under the root (Q1, Q6, Q10). Oliver, Finn and Sofia had Q6 right, and the group's rework holds."),
      kept(10, "Repeated: a square factor left under the root (Q1, Q6, Q10). Nobody at the table had Q10 right, so the group's last try is still wrong."),
    ],
    finn: [
      grp(9, "Repeated: divided the wrong way round solving for x (Q9, Q10). Oliver, Ruby and Sofia had Q9 right, and the group's rework holds."),
      kept(10, "Repeated: the diagonal found by dividing the side by √2 (Q9, Q10). Nobody at the table had Q10 right, so the group's last try is still wrong."),
    ],
    sofia: [
      own(7, "One-off: the fraction left upside down dividing surds, on Q7 alone. Found on the second submission."),
      own(10, "One-off: the diagonal found by dividing the side by √2, on Q10 alone. Found on the second submission."),
    ],
  },
  // Problem Set 2
  {
    sam: [
      own(2, "One-off: √5 × (−√5) as +5, on Q2 alone. Found on the second submission."),
      own(7, "One-off: the conjugate's sign copied from the denominator, on Q7 alone. Found on the second submission."),
    ],
    jordan: [
      own(2, "One-off: a bracket expanded without checking the middle terms, on Q2 alone. Found on the second submission."),
    ],
    amelia: [
      grp(7, "Repeated: multiplied only the denominator by the conjugate (Q7, Q8). Priya and Aiden had Q7 right, and the group's rework holds."),
      grp(8, "Repeated: multiplied only the denominator by the conjugate (Q7, Q8). Priya, Tomas and Aiden had Q8 right, and the group's rework holds."),
      own(9, "One-off: a denominator dropped adding the two fractions, on Q9 alone. Found on the second submission."),
      own(10, "One-off: the area found, the sentence about the diagonal left out, on Q10 alone. Found on the second submission."),
    ],
    tomas: [
      grp(5, "Repeated: the fraction turned over rationalising (Q5, Q6). Priya, Amelia and Aiden had Q5 right, and the group's rework holds."),
      grp(6, "Repeated: the fraction turned over rationalising (Q5, Q6). Priya, Amelia and Aiden had Q6 right, and the group's rework holds."),
      own(7, "One-off: multiplied by the same bracket, not its conjugate, on Q7 alone. Found on the second submission."),
      grp(9, "Not attempted. Priya and Aiden had Q9 right, and the group's rework holds."),
      grp(10, "Not attempted. Priya and Aiden had Q10 right, and the group's rework holds."),
    ],
    zara: [
      own(3, "One-off: (√7 + 2)² with 2√7 for the middle term, on Q3 alone. Found on the second submission."),
      own(9, "One-off: a common denominator found, one numerator not scaled, on Q9 alone. Found on the second submission."),
    ],
    liam: [
      own(2, "One-off: only two of the four terms expanded, on Q2 alone. Found on the second submission."),
      grp(3, "Pattern: New skills is a gap on the set ((√7 + 2)² squared term by term). Sam and Jordan had Q3 right, and the group's rework holds."),
      grp(4, "Pattern: New skills is a gap on the set ((3 − √2)(3 + √2) taken as 9 + 2). Sam, Jordan and Zara had Q4 right, and the group's rework holds."),
      grp(6, "Not attempted. Sam, Jordan and Zara had Q6 right, and the group's rework holds."),
      grp(7, "Not attempted. Jordan and Zara had Q7 right, and the group's rework holds."),
      grp(8, "Not attempted. Sam, Jordan and Zara had Q8 right, and the group's rework holds."),
      grp(9, "Not attempted. Sam and Jordan had Q9 right, and the group's rework holds."),
      grp(10, "Not attempted. Sam, Jordan and Zara had Q10 right, and the group's rework holds."),
    ],
    aiden: [
      own(1, "One-off: √3 multiplied into the first term only, on Q1 alone. Found on the second submission."),
    ],
    mia: [
      own(9, "One-off: a denominator dropped adding fractions, on Q9 alone. Found on the second submission."),
    ],
    noah: [
      own(3, "One-off: (√7 + 2)² squared term by term, on Q3 alone. Found on the second submission."),
    ],
    chloe: [
      own(8, "One-off: the conjugate multiplied on the bottom only, on Q8 alone. Found on the second submission."),
      own(9, "One-off: a denominator dropped adding fractions, on Q9 alone. Found on the second submission."),
    ],
    ethan: [
      own(8, "One-off: a term dropped expanding, on Q8 alone. Found on the second submission."),
    ],
    isla: [
      own(2, "One-off: the product's sign copied from the bracket, on Q2 alone. Found on the second submission."),
      own(10, "One-off: the sentence gives the area where the diagonal was asked, on Q10 alone. Found on the second submission."),
    ],
    lucas: [
      own(2, "One-off: a sign lost expanding (2 + √5)(3 − √5), on Q2 alone. Found on the second submission."),
      own(10, "One-off: the diagonal stated without saying which length it is, on Q10 alone. Found on the second submission."),
    ],
    grace: [
      grp(8, "Not attempted. Isla, Lucas and Harper had Q8 right, and the group's rework holds."),
      grp(9, "Not attempted. Isla, Lucas and Harper had Q9 right, and the group's rework holds."),
      kept(10, "Not attempted. Nobody at the table had Q10 right, so the group's last try is still wrong."),
    ],
    harper: [
      own(1, "One-off: the minus not multiplied through the bracket, on Q1 alone. Found on the second submission."),
      grp(3, "Repeated: (√7 + 2)² with the middle term's 2 lost (Q3, Q10). Isla, Lucas and Grace had Q3 right, and the group's rework holds."),
      kept(10, "Repeated: (3 − √2)²'s middle term not doubled (Q3, Q10). Nobody at the table had Q10 right, so the group's last try is still wrong."),
    ],
    oliver: [
      own(2, "One-off: the middle term written without multiplying it out, on Q2 alone. Found on the second submission."),
      own(4, "One-off: (3 − √2)(3 + √2) taken as 9 + 2, on Q4 alone. Found on the second submission."),
    ],
    ruby: [
      own(9, "One-off: a common denominator's numerator not scaled, on Q9 alone. Found on the second submission."),
    ],
    finn: [
      own(6, "One-off: the fraction turned over rationalising, on Q6 alone. Found on the second submission."),
    ],
    sofia: [
      grp(5, "Repeated: rationalised the top instead of the bottom (Q5, Q6). Oliver, Ruby and Finn had Q5 right, and the group's rework holds."),
      grp(6, "Repeated: rationalised the top instead of the bottom (Q5, Q6). Oliver and Ruby had Q6 right, and the group's rework holds."),
      own(7, "One-off: the conjugate's fraction left unsimplified, on Q7 alone. Found on the second submission."),
    ],
  },
  // Problem Set 3
  {
    sam: [
      own(8, "One-off: the signs of a factor pair swapped, not expanded back, on Q8 alone. Found on the second submission."),
    ],
    jordan: [
      own(6, "One-off: a perfect square factorised as a difference of squares, not checked, on Q6 alone. Found on the second submission."),
      grp(8, "Repeated: a factor pair that multiplies to the constant, not checked by expanding (Q8, Q9). Zara had Q8 right, and the group's rework holds."),
      grp(9, "Repeated: a factor pair that multiplies to the constant, not checked by expanding (Q8, Q9). Sam and Zara had Q9 right, and the group's rework holds."),
      grp(10, "Not attempted. Sam and Zara had Q10 right, and the group's rework holds."),
    ],
    amelia: [
      own(2, "One-off: (2x − 3)² expanded without the middle term, on Q2 alone. Found on the second submission."),
      own(4, "One-off: difference of squares as square, on Q4 alone. Found on the second submission."),
      own(7, "One-off: a common factor taken out and not put back in the answer, on Q7 alone. Found on the second submission."),
      own(10, "One-off: the last line doesn't say what was shown, on Q10 alone. Found on the second submission."),
    ],
    tomas: [
      grp(1, "Pattern: Algebra is a gap on the set (signs in the second bracket copied, not multiplied). Priya and Amelia had Q1 right, and the group's rework holds."),
      own(2, "One-off: the middle term's sign copied from the bracket, on Q2 alone. Found on the second submission."),
      own(6, "One-off: the square's sign flipped, on Q6 alone. Found on the second submission."),
      grp(7, "Pattern: Algebra is a gap on the set (a negative common factor's sign lost). Priya had Q7 right, and the group's rework holds."),
      own(10, "One-off: both squares expanded, the subtraction's signs not shown, on Q10 alone. Found on the second submission."),
    ],
    zara: [
      own(4, "One-off: x² − 49 factorised as (x − 7)², on Q4 alone. Found on the second submission."),
    ],
    liam: [
      own(2, "One-off: (2x − 3)² squared term by term, on Q2 alone. Found on the second submission."),
      grp(5, "Pattern: Algebra is a gap on the set (a factor pair written without expanding back). Sam, Jordan and Zara had Q5 right, and the group's rework holds."),
      grp(6, "Not attempted. Sam and Zara had Q6 right, and the group's rework holds."),
      grp(7, "Not attempted. Sam, Jordan and Zara had Q7 right, and the group's rework holds."),
      grp(8, "Not attempted. Zara had Q8 right, and the group's rework holds."),
      grp(9, "Not attempted. Sam and Zara had Q9 right, and the group's rework holds."),
      grp(10, "Not attempted. Sam and Zara had Q10 right, and the group's rework holds."),
    ],
    aiden: [
      own(1, "One-off: the 4 on x only, on Q1 alone. Found on the second submission."),
      own(3, "One-off: (3x)² as 3x², on Q3 alone. Found on the second submission."),
      own(7, "One-off: the common factor divided out of the first two terms only, on Q7 alone. Found on the second submission."),
    ],
    mia: [
      own(4, "One-off: x² − 49 written as (x − 7)², on Q4 alone. Found on the second submission."),
      own(9, "One-off: brackets tried in turn, none expanded back, on Q9 alone. Found on the second submission."),
    ],
    noah: [
      grp(2, "Repeated: (2x − 3)² squared term by term (Q2, Q10). Mia, Chloe and Ethan had Q2 right, and the group's rework holds."),
      grp(10, "Repeated: (2x − 3)² squared term by term (Q2, Q10). Mia, Chloe and Ethan had Q10 right, and the group's rework holds."),
    ],
    chloe: [
      own(8, "One-off: a factor pair written without checking, on Q8 alone. Found on the second submission."),
    ],
    ethan: [
      own(6, "One-off: a perfect square's middle term with the wrong sign, on Q6 alone. Found on the second submission."),
      own(8, "One-off: a factor pair written without checking the middle, on Q8 alone. Found on the second submission."),
    ],
    isla: [
      own(1, "One-off: signs in the second bracket copied, not multiplied, on Q1 alone. Found on the second submission."),
      own(7, "One-off: the common factor's sign left behind, on Q7 alone. Found on the second submission."),
      own(10, "One-off: the working shown, the last line doesn't say what it shows, on Q10 alone. Found on the second submission."),
    ],
    lucas: [
      own(8, "One-off: a pair that multiplies to 24 but adds to 10, on Q8 alone. Found on the second submission."),
      own(10, "One-off: the identity shown, one line's sign not justified, on Q10 alone. Found on the second submission."),
    ],
    grace: [
      kept(10, "Not attempted. Nobody at the table had Q10 right, so the group's last try is still wrong."),
    ],
    harper: [
      grp(1, "Repeated: a sign lost in the expansion (Q1, Q10). Lucas and Grace had Q1 right, and the group's rework holds."),
      own(2, "One-off: (2x − 3)²'s middle term sign lost, on Q2 alone. Found on the second submission."),
      own(7, "One-off: the common factor's sign lost, on Q7 alone. Found on the second submission."),
      kept(10, "Repeated: x² − x² collected as 2x² (Q1, Q10). Nobody at the table had Q10 right, so the group's last try is still wrong."),
    ],
    oliver: [
      own(2, "One-off: (2x − 3)² squared term by term, on Q2 alone. Found on the second submission."),
      grp(5, "Repeated: factor pairs written without expanding back (Q5, Q8). Sofia had Q5 right, and the group's rework holds."),
      own(6, "One-off: perfect square as difference, on Q6 alone. Found on the second submission."),
      grp(8, "Repeated: factor pairs written without expanding back (Q5, Q8). Sofia had Q8 right, and the group's rework holds."),
      grp(10, "Not attempted. Ruby, Finn and Sofia had Q10 right, and the group's rework holds."),
    ],
    ruby: [
      grp(5, "Repeated: a pair that multiplies to −15 but doesn't add to 2 (Q5, Q8). Sofia had Q5 right, and the group's rework holds."),
      grp(8, "Repeated: a pair that multiplies to −15 but doesn't add to 2 (Q5, Q8). Sofia had Q8 right, and the group's rework holds."),
    ],
    finn: [
      grp(5, "Repeated: a factor's sign flipped writing the pair, the check copied from the question (Q5, Q8). Sofia had Q5 right, and the group's rework holds."),
      grp(8, "Repeated: a factor's sign flipped writing the pair (Q5, Q8). Sofia had Q8 right, and the group's rework holds."),
    ],
    sofia: [
      own(9, "One-off: a non-monic pair not checked, on Q9 alone. Found on the second submission."),
    ],
  },
  // Problem Set 4
  {
    sam: [
      grp(1, "Repeated: right split, the signs put into the wrong brackets (Q1, Q2). Zara had Q1 right, and the group's rework holds."),
      grp(2, "Repeated: right split, the signs put into the wrong brackets (Q1, Q2). Zara had Q2 right, and the group's rework holds."),
      own(7, "One-off: half of b taken with the wrong sign completing the square, on Q7 alone. Found on the second submission."),
      own(8, "One-off: turning point read with the sign flipped, on Q8 alone. Found on the second submission."),
    ],
    jordan: [
      grp(1, "Pattern: Algebra is a gap on the set (non-monic pairs not expanded back to check). Zara had Q1 right, and the group's rework holds."),
      grp(2, "Pattern: Algebra is a gap on the set (non-monic pairs not expanded back to check). Zara had Q2 right, and the group's rework holds."),
      grp(4, "Pattern: Algebra is a gap on the set (non-monic pairs not expanded back to check). Sam and Zara had Q4 right, and the group's rework holds."),
      grp(9, "Not attempted. Sam had Q9 right, and the group's rework holds."),
      grp(10, "Not attempted. Sam and Zara had Q10 right, and the group's rework holds."),
    ],
    amelia: [
      own(6, "One-off: added 9 to complete the square, never took it away, on Q6 alone. Found on the second submission."),
      own(7, "One-off: half of b squared as a whole number over 2, on Q7 alone. Found on the second submission."),
      own(10, "One-off: the negative width kept in the answer sentence, on Q10 alone. Found on the second submission."),
    ],
    tomas: [
      grp(3, "Pattern: New skills is a gap on the set (factors set to zero with their signs flipped). Priya, Amelia and Aiden had Q3 right, and the group's rework holds."),
      own(5, "One-off: a root's sign copied from its bracket, on Q5 alone. Found on the second submission."),
      grp(6, "Pattern: New skills is a gap on the set (half of b taken with the wrong sign). Priya and Aiden had Q6 right, and the group's rework holds."),
      grp(7, "Pattern: Algebra is a gap on the set (fractions lost in half of b). Priya and Aiden had Q7 right, and the group's rework holds."),
      own(9, "One-off: the minimum's x read with the sign flipped, on Q9 alone. Found on the second submission."),
      grp(10, "Not attempted. Priya and Aiden had Q10 right, and the group's rework holds."),
    ],
    zara: [
      grp(6, "Repeated: added the square to complete it, never took it away (Q6, Q8, Q9). Sam and Jordan had Q6 right, and the group's rework holds."),
      own(7, "One-off: half of −5 squared as 25/2, on Q7 alone. Found on the second submission."),
      grp(8, "Repeated: added the square to complete it, never took it away (Q6, Q8, Q9). Jordan had Q8 right, and the group's rework holds."),
      grp(9, "Repeated: added the square to complete it, never took it away (Q6, Q8, Q9). Sam had Q9 right, and the group's rework holds."),
    ],
    liam: [
      grp(1, "Pattern: Algebra is a gap on the set (non-monic pairs not expanded back to check). Zara had Q1 right, and the group's rework holds."),
      grp(2, "Pattern: Algebra is a gap on the set (non-monic pairs not expanded back to check). Zara had Q2 right, and the group's rework holds."),
      grp(3, "Pattern: Algebra is a gap on the set (2x = −1 and 2x = 1 solved with the fraction turned over). Sam, Jordan and Zara had Q3 right, and the group's rework holds."),
      grp(4, "Pattern: Algebra is a gap on the set (2x = −1 and 2x = 1 solved with the fraction turned over). Sam and Zara had Q4 right, and the group's rework holds."),
      grp(5, "Pattern: Algebra is a gap on the set (one root found by trying, the equation never made zero). Sam, Jordan and Zara had Q5 right, and the group's rework holds."),
      grp(6, "Not attempted. Sam and Jordan had Q6 right, and the group's rework holds."),
      grp(7, "Not attempted. Jordan had Q7 right, and the group's rework holds."),
      grp(8, "Not attempted. Jordan had Q8 right, and the group's rework holds."),
      grp(9, "Not attempted. Sam had Q9 right, and the group's rework holds."),
      grp(10, "Not attempted. Sam and Zara had Q10 right, and the group's rework holds."),
    ],
    aiden: [
      own(8, "One-off: the 2 taken out of 2x² only, on Q8 alone. Found on the second submission."),
    ],
    mia: [
      grp(1, "Pattern: Algebra is a gap on the set (non-monic pairs not expanded back to check). Noah, Chloe and Ethan had Q1 right, and the group's rework holds."),
      grp(4, "Pattern: Algebra is a gap on the set (non-monic pairs not expanded back to check). Noah and Chloe had Q4 right, and the group's rework holds."),
      own(6, "One-off: half of b squared without its sign, on Q6 alone. Found on the second submission."),
    ],
    noah: [
      own(6, "One-off: the square completed, its constant not taken away, on Q6 alone. Found on the second submission."),
    ],
    chloe: [
      own(2, "One-off: a non-monic pair not expanded back to check, on Q2 alone. Found on the second submission."),
      own(5, "One-off: a root's sign lost rearranging, on Q5 alone. Found on the second submission."),
      own(7, "One-off: halves lost completing the square, on Q7 alone. Found on the second submission."),
    ],
    ethan: [
      own(2, "One-off: a non-monic pair not expanded back to check, on Q2 alone. Found on the second submission."),
      own(4, "One-off: a root's sign lost, on Q4 alone. Found on the second submission."),
      own(5, "One-off: factorised before making the equation equal zero, on Q5 alone. Found on the second submission."),
      own(7, "One-off: half of −5 taken as −5/4, on Q7 alone. Found on the second submission."),
      own(9, "One-off: the minimum value given as the x, the working not shown, on Q9 alone. Found on the second submission."),
    ],
    isla: [
      own(5, "One-off: x² − 3x = 10 rearranged with the 10's sign copied, on Q5 alone. Found on the second submission."),
      own(8, "One-off: the turning point's sign copied from the bracket, on Q8 alone. Found on the second submission."),
      kept(10, "Pattern: Reasoning is a gap on the set (the negative width given in the sentence). Nobody at the table had Q10 right, so the group's last try is still wrong."),
    ],
    lucas: [
      own(5, "One-off: x² − 3x = 10 rearranged with a sign lost, on Q5 alone. Found on the second submission."),
      grp(8, "Repeated: the turning point read with the sign flipped (Q8, Q9). Harper had Q8 right, and the group's rework holds."),
      grp(9, "Repeated: the turning point read with the sign flipped (Q8, Q9). Isla had Q9 right, and the group's rework holds."),
      own(10, "One-off: width and length swapped in the sentence, on Q10 alone. Found on the second submission."),
    ],
    grace: [
      grp(7, "Not attempted. Isla, Lucas and Harper had Q7 right, and the group's rework holds."),
      grp(8, "Not attempted. Harper had Q8 right, and the group's rework holds."),
      grp(9, "Not attempted. Isla had Q9 right, and the group's rework holds."),
      kept(10, "Not attempted. Nobody at the table had Q10 right, so the group's last try is still wrong."),
    ],
    harper: [
      grp(5, "Repeated: a sign lost rearranging x² − 3x = 10 (Q5, Q10). Grace had Q5 right, and the group's rework holds."),
      own(9, "One-off: the minimum value read off the wrong line, on Q9 alone. Found on the second submission."),
      kept(10, "Repeated: a sign lost rearranging w(2w + 3) = 35 (Q5, Q10). Nobody at the table had Q10 right, so the group's last try is still wrong."),
    ],
    oliver: [
      grp(1, "Pattern: Algebra is a gap on the set (non-monic pairs not expanded back to check). Ruby, Finn and Sofia had Q1 right, and the group's rework holds."),
      grp(2, "Pattern: Algebra is a gap on the set (non-monic pairs not expanded back to check). Ruby and Finn had Q2 right, and the group's rework holds."),
      own(5, "One-off: null factor law on x(x − 3) = 10, a product that isn't 0, on Q5 alone. Found on the second submission."),
      grp(9, "Not attempted. Finn and Sofia had Q9 right, and the group's rework holds."),
      grp(10, "Not attempted. Ruby, Finn and Sofia had Q10 right, and the group's rework holds."),
    ],
    ruby: [
      grp(4, "Repeated: a pair that multiplies but doesn't add, never expanded back (Q4, Q5). Oliver and Sofia had Q4 right, and the group's rework holds."),
      grp(5, "Repeated: a pair that multiplies but doesn't add, never expanded back (Q4, Q5). Finn and Sofia had Q5 right, and the group's rework holds."),
      own(9, "One-off: the minimum value given as the x of the turning point, on Q9 alone. Found on the second submission."),
    ],
    finn: [
      grp(3, "Repeated: solved 2x + 1 = 0 as x = −2 (Q3, Q4). Oliver, Ruby and Sofia had Q3 right, and the group's rework holds."),
      grp(4, "Repeated: solved 2x + 1 = 0 as x = −2 (Q3, Q4). Oliver and Sofia had Q4 right, and the group's rework holds."),
      own(8, "One-off: turning point read with the sign flipped, on Q8 alone. Found on the second submission."),
    ],
    sofia: [
      grp(2, "Pattern: Algebra is a gap on the set (a non-monic pair not checked). Ruby and Finn had Q2 right, and the group's rework holds."),
      grp(7, "Pattern: Algebra is a gap on the set (halves lost completing the square). Oliver, Ruby and Finn had Q7 right, and the group's rework holds."),
    ],
  },
  // Problem Set 5
  {
    sam: [
      own(4, "One-off: right split, signs in the wrong brackets, on Q4 alone. Found on the second submission."),
      own(6, "One-off: turning point read with the sign flipped, on Q6 alone. Found on the second submission."),
      own(9, "One-off: negative a read as concave up, on Q9 alone. Found on the second submission."),
    ],
    jordan: [
      kept(4, "Pattern: Algebra is a gap on the set (non-monic pairs not expanded back to check). Nobody at the table had Q4 right, so the group's last try is still wrong."),
      grp(8, "Pattern: Algebra is a gap on the set (non-monic pairs not expanded back to check). Sam and Zara had Q8 right, and the group's rework holds."),
      grp(9, "Not attempted. Zara had Q9 right, and the group's rework holds."),
      grp(10, "Not attempted. Sam had Q10 right, and the group's rework holds."),
    ],
    amelia: [
      own(6, "One-off: added 16 to complete the square, never took it away, on Q6 alone. Found on the second submission."),
      own(8, "One-off: sum of the intercepts never halved, on Q8 alone. Found on the second submission."),
      grp(10, "Pattern: Reasoning is a gap on the set (the landing given as the nozzle's zero). Priya and Aiden had Q10 right, and the group's rework holds."),
    ],
    tomas: [
      grp(1, "Pattern: New skills is a gap on the set (intercepts read off the factors with the signs flipped). Priya, Amelia and Aiden had Q1 right, and the group's rework holds."),
      own(2, "One-off: h read as +3 from (x + 3), on Q2 alone. Found on the second submission."),
      grp(4, "Pattern: Algebra is a gap on the set (solved 3x + 2 = 0 as −3/2). Priya, Amelia and Aiden had Q4 right, and the group's rework holds."),
      own(5, "One-off: axis of symmetry without the minus, on Q5 alone. Found on the second submission."),
      grp(8, "Not attempted. Priya and Aiden had Q8 right, and the group's rework holds."),
      grp(9, "Not attempted. Priya, Amelia and Aiden had Q9 right, and the group's rework holds."),
      grp(10, "Not attempted. Priya and Aiden had Q10 right, and the group's rework holds."),
    ],
    zara: [
      own(4, "One-off: solved 3x + 2 = 0 as −3/2, on Q4 alone. Found on the second submission."),
      own(6, "One-off: added 16 to complete the square, never took it away, on Q6 alone. Found on the second submission."),
      own(10, "One-off: axis given as the height, on Q10 alone. Found on the second submission."),
    ],
    liam: [
      grp(1, "Pattern: New skills is a gap on the set (intercepts read off the factors with the signs flipped). Sam, Jordan and Zara had Q1 right, and the group's rework holds."),
      kept(4, "Pattern: Algebra is a gap on the set (a non-monic pair not expanded back to check). Nobody at the table had Q4 right, so the group's last try is still wrong."),
      grp(6, "Not attempted. Jordan had Q6 right, and the group's rework holds."),
      grp(7, "Not attempted. Sam, Jordan and Zara had Q7 right, and the group's rework holds."),
      grp(8, "Not attempted. Sam and Zara had Q8 right, and the group's rework holds."),
      grp(9, "Not attempted. Zara had Q9 right, and the group's rework holds."),
      grp(10, "Not attempted. Sam had Q10 right, and the group's rework holds."),
    ],
    aiden: [
      own(7, "One-off: the 2 multiplied x² and nothing else, on Q7 alone. Found on the second submission."),
    ],
    mia: [
      grp(4, "Pattern: Algebra is a gap on the set (non-monic pairs not expanded back to check). Noah and Ethan had Q4 right, and the group's rework holds."),
      grp(8, "Pattern: Algebra is a gap on the set (non-monic pairs not expanded back to check). Noah had Q8 right, and the group's rework holds."),
      grp(9, "Pattern: Algebra is a gap on the set (took −1 out and left the signs inside behind). Noah, Chloe and Ethan had Q9 right, and the group's rework holds."),
    ],
    noah: [
      own(7, "One-off: (x − 3)² squared term by term, on Q7 alone. Found on the second submission."),
    ],
    chloe: [
      own(4, "One-off: non-monic pair not expanded back to check, on Q4 alone. Found on the second submission."),
      own(5, "One-off: (−3)² taken as −9, on Q5 alone. Found on the second submission."),
      own(8, "One-off: sum of the intercepts never halved, on Q8 alone. Found on the second submission."),
    ],
    ethan: [
      own(5, "One-off: (−3)² taken as −9, the axis not shown, on Q5 alone. Found on the second submission."),
      own(8, "One-off: non-monic pair not expanded back to check, on Q8 alone. Found on the second submission."),
      own(10, "One-off: axis given as the height, the working not shown, on Q10 alone. Found on the second submission."),
    ],
    isla: [
      own(5, "One-off: axis of symmetry without the minus, on Q5 alone. Found on the second submission."),
      own(9, "One-off: took −1 out and left the signs inside behind, on Q9 alone. Found on the second submission."),
      kept(10, "Pattern: Reasoning is a gap on the set (the landing given as the nozzle's zero). Nobody at the table had Q10 right, so the group's last try is still wrong."),
    ],
    lucas: [
      grp(2, "Repeated: turning point read with the sign flipped (Q2, Q3). Isla, Grace and Harper had Q2 right, and the group's rework holds."),
      grp(3, "Repeated: turning point read with the sign flipped (Q2, Q3). Isla, Grace and Harper had Q3 right, and the group's rework holds."),
      own(9, "One-off: took −1 out and left the signs inside behind, on Q9 alone. Found on the second submission."),
      kept(10, "Pattern: Reasoning is a gap on the set (the landing given as the nozzle's zero). Nobody at the table had Q10 right, so the group's last try is still wrong."),
    ],
    grace: [
      grp(8, "Not attempted. Isla, Lucas and Harper had Q8 right, and the group's rework holds."),
      kept(9, "Not attempted. Nobody at the table had Q9 right, so the group's last try is still wrong."),
      kept(10, "Not attempted. Nobody at the table had Q10 right, so the group's last try is still wrong."),
    ],
    harper: [
      own(7, "One-off: the 2 multiplied x² and nothing else, on Q7 alone. Found on the second submission."),
      own(9, "One-off: negative a read as concave up, on Q9 alone. Found on the second submission."),
      own(10, "One-off: axis given as the height, the working not shown, on Q10 alone. Found on the second submission."),
    ],
    oliver: [
      grp(4, "Pattern: Algebra is a gap on the set (non-monic pairs not expanded back to check). Ruby had Q4 right, and the group's rework holds."),
      own(7, "One-off: (x − 3)² squared term by term, on Q7 alone. Found on the second submission."),
      grp(8, "Pattern: Algebra is a gap on the set (non-monic pairs not expanded back to check). Ruby had Q8 right, and the group's rework holds."),
      grp(10, "Not attempted. Finn and Sofia had Q10 right, and the group's rework holds."),
    ],
    ruby: [
      own(5, "One-off: (−3)² taken as −9, on Q5 alone. Found on the second submission."),
      grp(9, "Pattern: Algebra is a gap on the set (a pair that multiplies to −8 but doesn't add to −2). Oliver, Finn and Sofia had Q9 right, and the group's rework holds."),
      own(10, "One-off: axis given as the height, on Q10 alone. Found on the second submission."),
    ],
    finn: [
      own(4, "One-off: solved 3x + 2 = 0 as −3/2, on Q4 alone. Found on the second submission."),
      own(6, "One-off: turning point read with the sign flipped, on Q6 alone. Found on the second submission."),
      own(8, "One-off: sum of the intercepts never halved, on Q8 alone. Found on the second submission."),
    ],
    sofia: [
      grp(4, "Pattern: Algebra is a gap on the set (non-monic pairs not expanded back to check). Ruby had Q4 right, and the group's rework holds."),
      grp(8, "Pattern: Algebra is a gap on the set (non-monic pairs not expanded back to check). Ruby had Q8 right, and the group's rework holds."),
    ],
  },
  // Problem Set 6
  {
    jordan: [
      own(2, "One-off: non-monic factors not checked by expanding, on Q2 alone. Found on the second submission."),
      own(7, "One-off: a pair that multiplies to 8 but adds to 9, on Q7 alone. Found on the second submission."),
      grp(8, "Not attempted. Zara had Q8 right, and the group's rework holds (the demo group's scripted run)."),
      grp(9, "Not attempted. Nobody at the table had Q9 right; Zara's first submission went wrong on one line, the hint after the group's second wrong check named it, and the third try holds (the one exception on the set)."),
      grp(10, "Not attempted. Zara had Q10 right, and the group's rework holds (the demo group's scripted run)."),
    ],
    amelia: [
      own(6, "One-off: read “touches once” as discriminant > 0, on Q6 alone. Found on the second submission."),
      own(7, "One-off: multiplied through by 3 and never took it back out, on Q7 alone. Found on the second submission."),
      grp(10, "Pattern: Reasoning is a gap on the set (said the graph crosses twice). Priya and Aiden had Q10 right, and the group's rework holds."),
    ],
    tomas: [
      own(3, "One-off: null factor law on a product that isn't 0, on Q3 alone. Found on the second submission."),
      grp(4, "Pattern: Algebra is a gap on the set (divided by a, not 2a). Priya, Amelia and Aiden had Q4 right, and the group's rework holds."),
      grp(5, "Pattern: Algebra is a gap on the set (roots read off the factors with the signs flipped). Priya, Amelia and Aiden had Q5 right, and the group's rework holds."),
      grp(7, "Pattern: Algebra is a gap on the set (scaled two of three terms). Priya had Q7 right, and the group's rework holds."),
      grp(8, "Not attempted. Priya, Amelia and Aiden had Q8 right, and the group's rework holds."),
      grp(9, "Not attempted. Priya, Amelia and Aiden had Q9 right, and the group's rework holds."),
      grp(10, "Not attempted. Priya and Aiden had Q10 right, and the group's rework holds."),
    ],
    zara: [
      own(3, "One-off: null factor law on a product that isn't 0, on Q3 alone. Found on the second submission."),
      own(7, "One-off: multiplied through by 3 and never took it back out, on Q7 alone. Found on the second submission."),
      own(9, "One-off: axis given as the height, on Q9 alone. Found on the second submission."),
    ],
    liam: [
      grp(1, "Pattern: Algebra is a gap on the set (a factor pair not expanded back to check). Jordan and Zara had Q1 right, and the group's rework holds (the demo group's scripted run)."),
      grp(2, "Pattern: Algebra is a gap on the set (a factor pair not expanded back to check). Zara had Q2 right, and the group's rework holds (the demo group's scripted run)."),
      grp(3, "Pattern: New skills is a gap on the set (null factor law on a product that isn't 0). Jordan had Q3 right, and the group's rework holds (the demo group's scripted run)."),
      grp(5, "Pattern: Algebra is a gap on the set (roots read off the factors with the signs flipped). Jordan and Zara had Q5 right, and the group's rework holds (the demo group's scripted run)."),
      grp(6, "Not attempted. Jordan and Zara had Q6 right, and the group's rework holds (the demo group's scripted run)."),
      kept(7, "Not attempted. Nobody at the table had Q7 right, so the group's last try is still wrong (the demo group's scripted run)."),
      grp(8, "Not attempted. Zara had Q8 right, and the group's rework holds (the demo group's scripted run)."),
      grp(9, "Not attempted. Nobody at the table had Q9 right; Zara's first submission went wrong on one line, the hint after the group's second wrong check named it, and the third try holds (the one exception on the set)."),
      grp(10, "Not attempted. Zara had Q10 right, and the group's rework holds (the demo group's scripted run)."),
    ],
    aiden: [
      own(7, "One-off: scaled two of three terms, on Q7 alone. Found on the second submission."),
    ],
    mia: [
      grp(2, "Pattern: Algebra is a gap on the set (a factor pair never expanded back). Noah and Ethan had Q2 right, and the group's rework holds."),
      grp(7, "Pattern: Algebra is a gap on the set (the third off by a third). Noah had Q7 right, and the group's rework holds."),
      grp(9, "Pattern: Algebra is a gap on the set (took −x out and left the sign behind). Noah had Q9 right, and the group's rework holds."),
    ],
    noah: [
      own(3, "One-off: null factor law on a product that isn't 0, on Q3 alone. Found on the second submission."),
      grp(10, "Not attempted. Mia had Q10 right, and the group's rework holds."),
    ],
    ethan: [
      own(1, "One-off: signs flipped in the pair, on Q1 alone. Found on the second submission."),
      own(4, "One-off: divided by a, not 2a, on Q4 alone. Found on the second submission."),
      own(7, "One-off: multiplied through by 3 and never took it back out, on Q7 alone. Found on the second submission."),
      own(9, "One-off: axis given as the height, a step skipped, on Q9 alone. Found on the second submission."),
      grp(10, "Not attempted. Mia had Q10 right, and the group's rework holds."),
    ],
    isla: [
      own(4, "One-off: −b written as −5, on Q4 alone. Found on the second submission."),
      own(7, "One-off: scaled two of three terms, on Q7 alone. Found on the second submission."),
      kept(10, "Pattern: Reasoning is a gap on the set (said the graph crosses twice). Nobody at the table had Q10 right, so the group's last try is still wrong."),
    ],
    lucas: [
      own(7, "One-off: a pair that multiplies to 8 but adds to 9, on Q7 alone. Found on the second submission."),
      kept(10, "Pattern: Reasoning is a gap on the set (negative discriminant, two solutions). Nobody at the table had Q10 right, so the group's last try is still wrong."),
    ],
    grace: [
      grp(5, "Not attempted. Isla and Lucas had Q5 right, and the group's rework holds."),
      grp(6, "Not attempted. Isla, Lucas and Harper had Q6 right, and the group's rework holds."),
      kept(7, "Not attempted. Nobody at the table had Q7 right, so the group's last try is still wrong."),
      grp(8, "Not attempted. Isla and Lucas had Q8 right, and the group's rework holds."),
      grp(9, "Not attempted. Isla and Lucas had Q9 right, and the group's rework holds."),
      kept(10, "Not attempted. Nobody at the table had Q10 right, so the group's last try is still wrong."),
    ],
    harper: [
      grp(3, "Pattern: Algebra is a gap on the set (a sign lost in the expansion). Isla, Lucas and Grace had Q3 right, and the group's rework holds."),
      grp(5, "Pattern: Graphing is a gap on the set (turning point's height from the wrong line). Isla and Lucas had Q5 right, and the group's rework holds."),
      kept(7, "Not attempted. Nobody at the table had Q7 right, so the group's last try is still wrong."),
      grp(8, "Not attempted. Isla and Lucas had Q8 right, and the group's rework holds."),
      grp(9, "Pattern: Graphing is a gap on the set (axis given as the height, the working not shown). Isla and Lucas had Q9 right, and the group's rework holds."),
      kept(10, "Not attempted. Nobody at the table had Q10 right, so the group's last try is still wrong."),
    ],
    oliver: [
      grp(1, "Repeated: factor pairs not expanded back (Q1, Q2). Ruby, Finn and Sofia had Q1 right, and the group's rework holds."),
      grp(2, "Repeated: factor pairs not expanded back (Q1, Q2). Ruby had Q2 right, and the group's rework holds."),
      own(3, "One-off: null factor law on a product that isn't 0, on Q3 alone. Found on the second submission."),
      own(7, "One-off: scaled two of three terms, on Q7 alone. Found on the second submission."),
      grp(8, "Not attempted. Ruby, Finn and Sofia had Q8 right, and the group's rework holds."),
      grp(9, "Not attempted. Finn and Sofia had Q9 right, and the group's rework holds."),
      grp(10, "Not attempted. Ruby, Finn and Sofia had Q10 right, and the group's rework holds."),
    ],
    ruby: [
      own(5, "One-off: turning point's height from the wrong line, on Q5 alone. Found on the second submission."),
      own(7, "One-off: a pair that multiplies to 8 but adds to 9, on Q7 alone. Found on the second submission."),
      own(9, "One-off: axis given as the height, on Q9 alone. Found on the second submission."),
    ],
    finn: [
      grp(2, "Pattern: Algebra is a gap on the set (sign lost solving 2x − 1 = 0). Ruby had Q2 right, and the group's rework holds."),
      grp(4, "Pattern: Algebra is a gap on the set (divided by a, not 2a). Oliver and Ruby had Q4 right, and the group's rework holds."),
      own(5, "One-off: turning point's height from the wrong line, on Q5 alone. Found on the second submission."),
      kept(7, "Pattern: Algebra is a gap on the set (multiplied through by 3 and never took it back out). Nobody at the table had Q7 right, so the group's last try is still wrong."),
    ],
    sofia: [
      grp(2, "Pattern: Algebra is a gap on the set (a factor pair not checked). Ruby had Q2 right, and the group's rework holds."),
      grp(4, "Pattern: Algebra is a gap on the set (denominator a, not 2a). Oliver and Ruby had Q4 right, and the group's rework holds."),
      kept(7, "Pattern: Algebra is a gap on the set (scaled two of three terms). Nobody at the table had Q7 right, so the group's last try is still wrong."),
    ],
  },
];

/** A problem class review covered (by number): the students whose wrong working went on the board, and why. */
export interface StoryCovered {
  q: number;
  examples: readonly string[];
  why: string;
}

/**
 * The class review part (ticket 281), for Problem Sets 1–6 (index 0–5): null where the set's pathway has no class review
 * (Sets 2, 4 and 5); otherwise every problem a group left unsolved, in set order, with one or two examples of the class's
 * real wrong working, the most common slip first and a student from a table that left it unsolved first. The records
 * (`classReview` on Sets 1 and 3, `SET6_CLASS_REVIEW`) equal it.
 */
export const STORY_CLASS_REVIEW: readonly (readonly StoryCovered[] | null)[] = [
  [{ q: 10, examples: ["finn", "oliver"], why: "Violet left Q10 unsolved. The board shows Finn's working (divided the wrong way round, 2 in the class) and Oliver's working (root of a sum split, 1 in the class), unnamed." }],
  null,
  [{ q: 10, examples: ["isla", "lucas"], why: "Mint left Q10 unsolved. The board shows Isla's working (last line solves for x, 2 in the class) and Lucas's working (one sign left unchanged, 1 in the class), unnamed." }],
  null,
  null,
  [{ q: 7, examples: ["isla", "zara"], why: "Mint, Sky and Violet left Q7 unsolved. The board shows Isla's working (scaled two of three terms, 6 in the class) and Zara's working (tripled, third never restored, 4 in the class), unnamed." }, { q: 10, examples: ["isla", "lucas"], why: "Mint left Q10 unsolved. The board shows Isla's working (said the graph crosses twice, 2 in the class) and Lucas's working (negative Δ read as two, 1 in the class), unnamed." }],
];

/** The one-step rule's ladder. */
export const STORY_RANK: Record<StoryStatus, number> = { gap: 0, developing: 1, solid: 2, secure: 3 };

/** A set's story (1 … 6). */
export const storySet = (id: string): StorySet | undefined => STORY_SETS.find((s) => s.id === id);

/** The results that count for the one-step rule, oldest first: every assessed cell with a result (not unseen, absent or live). */
export function storyResults(student: string, category: StoryCategory): { n: number; status: StoryStatus }[] {
  return STORY[student].cells[category].flatMap((c, i) => (c.status === "unseen" || c.status === "absent" || c.status === "none" || c.status === "live" ? [] : [{ n: i + 1, status: c.status }]));
}

/** Whether a student was away for the set at `i` (0 … 5): its cells read absent (ticket 250). */
export const storyAbsent = (row: StoryRow, i: number): boolean => STORY_CATEGORIES.some((c) => row.cells[c][i].status === "absent");
