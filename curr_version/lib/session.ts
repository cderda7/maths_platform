import type { Confidence, Stage } from "@/data/types";

/**
 * The student's session: everything the closed loop needs to remember about one run. Pure data
 * plus a reducer, so the flow can be unit-tested and, from ticket 05, mirrored to the teacher tab.
 */
export interface StudentSession {
  stage: Stage;
  /** null until the offer is answered. */
  practice: "taken" | "declined" | null;
  confidence: Confidence | null;
}

export type SessionAction =
  | { type: "practice/accept" }
  | { type: "practice/decline" }
  | { type: "practice/finish" }
  | { type: "confidence/set"; confidence: Confidence }
  | { type: "goto"; stage: Stage }
  | { type: "reset" };

export const INITIAL_SESSION: StudentSession = { stage: "overview", practice: null, confidence: null };

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
    stage,
    practice: i >= order.indexOf("confidence") ? "declined" : i === order.indexOf("practice") ? "taken" : null,
    confidence: i >= order.indexOf("working") ? { level: "low-when", subskill: "factoring" } : null,
  };
}
