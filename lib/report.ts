import { ASSIGNMENT, PROBLEM_MAP } from "@/data/assignment";
import type { Classmate } from "@/data/classmates";
import type { ClassReview } from "@/data/recordReview";
import { leafName, type GroupId } from "@/data/taxonomy";
import type { Confidence, Problem, ReviewStage } from "@/data/types";
import { boardCovered, type ClassroomState } from "./classroom";
import { groupVersion } from "./debrief";
import { evaluateLine } from "./evaluate";
import { boardExamples } from "./examples";
import { feedbackFor } from "./feedback";
import type { GroupRun } from "./groupReview";
import { classmateLines } from "./hierarchy";
import type { StudentSession } from "./session";
import { firstFinished, recordFinished } from "./setScore";

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

/** The Confidence column's label before an answer. */
export const NO_CONFIDENCE = "—";

/** The short label on the live grid: "confident", "low", or "low: fractions, discriminant". */
export function confidenceLabel(c: Confidence | null): string {
  if (!c) return NO_CONFIDENCE;
  if (c.level === "confident") return "confident";
  const named = namedSkills(c);
  return named ? `low: ${named.join(", ")}` : "low";
}

/** A confidence label's colour, the Class view's and the student panel's (ticket 316): confident green, a low answer accent, no answer muted. */
export function confidenceTone(label: string): string {
  return label === NO_CONFIDENCE ? "text-ink-muted" : label === "confident" ? "text-secure" : "text-accent-deep";
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
 * Where each problem ended up, for the tiles on the student's report: right when handed in, right after the independent
 * rework, right once the group's rework checked, left unsolved by the group and then covered in class review (ticket 282),
 * or still wrong. The first that applies wins, so a problem sits in exactly one column. A pathway without a stage never
 * yields that stage's outcome, and that column is not shown at all.
 */
export type Outcome = "first" | "individual" | "group" | "covered" | "wrong";

export interface OutcomeColumn {
  id: Outcome;
  label: string;
  problems: Problem[];
  /** The column's problems the student did not attempt (ticket 282): the note under the column names them. */
  notAttempted: Problem[];
}

export const OUTCOME_LABEL: Record<Outcome, string> = {
  first: "Correct first try",
  individual: "Correct after individual review",
  group: "Correct after group review",
  covered: "Covered in class review",
  wrong: "Incorrect",
};

/** A version is right when it has at least one line and none of them is wrong: the same rule as "every step held". */
export const holds = (problem: string, lines: string[]): boolean => lines.length > 0 && lines.every((tex) => evaluateLine(problem, tex).verdict !== "wrong");

/**
 * A problem class review covered, as the report shows it (ticket 282): the examples the teacher put on the board, in the
 * board's order, as lines only. Anonymous by construction: no student id reaches the report.
 */
export interface CoveredShown {
  problem: string;
  examples: readonly (readonly string[])[];
}
/** What class review covered on a set, or null when it has not happened (or the pathway has none): then there is no column. */
export type ClassReviewShown = readonly CoveredShown[];

/** A finished set's recorded class review (ticket 281), names dropped. */
export const recordedClassReview = (review: ClassReview | undefined): ClassReviewShown | null =>
  review ? review.map((c) => ({ problem: c.problem, examples: c.examples.map((e) => [...e.lines]) })) : null;

/**
 * The live set's class review (ticket 282): once class review is over, the problems the board showed (`boardCovered`), each
 * with the examples projected on it, read as the board reads them (`boardExamples`: the same lines, in the same order).
 */
export function liveClassReview(c: ClassroomState | null | undefined, session: StudentSession | null): ClassReviewShown | null {
  const covered = boardCovered(c);
  if (!covered) return null;
  return covered.map((problem) => ({ problem, examples: boardExamples(c?.wholeClass?.examples[problem] ?? [], problem, session).map((e) => e.lines) }));
}

/**
 * The pathway the report reads (ticket 282): the set's, with class review only once it has happened (`classReview` not
 * null). Before then the columns are the ones they were, so nothing moves until the board's End moves the covered tiles.
 */
export const reportPathway = (pathway: readonly ReviewStage[], classReview: ClassReviewShown | null): ReviewStage[] =>
  pathway.filter((s) => s !== "whole-class" || classReview !== null);

/**
 * Everything one student wrote on one problem, stage by stage (ticket 243): the first submission and whether it was finished
 * (ticket 282: an unfinished one is never right first time), their own second submission, what their group wrote once it
 * closed the problem (its rework that checked correct, or its last try on a problem closed unsolved), and the examples class
 * review put on the board when it covered the problem. The same shape for a live session and a set's record, so both reports
 * sort tiles and show working from it.
 */
export interface ProblemReview {
  first: string[];
  finished: boolean;
  second: string[];
  group?: { lines: string[]; solved: boolean };
  classReview?: string[][];
}
export type Reviews = Record<string, ProblemReview>;

const coveredExamples = (classReview: ClassReviewShown | null | undefined, problem: string): { classReview: string[][] } | object => {
  const c = classReview?.find((x) => x.problem === problem);
  return c ? { classReview: c.examples.map((lines) => [...lines]) } : {};
};

/** A live session's versions of one problem: its lines, its rework, the group run's version once the run closed it, and class review's examples. */
function sessionReview(session: StudentSession, run: GroupRun | null | undefined, problem: string, classReview?: ClassReviewShown | null): ProblemReview {
  const closed = run?.resolved.includes(problem) ? true : run?.unsolved?.includes(problem) ? false : null;
  return {
    first: (session.lines[problem] ?? []).map((l) => l.tex),
    finished: firstFinished(session, problem),
    second: (session.rework[problem] ?? []).map((l) => l.tex),
    ...(run && closed !== null ? { group: { lines: groupVersion(run, problem), solved: closed } } : {}),
    ...coveredExamples(classReview, problem),
  };
}

export const sessionReviews = (session: StudentSession, run: GroupRun | null | undefined, problems: Problem[] = ASSIGNMENT.problems, classReview: ClassReviewShown | null = null): Reviews =>
  Object.fromEntries(problems.map((p) => [p.id, sessionReview(session, run, p.id, classReview)]));

/** Every review stage: a finished set's records show all they hold. */
export const ALL_REVIEW_STAGES: readonly ReviewStage[] = ["individual", "group", "whole-class"];

/**
 * A set record's versions: its first submission as the Class View reads it, and what review made of its mistakes
 * (`review`, ticket 244). `over` is the review stages the class has finished: a second submission shows once
 * individual review is over and a group's version once group review is, so on the live set a problem a classmate
 * fixes later sits in Incorrect until then, the columns never moving (rule 9a). A finished set passes every stage.
 * `classReview` (ticket 282) is what class review covered, null until it has happened.
 */
export function recordReviews(record: Classmate, problems: Problem[] = ASSIGNMENT.problems, over: readonly ReviewStage[] = ALL_REVIEW_STAGES, classReview: ClassReviewShown | null = null): Reviews {
  const reviews: Reviews = {};
  problems.forEach((p, i) => {
    const later = record.review?.[p.id];
    const second = over.includes("individual") ? later?.second : undefined;
    const group = over.includes("group") ? later?.group : undefined;
    reviews[p.id] = { first: classmateLines(record, p, i) ?? [], finished: recordFinished(record, i), second: second ?? [], ...(group ? { group } : {}), ...coveredExamples(classReview, p.id) };
  });
  return reviews;
}

/**
 * The review stages the class has finished, from a set's stages (`assignmentStages`): what `recordReviews` may show.
 * A stage is finished once it is over, or while it is still current once everyone is done with it (group review
 * stays current until class review starts, and on a pathway without class review it never ends otherwise).
 */
export const reviewStagesOver = (stages: readonly { id: string; state: string; done: number | null; total: number }[]): ReviewStage[] =>
  stages.flatMap((s) => (s.id !== "working" && (s.state === "over" || (s.state === "current" && s.done !== null && s.done >= s.total)) ? [s.id as ReviewStage] : []));

const NO_REVIEW: ProblemReview = { first: [], finished: false, second: [] };

/**
 * Where one problem ended up. Right first time needs the first submission finished with no wrong line (ticket 282: an
 * unfinished one with nothing wrong in it yet is not right). Covered in class review needs class review in the pathway and
 * its examples on the problem, and, when the pathway has group review, the student's group to have closed it unsolved:
 * a problem the group never took on (an absent student's) stays Incorrect.
 */
export function outcomeOf(problem: string, review: ProblemReview = NO_REVIEW, pathway: readonly ReviewStage[]): Outcome {
  if (review.finished && holds(problem, review.first)) return "first";
  if (pathway.includes("individual") && holds(problem, review.second)) return "individual";
  if (pathway.includes("group") && review.group?.solved) return "group";
  if (pathway.includes("whole-class") && review.classReview && (!pathway.includes("group") || review.group?.solved === false)) return "covered";
  return "wrong";
}

export const problemOutcome = (session: StudentSession, problem: string, pathway: readonly ReviewStage[], run: GroupRun | null | undefined, classReview: ClassReviewShown | null = null): Outcome =>
  outcomeOf(problem, sessionReview(session, run, problem, classReview), pathway);

/** Not attempted: nothing written on the first submission and nothing handed in for it. */
export const notAttempted = (review: ProblemReview = NO_REVIEW): boolean => review.first.length === 0 && !review.finished;

/**
 * The columns the pathway allows, in order, each with its problems in set order and those of them not attempted. An empty
 * column stays, so the layout never shifts. Pass the report's pathway (`reportPathway`): class review's column only once it happened.
 */
export function columnsOf(reviews: Reviews, pathway: readonly ReviewStage[], problems: Problem[] = ASSIGNMENT.problems): OutcomeColumn[] {
  const stages: Outcome[] = ["individual", "group"];
  const ids: Outcome[] = ["first", ...stages.filter((s) => pathway.includes(s as ReviewStage)), ...(pathway.includes("whole-class") ? (["covered"] as const) : []), "wrong"];
  const columns = ids.map((id) => ({ id, label: OUTCOME_LABEL[id], problems: [] as Problem[], notAttempted: [] as Problem[] }));
  for (const p of problems) {
    const column = columns.find((c) => c.id === outcomeOf(p.id, reviews[p.id], pathway))!;
    column.problems.push(p);
    if (notAttempted(reviews[p.id])) column.notAttempted.push(p);
  }
  return columns;
}

export const outcomeColumns = (session: StudentSession, pathway: readonly ReviewStage[], run: GroupRun | null | undefined, problems: Problem[] = ASSIGNMENT.problems, classReview: ClassReviewShown | null = null): OutcomeColumn[] =>
  columnsOf(sessionReviews(session, run, problems, classReview), pathway, problems);

/** The note under a column: "Q9, Q10 not attempted", or null when it has none. */
export const notAttemptedNote = (column: Pick<OutcomeColumn, "notAttempted">): string | null =>
  column.notAttempted.length > 0 ? `${column.notAttempted.map((p) => p.label).join(", ")} not attempted` : null;

export type VersionKind = "first" | "second" | "group" | "group-last" | "class";

export interface ShownVersion {
  kind: VersionKind;
  label: string;
  lines: string[];
  /** Class review's pane only: each example the board showed, unmarked and anonymous. */
  examples?: string[][];
}

export const VERSION_LABEL: Record<VersionKind, string> = {
  first: "First submission",
  second: "Second submission",
  group: "Group's rework",
  "group-last": "Group's last try",
  class: "Class review",
};

/**
 * The versions a problem's working shows (ticket 243), only those that tell its story: right first time, the first
 * submission alone; right on the student's own rework, the first and second; right in group review, the first (reading
 * *not attempted* when nothing was written), the second when there is one, and the group's rework; covered in class review
 * (ticket 282), the first, the second when there is one, the group's last try and the Class review pane with the board's
 * examples; still wrong, every version there is, the group's last try included when their group took it on.
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
  if (outcome === "covered") out.push({ ...v("class", []), examples: review.classReview!.map((lines) => [...lines]) });
  return out;
}
