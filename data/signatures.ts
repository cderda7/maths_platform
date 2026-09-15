import type { MisconceptionId } from "./misconceptions";

/**
 * Error families (ticket 303): the misconceptions grouped by what is wrong at a glance, so one kind of error seen on
 * different sets, in different topics and categories, reads as one signature ("Minus signs wrong" on PS2–PS5 for Sam:
 * a surd product's sign, a factor pair's signs, a turning point's sign, concavity, a perfect square's sign). A
 * student's patterns carry a misconception each (`Pattern.misconception` in `data/story.ts`, checked against their wrong
 * lines); the family is looked up here. Communication patterns are right working with steps left out, not a wrong line,
 * so they form the one family keyed by category instead (`steps`).
 *
 * Every misconception belongs to exactly one family (`data/signatures.test.ts`): a new taxonomy entry must be placed.
 * Names say what is wrong, never why (user rule, 2026-09-15). See DECISION_LOG.md, 2026-09-15 (ticket 303).
 */
export interface ErrorFamily {
  /** The banner's name: what is wrong, at a glance. */
  name: string;
  /** One line under the name: what the family's lines look like. */
  gloss: string;
  misconceptions: readonly MisconceptionId[];
}

export const FAMILIES = {
  "minus-signs": {
    name: "Minus signs wrong",
    gloss: "a minus dropped, flipped, or moved to another term",
    misconceptions: ["root-vertex-sign", "minus-not-distributed", "product-sign", "collecting-sign", "rearranging-sign", "solving-sign", "pair-signs-swapped", "square-sign", "minus-b-dropped", "concavity-sign", "graph-signs"],
  },
  "factor-pairs": {
    name: "Factor pairs wrong",
    gloss: "brackets that don't multiply back to the quadratic",
    misconceptions: ["pair-sum-wrong", "brackets-dont-expand", "check-wrong"],
  },
  "not-undone": {
    name: "Not undone",
    gloss: "something added, multiplied or taken out isn't reversed",
    misconceptions: ["factor-missing", "square-not-balanced"],
  },
  "squared-brackets": {
    name: "Squared brackets wrong",
    gloss: "(a ± b)² or a² − b² written wrong",
    misconceptions: ["squared-termwise", "middle-not-doubled", "square-vs-difference"],
  },
  "terms-missed": {
    name: "Terms missed",
    gloss: "a multiply, divide or power reaches only part of an expression",
    misconceptions: ["partial-distribution", "power-on-part"],
  },
  "fractions-upside-down": {
    name: "Fractions upside down",
    gloss: "divided the wrong way round",
    misconceptions: ["divided-wrong-way"],
  },
  halves: {
    name: "Halves wrong",
    gloss: "a half lost, doubled or signed wrong",
    misconceptions: ["halving-wrong"],
  },
  "turning-point-height": {
    name: "Turning point height wrong",
    gloss: "the x given as the height, or the height from the wrong line",
    misconceptions: ["x-for-y", "vertex-y-wrong"],
  },
  "answer-sentence": {
    name: "Answer sentence wrong",
    gloss: "the sentence doesn't match the working or the question",
    misconceptions: ["context-not-checked", "question-not-answered"],
  },
  nfl: {
    name: "Null factor law wrong",
    gloss: "used on a product that isn't 0",
    misconceptions: ["nfl-without-zero"],
  },
  surds: {
    name: "Surds wrong",
    gloss: "a root simplified, joined or rationalised wrong",
    misconceptions: ["root-not-taken", "square-left-in-root", "roots-added", "rationalise-wrong-factor"],
  },
  "fraction-parts": {
    name: "Fraction parts lost",
    gloss: "part of a denominator dropped, or a fraction left uncancelled",
    misconceptions: ["denominator-dropped", "not-cancelled"],
  },
  "roots-formula": {
    name: "Roots wrong",
    gloss: "a root missing, the formula's 2a, or the root count from Δ",
    misconceptions: ["root-missing", "formula-2a", "discriminant-root-count"],
  },
  steps: {
    name: "Steps missing",
    gloss: "right working with steps a reader needs left out",
    misconceptions: [],
  },
} as const satisfies Record<string, ErrorFamily>;

export type FamilyId = keyof typeof FAMILIES;
export const FAMILY_IDS = Object.keys(FAMILIES) as FamilyId[];

const BY_MISCONCEPTION = new Map<MisconceptionId, FamilyId>(FAMILY_IDS.flatMap((f) => FAMILIES[f].misconceptions.map((m) => [m, f] as const)));

/** A pattern's family: its misconception's, or `steps` for a communication pattern (no misconception). */
export function familyOf(misconception: MisconceptionId | null): FamilyId {
  if (misconception === null) return "steps";
  const f = BY_MISCONCEPTION.get(misconception);
  if (!f) throw new Error(`misconception ${misconception} is in no error family (data/signatures.ts)`);
  return f;
}

/** A signature needs the family on this many different sets (user, 2026-09-15). */
export const SIGNATURE_MIN_SETS = 2;
