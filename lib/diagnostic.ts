import { CLASSMATES } from "@/data/classmates";
import { DIAGNOSTIC_MAP, FALLBACK_STEP, PROBLEM_DIAGNOSTICS, type Diagnostic, type DiagnosticStep } from "@/data/diagnostic";
import { latestDiagnostic, liveDiagnostic, type ClassroomState } from "./classroom";
import { arrivesAt, CLASS_SIZE, closedAt, currentIndex, type DiagnosticRun } from "./diagnosticChain";

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
// The class's answers (ticket 137; per step of a chain since ticket 241). The demo student answers for real; the nineteen
// classmates' answers are a function of the step and the time since it opened, so every tab agrees without a message:
// which option each picks (`classmatePick`) and when it lands (`arrivesAt`, in `lib/diagnosticChain`).

export { arrivesAt, CLASS_SIZE, TRICKLE_FROM_MS, TRICKLE_TO_MS } from "./diagnosticChain";

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
  /** Twenty while the step is open or once all twenty are in; the responders once force submit has closed it without everyone. */
  total: number;
  /** Answers per option id, every option present. */
  counts: Record<string, number>;
  /** Everyone has answered. */
  complete: boolean;
  /** The step has closed at `now` (all in, or force submit's zero): its correct answer is shown on the board and the iPads. */
  revealed: boolean;
}

/**
 * The count per option on the step at `index` (the current one by default) at `now`: the classmates whose answers landed
 * after the step opened and before it closed, and the demo student's once given. Anyone who had not answered when force
 * submit closed the step is left out, so the totals read over the responders. Unknown steps tally nothing.
 */
export function tally(run: DiagnosticRun, now: number, index = currentIndex(run)): Tally {
  const id = run.steps[index];
  const q = id === undefined ? undefined : questionFor(id);
  const counts: Record<string, number> = Object.fromEntries((q?.options ?? []).map((o) => [o.id, 0]));
  const opened = run.openedAt[index];
  const close = closedAt(run, index);
  const revealed = close !== null && now >= close;
  if (!q || opened === undefined) return { answered: 0, total: CLASS_SIZE, counts, complete: false, revealed: false };
  const cutoff = revealed ? close : now;
  let answered = 0;
  CLASSMATES.forEach((_, i) => {
    if (opened + arrivesAt(i) <= cutoff) {
      counts[classmatePick(q, i)] += 1;
      answered += 1;
    }
  });
  const mine = run.answers[id];
  if (mine && mine.at <= cutoff && mine.option in counts) {
    counts[mine.option] += 1;
    answered += 1;
  }
  const complete = answered === CLASS_SIZE;
  return { answered, total: revealed ? answered : CLASS_SIZE, counts, complete, revealed };
}

/** The latest run that sent this step and was not withdrawn, and the step's place in it. */
export function runFor(c: ClassroomState | null | undefined, questionId: string): { run: DiagnosticRun; index: number } | null {
  const runs = c?.diagnostics ?? [];
  for (let i = runs.length - 1; i >= 0; i--) {
    const index = runs[i].steps.indexOf(questionId);
    if (!runs[i].withdrawn && index >= 0) return { run: runs[i], index };
  }
  return null;
}

export { latestDiagnostic, liveDiagnostic };
