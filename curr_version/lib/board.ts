import { ASSIGNMENT, PROBLEM_MAP } from "@/data/assignment";
import type { Problem, Stage, Stroke } from "@/data/types";
import { activeAssignment } from "./assignment";
import { currentSlide, pathwayOf, type BoardView, type ClassroomState } from "./classroom";
import { boardExamples, type BoardExample } from "./examples";
import { nextStage } from "./pathway";
import type { StudentSession } from "./session";

/**
 * What the smartboard shows. The board is the third surface: opened once at the start of the
 * lesson, left on the projector, never touched. It reads the classroom state and the pathway and
 * decides per stage; nothing on it is a control, and nothing on it names a student.
 *
 *  - `blank` while students work and through individual review: the class and the assignment
 *    title, so a projector that is on doesn't read as broken, and nothing else. Also after
 *    whole-class review has ended.
 *  - `holding` once group review is over and the teacher has not advanced: a quiet placeholder
 *    that ticket 42 fills with the final standings.
 *  - `whole-class` while the teacher is projecting: the current problem, its anonymous examples
 *    with "n/m students" (marks only in the marked view) and a read-only mirror of the teacher's
 *    working.
 *
 * Until ticket 40 gives the classroom a group session of its own, the demo student's session is
 * the class's clock: their group review ending is the class's.
 */
export type BoardKind = "blank" | "holding" | "whole-class";

interface Lesson {
  className: string;
  title: string;
}

export type BoardContent =
  | ({ kind: "blank" } & Lesson)
  | ({ kind: "holding" } & Lesson)
  | ({
      kind: "whole-class";
      problem: Problem;
      /** Zero-based slide index and the number of projected problems. */
      index: number;
      total: number;
      view: BoardView;
      examples: BoardExample[];
      teacherInk: Stroke[];
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

export function boardContent(c: ClassroomState | null | undefined, session: StudentSession | null): BoardContent {
  const lesson: Lesson = { className: ASSIGNMENT.className, title: activeAssignment(c).title };
  const slide = currentSlide(c);
  if (slide) {
    const problem = PROBLEM_MAP[slide.problemId];
    const refs = c?.wholeClass?.examples[slide.problemId] ?? [];
    return { kind: "whole-class", ...lesson, problem, index: slide.index, total: slide.total, view: slide.view, examples: boardExamples(refs, slide.problemId, session), teacherInk: slide.teacherInk };
  }
  if (c?.wholeClass?.status === "ended") return { kind: "blank", ...lesson };
  if (groupReviewOver(c, session)) return { kind: "holding", ...lesson };
  return { kind: "blank", ...lesson };
}

/** The teacher's indicator: "blank", "holding", or "Q3 · 2 of 3" (with " · marks" in the marked view). */
export function boardWord(b: BoardContent): string {
  if (b.kind !== "whole-class") return b.kind;
  return `${b.problem.label} · ${b.index + 1} of ${b.total}${b.view === "marked" ? " · marks" : ""}`;
}
