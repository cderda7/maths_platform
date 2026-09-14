import { CLASSMATES } from "@/data/classmates";
import { DIAGNOSTIC_MAP, FALLBACK_STEP, PROBLEM_DIAGNOSTICS, type Diagnostic, type DiagnosticStep } from "@/data/diagnostic";
import { latestDiagnostic, openDiagnostic, type ClassroomState, type DiagnosticRun } from "./classroom";

/** The question behind a push, by id. An id no longer known (a push stored before ticket 240) finds nothing. */
export function questionFor(questionId: string): DiagnosticStep | undefined {
  return DIAGNOSTIC_MAP[questionId];
}

export function isCorrect(questionId: string, option: string): boolean {
  return questionFor(questionId)?.correct === option;
}

/**
 * A problem's step questions in solution order (ticket 240), each on the problem's similar problem. A problem with none
 * authored (one of a set made through Create) falls back to the one fixed question.
 */
export function stepsFor(problemId: string): DiagnosticStep[] {
  return PROBLEM_DIAGNOSTICS.find((p) => p.problemId === problemId)?.steps ?? [FALLBACK_STEP];
}

/** The distractor on a step that mirrors a wrong line, if one does. */
export const optionForSlip = (step: Diagnostic, line: string) => step.options.find((o) => o.slip === line);

/**
 * How many students slipped at this step on the original problem: the rows (the mistake view's, Sam's live row among them)
 * with a wrong line that one of the step's distractors mirrors.
 */
export function slippedAt(step: Diagnostic, rows: readonly { lines: readonly { tex: string; verdict: { verdict: string } }[] }[]): number {
  const slips = new Set(step.options.flatMap((o) => (o.slip ? [o.slip] : [])));
  return rows.filter((r) => r.lines.some((l) => l.verdict.verdict === "wrong" && slips.has(l.tex))).length;
}

// ---------------------------------------------------------------------------------------------
// The class's answers (ticket 137). The demo student answers for real; the nineteen classmates'
// answers are a function of the question and the time since the push, so every tab agrees
// without a message: which option each picks (`classmatePick`) and when it lands (`arrivesAt`).

/** Everyone who answers a diagnostic: the demo student and the classmates. */
export const CLASS_SIZE = CLASSMATES.length + 1;

/** The classmates' answers land between `TRICKLE_FROM_MS` and `TRICKLE_TO_MS` after the push, spread evenly in a fixed order. */
export const TRICKLE_FROM_MS = 1500;
export const TRICKLE_TO_MS = 8000;

/** When the classmate at `index` answers, ms after the push: a fixed shuffle so the counts climb unevenly across the options, not in roster order. */
export function arrivesAt(index: number): number {
  const n = CLASSMATES.length;
  const slot = (index * 7) % n;
  return TRICKLE_FROM_MS + Math.round(((TRICKLE_TO_MS - TRICKLE_FROM_MS) * slot) / (n - 1));
}

/**
 * The option the classmate at `index` of the roster picks (ticket 240): the distractor mirroring a wrong line in their own
 * work on the step's problem, else a common slip the step names them on (only students who have not reached the problem),
 * else the correct one.
 */
export function classmatePick(q: Diagnostic, index: number): string {
  const c = CLASSMATES[index];
  const work = q.problemId ? (c.attempts[q.problemId] ?? []) : [];
  const mirrored = q.options.find((o) => o.slip && work.includes(o.slip));
  if (mirrored) return mirrored.id;
  const picked = Object.entries(q.picks ?? {}).find(([, who]) => who?.includes(c.id));
  return picked ? picked[0] : q.correct;
}

export interface Tally {
  /** Answers in so far, the demo student's included once given. */
  answered: number;
  total: number;
  /** Answers per option id, every option present. */
  counts: Record<string, number>;
  /** Everyone has answered. */
  complete: boolean;
}

/** The count per option at `now`: the classmates whose answers have landed and the demo student's once given. Unknown questions tally nothing. */
export function tally(run: DiagnosticRun, now: number): Tally {
  const q = questionFor(run.questionId);
  const counts: Record<string, number> = Object.fromEntries((q?.options ?? []).map((o) => [o.id, 0]));
  if (!q) return { answered: 0, total: CLASS_SIZE, counts, complete: false };
  let answered = 0;
  const since = now - run.pushedAt;
  CLASSMATES.forEach((_, i) => {
    if (since >= arrivesAt(i)) {
      counts[classmatePick(q, i)] += 1;
      answered += 1;
    }
  });
  if (run.answer !== undefined && run.answer in counts) {
    counts[run.answer] += 1;
    answered += 1;
  }
  return { answered, total: CLASS_SIZE, counts, complete: answered === CLASS_SIZE };
}

/** The latest run of this question, open or answered. */
export function runFor(c: ClassroomState | null | undefined, questionId: string): DiagnosticRun | null {
  const runs = c?.diagnostics ?? [];
  for (let i = runs.length - 1; i >= 0; i--) if (runs[i].questionId === questionId) return runs[i];
  return null;
}

/**
 * The run the board shows at `now`, if any: only ever the latest, never while the teacher has
 * cleared it, and otherwise either by the teacher's hand ("shown") or on its own once all twenty
 * answers are in. An open run the teacher has not shown stays off the board.
 */
export function boardDiagnostic(c: ClassroomState | null | undefined, now: number): DiagnosticRun | null {
  const run = latestDiagnostic(c);
  if (!run || run.board === "cleared") return null;
  if (run.board === "shown") return run;
  return tally(run, now).complete ? run : null;
}

export { latestDiagnostic, openDiagnostic };
