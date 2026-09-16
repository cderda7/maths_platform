import { PROBLEM_MAP } from "@/data/assignment";
import type { Problem, QuestionPair, Stroke } from "@/data/types";
import { currentSlide, type BoardView, type ClassroomState } from "./classroom";
import type { ClassStep } from "./classReview";
import { pairFor } from "./pairs";
import type { Markup } from "./markup";
import { boardExamples, lineMarks, mistakeOf, type LineMark } from "./examples";
import type { StudentSession } from "./session";

/**
 * What a student sees during class review: the board's question at the step the board is on (ticket 344).
 *
 *  - `examples`: the board's slide as the board shows it (ticket 161), the problem and its two or three examples, red and
 *    blue on the lines only while the board itself is showing marks, beside a pad mirroring the teacher's writing. The one
 *    difference from the board is each example's corner: the board leaves it empty (no counts since ticket 202); the
 *    student's screen marks the example that is their own first hand-in ("your approach") and says nothing on the others,
 *    so no student ever sees a count.
 *  - `worked`: Q*'s working, the same lines the board has revealed and no more.
 *  - `turn`: Q**, which this student writes on their own pad, every line marked as it is read.
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
  /** Which of the question's three steps the class is on. */
  step: ClassStep;
  /** Q* and Q** for this question; null on a question with no pair, which runs its examples alone. */
  pair: QuestionPair | null;
  /** How many lines of Q* the board has revealed. */
  reveal: number;
  /** The teacher's pad, mirrored on the examples step; the student's pad takes no input there. */
  teacherInk: Stroke[];
  /** The teacher's marks over the slide (ticket 330), shown on the examples step. */
  markup: Markup[];
}

export function frozenView(session: StudentSession, classroom: ClassroomState | null | undefined): FrozenView | null {
  const slide = currentSlide(classroom);
  if (!slide) return null;
  const problem = PROBLEM_MAP[slide.problemId];
  if (!problem) return null;
  const marked = slide.view === "marked";
  const refs = classroom?.wholeClass?.examples[problem.id] ?? [];
  // The first hand-in, not the rework: the examples are picked from final workings, the tag names where they started.
  const initial = (session.lines[problem.id] ?? []).map((l) => l.tex);
  const own = initial.length > 0 ? mistakeOf(problem.id, initial) : null;
  const examples: FrozenExample[] = boardExamples(refs, problem.id, session).map((e) => {
    const marks = marked ? lineMarks(problem.id, e.lines) : e.lines.map(() => null);
    return { letter: e.letter, lines: e.lines.map((tex, i) => ({ tex, mark: marks[i] })), mine: own !== null && mistakeOf(problem.id, e.lines) === own };
  });
  return { problem, view: slide.view, index: slide.index, total: slide.total, examples, step: slide.step, pair: pairFor(problem.id), reveal: slide.reveal, teacherInk: slide.teacherInk, markup: slide.markup };
}
