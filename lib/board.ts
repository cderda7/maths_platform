import { ASSIGNMENT, PROBLEM_MAP } from "@/data/assignment";
import type { Diagnostic } from "@/data/diagnostic";
import type { Problem, Stage, Stroke } from "@/data/types";
import { activeAssignment } from "./assignment";
import { currentSlide, pathwayOf, type BoardView, type ClassroomState, type FollowMode } from "./classroom";
import { boardDiagnostic, questionFor, tally, type Tally } from "./diagnostic";
import { boardExamples, type BoardExample } from "./examples";
import { nextStage } from "./pathway";
import type { StudentSession } from "./session";
import { leaderboardAt, type RankedStanding } from "./standings";

/**
 * What the smartboard shows. The board is the third surface: opened once at the start of the
 * lesson and left on the projector. It reads the classroom state and the pathway and decides per
 * stage; nothing on it names a student. Its only controls are in whole-class review, where the
 * teacher is standing at it: the working pad and the frozen / write-with-me toggle.
 *
 *  - `blank` while students work and through individual review: the class and the assignment
 *    title, so a projector that is on doesn't read as broken, and nothing else. Also after
 *    whole-class review has ended.
 *  - `group` while the class is in group review (the classroom has a run that isn't done): the
 *    race, five standings ranked with medals for the first three to finish.
 *  - `holding` once group review is over and the teacher has not advanced: the same standings,
 *    final, held on the wall until the teacher projects or ends.
 *  - `whole-class` while the teacher is projecting: the current problem, its anonymous examples
 *    with "n/m students" (marks only in the marked view), the teacher's working (a pad the
 *    teacher writes on at the board, or a mirror of the laptop's) and the students' mode.
 *  - `diagnostic` over any of those (ticket 137): the latest live diagnostic once all twenty
 *    have answered, or when the teacher has put it up by hand, until cleared or replaced. The
 *    question, each option with its count, the right one marked; no names, no misconceptions.
 *
 * The run on the classroom is the class's clock for group review; the demo student's session
 * still says when their group review is over (the pathway's next stage), which is the holding
 * moment when no run was ever begun (a jump straight to the report).
 */
export type BoardKind = "blank" | "group" | "holding" | "whole-class" | "diagnostic";

interface Lesson {
  className: string;
  title: string;
}

export type BoardContent =
  | ({ kind: "blank" } & Lesson)
  | ({ kind: "diagnostic"; question: Diagnostic; tally: Tally } & Lesson)
  | ({ kind: "group"; standings: RankedStanding[] } & Lesson)
  | ({ kind: "holding"; standings: RankedStanding[] } & Lesson)
  | ({
      kind: "whole-class";
      problem: Problem;
      /** Zero-based slide index and the number of projected problems. */
      index: number;
      total: number;
      view: BoardView;
      examples: BoardExample[];
      teacherInk: Stroke[];
      /** What the students' screens are doing: mirroring `teacherInk`, or writing along. */
      mode: FollowMode;
    } & Lesson);

/** Stages a student can only be in once their group review is behind them (or the whole lesson is). */
const AFTER_REVIEW: Stage[] = ["report", "peers", "history"];

/** True when this student's group review is over: they sit where the pathway sends them after it, or beyond. */
function groupReviewOver(c: ClassroomState | null | undefined, session: StudentSession | null): boolean {
  if (!session) return false;
  const pathway = pathwayOf(c);
  if (!pathway.includes("group")) return false;
  return session.stage === nextStage(pathway, "group-done") || AFTER_REVIEW.includes(session.stage);
}

/** `now` drives the scripted race; 0 (the server, before the first tick) reads as the start. */
export function boardContent(c: ClassroomState | null | undefined, session: StudentSession | null, now = 0): BoardContent {
  const lesson: Lesson = { className: ASSIGNMENT.className, title: activeAssignment(c).title };
  const run = boardDiagnostic(c, now);
  const question = run && questionFor(run.questionId, run.question);
  if (run && question) return { kind: "diagnostic", ...lesson, question, tally: tally(run, now) };
  const slide = currentSlide(c);
  if (slide) {
    const problem = PROBLEM_MAP[slide.problemId];
    const refs = c?.wholeClass?.examples[slide.problemId] ?? [];
    return { kind: "whole-class", ...lesson, problem, index: slide.index, total: slide.total, view: slide.view, examples: boardExamples(refs, slide.problemId, session), teacherInk: slide.teacherInk, mode: slide.mode };
  }
  if (c?.wholeClass?.status === "ended") return { kind: "blank", ...lesson };
  if (c?.group && !c.group.done) return { kind: "group", ...lesson, standings: leaderboardAt(c, session, now) };
  if (c?.group?.done || groupReviewOver(c, session)) return { kind: "holding", ...lesson, standings: leaderboardAt(c, session, now) };
  return { kind: "blank", ...lesson };
}
