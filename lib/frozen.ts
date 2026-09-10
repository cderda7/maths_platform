import { PROBLEM_MAP } from "@/data/assignment";
import type { Problem, Stroke } from "@/data/types";
import { currentSlide, type BoardView, type ClassroomState, type FollowMode } from "./classroom";
import { lineMarks, type LineMark } from "./examples";
import type { StudentSession } from "./session";

/**
 * What a frozen student sees: their own work on the problem the board is showing, one block per
 * version (handed in, then reworked), each with its ink and transcription, beside a pad. Marks
 * appear on the lines only while the board itself is showing marks. The pad follows the board's
 * mode: a mirror of the teacher's writing, or the student's own to write along with.
 */
export interface FrozenVersion {
  label: string;
  lines: { tex: string; mark: LineMark }[];
  ink: Stroke[];
}

export interface FrozenView {
  problem: Problem;
  view: BoardView;
  index: number;
  total: number;
  versions: FrozenVersion[];
  attempted: boolean;
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
  const versions: FrozenVersion[] = [];
  const original = session.lines[problem.id] ?? [];
  const rework = session.rework[problem.id] ?? [];
  const block = (label: string, texs: string[], ink: Stroke[]): FrozenVersion => {
    const marks = marked ? lineMarks(problem.id, texs) : texs.map(() => null);
    return { label, lines: texs.map((tex, i) => ({ tex, mark: marks[i] })), ink };
  };
  if (original.length > 0) versions.push(block("Handed in", original.map((l) => l.tex), session.ink[problem.id] ?? []));
  if (rework.length > 0) versions.push(block("Reworked", rework.map((l) => l.tex), session.reworkInk[problem.id] ?? []));
  return { problem, view: slide.view, index: slide.index, total: slide.total, versions, attempted: original.length > 0, mode: slide.mode, teacherInk: slide.teacherInk };
}
