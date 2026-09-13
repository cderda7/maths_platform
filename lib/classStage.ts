import { CLASSMATES, type Classmate } from "@/data/classmates";
import { BEFORE_HAND_IN_STAGES, type ReviewStage } from "@/data/types";
import { pathwayOf, type AdvanceKind, type ClassroomState } from "./classroom";
import { STAGE_SHORT } from "./pathway";
import { classmateProgress, isSubmitted } from "./progress";
import { classReadiness, CLASS_SIZE } from "./readiness";
import type { StudentSession } from "./session";
import { standingsAt } from "./standings";

/**
 * Where the class is on its pathway, for the class view's Pathway card (ticket 129): every stage
 * of the pathway (the individual working first, then the review stages) as over, current or
 * ahead, with how many of the class are done with the current one. Pure: derived from the
 * classroom, the live student's session and the clock, so every tab agrees.
 *
 * The class enters a stage when the class does, not when its first or last student does:
 * class review when the teacher projects, group review when the gate opens (everyone in, or the
 * teacher's start), individual review when the live student hands in (the classmates' review is
 * scripted from that moment). Working is over from then on even with a student marked missing on
 * the grid; the count while it is current says how many have handed the set in, whole or in part
 * (the one meaning of submitted, `lib/progress`, ticket 185). Once the
 * whole-class session ends every stage is over and none is current.
 *
 * "Force submit" (ticket 145) sits beside the current pill for the three stages the students work
 * through: `FORCE_KIND` names the advance each starts, `canForce` says whether there is still
 * anything to force (the live student is still on the stage, and the teacher is not projecting).
 */
export type ClassStageId = "working" | ReviewStage;
export type StageState = "over" | "current" | "ahead";

export interface ClassStage {
  id: ClassStageId;
  /** The chip's word: "indiv working", "indiv review", "group review", "class review". */
  word: string;
  state: StageState;
  /** Students done with the stage; null for class review, which has no per-student count. */
  done: number | null;
  total: number;
}

export const CLASS_STAGE_WORD: Record<ClassStageId, string> = { working: "indiv working", ...STAGE_SHORT };

/** Student stages before the set is handed in. */
const WORKING_STAGES = BEFORE_HAND_IN_STAGES;

/** The advance "force submit" starts for a stage; class review has none (the teacher ends the session from its card). */
export const FORCE_KIND: Record<ClassStageId, AdvanceKind | null> = { working: "force-submit", individual: "force-review", group: "force-group", "whole-class": null };

/** The word beside the pulsing dot while a stage's force submit counts down. */
export const FORCE_PENDING_WORD: Record<ClassStageId, string> = { working: "handing in", individual: "handing in", group: "ending", "whole-class": "" };

/**
 * Whether force submit on a stage still has anything to do: the live student is on it (before
 * hand-in; correcting or waiting at the gate; on the board) and the teacher is not projecting.
 * Without a session the class is on the working and everyone is still on the set.
 */
export function canForce(id: ClassStageId, c: ClassroomState | null | undefined, session: StudentSession | null): boolean {
  if (FORCE_KIND[id] === null || c?.wholeClass?.status === "active") return false;
  switch (id) {
    case "working":
      return !session || WORKING_STAGES.includes(session.stage);
    case "individual":
      return !!session && (session.stage === "feedback" || session.stage === "class-wait");
    case "group":
      return !!session && session.stage === "group" && !c?.group?.done;
    default:
      return false;
  }
}

/** The stage the class is on, or null once the whole-class session has ended. */
export function currentClassStage(c: ClassroomState | null | undefined, session: StudentSession | null, now: number): ClassStageId | null {
  const pathway = pathwayOf(c);
  const wc = c?.wholeClass;
  if (wc?.status === "ended") return null;
  if (wc?.status === "active" && pathway.includes("whole-class")) return "whole-class";
  if (pathway.includes("group") && (!!c?.group || classReadiness(c, now).started)) return "group";
  if (pathway.includes("individual") && liveHandedIn(session)) return "individual";
  return "working";
}

const liveHandedIn = (session: StudentSession | null): boolean => !!session && !WORKING_STAGES.includes(session.stage);

/** How many of the class are done with a stage; `classmates` are the assignment's (ticket 185; the fixture's by default). */
export function stageDone(id: ClassStageId, c: ClassroomState | null | undefined, session: StudentSession | null, now: number, classmates: readonly Classmate[] = CLASSMATES): number | null {
  switch (id) {
    case "working":
      // The set handed in: the live student past working, a classmate who submitted.
      return (liveHandedIn(session) ? 1 : 0) + classmates.filter((m) => isSubmitted(classmateProgress(m, []))).length;
    case "individual":
      return classReadiness(c, now).handedIn;
    case "group":
      return Math.min(
        CLASS_SIZE,
        standingsAt(c, session, now)
          .filter((s) => s.percent >= 100)
          .reduce((n, s) => n + s.members.length, 0),
      );
    case "whole-class":
      return null;
  }
}

/** A stage without its count: what the student's header strip shows (ticket 151). */
export type PathwayStage = Pick<ClassStage, "id" | "word" | "state">;

/**
 * Every stage of the pathway as over, current or ahead, no counts. The student's own header
 * reads this: the live student's hand-in is what moves the class into individual review, the
 * gate they wait at is what opens group review, and the teacher's projection freezes them into
 * class review, so the class's stage is their stage too, and both sides light the same pill.
 */
export function pathwayStages(c: ClassroomState | null | undefined, session: StudentSession | null, now: number): PathwayStage[] {
  const ids: ClassStageId[] = ["working", ...pathwayOf(c)];
  const current = currentClassStage(c, session, now);
  const at = current === null ? ids.length : ids.indexOf(current);
  return ids.map((id, i) => ({ id, word: CLASS_STAGE_WORD[id], state: i < at ? "over" : i === at ? "current" : "ahead" }));
}

export function classStages(c: ClassroomState | null | undefined, session: StudentSession | null, now: number, classmates: readonly Classmate[] = CLASSMATES): ClassStage[] {
  return pathwayStages(c, session, now).map((s) => ({ ...s, done: s.state === "current" ? stageDone(s.id, c, session, now, classmates) : null, total: CLASS_SIZE }));
}
