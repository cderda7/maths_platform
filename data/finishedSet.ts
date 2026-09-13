import type { Classmate } from "./classmates";
import type { LineVerdict } from "./evaluation";
import type { SeatingGroups } from "./groups";
import type { Assignment, Pathway } from "./types";

/**
 * A finished problem set (ticket 210): everything the Classroom and a set's teacher tabs need about a set
 * the class has already done, in one self-contained folder `data/psetN/`, exported from its `index.ts`
 * as `PSN` and registered by one line in `data/finishedSets.ts`. Every index keyed by problem id (the
 * evaluation table in `lib/evaluate.ts`) and by set id (the registry in `lib/assignments.ts`, the
 * frozen groups in `lib/seating.ts`) is built from that list, so adding a set touches nothing else.
 *
 * The shared suite `data/finishedSets.test.ts` checks every registered set against this contract and
 * against the class story sheet (`data/story.ts`, mirrored to `specs/class-story.md`).
 *
 * Teacher-side only: a finished set never reaches a student screen, a hint box, a diagnostic push, the
 * board or class review (those are the live lesson's, Problem Set 6's).
 */
export interface FinishedSet {
  /**
   * The set as the class met it. `id` is `pset-N`; `title` is "PROBLEM SET N — …" (the student eyebrow's
   * upper case); `due` reads as on the card ("Tue 25 Aug") and orders the registry; `newSkills` names the
   * set's New skills, each tagged in at least two problems. Problem ids are `psN-q1` … `psN-q10` (labels
   * Q1 … Q10), so no two sets' problem-keyed tables collide.
   */
  fixture: Assignment;
  /** The set's name as the teacher writes it, for the Classroom card: "Problem Set 5 — Features of a parabola". */
  name: string;
  /** The review stages it ran after individual working; every stage is over. */
  pathway: Pathway;
  /** Sam's handed-in record on the set (his row, report and Mistakes rows). */
  sam: Classmate;
  /** The nineteen classmates' records, in the class order (`CLASSMATES` in `data/classmates.ts`). */
  classmates: readonly Classmate[];
  /** Every line anyone wrote on the set, keyed by the set's problem ids, then by the line's TeX exactly. */
  evaluation: Record<string, Record<string, LineVerdict>>;
  /** The seating frozen when the set was created, which its Groups tab opens on; the class default when absent. */
  groups?: SeatingGroups;
}
