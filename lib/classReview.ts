import type { SolutionStep } from "@/data/types";
import { LADDER_SLIPS, markLine, MARK_RULES, type LineMark } from "./ladder";
import { pairFor } from "./pairs";
import type { RevealedLine } from "./recognition";
import { padScript, type ScriptSlips } from "./warmup";

/**
 * Class review, question by question (ticket 344). Each question the teacher picked runs three steps, in this order:
 *
 *   examples  →  worked example (Q*)  →  the students' turn (Q**)
 *
 * The examples are what class review has always shown (the chosen workings, the teacher's marks and pad, every iPad on
 * the slide). Then Q* for that question (ticket 310's pair) is revealed a line at a time by the teacher, on the board and
 * mirrored on every iPad. Then Q**, the second near-identical question, goes onto every student's own iPad and each of
 * them writes the whole working, every line marked as it is read (`turnState`, ticket 311's check through ticket 312's
 * `markLine`). Nothing is blanked and nothing is given: a wrong line stays wrong until the student writes a right one.
 *
 * Nothing here is marked into a version, scored or recorded: class review changes no report and no set score. What the
 * student wrote lives on their session (`classReview` in `lib/session.ts`) so a reload lands where they were, and any live
 * view reads one student's turn with `turnFor(problemId, lines)` — one call per student, the same answer on every tab.
 *
 * A question with no pair (Problem Sets 1–5, a set made in Create) runs its examples alone, as class review did before.
 * See DECISION_LOG.md, 2026-09-16 (class review works an example, then the class does a near-identical question).
 */

/** The three steps of a class review question, in order. */
export type ClassStep = "examples" | "worked" | "turn";
export const CLASS_STEPS: readonly ClassStep[] = ["examples", "worked", "turn"];

/** What the teacher's screens and the board call each step. */
export const CLASS_STEP_WORD: Record<ClassStep, string> = { examples: "Examples", worked: "Worked example", turn: "Students' turn" };
/** What the student's iPad calls each step, in the banner's chip. */
export const CLASS_STEP_STUDENT_WORD: Record<ClassStep, string> = { examples: "examples", worked: "worked example", turn: "your turn" };

/** The steps a question runs: all three with a pair, the examples alone without one. */
export const stepsFor = (problemId: string): ClassStep[] => (pairFor(problemId) ? [...CLASS_STEPS] : ["examples"]);

/** The last step a question runs: the students' turn with a pair, the examples alone without one. */
export const lastStep = (problemId: string): ClassStep => (pairFor(problemId) ? "turn" : "examples");

/** True when `step` is the question's last: the one the teacher ends with "Next question" (or "Finish"). */
export const isLastStep = (problemId: string, step: ClassStep): boolean => step === lastStep(problemId);

/** How many lines Q* has to reveal, 0 for a question without a pair. */
export const workedLines = (problemId: string): number => pairFor(problemId)?.worked.solution.length ?? 0;

// ── The students' turn ──────────────────────────────────────────────────────────────────────────────────────────────

/** One line a student wrote on Q**, marked against the step it was written for. */
export interface TurnLine {
  tex: string;
  mark: LineMark;
  /** The line's index in what the pad has read. */
  index: number;
}

export interface TurnState {
  /** Every line written, in order, each with its mark: what the student's working column shows. */
  written: TurnLine[];
  /** The step of the working the next line is checked against; `steps.length` once every step is in. */
  step: number;
  /** Steps still to write. */
  left: number;
  done: boolean;
}

/**
 * Q** as it stands after the lines the pad has read, in order. Each line is checked against the step the student is on: a
 * right line moves on to the next step, anything else stays on this one and is shown where it was written (red with its
 * misconception where the check names one, dashed when it could not be read). No blank is ever filled in, so the working
 * only grows by what the student wrote. Lines read after the last step are not part of it. Derived from the lines alone,
 * so undo, a reload and any live view agree.
 */
export function turnState(steps: readonly Pick<SolutionStep, "tex" | "tags">[], lines: readonly Pick<RevealedLine, "tex">[]): TurnState {
  const written: TurnLine[] = [];
  let step = 0;
  lines.forEach((l, index) => {
    if (step >= steps.length) return;
    const mark = markLine(steps[step], l.tex);
    written.push({ tex: l.tex, mark, index });
    if (MARK_RULES[mark.kind].fills) step++;
  });
  return { written, step, left: Math.max(0, steps.length - step), done: step >= steps.length };
}

/**
 * One student's turn on class review question `problemId`, from the lines their pad has read: what a live view of the
 * class reads, one call per student (ticket 320). Null for a question with no pair, which has no students' turn.
 */
export function turnFor(problemId: string, lines: readonly Pick<RevealedLine, "tex">[]): TurnState | null {
  const pair = pairFor(problemId);
  return pair ? turnState(pair.completion.solution, lines) : null;
}

// ── The demo ────────────────────────────────────────────────────────────────────────────────────────────────────────

/**
 * What the demo pad reads on a class review Q**, one line per burst: the whole working, with any scripted slip just
 * before the step it belongs to. The slips are ticket 312's `LADDER_SLIPS`, the same named simulation data: Sam meets the
 * same Q** here as when he asked for help on that question, and his sign habit (`data/story.ts`) shows the same way — on
 * Q2**'s non-monic factors, the right numbers with their signs in the wrong brackets, marked and then written again right.
 */
export function classTurnScript(problemId: string, slips: Readonly<Record<string, ScriptSlips>> = LADDER_SLIPS): string[] {
  const pair = pairFor(problemId);
  if (!pair) return [];
  return padScript(pair.completion.solution, slips[pair.completion.id] ?? {});
}
