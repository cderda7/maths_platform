import type { SubskillId } from "./types";

/**
 * Scripted evaluation for the demo problems. Every line the pad can "read" (the scripted run,
 * the rework path, and the model solution) is listed with a verdict. This is not a maths engine:
 * a line the table doesn't know is "unclear", which is the honest state for an evaluator that
 * can't follow a line.
 */
export interface LineVerdict {
  /** ok: the step holds. wrong: the step doesn't. */
  verdict: "ok" | "wrong";
  subskill: SubskillId;
  /** What the step does, in the student's terms. */
  label: string;
  /** Right *given* a wrong line above. Shown without blame and never counted as a mistake. */
  builtOn?: boolean;
  /** For wrong lines: the pattern-level clue used in review ("detective work"), never the location. */
  clue?: string;
  /** For wrong lines: the note shown once feedback is unlocked. */
  note?: string;
}

const ok = (subskill: SubskillId, label: string, builtOn = false): LineVerdict => ({ verdict: "ok", subskill, label, builtOn });
const wrong = (subskill: SubskillId, label: string, clue: string, note: string): LineVerdict => ({ verdict: "wrong", subskill, label, clue, note });

export const EVALUATION: Record<string, Record<string, LineVerdict>> = {
  q1: {
    "x^2 - 5x + 6 = 0": ok("algebra", "Standard form"),
    "(x-2)(x-3) = 0": ok("factoring", "Factorised"),
    "(x - 2)(x - 3) = 0": ok("factoring", "Factorised"),
    "x = 2 \\;\\text{or}\\; x = 3": ok("roots", "Null factor law"),
    "(x + 2)(x + 3) = 0": wrong(
      "factoring",
      "Factorised",
      "Somewhere a pair of signs doesn't survive the trip back. Expanding a factorisation is a one-line check.",
      "Expand this back: what sign does the x term come out with?",
    ),
    "x = -2 \\;\\text{or}\\; x = -3": ok("roots", "Null factor law", true),
  },
  q2: {
    "2x^2 + 7x - 4 = 0": ok("algebra", "Standard form"),
    "ac = -8,\\quad 8 + (-1) = 7": ok("factoring", "Found the split"),
    "2x^2 + 8x - x - 4 = 0": ok("factoring", "Split the middle term"),
    "2x(x+4) - 1(x+4) = 0": ok("factoring", "Grouped"),
    "(2x - 1)(x + 4) = 0": ok("factoring", "Factorised"),
    "x = \\tfrac{1}{2} \\;\\text{or}\\; x = -4": ok("roots", "Null factor law"),
    "(2x + 4)(x - 1) = 0": wrong(
      "factoring",
      "Factorised",
      "When the x² term has a coefficient, a guessed pair can look right and still not multiply out. Something here didn't get expanded back.",
      "Try expanding this back. What do you get for the x term?",
    ),
    "2x + 4 = 0 \\;\\text{or}\\; x - 1 = 0": ok("roots", "Null factor law", true),
    "x = -2 \\;\\text{or}\\; x = 1": ok("algebra", "Solved each factor", true),
  },
  q3: {
    "(x - 3)(x + 2) = 6": ok("algebra", "Copied the equation"),
    "x^2 - x - 6 = 6": ok("expansion", "Expanded first"),
    "x^2 - x - 12 = 0": ok("algebra", "Rearranged to standard form"),
    "(x - 4)(x + 3) = 0": ok("factoring", "Factorised"),
    "x = 4 \\;\\text{or}\\; x = -3": ok("roots", "Null factor law"),
    "x - 3 = 6 \\;\\text{or}\\; x + 2 = 6": wrong(
      "algebra",
      "Null factor law",
      "A rule got used somewhere it doesn't apply. Check what each rule needs to be true before it can be used.",
      "The null factor law needs a product equal to zero. What is the right-hand side here?",
    ),
    "x = 9 \\;\\text{or}\\; x = 4": ok("algebra", "Solved each part", true),
  },
  q4: {
    "a = 3,\\; b = -5,\\; c = -1": ok("algebra", "Identified a, b, c"),
    "b^2 - 4ac = 25 + 12 = 37": ok("roots", "Discriminant"),
    "x = \\dfrac{5 \\pm \\sqrt{37}}{6}": ok("fractions", "Quadratic formula"),
    "x = \\dfrac{5 \\pm \\sqrt{37}}{3}": wrong(
      "fractions",
      "Quadratic formula",
      "The formula has a denominator with two parts. Something in it got halved, or didn't.",
      "The denominator of the quadratic formula is 2a. With a = 3, what is it?",
    ),
  },
};

/**
 * Curated standout-correct steps (highlighted blue). Not "everything right": for a strong run
 * the genuinely novel moves, for a weaker run the harder steps that still held. Keyed by
 * problem then line, with the run kind it applies to and the one-line reason shown.
 */
export interface Standout {
  when: "strong" | "weak" | "both";
  why: string;
}

export const STANDOUT: Record<string, Record<string, Standout>> = {
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
};
