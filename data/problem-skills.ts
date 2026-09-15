import type { LeafId } from "./taxonomy";

/**
 * Each problem's one skill (ticket 294; DECISION_LOG.md 2026-09-15): the taxonomy leaf the problem is for, which a problem's model
 * solution carries among several. Homework reads it to tell a duplicate: a missed homework's leftover whose skill one of the
 * current homework's own problems already has does not carry (`lib/homeworkList.ts`).
 *
 * Problem Sets 1–4 already name it: the first leaf of each problem in the class story sheet's outline (`STORY_SETS[n].outline`
 * in `data/story.ts`), read by `primarySkill` in `lib/problemSkill.ts`. Problem Sets 5 and 6 were authored before the outline
 * and have none, so their problems' skills are here, chosen as the outline chooses for the same kind of problem:
 * - solving by factorising is the factorising (Problem Set 4's "Solve 2x² − 7x + 3 = 0" is non-monic factorising);
 * - making one side zero first is quadratic equations (its "Solve x² − 3x = 10");
 * - completing the square, even to a turning point, is the binomial identity (its Q8 and Q9);
 * - reading or computing a feature is graph features; a worded problem is interpreting worded problems.
 * `lib/homeworkList.test.ts` holds every problem of every set to exactly one skill its model solution carries.
 */
export const PS5_PS6_PRIMARY_SKILL: Readonly<Record<string, LeafId>> = {
  // Problem Set 6
  q1: "algebra.expand-factor.monic",
  q2: "algebra.expand-factor.nonmonic",
  q3: "algebra.equations.quadratic",
  q4: "algebra.equations.quadratic",
  q5: "graphing.quadratics.features",
  q6: "algebra.equations.discriminant",
  q7: "algebra.number.fractions",
  q8: "graphing.quadratics.features",
  q9: "reasoning.interpret.worded",
  q10: "algebra.equations.discriminant",
  // Problem Set 5
  "ps5-q1": "graphing.quadratics.features",
  "ps5-q2": "graphing.quadratics.features",
  "ps5-q3": "graphing.quadratics.features",
  "ps5-q4": "algebra.expand-factor.nonmonic",
  "ps5-q5": "graphing.quadratics.features",
  "ps5-q6": "algebra.expand-factor.binomial",
  "ps5-q7": "algebra.expand-factor.binomial",
  "ps5-q8": "algebra.expand-factor.nonmonic",
  "ps5-q9": "graphing.quadratics.sketch",
  "ps5-q10": "reasoning.interpret.worded",
};
