import { DEMO_STUDENT } from "@/data/assignment";
import { BEFORE_HAND_IN_STAGES, type Pathway, type ReviewStage, type Stage } from "@/data/types";
import { lessonOver, pathwayOf, type ClassroomState } from "./classroom";
import { nextStage, REVIEW_ORDER } from "./pathway";
import { classReadiness } from "./readiness";
import { reviewPlaces } from "./reviewPlaces";
import type { StudentSession } from "./session";
import { sittingOut, standingsAt } from "./standings";
import { classmatesAt, type StreamSet } from "./stream";

/**
 * Changing the pathway during the lesson (ticket 336): which review stages the teacher may still switch on or off, and the
 * pathway a change leaves. Pure. See DECISION_LOG.md, 2026-09-16 (changing the pathway live).
 *
 * The rule: a review stage may be switched while no present student has entered it; a stage on the pathway that someone in
 * the room is in, or has been through, is locked. A stage that is off has been entered by nobody, so it can always be
 * switched on: the students already past its place keep their route, and every student who has not yet reached the
 * transition before it goes through it (routing reads the pathway as it is at each transition, `nextStage`). Individual
 * working is always locked, and absent students (ticket 250) never lock anything.
 *
 * Where a student is, as a place on the full line (working 0, individual review 1, group review 2, class review 3, done 4):
 * Sam from his session's stage (the gate into group review is group review's entry, class review's wait is its entry);
 * a classmate from the demo's own model of the class: working until the stream has them hand in, then at the entry of the
 * stage the pathway gives after hand-in, after their corrections (Where students are's Done reviewing) and after their
 * group's board is home (or their group sits out); everyone in the room is in group review once the gate has opened, in
 * class review once the board is projected, and done once the lesson is over.
 */

/** A place on the full line: 0 working, 1 individual review, 2 group review, 3 class review, 4 done. */
export type LinePlace = 0 | 1 | 2 | 3 | 4;

const REVIEW_PLACE: Record<ReviewStage, LinePlace> = { individual: 1, group: 2, "whole-class": 3 };

/** A student stage's place on the line: before hand-in 0; correcting 1; at the gate or on the board 2; waiting for or frozen in class review 3; anything after 4. */
export function stagePlace(stage: Stage): LinePlace {
  if (BEFORE_HAND_IN_STAGES.includes(stage)) return 0;
  switch (stage) {
    case "feedback":
      return 1;
    case "class-wait":
    case "group":
      return 2;
    case "waiting":
    case "frozen":
      return 3;
    default:
      return 4;
  }
}

/** Which review stages are locked: on the pathway and entered by a student in the room (at its place or past it). */
export type PathwayLocks = Record<ReviewStage, boolean>;

export function pathwayLocks(pathway: readonly ReviewStage[], places: readonly LinePlace[]): PathwayLocks {
  const furthest = Math.max(0, ...places);
  return Object.fromEntries(REVIEW_ORDER.map((s) => [s, pathway.includes(s) && furthest >= REVIEW_PLACE[s]])) as PathwayLocks;
}

/** One stage switched on or off, in `REVIEW_ORDER`; a locked stage refused (the same pathway back). An empty pathway is working only. */
export function switchStage(pathway: readonly ReviewStage[], stage: ReviewStage, locks: PathwayLocks): Pathway {
  if (locks[stage]) return [...pathway];
  return REVIEW_ORDER.filter((s) => (s === stage ? !pathway.includes(s) : pathway.includes(s)));
}

/**
 * The pathway a requested change leaves, under the locks as they are at the moment it is made: every switchable stage as
 * requested, every locked stage as it is now (a stage a student entered while the teacher was choosing stays on).
 */
export function changedPathway(current: readonly ReviewStage[], requested: readonly ReviewStage[], locks: PathwayLocks): Pathway {
  return REVIEW_ORDER.filter((s) => (locks[s] ? current.includes(s) : requested.includes(s)));
}

export const samePathway = (a: readonly ReviewStage[], b: readonly ReviewStage[]): boolean => a.length === b.length && a.every((s, i) => b[i] === s);

/** A set as the rule reads it: the stream's set and its absent students. */
export type LiveSet = StreamSet & { absent: readonly string[] };

/** A student past a transition stands at the entry of the stage the pathway gives next (done, 4, when nothing is left). */
const after = (pathway: readonly ReviewStage[], from: "handed-in" | "reworked" | "group-done"): LinePlace => stagePlace(nextStage(pathway, from));

/** Where every present student is on the line at `now`: Sam first (when in the room), then the classmates in roster order. */
export function presentPlaces(c: ClassroomState | null | undefined, set: LiveSet, session: StudentSession | null, now: number): LinePlace[] {
  const pathway = pathwayOf(c);
  if (lessonOver(c)) return [...(set.absent.includes(DEMO_STUDENT.id) ? [] : [4 as const]), ...set.classmates.filter((m) => !set.absent.includes(m.id)).map(() => 4 as const)];
  // Class-wide floors: the gate opened takes the room into group review, the board projected into class review.
  const floor: LinePlace = c?.wholeClass?.status === "active" && pathway.includes("whole-class") ? 3 : pathway.includes("group") && (!!c?.group || classReadiness(c, now).started) ? 2 : 0;
  const lift = (p: LinePlace): LinePlace => (Math.max(p, floor) as LinePlace);
  const sam = session ? stagePlace(session.stage) : 0;
  const correcting = pathway.includes("individual") && !!session && !BEFORE_HAND_IN_STAGES.includes(session.stage);
  const reviewDone = correcting ? new Set(reviewPlaces(set, c, session, now).filter((s) => s.place.kind === "done").map((s) => s.id)) : new Set<string>();
  const inGroup = floor >= 2 && pathway.includes("group");
  const groupDone = inGroup
    ? new Set([...standingsAt(c, session, now).filter((g) => g.percent >= 100).flatMap((g) => g.members), ...sittingOut(c, session).flatMap((g) => g.members)])
    : new Set<string>();
  const classmates = classmatesAt(set, session, now)
    .filter((m) => !set.absent.includes(m.record.id))
    .map((m): LinePlace => {
      const id = m.record.id;
      if (!m.state.submitted) return lift(0);
      if (groupDone.has(id)) return lift(after(pathway, "group-done"));
      if (reviewDone.has(id)) return lift(after(pathway, "reworked"));
      return lift(after(pathway, "handed-in"));
    });
  return [...(set.absent.includes(DEMO_STUDENT.id) ? [] : [lift(sam)]), ...classmates];
}

/** The locks on the live set at `now`: what the decision card's Change reads, and what its Done resolves against. */
export const liveLocks = (c: ClassroomState | null | undefined, set: LiveSet, session: StudentSession | null, now: number): PathwayLocks => pathwayLocks(pathwayOf(c), presentPlaces(c, set, session, now));
