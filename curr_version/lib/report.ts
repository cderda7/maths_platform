import { PROBLEM_MAP } from "@/data/assignment";
import { SUBSKILL_MAP } from "@/data/subskills";
import type { Confidence, SubskillId } from "@/data/types";
import { feedbackFor } from "./feedback";
import type { StudentSession } from "./session";

/**
 * The facts on the final report, shared by the student's and the teacher's views so the two
 * are the same text. Facts, not judgements: counts of what happened, never a score.
 */
export interface ReportFacts {
  slipped: number;
  total: number;
  reworked: string[];
  practices: string[];
  caution: SubskillId[];
  confidence: string;
  stars: string[];
}

export function confidenceSentence(c: Confidence | null): string {
  if (!c) return "No confidence rating";
  if (c.level === "confident") return "Confident before starting";
  if (c.level === "low") return "Confidence low before starting";
  return `Confidence low when ${SUBSKILL_MAP[c.subskill].name.toLowerCase()} comes up`;
}

export function reportFacts(session: StudentSession): ReportFacts {
  const fb = feedbackFor(session);
  return {
    slipped: fb.filter((p) => p.slips.length > 0).length,
    total: fb.length,
    reworked: Object.keys(session.rework).filter((id) => (session.rework[id]?.length ?? 0) > 0).map((id) => PROBLEM_MAP[id].label),
    practices: session.practices.map(
      (p) =>
        `${p.reason === "help" ? "Help" : "Practice"} · ${SUBSKILL_MAP[p.subskill].short.toLowerCase()} · ${PROBLEM_MAP[p.problem]?.label ?? p.problem} · ${p.accepted ? "taken" : "declined"}`,
    ),
    caution: session.escalation.caution,
    confidence: confidenceSentence(session.confidence),
    stars: session.stars.map((id) => PROBLEM_MAP[id].label),
  };
}
