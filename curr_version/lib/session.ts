import type { Confidence, Stage } from "@/data/types";
import { afterUndo, type RevealedLine } from "./recognition";

/**
 * The student's session: everything the closed loop needs to remember about one run. Pure data
 * plus a reducer, so the flow can be unit-tested and, from ticket 05, mirrored to the teacher tab.
 */
export interface StudentSession {
  stage: Stage;
  /** null until the offer is answered. */
  practice: "taken" | "declined" | null;
  confidence: Confidence | null;
  /** Index into the assignment's problems while working. */
  problemIndex: number;
  /** Recognised lines per problem id, in the order they appeared. */
  lines: Record<string, RevealedLine[]>;
}

export type SessionAction =
  | { type: "practice/accept" }
  | { type: "practice/decline" }
  | { type: "practice/finish" }
  | { type: "confidence/set"; confidence: Confidence }
  | { type: "problem/goto"; index: number }
  | { type: "line/reveal"; problem: string; line: RevealedLine }
  | { type: "lines/undo"; problem: string; strokeCount: number }
  | { type: "lines/clear"; problem: string }
  | { type: "goto"; stage: Stage }
  | { type: "reset" };

export const INITIAL_SESSION: StudentSession = { stage: "overview", practice: null, confidence: null, problemIndex: 0, lines: {} };

export function sessionReducer(s: StudentSession, a: SessionAction): StudentSession {
  switch (a.type) {
    case "practice/accept":
      return { ...s, practice: "taken", stage: "practice" };
    case "practice/decline":
      return { ...s, practice: "declined", stage: "confidence" };
    case "practice/finish":
      return { ...s, stage: "confidence" };
    case "confidence/set":
      return { ...s, confidence: a.confidence, stage: "working" };
    case "problem/goto":
      return { ...s, problemIndex: a.index };
    case "line/reveal":
      return { ...s, lines: { ...s.lines, [a.problem]: [...(s.lines[a.problem] ?? []), a.line] } };
    case "lines/undo":
      return { ...s, lines: { ...s.lines, [a.problem]: afterUndo(s.lines[a.problem] ?? [], a.strokeCount) } };
    case "lines/clear":
      return { ...s, lines: { ...s.lines, [a.problem]: [] } };
    case "goto":
      return { ...s, stage: a.stage };
    case "reset":
      return INITIAL_SESSION;
  }
}

/** Builds a session already at `stage`, for deep links, with plausible earlier answers filled in. */
export function sessionAt(stage: Stage): StudentSession {
  const order: Stage[] = ["overview", "practice", "confidence", "working", "feedback", "rework", "group-pass", "group-discuss", "report"];
  const i = order.indexOf(stage);
  if (i < 0) return INITIAL_SESSION;
  return {
    ...INITIAL_SESSION,
    stage,
    practice: i >= order.indexOf("confidence") ? "declined" : i === order.indexOf("practice") ? "taken" : null,
    confidence: i >= order.indexOf("working") ? { level: "low-when", subskill: "factoring" } : null,
  };
}
