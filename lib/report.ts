import { ASSIGNMENT, PROBLEM_MAP } from "@/data/assignment";
import { leafName, type GroupId } from "@/data/taxonomy";
import type { Confidence, Problem, ReviewStage } from "@/data/types";
import { evaluateLine } from "./evaluate";
import { feedbackFor } from "./feedback";
import type { GroupRun } from "./groupReview";
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
  caution: GroupId[];
  confidence: string;
  stars: string[];
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
 * One way to write a confidence label in the roster's narrow Confidence column (ticket 190): its
 * words, each kept whole ("non-monic" never breaks at its hyphen) with the lines free to wrap
 * between them, and how many named skills it leaves out, shown as "+1" with the full label on hover.
 */
export type ConfidenceForm = { words: string[]; hidden: number };

/**
 * The forms a label can take, longest first; the cell shows the first that fits its lines at the
 * column's own size. "confident", "low" and "—" have one form. A named answer tries every skill in
 * full ("low: fractions, non-monic factorising"), then each skill alone with the rest counted
 * ("low: fractions +1", "low: non-monic factorising +1"), then none ("low +2"), which always fits.
 * See DECISION_LOG.md, "A confidence label too long for its column names what fits and counts the rest".
 */
export function confidenceForms(label: string): ConfidenceForm[] {
  const i = label.indexOf(":");
  const skills = i < 0 ? [] : label.slice(i + 1).split(",").map((s) => s.trim()).filter(Boolean);
  const head = i < 0 ? label : label.slice(0, i);
  if (skills.length === 0) return [{ words: [head], hidden: 0 }];
  const words = (shown: string[]) => shown.flatMap((skill, k) => skill.split(/\s+/).map((w, j, all) => (j === all.length - 1 && k < shown.length - 1 ? `${w},` : w)));
  return [
    { words: [`${head}:`, ...words(skills)], hidden: 0 },
    ...(skills.length > 1 ? skills.map((skill) => ({ words: [`${head}:`, ...words([skill])], hidden: skills.length - 1 })) : []),
    { words: [head], hidden: skills.length },
  ];
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
