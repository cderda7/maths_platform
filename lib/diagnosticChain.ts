import { CLASSMATES } from "@/data/classmates";
import { DIAGNOSTIC_MAP } from "@/data/diagnostic";

/**
 * A live diagnostic as a chain of step questions the teacher paces the class through (ticket 241). Everything a tab shows
 * is a function of the stored moments here and `now`: when each step opened, when the demo student answered it, when force
 * submit was pressed on it, when the chain ended. Nothing is written when a step closes (all twenty in, or the countdown
 * at zero): the close is derived, so a reload replays nothing and the laptop, the board and the iPad agree without a
 * message. See DECISION_LOG.md, 2026-09-14 (the diagnostic chain's run state).
 *
 * No import of `lib/classroom` (which stores the runs) or `lib/diagnostic` (which tallies them): both read this.
 */

/** Everyone who answers a diagnostic: the demo student and the classmates. */
export const CLASS_SIZE = CLASSMATES.length + 1;

/** The classmates' answers land between `TRICKLE_FROM_MS` and `TRICKLE_TO_MS` after their step opens, spread evenly in a fixed order. */
export const TRICKLE_FROM_MS = 1500;
export const TRICKLE_TO_MS = 8000;

/** Force submit on a step: its countdown, after which the step closes over whoever has answered. Five seconds since ticket 260 (ten in 241). */
export const DIAGNOSTIC_FORCE_MS = 5_000;

/** When the classmate at `index` answers, ms after the step opened: a fixed shuffle so the counts climb unevenly across the options, not in roster order. */
export function arrivesAt(index: number): number {
  const n = CLASSMATES.length;
  const slot = (index * 7) % n;
  return TRICKLE_FROM_MS + Math.round(((TRICKLE_TO_MS - TRICKLE_FROM_MS) * slot) / (n - 1));
}

/** The last present classmate's answer, ms after a step opens (ticket 250: an absent student answers nothing); 0 with nobody present. */
const lastArrivalMs = (absent: readonly string[]): number => Math.max(0, ...CLASSMATES.flatMap((m, i) => (absent.includes(m.id) ? [] : [arrivesAt(i)])));

/** The demo student's answer to one step: the option, and when it was given. */
export interface ChainAnswer {
  option: string;
  at: number;
}

/**
 * One chain sent from the mistake view. `steps` are the step ids in solution order (one step is a chain of one); the
 * current step is the last one opened (`openedAt`). A step closes (its answer revealed) once every student has answered
 * it or its force-submit countdown has run out, whichever is first (`closedAt`). The chain is out until `endedAt`: back to
 * work after the last step's reveal, or a withdraw (`withdrawn`, whose results are shown nowhere). Ended runs stay on the
 * classroom: the flyout reads a step's latest result, and the classmates' work stream skips the time each chain was out.
 */
export interface DiagnosticRun {
  steps: string[];
  pushedAt: number;
  /** When each step opened, by position: `openedAt[0]` is the push; one entry per step reached. */
  openedAt: number[];
  /** The demo student's pick per step id; a pick is final. */
  answers: Record<string, ChainAnswer>;
  /** When force submit was pressed on a step, by step id; cancel removes it. */
  forcedAt: Record<string, number>;
  endedAt?: number;
  withdrawn?: true;
}

/** The chain's actions; `at` is the moment (the store stamps it). */
export type ChainAction =
  /** A chain to every student's screen; refused while another is out, and with no known step. */
  | { type: "diagnostic/push"; steps: string[]; at?: number }
  /** The demo student's pick on the current step: refused once they have picked, and once the step has closed. */
  | { type: "diagnostic/answer"; option: string; at?: number }
  /** Force submit on the current step: the countdown starts. Refused once closed or while already counting. */
  | { type: "diagnostic/force"; at?: number }
  /** Cancel the countdown: back to answering. Refused once the countdown has closed the step. */
  | { type: "diagnostic/force-cancel"; at?: number }
  /** Next question: the next step opens, only once the current step has closed, never past the last. */
  | { type: "diagnostic/next"; at?: number }
  /** Done: closes the chain, only once the last step has closed. */
  | { type: "diagnostic/end"; at?: number }
  /** Discards the whole chain, at any point while it is out. */
  | { type: "diagnostic/withdraw"; at?: number };

/** Every authored step's place in solution order: problem by problem, step by step. */
const ORDER = new Map(Object.keys(DIAGNOSTIC_MAP).map((id, i) => [id, i]));

/** The selected steps as a chain runs them: known ids only, each once, in solution order whatever order they were picked in. */
export function inSolutionOrder(ids: readonly string[]): string[] {
  return [...new Set(ids)].filter((id) => ORDER.has(id)).sort((a, b) => ORDER.get(a)! - ORDER.get(b)!);
}

/** The latest run, out or ended; null before the first push. */
export function latestRun(runs: readonly DiagnosticRun[] | undefined): DiagnosticRun | null {
  return runs && runs.length > 0 ? runs[runs.length - 1] : null;
}

/** The chain that is out, if one is: only the latest run can be. */
export function liveRun(runs: readonly DiagnosticRun[] | undefined): DiagnosticRun | null {
  const run = latestRun(runs);
  return run && run.endedAt === undefined ? run : null;
}

/** The current step's position: the last one opened. */
export const currentIndex = (run: DiagnosticRun): number => run.openedAt.length - 1;
export const isLastStep = (run: DiagnosticRun, index = currentIndex(run)): boolean => index >= run.steps.length - 1;

/**
 * When the step at `index` closed or will close, given what is stored: the moment the last answer lands (the last present
 * classmate's, or the demo student's if later), or the force-submit countdown's zero, whichever is first. Null while
 * neither is known (the demo student has not answered and nobody has pressed force submit) and for a step not yet opened.
 * `absent` is the live set's absent students (ticket 250), read live from the classroom, so marking one closes the step
 * as soon as everyone left in the room has answered.
 */
export function closedAt(run: DiagnosticRun, index: number, absent: readonly string[] = []): number | null {
  const id = run.steps[index];
  const opened = run.openedAt[index];
  if (id === undefined || opened === undefined) return null;
  const answer = run.answers[id];
  const allIn = answer ? Math.max(opened + lastArrivalMs(absent), answer.at) : Infinity;
  const forced = run.forcedAt[id] !== undefined ? run.forcedAt[id] + DIAGNOSTIC_FORCE_MS : Infinity;
  const close = Math.min(allIn, forced);
  return close === Infinity ? null : close;
}

/** The step's answer is revealed at `now`: every student has answered, or force submit has closed it. */
export function isRevealed(run: DiagnosticRun, index: number, now: number, absent: readonly string[] = []): boolean {
  const close = closedAt(run, index, absent);
  return close !== null && now >= close;
}

/** The current step's force-submit countdown, while it runs: when it reaches zero. */
export function forceDeadline(run: DiagnosticRun, now: number, absent: readonly string[] = []): number | null {
  const i = currentIndex(run);
  const at = run.forcedAt[run.steps[i]];
  return at !== undefined && !isRevealed(run, i, now, absent) ? at + DIAGNOSTIC_FORCE_MS : null;
}

/** "1st", "2nd", "3rd", "4th" … for the "1st of 3" count. */
export function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${n % 10 === 1 ? "st" : n % 10 === 2 ? "nd" : n % 10 === 3 ? "rd" : "th"}`;
}

/** "1st of 3" for the step at `index`; null for a chain of one, which needs no count. */
export function chainPosition(run: DiagnosticRun, index = currentIndex(run)): string | null {
  return run.steps.length > 1 ? `${ordinal(index + 1)} of ${run.steps.length}` : null;
}

/** The chain reducer over the classroom's runs; the same array when an action is refused. `absent`: the live set's absent students, who answer nothing. */
export function chainReducer(runs: DiagnosticRun[], a: ChainAction, absent: readonly string[] = []): DiagnosticRun[] {
  const at = a.at ?? 0;
  const live = liveRun(runs);
  const replace = (run: DiagnosticRun) => [...runs.slice(0, -1), run];
  if (a.type === "diagnostic/push") {
    const steps = inSolutionOrder(a.steps);
    if (live || steps.length === 0) return runs;
    return [...runs, { steps, pushedAt: at, openedAt: [at], answers: {}, forcedAt: {} }];
  }
  if (!live) return runs;
  const i = currentIndex(live);
  const id = live.steps[i];
  const revealed = isRevealed(live, i, at, absent);
  switch (a.type) {
    case "diagnostic/answer": {
      const known = DIAGNOSTIC_MAP[id]?.options.some((o) => o.id === a.option);
      if (live.answers[id] || revealed || !known) return runs;
      return replace({ ...live, answers: { ...live.answers, [id]: { option: a.option, at } } });
    }
    case "diagnostic/force":
      if (revealed || live.forcedAt[id] !== undefined) return runs;
      return replace({ ...live, forcedAt: { ...live.forcedAt, [id]: at } });
    case "diagnostic/force-cancel": {
      if (revealed || live.forcedAt[id] === undefined) return runs;
      const forcedAt = { ...live.forcedAt };
      delete forcedAt[id];
      return replace({ ...live, forcedAt });
    }
    case "diagnostic/next":
      if (!revealed || isLastStep(live, i)) return runs;
      return replace({ ...live, openedAt: [...live.openedAt, Math.max(at, closedAt(live, i, absent)!)] });
    case "diagnostic/end":
      if (!revealed || !isLastStep(live, i)) return runs;
      return replace({ ...live, endedAt: at });
    case "diagnostic/withdraw":
      return replace({ ...live, endedAt: at, withdrawn: true });
  }
}

/** When the classmates' work stream stood still: every chain from its push to its end (still out: to now). */
export function chainPauses(runs: readonly DiagnosticRun[] | undefined): { from: number; to: number | null }[] {
  return (runs ?? []).map((r) => ({ from: r.pushedAt, to: r.endedAt ?? null }));
}

/**
 * A run as stored, read tolerantly: a run stored before ticket 241 was one question (`questionId`, the demo student's
 * `answer`), which reads as an ended chain of one. The same object when it is already a chain.
 */
export function migrateRun(raw: unknown): DiagnosticRun {
  const r = raw as Partial<DiagnosticRun> & { questionId?: string; answer?: string };
  if (Array.isArray(r.steps) && Array.isArray(r.openedAt)) return r as DiagnosticRun;
  const pushedAt = typeof r.pushedAt === "number" ? r.pushedAt : 0;
  const id = typeof r.questionId === "string" ? r.questionId : "";
  return { steps: [id], pushedAt, openedAt: [pushedAt], answers: r.answer !== undefined ? { [id]: { option: r.answer, at: pushedAt } } : {}, forcedAt: {}, endedAt: pushedAt };
}
