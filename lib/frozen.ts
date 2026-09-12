import { PROBLEM_MAP } from "@/data/assignment";
import type { Problem, Stroke } from "@/data/types";
import { currentSlide, type BoardView, type ClassroomState, type FollowMode } from "./classroom";
import { boardExamples, lineMarks, mistakeOf, type LineMark } from "./examples";
import type { StudentSession } from "./session";

/**
 * What a frozen student sees: the board's slide as the board shows it (ticket 161), the problem
 * and its two or three examples, red and blue on the lines only while the board itself is showing
 * marks, beside a pad. The one difference from the board is each example's corner: the board
 * counts students there; the student's screen marks the example that is their own first hand-in
 * ("your initial response": the same exact mistake, or correct like them) and says nothing on the
 * others, so no student ever sees a count. The pad follows the board's mode: a mirror of the
 * teacher's writing, or the student's own to write along with.
 */
export interface FrozenExample {
  letter: string;
  lines: { tex: string; mark: LineMark }[];
  /** The student's first hand-in made this example's exact mistake (or, for the correct example, got it right). */
  mine: boolean;
}

export interface FrozenView {
  problem: Problem;
  view: BoardView;
  index: number;
  total: number;
  examples: FrozenExample[];
  /** frozen: the pad mirrors `teacherInk` and takes no input. write-with-me: the pad is the student's own. */
  mode: FollowMode;
  teacherInk: Stroke[];
}

export function frozenView(session: StudentSession, classroom: ClassroomState | null | undefined): FrozenView | null {
  const slide = currentSlide(classroom);
  if (!slide) return null;
  const problem = PROBLEM_MAP[slide.problemId];
  if (!problem) return null;
  const marked = slide.view === "marked";
  const refs = classroom?.wholeClass?.examples[problem.id] ?? [];
  // The first hand-in, not the rework: the board counts students by their final working, the tag names where they started.
  const initial = (session.lines[problem.id] ?? []).map((l) => l.tex);
  const own = initial.length > 0 ? mistakeOf(problem.id, initial) : null;
  const examples: FrozenExample[] = boardExamples(refs, problem.id, session).map((e) => {
    const marks = marked ? lineMarks(problem.id, e.lines) : e.lines.map(() => null);
    return { letter: e.letter, lines: e.lines.map((tex, i) => ({ tex, mark: marks[i] })), mine: own !== null && mistakeOf(problem.id, e.lines) === own };
  });
  return { problem, view: slide.view, index: slide.index, total: slide.total, examples, mode: slide.mode, teacherInk: slide.teacherInk };
}
