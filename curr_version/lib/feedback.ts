import { STANDOUT } from "@/data/evaluation";
import { ASSIGNMENT } from "@/data/assignment";
import { SUBSKILL_MAP } from "@/data/subskills";
import type { Problem, SubskillId } from "@/data/types";
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
  /** Subskills of the lines that didn't hold, in order. */
  slips: SubskillId[];
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
      slips: wrong.map((l) => (l.verdict.verdict === "wrong" ? l.verdict.subskill : "roots")),
      clue: first && first.verdict === "wrong" ? first.clue : undefined,
      clean: lines.length > 0 && wrong.length === 0,
    };
  });
}

/**
 * Detective feedback: one conversational sentence, never a location. How many problems contain
 * at least one mistake and, whenever that is one or more, which subskills to double-check (first
 * occurrence order, at most three). `final` reads the rework where there is one.
 */
export interface FeedbackSummary {
  count: number;
  total: number;
  subskills: SubskillId[];
  sentence: string;
}

export type FeedbackVersion = "original" | "final";

export const HINT_CAP = 3;

function linesFor(session: StudentSession, problemId: string, version: FeedbackVersion): RevealedLine[] {
  if (version === "final") {
    const rw = session.rework[problemId] ?? [];
    if (rw.length > 0) return rw;
  }
  return session.lines[problemId] ?? [];
}

export function feedbackSummary(session: StudentSession, version: FeedbackVersion = "original", problems: Problem[] = ASSIGNMENT.problems): FeedbackSummary {
  let count = 0;
  const subskills: SubskillId[] = [];
  for (const p of problems) {
    const wrong = linesFor(session, p.id, version).map((l) => evaluateLine(p.id, l.tex)).filter((v) => v.verdict === "wrong");
    if (wrong.length === 0) continue;
    count++;
    for (const v of wrong) if (v.verdict === "wrong" && !subskills.includes(v.subskill)) subskills.push(v.subskill);
  }
  return { count, total: problems.length, subskills, sentence: summarySentence(count, subskills, version) };
}

function joinWords(words: string[]): string {
  if (words.length <= 1) return words.join("");
  return `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
}

export function summarySentence(count: number, subskills: SubskillId[], version: FeedbackVersion = "original"): string {
  const still = version === "final" ? "still " : "";
  if (count === 0) return version === "final" ? "Every problem holds now." : "Every problem held.";
  const head = count === 1 ? `1 of your problems ${still}contains a mistake.` : `${count} of your problems ${still}contain a mistake.`;
  const names = subskills.slice(0, HINT_CAP).map((id) => SUBSKILL_MAP[id].short.toLowerCase());
  return names.length ? `${head} Double-check ${joinWords(names)}.` : head;
}
