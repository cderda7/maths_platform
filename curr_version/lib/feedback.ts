import { STANDOUT } from "@/data/evaluation";
import { ASSIGNMENT } from "@/data/assignment";
import type { Problem, SubskillId } from "@/data/types";
import { evaluateLine, type Verdict } from "./evaluate";
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
