import { ASSIGNMENT, PROBLEM_MAP } from "@/data/assignment";
import type { Diagnostic } from "@/data/diagnostic";
import type { Problem, QuestionPair, Stage, Stroke } from "@/data/types";
import { activeAssignment } from "./assignment";
import { currentSlide, lessonOver, pathwayOf, type BoardView, type ClassroomState } from "./classroom";
import type { ClassStep } from "./classReview";
import { pairFor } from "./pairs";
import { liveDiagnostic, questionFor, tally, type Tally } from "./diagnostic";
import { chainPosition, currentIndex, isLastStep, type DiagnosticRun } from "./diagnosticChain";
import { liveAbsent } from "./absence";
import { boardExamples, type BoardExample } from "./examples";
import type { Markup } from "./markup";
import { nextStage } from "./pathway";
import type { StudentSession } from "./session";
import { leaderboardAt, type RankedStanding } from "./standings";

/**
 * What the smartboard shows. The board is the third surface: opened once at the start of the
 * lesson and left on the projector. It reads the classroom state and the pathway and decides per
 * stage; nothing on it names a student. Its only controls are in whole-class review, where the
 * teacher is standing at it: the working pad on the examples, and the one control that moves the class
 * through the question's three steps (ticket 344).
 *
 *  - `blank` while students work and through individual review: the class and the assignment
 *    title, so a projector that is on doesn't read as broken, and nothing else. Also after
 *    whole-class review has ended (or the lesson is over some other way, ticket 263), and before a set is sent (the class alone, ticket 264).
 *  - `group` while the class is in group review (the classroom has a run that isn't done): the
 *    race, five standings ranked with medals for the first three to finish.
 *  - `holding` once group review is over and the teacher has not advanced: the same standings,
 *    final, held on the wall until the teacher projects or ends.
 *  - `whole-class` while the teacher is projecting: the current question at the step it is on
 *    (ticket 344) — its anonymous examples beside the teacher's working (a pad the teacher writes on
 *    at the board, or a mirror of the laptop's), then Q* revealed a line at a time, then Q** while
 *    the class writes it. Never a count of students (ticket 202).
 *  - `diagnostic` over any of those while a live diagnostic chain is out (ticket 241): the board
 *    takes over at the push and shows the current step, "1st of 3" on a longer chain and how many
 *    have answered, the right option green only once the step has closed (all in, or force
 *    submit), and the teacher's one control. Never a count per option, a name or a
 *    misconception. Back to work (or a withdraw) gives the board back to whatever it showed.
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
  | ({
      kind: "diagnostic";
      run: DiagnosticRun;
      question: Diagnostic;
      tally: Tally;
      /** "1st of 3", or null on a chain of one. */
      position: string | null;
      last: boolean;
    } & Lesson)
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
      /** The teacher's marks over the slide (ticket 330), and how many strokes the problem has in all (pad and slide) for Undo / Clear. */
      markup: Markup[];
      inkCount: number;
      /** Which of the question's three steps the board is on (ticket 344), and the last question, whose move on is "Finish". */
      step: ClassStep;
      last: boolean;
      /** Q* and Q** for this question, and how many lines of Q* are on screen; null on a question with no pair, which runs its examples alone. */
      pair: QuestionPair | null;
      reveal: number;
    } & Lesson);

/** Stages a student can only be in once their group review is behind them (or the whole lesson is). */
const AFTER_REVIEW: Stage[] = ["report", "peers", "history", "homework"];

/** True when this student's group review is over: they sit where the pathway sends them after it, or beyond. */
function groupReviewOver(c: ClassroomState | null | undefined, session: StudentSession | null): boolean {
  if (!session) return false;
  const pathway = pathwayOf(c);
  if (!pathway.includes("group")) return false;
  return session.stage === nextStage(pathway, "group-done") || AFTER_REVIEW.includes(session.stage);
}

/** `now` drives the scripted race; 0 (the server, before the first tick) reads as the start. */
export function boardContent(c: ClassroomState | null | undefined, session: StudentSession | null, now = 0): BoardContent {
  // Nothing sent, no set to name (ticket 264): the blank board is the class alone.
  const lesson: Lesson = { className: ASSIGNMENT.className, title: c?.assignment ? activeAssignment(c).title : "" };
  const run = liveDiagnostic(c);
  const question = run && questionFor(run.steps[currentIndex(run)]);
  if (run && question) return { kind: "diagnostic", ...lesson, run, question, tally: tally(run, now, currentIndex(run), liveAbsent(c)), position: chainPosition(run), last: isLastStep(run) };
  const slide = currentSlide(c);
  if (slide) {
    const problem = PROBLEM_MAP[slide.problemId];
    const refs = c?.wholeClass?.examples[slide.problemId] ?? [];
    return { kind: "whole-class", ...lesson, problem, index: slide.index, total: slide.total, view: slide.view, examples: boardExamples(refs, slide.problemId, session), teacherInk: slide.teacherInk, markup: slide.markup, inkCount: slide.inkCount, step: slide.step, last: slide.last, pair: pairFor(slide.problemId), reveal: slide.reveal };
  }
  if (lessonOver(c)) return { kind: "blank", ...lesson };
  if (c?.group && !c.group.done) return { kind: "group", ...lesson, standings: leaderboardAt(c, session, now) };
  if (c?.group?.done || groupReviewOver(c, session)) return { kind: "holding", ...lesson, standings: leaderboardAt(c, session, now) };
  return { kind: "blank", ...lesson };
}
