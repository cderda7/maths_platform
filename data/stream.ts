/**
 * How Problem Set 6's class works through the set once the teacher presses Create (ticket 189): each
 * classmate's pace, read by `lib/stream.ts`. Times are milliseconds after the set went live
 * (`liveStartedAt`). A classmate answers their problems in assignment order, as many as their
 * fixture record's `done`, one event each; a problem takes `paceMs` × its difficulty weight
 * (`DIFFICULTY_WEIGHT`), nudged a little per student and problem so no two students tick together.
 *
 * The script the user settled (2026-09-13):
 * - Five low-confidence students warm up first ("warming up"): Jordan, Tomas, Amelia, Mia, Oliver.
 *   Amelia, Mia and Oliver then work at an average pace; Jordan and Tomas are slow throughout.
 * - Jordan answers Q1–Q7 and stays on Q8: `submitAtMs: null`, he never hands in on his own.
 * - Chloe never starts: no entry (her record has nothing done).
 * - Everyone else hands in with their record's answered count; most finish four to six minutes in,
 *   the first answer lands within ten seconds: Ethan rushes Q1 and slips on the signs, so the first
 *   name on Mistakes arrives with it.
 *
 * What happens inside those times (ticket 314, read by `lib/place.ts`), none of it moving an answer or a
 * hand-in: every student answers the confidence check first. The five who warm up then tell the tutor
 * what worries them (the warm-up chat) and take every skill of their warm-up in three steps (worked
 * example, finishing the steps, on their own), all inside `warmUpMs`. Four students take help on a
 * question they really slipped on (the practice skill is the one their wrong line is tagged with), in
 * three steps inside that question's own time (worked example, finishing the steps, back on the
 * question); three ask for hints. See DECISION_LOG.md, 2026-09-15 (the classmates' warm-ups, help and
 * hints).
 */
import type { LeafId } from "./taxonomy";
import type { Difficulty } from "./types";

/** "I need help" on a question (ticket 314): the practice skill the student names, on the question they are on. */
export interface StreamHelp {
  problem: string;
  leaf: LeafId;
}

/** Hints asked on a question (ticket 314): how many, one or two. */
export interface StreamHints {
  problem: string;
  count: 1 | 2;
}

export interface StreamPace {
  /** How long the warm-up takes before the first problem; absent for a student who goes straight to the set. */
  warmUpMs?: number;
  /**
   * The skills the warm-up takes, in the order it takes them (easiest first, `byEase`), with `warmUpMs`: the
   * skills named in the confidence answer, or for a student who named none, the skill their chat answer names.
   */
  warmUpSkills?: readonly LeafId[];
  /** Questions the student takes help on, each on the problem's own time (ticket 314). */
  help?: readonly StreamHelp[];
  /** Questions the student asks hints on (ticket 314). */
  hints?: readonly StreamHints[];
  /** Milliseconds per unit of difficulty weight: a simple familiar problem takes 0.6 of it. */
  paceMs: number;
  /** How long the first problem takes, when not its weighted pace: the student who rushes it. */
  firstMs?: number;
  /**
   * When the student hands in, after their last answer. Absent: `SUBMIT_AFTER_MS` after it (a
   * quick look back). A number: then, for a student who stops short and sits on the next problem
   * before handing in what they have. `null`: never (Jordan).
   */
  submitAtMs?: number | null;
}

/** Relative time a problem takes by its difficulty; a set of ten Problem Set 6 problems weighs 10.2. */
export const DIFFICULTY_WEIGHT: Record<Difficulty, number> = {
  "simple familiar": 0.6,
  "simple unfamiliar": 0.9,
  "complex familiar": 1.2,
  "complex unfamiliar": 1.4,
};

/** The look back over the set between the last answer and handing in. */
export const SUBMIT_AFTER_MS = 12_000;

/** The five who warm up first (in the order the user named them). */
export const WARM_UP_IDS = ["jordan", "tomas", "amelia", "mia", "oliver"] as const;

const S = 1000;

/** The confidence check at the start (ticket 314): this long, or less for a student whose first move comes sooner (at most `CONFIDENCE_SHARE` of the time to it). */
export const CONFIDENCE_CHECK_MS = 6 * S;
export const CONFIDENCE_SHARE = 0.4;

/** The warm-up chat (ticket 314): one question per skill named in the confidence answer, one open question for a student who named none. */
export const CHAT_TURN_MS = 9 * S;

/** How a warm-up skill's time splits over its three steps: worked example, finishing the steps, on their own. */
export const WARM_UP_STEP_SHARES = [0.35, 0.4, 0.25] as const;

/** Where in a question's time help's three steps begin (worked example, finishing the steps, back on the question), as fractions of it. */
export const HELP_STEP_AT = [0.2, 0.45, 0.75] as const;

/** Where in a question's time the first and second hints appear, as fractions of it. */
export const HINT_AT = [0.45, 0.7] as const;

const MONIC: LeafId = "algebra.expand-factor.monic";
const NONMONIC: LeafId = "algebra.expand-factor.nonmonic";
const FRACTIONS: LeafId = "algebra.number.fractions";

export const STREAM_PACES: Record<string, StreamPace> = {
  priya: { paceMs: 23 * S },
  // Slow throughout, stalls on Q8. Not confident on non-monic factorising: warms up on it.
  jordan: { warmUpMs: 115 * S, warmUpSkills: [NONMONIC], paceMs: 47 * S, submitAtMs: null },
  // Not confident, no skill named; her chat names the discriminant, the skill of her Q6 and Q10 slips and the first thing her clarification says.
  amelia: { warmUpMs: 70 * S, warmUpSkills: ["algebra.equations.discriminant"], paceMs: 26 * S },
  // Slow throughout; seven answered, hands in late. Not confident on fractions.
  tomas: { warmUpMs: 105 * S, warmUpSkills: [FRACTIONS], paceMs: 44 * S, submitAtMs: 420 * S },
  zara: { paceMs: 26 * S },
  // Four answered (Q5 started), then sits on Q5 until he gives up. Help on Q1, where his pair multiplies to 6 and adds to 7 (monic).
  liam: { paceMs: 38 * S, submitAtMs: 330 * S, help: [{ problem: "q1", leaf: MONIC }] },
  aiden: { paceMs: 24 * S },
  // Not confident on fractions and non-monic factorising: both, easiest first.
  mia: { warmUpMs: 80 * S, warmUpSkills: [FRACTIONS, NONMONIC], paceMs: 27 * S },
  // Two hints on Q3, where he uses the null factor law on a product that isn't zero.
  noah: { paceMs: 29 * S, submitAtMs: 290 * S, hints: [{ problem: "q3", count: 2 }] },
  // Rushes: the first answer in the class, Q1 wrong. A hint on Q4, where he divides by a, not 2a.
  ethan: { paceMs: 28 * S, firstMs: 8 * S, submitAtMs: 280 * S, hints: [{ problem: "q4", count: 1 }] },
  isla: { paceMs: 28 * S },
  lucas: { paceMs: 30 * S },
  // Four answered in one jump each, then sits on Q5.
  grace: { paceMs: 18 * S, submitAtMs: 270 * S },
  // Help on Q3, where a sign is lost collecting the expansion (expanding).
  harper: { paceMs: 32 * S, submitAtMs: 310 * S, help: [{ problem: "q3", leaf: "algebra.expand-factor.expand" }] },
  // Not confident on factorising, neither kind picked, so both: monic, then non-monic.
  oliver: { warmUpMs: 65 * S, warmUpSkills: [MONIC, NONMONIC], paceMs: 28 * S, submitAtMs: 340 * S },
  // A hint on Q9, where she gives the axis as the height.
  ruby: { paceMs: 25 * S, hints: [{ problem: "q9", count: 1 }] },
  // Help on Q5, where the turning point's height comes from the wrong line (features of a parabola).
  finn: { paceMs: 29 * S, help: [{ problem: "q5", leaf: "graphing.quadratics.features" }] },
  // Help on Q2, where her non-monic brackets don't expand back.
  sofia: { paceMs: 31 * S, help: [{ problem: "q2", leaf: NONMONIC }] },
};
