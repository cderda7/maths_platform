import { ASSIGNMENT } from "@/data/assignment";
import type { RevealedLine } from "./recognition";
import { evaluateLine } from "./evaluate";
import type { StudentSession } from "./session";

/**
 * The one per-problem signal in the product: a rework that breaks a problem whose first attempt
 * was correct. It never fires for a problem whose first attempt had a mistake, so it can't leak
 * where the real mistakes are. Evaluated live on every rework reveal, undo and clear.
 */
export interface Guard {
  /** First attempt had lines and none of them were wrong. */
  originalCorrect: boolean;
  /** Original correct and the current rework has a line that doesn't hold. */
  tripped: boolean;
}

const hasWrong = (problemId: string, lines: RevealedLine[]) => lines.some((l) => evaluateLine(problemId, l.tex).verdict === "wrong");

export function guardFor(session: StudentSession, problemId: string): Guard {
  const original = session.lines[problemId] ?? [];
  const originalCorrect = original.length > 0 && !hasWrong(problemId, original);
  return { originalCorrect, tripped: originalCorrect && hasWrong(problemId, session.rework[problemId] ?? []) };
}

/** Ids of every problem currently tripped, in assignment order. */
export function trippedProblems(session: StudentSession): string[] {
  return ASSIGNMENT.problems.map((p) => p.id).filter((id) => guardFor(session, id).tripped);
}

export const GUARD_TEXT = "This isn't where your mistake was made. Your original work was correct.";
