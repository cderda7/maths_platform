import { STANDOUT } from "@/data/evaluation";
import { ASSIGNMENT } from "@/data/assignment";
import { studentLeafName, type LeafId } from "@/data/taxonomy";
import type { Problem } from "@/data/types";
import { evaluateLine, type Verdict } from "./evaluate";
import type { RevealedLine } from "./recognition";
import type { StudentSession } from "./session";

/**
 * The feedback layers, derived from the session. Red: every step that didn't hold. Blue: a
 * curated set of correct steps chosen for the kind of run this was. Clue: a pattern-level hint
 * per problem with a slip, never the line. Pure, so ticket 07's rework and the teacher's
 * mistake view read the same thing.
 */
export type RunKind = "strong" | "weak";

export interface FeedbackLine {
  tex: string;
  verdict: Verdict;
  /** Highlighted blue, with the reason. */
  standout?: string;
}

export interface ProblemFeedback {
  problem: Problem;
  lines: FeedbackLine[];
  /** Leaves of the lines that didn't hold (first tag of each), in order. */
  slips: LeafId[];
  /** The detective-work clue, if any line didn't hold. */
  clue?: string;
  /** Right throughout, so the student may star it. */
  clean: boolean;
}

export function runKind(session: StudentSession): RunKind {
  for (const [pid, lines] of Object.entries(session.lines)) {
    for (const l of lines) if (evaluateLine(pid, l.tex).verdict === "wrong") return "weak";
  }
  return "strong";
}

export function feedbackFor(session: StudentSession): ProblemFeedback[] {
  const kind = runKind(session);
  return ASSIGNMENT.problems.map((problem) => {
    const raw = session.lines[problem.id] ?? [];
    const lines: FeedbackLine[] = raw.map((l) => {
      const verdict = evaluateLine(problem.id, l.tex);
      const so = STANDOUT[problem.id]?.[l.tex];
      const standout = verdict.verdict === "ok" && so && (so.when === "both" || so.when === kind) ? so.why : undefined;
      return { tex: l.tex, verdict, standout };
    });
    const wrong = lines.filter((l) => l.verdict.verdict === "wrong");
    const first = wrong[0]?.verdict;
    return {
      problem,
      lines,
      slips: wrong.map((l) => (l.verdict.verdict === "wrong" ? l.verdict.tags[0].leaf : "algebra.equations.quadratic")),
      clue: first && first.verdict === "wrong" ? first.clue : undefined,
      clean: lines.length > 0 && wrong.length === 0,
    };
  });
}

/**
 * How far a problem has got, reading the first hand-in and the rework together: nothing written
 * anywhere, some working but no answer yet, or an answer (right or wrong) somewhere in either: an
 * answer line in the marking table, or the sentence typed under a worded problem's working
 * (ticket 114). Finishing is about work outstanding, not correctness: a wrong answer is finished,
 * and the mistakes count is the other box's job.
 */
export type Progress = "not-attempted" | "unfinished" | "finished";

export function progressOf(session: StudentSession, problemId: string): Progress {
  const all = [...(session.lines[problemId] ?? []), ...(session.rework[problemId] ?? [])];
  const typed = (session.answers[problemId] ?? "").trim().length > 0;
  if (all.length === 0 && !typed) return "not-attempted";
  const answered =
    typed ||
    all.some((l) => {
      const v = evaluateLine(problemId, l.tex);
      return v.verdict !== "unclear" && v.answer === true;
    });
  return answered ? "finished" : "unfinished";
}

/** The problems not yet finished, in assignment order. */
export function incompleteProblems(session: StudentSession, problems: Problem[] = ASSIGNMENT.problems): string[] {
  return problems.filter((p) => progressOf(session, p.id) !== "finished").map((p) => p.id);
}

/** The incomplete box's line: "2 problems are incomplete.", "1 problem is incomplete.", or null when nothing is. */
export function incompleteHead(n: number): string | null {
  if (n <= 0) return null;
  return n === 1 ? "1 problem is incomplete." : `${n} problems are incomplete.`;
}

/**
 * Detective feedback: one conversational sentence, never a location. How many problems contain
 * at least one mistake and, whenever that is one or more, which subskills to double-check (first
 * occurrence order, at most three). `final` reads the rework where there is one, but never for a
 * problem that was blank at the first hand-in: a slip made while finishing one of those is not
 * counted anywhere this session (see FUTURE_FEATURES). A problem with correct working at hand-in
 * that the rework breaks is the guard's case (`lib/guard.ts`) and still counts under a forced
 * hand-in. While any problem is incomplete the count clause names the first submission, so it
 * cannot be read as a verdict on work that isn't there yet.
 */
export interface FeedbackSummary {
  count: number;
  total: number;
  /** Leaves to double-check, first-occurrence order. */
  subskills: LeafId[];
  /** The count clause ("5 of your problems contain a mistake."), without the hint. */
  head: string;
  /** The leaves the hint names: the first `HINT_CAP` of `subskills`, rendered as chips on screen. */
  hint: LeafId[];
  /** `head` and the hint as one plain sentence, for the notice and for tests. */
  sentence: string;
  /** How many problems are not finished, reading the rework too; the box above the count. */
  incomplete: number;
  /** The incomplete box's line, or null when the box is not shown. */
  incompleteHead: string | null;
}

export type FeedbackVersion = "original" | "final";

export const HINT_CAP = 3;

const wrongIn = (problemId: string, lines: RevealedLine[]) => lines.map((l) => evaluateLine(problemId, l.tex)).filter((v) => v.verdict === "wrong");

function linesFor(session: StudentSession, problemId: string, version: FeedbackVersion): RevealedLine[] {
  if (version === "final") {
    const rw = session.rework[problemId] ?? [];
    if (rw.length > 0) return rw;
  }
  return session.lines[problemId] ?? [];
}

export function feedbackSummary(session: StudentSession, version: FeedbackVersion = "original", problems: Problem[] = ASSIGNMENT.problems): FeedbackSummary {
  let count = 0;
  const subskills: LeafId[] = [];
  for (const p of problems) {
    // A problem blank at the first hand-in has no first version to "still" be wrong: it is left out.
    if (version === "final" && (session.lines[p.id]?.length ?? 0) === 0) continue;
    const wrong = wrongIn(p.id, linesFor(session, p.id, version));
    if (wrong.length === 0) continue;
    count++;
    for (const v of wrong) if (v.verdict === "wrong") for (const t of v.tags) if (!subskills.includes(t.leaf)) subskills.push(t.leaf);
  }
  const incomplete = incompleteProblems(session, problems).length;
  return { count, total: problems.length, subskills, ...summaryParts(count, subskills, version, incomplete > 0), incomplete, incompleteHead: incompleteHead(incomplete) };
}

function joinWords(words: string[]): string {
  if (words.length <= 1) return words.join("");
  return `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
}

/**
 * The count clause, the capped hint leaves, and the two joined as one sentence. `outstanding`
 * (the original version, something still incomplete) names the first submission instead:
 * "No mistakes in your first submission." / "2 problems in your first submission contain a mistake."
 */
export function summaryParts(count: number, subskills: LeafId[], version: FeedbackVersion = "original", outstanding = false): Pick<FeedbackSummary, "head" | "hint" | "sentence"> {
  const still = version === "final" ? "still " : "";
  const first = outstanding && version === "original";
  if (count === 0) {
    const head = version === "final" ? "Every problem holds now." : first ? "No mistakes in your first submission." : "Every problem held.";
    return { head, hint: [], sentence: head };
  }
  const head = first
    ? count === 1
      ? "1 problem in your first submission contains a mistake."
      : `${count} problems in your first submission contain a mistake.`
    : count === 1
      ? `1 of your problems ${still}contains a mistake.`
      : `${count} of your problems ${still}contain a mistake.`;
  const hint = subskills.slice(0, HINT_CAP);
  const names = hint.map((id) => studentLeafName(id).short);
  return { head, hint, sentence: names.length ? `${head} Double-check ${joinWords(names)}.` : head };
}

export function summarySentence(count: number, subskills: LeafId[], version: FeedbackVersion = "original"): string {
  return summaryParts(count, subskills, version).sentence;
}
