import { PROBLEM_MAP } from "@/data/assignment";
import { leafName, type GroupId } from "@/data/taxonomy";
import type { Confidence } from "@/data/types";
import { feedbackFor } from "./feedback";
import type { StudentSession } from "./session";
import type { DebriefPrompt } from "./debrief";

/**
 * The facts on the final report, shared by the student's and the teacher's views so the two
 * are the same text. Facts, not judgements: counts of what happened, never a score.
 */
export interface ReportFacts {
  slipped: number;
  total: number;
  reworked: string[];
  practices: string[];
  caution: GroupId[];
  confidence: string;
  stars: string[];
  /** The group-review debrief, per problem: which prompt the student answered and what they wrote. */
  groupNotes: { label: string; prompt: DebriefPrompt; text: string }[];
}

/** Naming three or more skills reads as low confidence overall: the answer is treated exactly as "not confident". */
export const NAMED_CAP = 2;

/** The skills a "not confident with…" answer names, or null when it should read as low overall (none named, or more than the cap). */
export function namedSkills(c: Confidence | null): string[] | null {
  if (!c || c.level !== "low-when") return null;
  const names = c.leaves.map((l) => leafName(l).short);
  return names.length === 0 || names.length > NAMED_CAP ? null : names;
}

/** The short label on the live grid: "confident", "low", or "low: fractions, discriminant". */
export function confidenceLabel(c: Confidence | null): string {
  if (!c) return "—";
  if (c.level === "confident") return "confident";
  const named = namedSkills(c);
  return named ? `low: ${named.join(", ")}` : "low";
}

export function confidenceSentence(c: Confidence | null): string {
  if (!c) return "No confidence rating";
  if (c.level === "confident") return "Confident before starting";
  const named = namedSkills(c);
  return named ? `Confidence low when ${named.join(", ")} comes up` : "Confidence low before starting";
}

export function reportFacts(session: StudentSession): ReportFacts {
  const fb = feedbackFor(session);
  return {
    slipped: fb.filter((p) => p.slips.length > 0).length,
    total: fb.length,
    reworked: Object.keys(session.rework).filter((id) => (session.rework[id]?.length ?? 0) > 0).map((id) => PROBLEM_MAP[id].label),
    practices: session.practices.map(
      (p) =>
        `${p.reason === "help" ? "Help" : "Practice"} · ${leafName(p.leaf).short} · ${PROBLEM_MAP[p.problem]?.label ?? p.problem} · ${p.accepted ? "taken" : "declined"}`,
    ),
    caution: session.escalation.caution,
    confidence: confidenceSentence(session.confidence),
    stars: session.stars.map((id) => PROBLEM_MAP[id].label),
    groupNotes: Object.entries(session.debrief)
      .filter(([, n]) => n.text.trim() !== "")
      .map(([id, n]) => ({ label: PROBLEM_MAP[id]?.label ?? id, prompt: n.prompt, text: n.text.trim() })),
  };
}
