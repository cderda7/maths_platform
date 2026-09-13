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
 */
import type { Difficulty } from "./types";

export interface StreamPace {
  /** How long the warm-up takes before the first problem; absent for a student who goes straight to the set. */
  warmUpMs?: number;
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

export const STREAM_PACES: Record<string, StreamPace> = {
  priya: { paceMs: 23 * S },
  // Slow throughout, stalls on Q8.
  jordan: { warmUpMs: 115 * S, paceMs: 47 * S, submitAtMs: null },
  amelia: { warmUpMs: 70 * S, paceMs: 26 * S },
  // Slow throughout; seven answered, hands in late.
  tomas: { warmUpMs: 105 * S, paceMs: 44 * S, submitAtMs: 420 * S },
  zara: { paceMs: 26 * S },
  // Two answered, then sits on Q3 until he gives up.
  liam: { paceMs: 38 * S, submitAtMs: 330 * S },
  aiden: { paceMs: 24 * S },
  mia: { warmUpMs: 80 * S, paceMs: 27 * S },
  noah: { paceMs: 29 * S, submitAtMs: 290 * S },
  // Rushes: the first answer in the class, Q1 wrong.
  ethan: { paceMs: 28 * S, firstMs: 8 * S, submitAtMs: 280 * S },
  isla: { paceMs: 28 * S },
  lucas: { paceMs: 30 * S },
  // Four answered in one jump each, then sits on Q5.
  grace: { paceMs: 18 * S, submitAtMs: 270 * S },
  harper: { paceMs: 32 * S, submitAtMs: 310 * S },
  oliver: { warmUpMs: 65 * S, paceMs: 28 * S, submitAtMs: 340 * S },
  ruby: { paceMs: 25 * S },
  finn: { paceMs: 29 * S },
  sofia: { paceMs: 31 * S },
};
