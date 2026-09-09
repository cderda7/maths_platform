import { PROBLEM_MAP } from "@/data/assignment";
import type { Problem, Stroke } from "@/data/types";
import { currentSlide, type BoardView, type ClassroomState } from "./classroom";
import { lineMarks, type LineMark } from "./examples";
import type { StudentSession } from "./session";

/**
 * What a frozen student sees: their own work on the problem the board is showing, one block per
 * version (handed in, then reworked), each with its ink and transcription. Marks appear on the
 * lines only while the board itself is showing marks. Nothing here is interactive.
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
  return { problem, view: slide.view, index: slide.index, total: slide.total, versions, attempted: original.length > 0 };
}
