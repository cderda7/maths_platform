import { ASSIGNMENT, PROBLEM_MAP } from "@/data/assignment";
import { leafName, type GroupId } from "@/data/taxonomy";
import type { Confidence, Problem, ReviewStage } from "@/data/types";
import { evaluateLine } from "./evaluate";
import { feedbackFor } from "./feedback";
import type { GroupRun } from "./groupReview";
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

/**
 * A confidence word split for a narrow column: the head ("confident", "low", "low:") and the named
 * skills, one per line, so no skill name is ever broken across two lines.
 */
export function confidenceLines(label: string): { head: string; skills: string[] } {
  const i = label.indexOf(":");
  if (i < 0) return { head: label, skills: [] };
  return { head: label.slice(0, i + 1), skills: label.slice(i + 1).split(",").map((s) => s.trim()).filter(Boolean) };
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

/**
 * Where each problem ended up, for the tiles on the student's report: right when handed in,
 * right after the independent rework, right once the group's rework checked, or still wrong.
 * The first that applies wins, so a problem sits in exactly one column. A pathway without a
 * stage never yields that stage's outcome, and that column is not shown at all.
 */
export type Outcome = "first" | "individual" | "group" | "wrong";

export interface OutcomeColumn {
  id: Outcome;
  label: string;
  problems: Problem[];
}

export const OUTCOME_LABEL: Record<Outcome, string> = {
  first: "Correct first try",
  individual: "Correct after individual review",
  group: "Correct after group review",
  wrong: "Incorrect",
};

/** A version is right when it has at least one line and none of them is wrong: the same rule as "every step held". */
const holds = (problem: string, lines: { tex: string }[]): boolean => lines.length > 0 && lines.every((l) => evaluateLine(problem, l.tex).verdict !== "wrong");

export function problemOutcome(session: StudentSession, problem: string, pathway: readonly ReviewStage[], run: GroupRun | null | undefined): Outcome {
  if (holds(problem, session.lines[problem] ?? [])) return "first";
  if (pathway.includes("individual") && holds(problem, session.rework[problem] ?? [])) return "individual";
  if (pathway.includes("group") && run?.resolved.includes(problem)) return "group";
  return "wrong";
}

/** The columns the pathway allows, in order, each with its problems in set order. An empty column stays, so the layout never shifts. */
export function outcomeColumns(session: StudentSession, pathway: readonly ReviewStage[], run: GroupRun | null | undefined, problems: Problem[] = ASSIGNMENT.problems): OutcomeColumn[] {
  const ids: Outcome[] = ["first", ...(pathway.includes("individual") ? (["individual"] as const) : []), ...(pathway.includes("group") ? (["group"] as const) : []), "wrong"];
  const columns = ids.map((id) => ({ id, label: OUTCOME_LABEL[id], problems: [] as Problem[] }));
  for (const p of problems) columns.find((c) => c.id === problemOutcome(session, p.id, pathway, run))!.problems.push(p);
  return columns;
}
