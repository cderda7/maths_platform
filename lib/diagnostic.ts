import { DEMO_STUDENT, PROBLEMS } from "@/data/assignment";
import { CLASSMATE_MAP, CLASSMATES } from "@/data/classmates";
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
export function slippedAt(step: Diagnostic, rows: readonly Pick<SlipRow, "lines">[]): number {
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

/** One answer that has landed on a step: who gave it (a classmate's id, or the demo student's), the option, and when. */
interface Arrival {
  student: string;
  option: string;
  at: number;
}

/**
 * Every answer on the step at `index` that counts at `now`, in the order they landed (ties in roster order, the demo
 * student after): the classmates whose answers landed after the step opened and before it closed, and the demo student's
 * once given. The one source of both `tally` and `pickersAt`, so the avatars under a count always number the count.
 */
function arrivalsAt(run: DiagnosticRun, now: number, index: number): { q: Diagnostic | undefined; arrivals: Arrival[]; revealed: boolean } {
  const id = run.steps[index];
  const q = id === undefined ? undefined : questionFor(id);
  const opened = run.openedAt[index];
  const close = closedAt(run, index);
  const revealed = close !== null && now >= close;
  if (!q || opened === undefined) return { q, arrivals: [], revealed: false };
  const cutoff = revealed ? close : now;
  const arrivals: Arrival[] = CLASSMATES.flatMap((c, i) => (opened + arrivesAt(i) <= cutoff ? [{ student: c.id, option: classmatePick(q, i), at: opened + arrivesAt(i) }] : []));
  const mine = run.answers[id];
  if (mine && mine.at <= cutoff && q.options.some((o) => o.id === mine.option)) arrivals.push({ student: DEMO_STUDENT.id, option: mine.option, at: mine.at });
  return { q, arrivals: arrivals.sort((a, b) => a.at - b.at), revealed };
}

/**
 * The count per option on the step at `index` (the current one by default) at `now`: the classmates whose answers landed
 * after the step opened and before it closed, and the demo student's once given. Anyone who had not answered when force
 * submit closed the step is left out, so the totals read over the responders. Unknown steps tally nothing.
 */
export function tally(run: DiagnosticRun, now: number, index = currentIndex(run)): Tally {
  const { q, arrivals, revealed } = arrivalsAt(run, now, index);
  const counts: Record<string, number> = Object.fromEntries((q?.options ?? []).map((o) => [o.id, 0]));
  for (const a of arrivals) counts[a.option] += 1;
  const answered = arrivals.length;
  const complete = answered === CLASS_SIZE;
  return { answered, total: revealed ? answered : CLASS_SIZE, counts, complete, revealed };
}

/**
 * Who picked each option on the step at `index` at `now` (ticket 242): student ids per option id, every option present,
 * in the order the answers landed, so an avatar joins the end of its cell's row and nobody moves. Exactly the answers
 * `tally` counts: the lists' lengths are its counts at every moment.
 */
export function pickersAt(run: DiagnosticRun, now: number, index = currentIndex(run)): Record<string, string[]> {
  const { q, arrivals } = arrivalsAt(run, now, index);
  const pickers: Record<string, string[]> = Object.fromEntries((q?.options ?? []).map((o) => [o.id, []]));
  for (const a of arrivals) pickers[a.option].push(a.student);
  return pickers;
}

/**
 * Whether a student's pick on a step repeats the slip they made on the original problem (ticket 242): the option mirrors a
 * wrong line (`slip`, ticket 240) and that very line is wrong in the student's own row on the problem, as the mistake view
 * shows it (`rows`: the problem's rows, the demo student's live row among them). A common slip, the correct option, or a
 * student with no row on the problem (right on it, or not reached it yet) repeats nothing. See DECISION_LOG.md, 2026-09-14
 * (repeated slips read the mistake view's rows).
 */
export function repeatedSlip(step: Diagnostic, studentId: string, option: string, rows: readonly SlipRow[]): boolean {
  const slip = step.options.find((o) => o.id === option)?.slip;
  const row = slip ? rows.find((r) => r.id === studentId) : undefined;
  return !!row && row.lines.some((l) => l.verdict.verdict === "wrong" && l.tex === slip);
}

/** A student's row on a problem, as much of the mistake view's as the diagnostic reads. */
export type SlipRow = { id: string; lines: readonly { tex: string; verdict: { verdict: string } }[] };

/** A student who answers a diagnostic, by id: a classmate or the demo student; undefined for an id the class does not have. */
export function studentFor(id: string): { id: string; name: string; initials: string } | undefined {
  if (id === DEMO_STUDENT.id) return DEMO_STUDENT;
  const c = CLASSMATE_MAP[id];
  return c && { id: c.id, name: c.name, initials: c.initials };
}

/** The problem a step asks about, as the class knows it ("Q1"); null for the fallback question, which belongs to none. */
export function problemLabelOf(step: Diagnostic): string | null {
  return PROBLEMS.find((p) => p.id === step.problemId)?.label ?? null;
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
