import { ASSIGNMENT, PROBLEM_MAP } from "@/data/assignment";
import type { Classmate } from "@/data/classmates";
import { leafName, type GroupId } from "@/data/taxonomy";
import type { Confidence, Problem, ReviewStage } from "@/data/types";
import { groupVersion } from "./debrief";
import { evaluateLine } from "./evaluate";
import { feedbackFor } from "./feedback";
import type { GroupRun } from "./groupReview";
import { classmateLines } from "./hierarchy";
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

/** A record's confidence label ("confident", "low", "low: fractions, discriminant") as the report's sentence, word for word the live one. */
export function labelSentence(label: string): string {
  if (label === "confident") return confidenceSentence({ level: "confident" });
  const i = label.indexOf(":");
  return i < 0 ? confidenceSentence({ level: "low" }) : `Confidence low when ${label.slice(i + 1).trim()} comes up`;
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
const holds = (problem: string, lines: string[]): boolean => lines.length > 0 && lines.every((tex) => evaluateLine(problem, tex).verdict !== "wrong");

/**
 * Everything one student wrote on one problem, stage by stage (ticket 243): the first submission, their own
 * second submission, and what their group wrote once it closed the problem (its rework that checked correct, or
 * its last try on a problem closed unsolved). The same shape for a live session and a set's record, so both
 * reports sort tiles and show working from it.
 */
export interface ProblemReview {
  first: string[];
  second: string[];
  group?: { lines: string[]; solved: boolean };
}
export type Reviews = Record<string, ProblemReview>;

/** A live session's versions of one problem: its lines, its rework, and the group run's version once the run closed it. */
function sessionReview(session: StudentSession, run: GroupRun | null | undefined, problem: string): ProblemReview {
  const closed = run?.resolved.includes(problem) ? true : run?.unsolved?.includes(problem) ? false : null;
  return {
    first: (session.lines[problem] ?? []).map((l) => l.tex),
    second: (session.rework[problem] ?? []).map((l) => l.tex),
    ...(run && closed !== null ? { group: { lines: groupVersion(run, problem), solved: closed } } : {}),
  };
}

export const sessionReviews = (session: StudentSession, run: GroupRun | null | undefined, problems: Problem[] = ASSIGNMENT.problems): Reviews =>
  Object.fromEntries(problems.map((p) => [p.id, sessionReview(session, run, p.id)]));

/** A set record's versions: its first submission as the Class View reads it, and what review made of its mistakes (`review`, ticket 244). */
export function recordReviews(record: Classmate, problems: Problem[] = ASSIGNMENT.problems): Reviews {
  const reviews: Reviews = {};
  problems.forEach((p, i) => {
    const later = record.review?.[p.id];
    reviews[p.id] = { first: classmateLines(record, p, i) ?? [], second: later?.second ?? [], ...(later?.group ? { group: later.group } : {}) };
  });
  return reviews;
}

const NO_REVIEW: ProblemReview = { first: [], second: [] };

export function outcomeOf(problem: string, review: ProblemReview = NO_REVIEW, pathway: readonly ReviewStage[]): Outcome {
  if (holds(problem, review.first)) return "first";
  if (pathway.includes("individual") && holds(problem, review.second)) return "individual";
  if (pathway.includes("group") && review.group?.solved) return "group";
  return "wrong";
}

export const problemOutcome = (session: StudentSession, problem: string, pathway: readonly ReviewStage[], run: GroupRun | null | undefined): Outcome =>
  outcomeOf(problem, sessionReview(session, run, problem), pathway);

/** Of the problems still incorrect, those the student's group worked on and closed unsolved (ticket 223): the report names them. */
export function unsolvedOf(reviews: Reviews, pathway: readonly ReviewStage[], problems: Problem[] = ASSIGNMENT.problems): Problem[] {
  if (!pathway.includes("group")) return [];
  return problems.filter((p) => reviews[p.id]?.group?.solved === false && outcomeOf(p.id, reviews[p.id], pathway) === "wrong");
}

export const unsolvedInGroup = (session: StudentSession, pathway: readonly ReviewStage[], run: GroupRun | null | undefined, problems: Problem[] = ASSIGNMENT.problems): Problem[] =>
  unsolvedOf(sessionReviews(session, run, problems), pathway, problems);

/** The columns the pathway allows, in order, each with its problems in set order. An empty column stays, so the layout never shifts. */
export function columnsOf(reviews: Reviews, pathway: readonly ReviewStage[], problems: Problem[] = ASSIGNMENT.problems): OutcomeColumn[] {
  const ids: Outcome[] = ["first", ...(pathway.includes("individual") ? (["individual"] as const) : []), ...(pathway.includes("group") ? (["group"] as const) : []), "wrong"];
  const columns = ids.map((id) => ({ id, label: OUTCOME_LABEL[id], problems: [] as Problem[] }));
  for (const p of problems) columns.find((c) => c.id === outcomeOf(p.id, reviews[p.id], pathway))!.problems.push(p);
  return columns;
}

export const outcomeColumns = (session: StudentSession, pathway: readonly ReviewStage[], run: GroupRun | null | undefined, problems: Problem[] = ASSIGNMENT.problems): OutcomeColumn[] =>
  columnsOf(sessionReviews(session, run, problems), pathway, problems);

export type VersionKind = "first" | "second" | "group" | "group-last";

export interface ShownVersion {
  kind: VersionKind;
  label: string;
  lines: string[];
}

export const VERSION_LABEL: Record<VersionKind, string> = {
  first: "First submission",
  second: "Second submission",
  group: "Group's rework",
  "group-last": "Group's last try",
};

/**
 * The versions a problem's working shows side by side on the teacher's report (ticket 243), only those that
 * tell its story: right first time, the first submission alone; right on the student's own rework, the first
 * and second; right in group review, the first, the second when there is one, and the group's rework; still
 * wrong, every version there is, the group's last try included when their group took it on.
 */
export function shownVersions(problem: string, review: ProblemReview = NO_REVIEW, pathway: readonly ReviewStage[]): ShownVersion[] {
  const outcome = outcomeOf(problem, review, pathway);
  const v = (kind: VersionKind, lines: string[]): ShownVersion => ({ kind, label: VERSION_LABEL[kind], lines });
  const out = [v("first", review.first)];
  if (outcome === "first") return out;
  const second = pathway.includes("individual") && review.second.length > 0;
  if (outcome === "individual") return [...out, v("second", review.second)];
  if (second) out.push(v("second", review.second));
  if (pathway.includes("group") && review.group) out.push(v(review.group.solved ? "group" : "group-last", review.group.lines));
  return out;
}
