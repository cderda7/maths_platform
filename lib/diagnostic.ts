import { CLASSMATES } from "@/data/classmates";
import { DIAGNOSTIC_MAP, DIAGNOSTICS, type Diagnostic } from "@/data/diagnostic";
import { latestDiagnostic, openDiagnostic, type ClassroomState, type DiagnosticRun } from "./classroom";

/** The question behind a push: one the teacher wrote (carried with the push) or a fixture by id. */
export function questionFor(questionId: string, question?: Diagnostic): Diagnostic | undefined {
  return question ?? DIAGNOSTIC_MAP[questionId];
}

export function isCorrect(questionId: string, option: string, question?: Diagnostic): boolean {
  return questionFor(questionId, question)?.correct === option;
}

/** The suggested check for a problem; the class view's example when no fixture names the problem. */
export function diagnosticFor(problemId: string): Diagnostic {
  return DIAGNOSTICS.find((d) => d.problemId === problemId) ?? DIAGNOSTICS[0];
}

/**
 * Whether a push (waiting or answered) came from the panel that shows `example` under
 * `problemId`: a fixture push is matched by its id, a teacher-written one by the problem it was
 * written under (none on the class view). The pending band, the response line and Withdraw
 * show only in the panel the push belongs to.
 */
export function pushBelongsTo(push: { questionId: string; question?: Diagnostic }, example: Diagnostic, problemId?: string): boolean {
  return push.question ? push.question.problemId === problemId : push.questionId === example.id;
}

/** A teacher-written question is valid with a stem, at least two options and a correct one among them. */
export function customQuestion(stem: string, tex: string, options: string[], correct: string, at = Date.now(), problemId?: string): Diagnostic | null {
  const opts = options.map((t, i) => ({ id: "abcd"[i], tex: t.trim() })).filter((o) => o.tex.length > 0);
  if (stem.trim().length === 0 || opts.length < 2 || !opts.some((o) => o.id === correct)) return null;
  const q: Diagnostic = { id: `custom-${at}`, stem: stem.trim(), tex: tex.trim(), options: opts, correct };
  return problemId ? { ...q, problemId } : q;
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
 * The option a classmate picks for a teacher-written question, which has no authored picks: three
 * in five take the option the teacher marked correct, the rest spread across the distractors in
 * turn, so the counts favour the right answer and every distractor gets some.
 */
export function writtenPick(q: Diagnostic, index: number): string {
  const distractors = q.options.filter((o) => o.id !== q.correct);
  if (distractors.length === 0 || index % 5 < 3) return q.correct;
  return distractors[Math.floor(index / 5) % distractors.length].id;
}

/** The option the classmate at `index` of the roster picks: the fixture's authored pick, or the correct one; the written-question rule when there is no fixture. */
export function classmatePick(q: Diagnostic, index: number): string {
  if (!q.picks) return writtenPick(q, index);
  const id = CLASSMATES[index].id;
  const picked = Object.entries(q.picks).find(([, who]) => who?.includes(id));
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
  const q = questionFor(run.questionId, run.question);
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

/**
 * The latest run that came from the panel showing `example` under `problemId`, open or answered;
 * `written` narrows it to the panel's own tab (a teacher-written question) or its example tab.
 */
export function runFor(c: ClassroomState | null | undefined, example: Diagnostic, problemId?: string, written?: boolean): DiagnosticRun | null {
  const runs = c?.diagnostics ?? [];
  for (let i = runs.length - 1; i >= 0; i--) {
    const run = runs[i];
    if (pushBelongsTo(run, example, problemId) && (written === undefined || !!run.question === written)) return run;
  }
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
